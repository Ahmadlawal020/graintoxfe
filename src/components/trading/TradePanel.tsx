import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Info, Loader2 } from 'lucide-react';
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
  const { data: userData } = useGetUserByIdQuery(user?.id || "");
  const [executeTrade, { isLoading: isTrading }] = useExecuteTradeMutation();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [useSLTP, setUseSLTP] = useState(false);
  const [price, setPrice] = useState(currentPrice.toString());
  const [amount, setAmount] = useState("");
  const [sliderValue, setSliderValue] = useState([0]);

  const handleTabChange = (val: string) => {
    setActiveTab(val as 'buy' | 'sell');
    setAmount("");
    setSliderValue([0]);
  };

  useEffect(() => {
    setPrice(currentPrice.toString());
  }, [currentPrice]);
  
  const walletBalance = userData?.walletBalance || 0;
  const assetBalance = userData?.holdings?.find((h: any) => h.tokenSymbol === symbol)?.amount || 0;

  const total = Number(price) * Number(amount || 0);
  const fee = total * 0.001; // 0.1% fee

  const handleSliderChange = (value: number[], type: 'buy' | 'sell') => {
    setSliderValue(value);
    const pct = value[0] / 100;
    
    if (type === 'buy') {
      const maxAmount = Math.floor((walletBalance / Number(price || 1)) * 100) / 100;
      setAmount((maxAmount * pct).toFixed(2));
    } else {
      setAmount((assetBalance * pct).toFixed(2));
    }
  };

  const handleMaxAmount = (type: 'buy' | 'sell') => {
    if (type === 'buy') {
      const maxAmount = Math.floor((walletBalance / Number(price || 1)) * 100) / 100;
      setAmount(maxAmount.toString());
      setSliderValue([100]);
    } else {
      setAmount(assetBalance.toString());
      setSliderValue([100]);
    }
  };

  const handleTrade = async (type: 'buy' | 'sell') => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await executeTrade({
        symbol,
        type,
        amount: parseFloat(amount),
        price: parseFloat(price)
      }).unwrap();
      
      toast.success(`${type.toUpperCase()} order executed successfully!`);
      setAmount("");
      setSliderValue([0]);
    } catch (error: any) {
      console.error("Trade error:", error);
      toast.error(error.data?.message || "Failed to execute trade");
    }
  };

  return (
    <div className="bg-[#161a1e] p-3 sm:p-4 w-full flex flex-col font-sans">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card p-1 rounded-lg mb-4 sm:mb-6">
          <TabsTrigger
            value="buy"
            className="data-[state=active]:bg-primary data-[state=active]:text-foreground transition-all text-muted-foreground font-bold uppercase tracking-widest text-[10px] sm:text-[11px] h-9 sm:h-10"
          >
            Buy
          </TabsTrigger>
          <TabsTrigger
            value="sell"
            className="data-[state=active]:bg-red-500 data-[state=active]:text-foreground transition-all text-muted-foreground font-bold uppercase tracking-widest text-[10px] sm:text-[11px] h-9 sm:h-10"
          >
            Sell
          </TabsTrigger>
        </TabsList>

        <div className="space-y-4 sm:space-y-5">
          {/* Asset Name Header */}
          <div className="flex flex-col border-l-2 border-primary pl-3 py-1">
            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Selected Asset</span>
            <span className="text-foreground font-bold text-sm tracking-tight">{name} <span className="text-muted-foreground font-mono text-[11px]">({symbol})</span></span>
          </div>

          <TabsContent value="buy" className="m-0 space-y-4 sm:space-y-5">
            {/* Available Balance Buy */}
            <div className="flex justify-between items-center text-[11px] bg-card p-2.5 rounded-lg border border-gray-800/30">
              <span className="text-muted-foreground font-bold uppercase tracking-tighter">Available Balance</span>
              <span className="text-foreground font-mono">₦{walletBalance.toLocaleString()} <span className="text-muted-foreground">NGN</span></span>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {/* Price Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Price</Label>
                  <span 
                    onClick={() => setPrice(currentPrice.toString())}
                    className="text-[9px] text-primary font-bold uppercase cursor-pointer hover:text-primary/80 transition-colors"
                  >
                    Market
                  </span>
                </div>
                <div className="relative group">
                  <Input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-[#1e2329] border-gray-800 text-foreground h-11 sm:h-12 focus:ring-1 focus:ring-primary/50 border-none transition-all font-mono text-sm pl-4 pr-14"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold">NGN</span>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Amount</Label>
                  <span 
                    onClick={() => handleMaxAmount('buy')}
                    className="text-[9px] text-primary font-bold uppercase cursor-pointer hover:text-primary/80 transition-colors"
                  >
                    Max
                  </span>
                </div>
                <div className="relative group">
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-[#1e2329] border-gray-800 text-foreground h-11 sm:h-12 focus:ring-1 focus:ring-primary/50 border-none transition-all font-mono text-sm pl-4 pr-14"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold">MT</span>
                </div>
              </div>

              {/* Percentage Slider */}
              <div className="pt-1 px-1">
                <Slider
                  value={sliderValue}
                  onValueChange={(v) => handleSliderChange(v, 'buy')}
                  max={100}
                  step={25}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground font-bold mt-2 px-0.5">
                  {[0, 25, 50, 75, 100].map(v => (
                    <button
                      key={v}
                      onClick={() => handleSliderChange([v], 'buy')}
                      className="hover:text-foreground transition-colors"
                    >
                      {v}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="space-y-1.5">
                <Label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total</Label>
                <div className="relative">
                  <Input
                    value={total > 0 ? total.toLocaleString() : ''}
                    readOnly
                    placeholder="0.00"
                    className="bg-[#1e2329] border-gray-800 text-foreground h-11 sm:h-12 border-none font-mono text-sm pl-4 pr-14 cursor-default"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold">NGN</span>
                </div>
              </div>

              {/* Action Button Buy */}
              <div className="pt-2">
                <Button 
                  onClick={() => handleTrade('buy')}
                  disabled={isTrading || !amount}
                  className="w-full h-12 sm:h-13 bg-primary hover:bg-primary/90 text-foreground font-black text-sm uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                >
                  {isTrading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Buy {symbol}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sell" className="m-0 space-y-4 sm:space-y-5">
            {/* Available Balance Sell */}
            <div className="flex justify-between items-center text-[11px] bg-card p-2.5 rounded-lg border border-gray-800/30">
              <span className="text-muted-foreground font-bold uppercase tracking-tighter">Available {symbol}</span>
              <span className="text-foreground font-mono">{assetBalance.toLocaleString()} <span className="text-muted-foreground">MT</span></span>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {/* Price Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Price</Label>
                  <span 
                    onClick={() => setPrice(currentPrice.toString())}
                    className="text-[9px] text-red-500 font-bold uppercase cursor-pointer hover:text-red-400 transition-colors"
                  >
                    Market
                  </span>
                </div>
                <div className="relative group">
                  <Input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-[#1e2329] border-gray-800 text-foreground h-11 sm:h-12 focus:ring-1 focus:ring-red-500/50 border-none transition-all font-mono text-sm pl-4 pr-14"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold">NGN</span>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Amount</Label>
                  <span 
                    onClick={() => handleMaxAmount('sell')}
                    className="text-[9px] text-red-500 font-bold uppercase cursor-pointer hover:text-red-400 transition-colors"
                  >
                    Max
                  </span>
                </div>
                <div className="relative group">
                  <Input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="bg-[#1e2329] border-gray-800 text-foreground h-11 sm:h-12 focus:ring-1 focus:ring-red-500/50 border-none transition-all font-mono text-sm pl-4 pr-14"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold">MT</span>
                </div>
              </div>

              {/* Percentage Slider */}
              <div className="pt-1 px-1">
                <Slider
                  value={sliderValue}
                  onValueChange={(v) => handleSliderChange(v, 'sell')}
                  max={100}
                  step={25}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-muted-foreground font-bold mt-2 px-0.5">
                  {[0, 25, 50, 75, 100].map(v => (
                    <button
                      key={v}
                      onClick={() => handleSliderChange([v], 'sell')}
                      className="hover:text-foreground transition-colors"
                    >
                      {v}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="space-y-1.5">
                <Label className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Total Est. Value</Label>
                <div className="relative">
                  <Input
                    value={total > 0 ? total.toLocaleString() : ''}
                    readOnly
                    placeholder="0.00"
                    className="bg-[#1e2329] border-gray-800 text-foreground h-11 sm:h-12 border-none font-mono text-sm pl-4 pr-14 cursor-default"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold">NGN</span>
                </div>
              </div>

              {/* Action Button Sell */}
              <div className="pt-2">
                <Button 
                  onClick={() => handleTrade('sell')}
                  disabled={isTrading || !amount}
                  className="w-full h-12 sm:h-13 bg-red-500 hover:bg-red-600 text-foreground font-black text-sm uppercase tracking-widest shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all"
                >
                  {isTrading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Sell {symbol}
                </Button>
              </div>
            </div>
          </TabsContent>

          <div className="space-y-3 sm:space-y-4">

            {/* TP/SL Toggle (Commented out for now as per simple request) */}
            {/* 
            <div className="pt-1">
              ...
            </div>
            */}

            {/* Fee & Summary */}
            <div className="mt-3 space-y-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-tight px-1">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  <Info className="w-3 h-3" /> Est. Fee (0.1%)
                </span>
                <span>≈ ₦{fee > 0 ? fee.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0.00'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>You'll Receive/Pay</span>
                <span className="text-foreground font-mono">{amount || '0'} MT</span>
              </div>
            </div>
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default TradePanel;
