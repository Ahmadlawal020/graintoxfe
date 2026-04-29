import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  History, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  Calendar, 
  Coins, 
  Search,
  Filter,
  Wheat
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import useAuth from "@/hooks/useAuth";
import { useGetUserByIdQuery } from "@/services/api/userApiSlice";
import { useGetUserTradesQuery } from "@/services/api/financeApiSlice";
import { useGetCropsQuery } from "@/services/api/cropApiSlice";
import { format } from 'date-fns';

const CropDetails = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { id } = useAuth();
  const { data: userData, isLoading: userLoading } = useGetUserByIdQuery(id || "", { pollingInterval: 10000 });
  const { data: trades, isLoading: tradesLoading } = useGetUserTradesQuery(undefined, { pollingInterval: 10000 });
  const { data: crops = [], isLoading: cropsLoading } = useGetCropsQuery(undefined, { pollingInterval: 30000 });

  const crop = crops.find((c: any) => c.tokenSymbol === symbol);
  const holding = userData?.holdings?.find((h: any) => h.tokenSymbol === symbol);
  const cropTrades = trades?.filter((t: any) => t.symbol === symbol) || [];

  if (userLoading || tradesLoading || cropsLoading) {
    return (
      <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  const buyTrades = cropTrades.filter((t: any) => t.type === 'buy');
  const sellTrades = cropTrades.filter((t: any) => t.type === 'sell');
  
  const totalBought = buyTrades.reduce((acc: number, t: any) => acc + t.amount, 0);
  const totalSold = sellTrades.reduce((acc: number, t: any) => acc + t.amount, 0);

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/user/crops')}
          className="w-fit hover:bg-muted -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to My Crops
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest text-[10px]">
                Market Status: ACTIVE
              </Badge>
              <span className="text-muted-foreground font-mono text-xs font-bold">{symbol}/NGN</span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground">{crop?.name || symbol} <span className="text-primary">Ledger</span></h1>
          </div>
          <div className="text-right flex flex-col items-end">
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Market Benchmark</p>
            <p className="text-3xl font-black font-mono text-primary">₦{(crop?.pricePerUnit || 0).toLocaleString()}<span className="text-sm font-bold text-muted-foreground ml-1">/kg</span></p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase">Current Inventory: {(crop?.totalStock || 0).toLocaleString()} kg</p>
          </div>
        </div>
      </div>

      {/* Holding Highlight */}
      <Card className="bg-primary text-primary-foreground border-none shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
               <Wheat className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] opacity-80">Your Personal Holdings</p>
              <h2 className="text-4xl font-black tracking-tighter">{(holding?.amount || 0).toLocaleString()} <span className="text-sm font-bold opacity-60">kg</span></h2>
            </div>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <Button className="flex-1 sm:flex-none !bg-white !text-primary hover:!bg-white/90 font-black px-8 h-12 rounded-xl shadow-xl uppercase text-xs tracking-widest" onClick={() => navigate('/user/market')}>
              Trade Asset
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none border-white/30 hover:bg-white/10 font-bold px-8 h-12 rounded-xl uppercase text-xs tracking-widest" onClick={() => navigate('/user/storage')}>
              Request Deposit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card border-border/50 shadow-sm relative overflow-hidden group">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Total Volume Purchased</p>
                <p className="text-2xl font-black font-mono">{totalBought.toLocaleString()} kg</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-sm relative overflow-hidden group">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Total Volume Liquidated</p>
                <p className="text-2xl font-black font-mono">{totalSold.toLocaleString()} kg</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                <TrendingDown className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-sm relative overflow-hidden group">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Cost Basis (Avg Price)</p>
                <p className="text-2xl font-black font-mono">₦{(holding?.averagePrice || 0).toLocaleString()}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase">Current PnL: <span className={((crop?.pricePerUnit || 0) - (holding?.averagePrice || 0)) >= 0 ? 'text-primary' : 'text-red-500'}>₦{(((crop?.pricePerUnit || 0) - (holding?.averagePrice || 0)) * (holding?.amount || 0)).toLocaleString()}</span></p>
              </div>
              <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-foreground group-hover:scale-110 transition-transform">
                <Coins className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card className="border-border/50 shadow-xl shadow-black/5 bg-card">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20 px-6 py-4">
          <div className="space-y-1">
            <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Transaction History
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-tight">Full audit log of all your {symbol} trades.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest">
              <Filter className="h-3 w-3 mr-2" /> Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/30 text-[9px] text-muted-foreground font-black uppercase tracking-widest border-b border-border/50">
                  <th className="px-6 py-4 text-left">Reference ID</th>
                  <th className="px-6 py-4 text-left">Type</th>
                  <th className="px-6 py-4 text-left">Date & Time</th>
                  <th className="px-6 py-4 text-right">Price</th>
                  <th className="px-6 py-4 text-right">Quantity</th>
                  <th className="px-6 py-4 text-right">Total Value</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="text-xs font-mono">
                {cropTrades.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-20">
                      <div className="flex flex-col items-center justify-center opacity-40">
                        <Receipt className="h-12 w-12 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">No transactions found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  cropTrades.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((tx: any) => (
                    <tr key={tx._id} className="border-b border-border/30 hover:bg-muted/20 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors font-bold uppercase truncate max-w-[80px] block">
                          #{tx._id.slice(-8)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={`font-black uppercase text-[8px] tracking-widest px-2 py-0.5 border-none ${
                          tx.type === 'buy' ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-sans text-[11px] font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(tx.createdAt), 'MMM dd, yyyy · HH:mm:ss')}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold">₦{(tx.price || 0).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-bold">{tx.amount.toLocaleString()}</span>
                        <span className="text-[8px] text-muted-foreground ml-1 font-sans font-black uppercase">kg</span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-foreground">₦{tx.total?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'completed' ? 'bg-primary' : 'bg-amber-500'} animate-pulse`} />
                          <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground">{tx.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CropDetails;
