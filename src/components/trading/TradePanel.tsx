import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Info, Loader2, ArrowDownUp, CheckCircle2, AlertTriangle, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/services/authSlice';
import { useGetUserByIdQuery } from '@/services/api/userApiSlice';
import { useExecuteTradeMutation } from '@/services/api/financeApiSlice';
import { toast } from 'sonner';

interface TradePanelProps {
  symbol: string;
  name: string;
  currentPrice: number;
  defaultTab?: 'buy' | 'sell';
}

const TradePanel = ({ symbol, name, currentPrice, defaultTab = 'buy' }: TradePanelProps) => {
  const user = useSelector(selectCurrentUser);
  const { data: userData, refetch: refetchUser } = useGetUserByIdQuery(user?.id || "");
  const [executeTrade, { isLoading: isTrading }] = useExecuteTradeMutation();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [price, setPrice] = useState(currentPrice.toString());
  const [amount, setAmount] = useState("");
  const [sliderValue, setSliderValue] = useState([0]);
  const [lastTradeResult, setLastTradeResult] = useState<{ type: string; symbol: string; amount: number; total: number } | null>(null);

  const handleTabChange = (val: string) => {
    setActiveTab(val as 'buy' | 'sell');
    setAmount("");
    setSliderValue([0]);
    setLastTradeResult(null);
  };

  // Reset when asset changes
  useEffect(() => {
    setPrice(currentPrice.toString());
    setAmount("");
    setSliderValue([0]);
    setLastTradeResult(null);
  }, [currentPrice, symbol]);

  const walletBalance = userData?.walletBalance || 0;
  const assetHolding = userData?.holdings?.find((h: any) => h.tokenSymbol === symbol);
  const assetBalance = assetHolding?.amount || 0;
  const avgPrice = assetHolding?.averagePrice || 0;

  const numPrice = Number(price) || 0;
  const numAmount = Number(amount) || 0;
  const total = numPrice * numAmount;
  const fee = total * 0.001; // 0.1% fee

  // Buy: you pay total + fee, receive amount in kg
  // Sell: you receive total - fee in NGN, give amount in kg
  const buyPayable = total + fee;
  const sellReceivable = total - fee;

  const canBuy = numAmount > 0 && numPrice > 0 && walletBalance >= buyPayable;
  const canSell = numAmount > 0 && numPrice > 0 && assetBalance >= numAmount;

  const handleSliderChange = useCallback((value: number[], type: 'buy' | 'sell') => {
    setSliderValue(value);
    const pct = value[0] / 100;

    if (type === 'buy') {
      // Account for fees in max calculation
      const effectivePrice = numPrice * 1.001; // price + 0.1% fee
      const maxAmount = Math.floor((walletBalance / (effectivePrice || 1)) * 100) / 100;
      setAmount(maxAmount > 0 ? (maxAmount * pct).toFixed(2) : "0");
    } else {
      setAmount(assetBalance > 0 ? (assetBalance * pct).toFixed(2) : "0");
    }
  }, [walletBalance, assetBalance, numPrice]);

  const handleMaxAmount = (type: 'buy' | 'sell') => {
    if (type === 'buy') {
      const effectivePrice = numPrice * 1.001;
      const maxAmount = Math.floor((walletBalance / (effectivePrice || 1)) * 100) / 100;
      setAmount(maxAmount > 0 ? maxAmount.toString() : "0");
      setSliderValue([100]);
    } else {
      setAmount(assetBalance > 0 ? assetBalance.toString() : "0");
      setSliderValue([100]);
    }
  };

  const handleTrade = async (type: 'buy' | 'sell') => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (numPrice <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    // Extra client-side validation
    if (type === 'buy' && walletBalance < buyPayable) {
      toast.error(`Insufficient balance. You need ₦${buyPayable.toLocaleString()} but have ₦${walletBalance.toLocaleString()}`);
      return;
    }
    if (type === 'sell' && assetBalance < numAmount) {
      toast.error(`Insufficient ${symbol}. You have ${assetBalance} kg but trying to sell ${numAmount} kg`);
      return;
    }

    try {
      const result = await executeTrade({
        symbol,
        type,
        amount: parseFloat(amount),
        price: parseFloat(price)
      }).unwrap();

      setLastTradeResult({
        type,
        symbol,
        amount: parseFloat(amount),
        total: type === 'buy' ? buyPayable : sellReceivable
      });

      toast.success(
        type === 'buy'
          ? `Bought ${amount} kg of ${symbol} for ₦${buyPayable.toLocaleString()}`
          : `Sold ${amount} kg of ${symbol} for ₦${sellReceivable.toLocaleString()}`
      );

      setAmount("");
      setSliderValue([0]);

      // Refetch user data to update balances
      refetchUser();
    } catch (error: any) {
      console.error("Trade error:", error);
      toast.error(error.data?.message || "Failed to execute trade");
    }
  };

  const percentButtons = [0, 25, 50, 75, 100];

  const renderTradeForm = (type: 'buy' | 'sell') => {
    const isBuy = type === 'buy';
    const accentColor = isBuy ? 'primary' : 'red-500';
    const balance = isBuy ? walletBalance : assetBalance;
    const balanceLabel = isBuy ? 'Available Balance' : `Available ${symbol}`;
    const balanceDisplay = isBuy
      ? `₦${walletBalance.toLocaleString()}`
      : `${assetBalance.toLocaleString()} kg`;
    const canExecute = isBuy ? canBuy : canSell;

    return (
      <div className="space-y-3.5">
        {/* Available Balance */}
        <div className="flex justify-between items-center text-[11px] bg-muted/40 p-2.5 rounded-lg border border-border/30">
          <span className="text-muted-foreground font-bold uppercase tracking-tighter flex items-center gap-1.5">
            <Wallet className="w-3 h-3" />
            {balanceLabel}
          </span>
          <span className="text-foreground font-mono font-bold">{balanceDisplay}</span>
        </div>

        {/* Price Input */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Price</Label>
            <button
              onClick={() => setPrice(currentPrice.toString())}
              className={`text-[9px] font-bold uppercase cursor-pointer transition-colors flex items-center gap-1 ${
                isBuy ? 'text-primary hover:text-primary/80' : 'text-red-500 hover:text-red-400'
              }`}
            >
              <ArrowDownUp className="w-2.5 h-2.5" />
              Market
            </button>
          </div>
          <div className="relative group">
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={`bg-accent/40 border-border text-foreground h-11 sm:h-12 focus:ring-1 ${
                isBuy ? 'focus:ring-primary/50' : 'focus:ring-red-500/50'
              } border-none transition-all font-mono text-sm pl-4 pr-14`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold">NGN</span>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Amount</Label>
            <button
              onClick={() => handleMaxAmount(type)}
              className={`text-[9px] font-bold uppercase cursor-pointer transition-colors ${
                isBuy ? 'text-primary hover:text-primary/80' : 'text-red-500 hover:text-red-400'
              }`}
            >
              Max
            </button>
          </div>
          <div className="relative group">
            <Input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                // Update slider position proportionally
                const newAmt = Number(e.target.value) || 0;
                if (isBuy) {
                  const effectivePrice = numPrice * 1.001;
                  const maxAmount = walletBalance / (effectivePrice || 1);
                  setSliderValue([maxAmount > 0 ? Math.min(100, (newAmt / maxAmount) * 100) : 0]);
                } else {
                  setSliderValue([assetBalance > 0 ? Math.min(100, (newAmt / assetBalance) * 100) : 0]);
                }
              }}
              placeholder="0.00"
              className={`bg-accent/40 border-border text-foreground h-11 sm:h-12 focus:ring-1 ${
                isBuy ? 'focus:ring-primary/50' : 'focus:ring-red-500/50'
              } border-none transition-all font-mono text-sm pl-4 pr-14`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold">kg</span>
          </div>
        </div>

        {/* Percentage Slider */}
        <div className="pt-1 px-1">
          <Slider
            value={sliderValue}
            onValueChange={(v) => handleSliderChange(v, type)}
            max={100}
            step={1}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground font-bold mt-2 px-0.5">
            {percentButtons.map(v => (
              <button
                key={v}
                onClick={() => handleSliderChange([v], type)}
                className={`px-1.5 py-0.5 rounded transition-all ${
                  sliderValue[0] === v
                    ? (isBuy ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-500')
                    : 'hover:text-foreground'
                }`}
              >
                {v}%
              </button>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        {numAmount > 0 && numPrice > 0 && (
          <div className={`rounded-lg p-3 space-y-2 text-[10px] font-bold uppercase tracking-tight ${
            isBuy ? 'bg-primary/5 border border-primary/10' : 'bg-red-500/5 border border-red-500/10'
          }`}>
            <div className="flex justify-between items-center text-muted-foreground">
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3" /> Subtotal
              </span>
              <span className="font-mono">₦{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Fee (0.1%)</span>
              <span className="font-mono">₦{fee.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            </div>
            <div className="h-px bg-border/50" />
            <div className={`flex justify-between items-center text-xs ${isBuy ? 'text-primary' : 'text-red-500'}`}>
              <span className="flex items-center gap-1">
                {isBuy ? (
                  <><TrendingUp className="w-3 h-3" /> You'll Pay</>
                ) : (
                  <><TrendingDown className="w-3 h-3" /> You'll Receive</>
                )}
              </span>
              <span className="font-mono font-black">
                ₦{(isBuy ? buyPayable : sellReceivable).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-muted-foreground">
              <span>{isBuy ? "You'll Receive" : "You'll Sell"}</span>
              <span className="font-mono text-foreground">{numAmount} kg {symbol}</span>
            </div>
          </div>
        )}

        {/* Insufficient balance warning */}
        {numAmount > 0 && !canExecute && (
          <div className="flex items-center gap-2 text-[10px] text-amber-500 bg-amber-500/10 rounded-lg p-2.5 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold">
              {isBuy
                ? `Insufficient balance. Need ₦${buyPayable.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                : `Insufficient ${symbol}. You have ${assetBalance} kg`
              }
            </span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-1">
          <Button
            onClick={() => handleTrade(type)}
            disabled={isTrading || !canExecute}
            className={`w-full h-12 sm:h-13 font-black text-sm uppercase tracking-widest shadow-lg active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isBuy
                ? 'bg-primary hover:bg-primary/90 !text-white shadow-primary/20'
                : 'bg-red-500 hover:bg-red-600 !text-white shadow-red-500/20'
            }`}
          >
            {isTrading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                {isBuy ? <TrendingUp className="w-4 h-4 mr-2" /> : <TrendingDown className="w-4 h-4 mr-2" />}
                {isBuy ? 'Buy' : 'Sell'} {symbol}
              </>
            )}
          </Button>
        </div>

        {/* Last trade confirmation */}
        {lastTradeResult && lastTradeResult.type === type && (
          <div className="flex items-center gap-2 text-[10px] text-green-500 bg-green-500/10 rounded-lg p-2.5 border border-green-500/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span className="font-bold">
              {type === 'buy' ? 'Bought' : 'Sold'} {lastTradeResult.amount} kg {lastTradeResult.symbol} — ₦{lastTradeResult.total.toLocaleString()}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-card p-3 sm:p-4 w-full flex flex-col font-sans">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/30 p-1 rounded-lg mb-4 sm:mb-5 h-10 sm:h-11">
          <TabsTrigger
            value="buy"
            className="data-[state=active]:bg-primary data-[state=active]:!text-white data-[state=active]:shadow-sm transition-all text-muted-foreground font-bold uppercase tracking-widest text-[10px] sm:text-[11px] h-8 sm:h-9 rounded-md"
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            Buy
          </TabsTrigger>
          <TabsTrigger
            value="sell"
            className="data-[state=active]:bg-red-500 data-[state=active]:!text-white data-[state=active]:shadow-sm transition-all text-muted-foreground font-bold uppercase tracking-widest text-[10px] sm:text-[11px] h-8 sm:h-9 rounded-md"
          >
            <TrendingDown className="w-3.5 h-3.5 mr-1.5" />
            Sell
          </TabsTrigger>
        </TabsList>

        {/* Asset Name Header */}
        <div className="flex items-center justify-between border-l-2 border-primary pl-3 py-1.5 mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Selected Asset</span>
            <span className="text-foreground font-bold text-sm tracking-tight">{name} <span className="text-muted-foreground font-mono text-[11px]">({symbol})</span></span>
          </div>
          {avgPrice > 0 && (
            <div className="flex flex-col items-end">
              <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">Avg. Cost</span>
              <span className="text-[11px] text-foreground font-mono font-bold">₦{avgPrice.toLocaleString()}</span>
            </div>
          )}
        </div>

        <TabsContent value="buy" className="m-0">
          {renderTradeForm('buy')}
        </TabsContent>

        <TabsContent value="sell" className="m-0">
          {renderTradeForm('sell')}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TradePanel;
