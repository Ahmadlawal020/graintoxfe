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
    <div className="p-2 sm:p-8 space-y-4 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-4">
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
              <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-widest text-[8px] sm:text-[10px]">
                Market Status: ACTIVE
              </Badge>
              <span className="text-muted-foreground font-mono text-[10px] sm:text-xs font-bold">{symbol}/NGN</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tighter text-foreground leading-tight">
              {crop?.name || symbol} <span className="text-primary">Ledger</span>
            </h1>
          </div>
          <div className="text-left sm:text-right flex flex-col items-start sm:items-end bg-muted/20 sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-border/50 sm:border-none">
            <p className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-black tracking-widest">Market Benchmark</p>
            <p className="text-xl sm:text-3xl font-black font-mono text-primary">₦{(crop?.pricePerUnit || 0).toLocaleString()}<span className="text-xs sm:text-sm font-bold text-muted-foreground ml-1">/kg</span></p>
            <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase mt-0.5">Current Inventory: {(crop?.totalStock || 0).toLocaleString()} kg</p>
          </div>
        </div>
      </div>

      {/* Holding Highlight */}
      <Card className="bg-primary text-primary-foreground border-none shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
        <CardContent className="p-4 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 relative z-10">
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="h-10 w-10 sm:h-16 sm:w-16 rounded-lg sm:rounded-2xl bg-white/20 flex items-center justify-center shadow-inner shrink-0">
              <Wheat className="h-5 w-5 sm:h-8 sm:w-8" />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] opacity-80 truncate">Your Holdings</p>
              <h2 className="text-xl sm:text-4xl font-black tracking-tighter truncate">
                {(holding?.amount || 0).toLocaleString()} <span className="text-[10px] sm:text-sm font-bold opacity-60">kg</span>
              </h2>
            </div>
          </div>
          <div className="flex flex-col min-[350px]:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <Button className="flex-1 sm:flex-none !bg-white !text-primary hover:!bg-white/90 font-black px-3 sm:px-8 h-10 sm:h-12 rounded-lg sm:rounded-xl shadow-xl uppercase text-[10px] sm:text-xs tracking-wider" onClick={() => navigate('/user/market')}>
              Trade Asset
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none border-white/30 hover:bg-white/10 font-bold px-3 sm:px-8 h-10 sm:h-12 rounded-lg sm:rounded-xl uppercase text-[10px] sm:text-xs tracking-wider" onClick={() => navigate('/user/storage')}>
              Deposit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 min-[500px]:grid-cols-3 gap-3 sm:gap-6">
        <Card className="bg-card border-border/50 shadow-sm relative overflow-hidden group">
          <CardContent className="p-4 sm:pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1 min-w-0">
                <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase font-black tracking-widest truncate">Total Purchased</p>
                <p className="text-lg sm:text-2xl font-black font-mono truncate">{totalBought.toLocaleString()} kg</p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shrink-0">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-sm relative overflow-hidden group">
          <CardContent className="p-4 sm:pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1 min-w-0">
                <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase font-black tracking-widest truncate">Total Liquidated</p>
                <p className="text-lg sm:text-2xl font-black font-mono truncate">{totalSold.toLocaleString()} kg</p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform shrink-0">
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 shadow-sm relative overflow-hidden group">
          <CardContent className="p-4 sm:pt-6">
            <div className="flex justify-between items-start">
              <div className="space-y-1 min-w-0">
                <p className="text-[8px] sm:text-[10px] text-muted-foreground uppercase font-black tracking-widest truncate">Cost Basis</p>
                <p className="text-lg sm:text-2xl font-black font-mono truncate">₦{(holding?.averagePrice || 0).toLocaleString()}</p>
                <p className="text-[8px] sm:text-[9px] font-bold text-muted-foreground uppercase truncate">PnL: <span className={((crop?.pricePerUnit || 0) - (holding?.averagePrice || 0)) >= 0 ? 'text-primary' : 'text-red-500'}>₦{(((crop?.pricePerUnit || 0) - (holding?.averagePrice || 0)) * (holding?.amount || 0)).toLocaleString()}</span></p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-accent flex items-center justify-center text-foreground group-hover:scale-110 transition-transform shrink-0">
                <Coins className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card className="border-border/50 shadow-xl shadow-black/5 bg-card">
        <CardHeader className="flex flex-col min-[450px]:flex-row items-start min-[450px]:items-center justify-between border-b border-border/50 bg-muted/20 px-4 sm:px-6 py-4 gap-3">
          <div className="space-y-1 min-w-0">
            <CardTitle className="text-sm sm:text-lg font-black uppercase tracking-widest flex items-center gap-2 truncate">
              <History className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              History
            </CardTitle>
            <CardDescription className="text-[8px] sm:text-[10px] font-bold uppercase tracking-tight truncate">Asset audit log</CardDescription>
          </div>
          <div className="flex gap-2 w-full min-[450px]:w-auto">
            <Button variant="outline" size="sm" className="h-8 text-[9px] sm:text-[10px] font-black uppercase tracking-widest flex-1 min-[450px]:flex-none">
              <Filter className="h-3 w-3 mr-1 sm:mr-2" /> Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/30 text-[9px] text-muted-foreground font-black uppercase tracking-widest border-b border-border/50">
                  <th className="px-4 sm:px-6 py-4 text-left hidden sm:table-cell">Reference ID</th>
                  <th className="px-4 sm:px-6 py-4 text-left">Type</th>
                  <th className="px-4 sm:px-6 py-4 text-left hidden sm:table-cell">Date & Time</th>
                  <th className="px-4 sm:px-6 py-4 text-right">Price</th>
                  <th className="px-4 sm:px-6 py-4 text-right">Qty</th>
                  <th className="px-4 sm:px-6 py-4 text-right hidden md:table-cell">Total Value</th>
                  <th className="px-4 sm:px-6 py-4 text-right hidden min-[400px]:table-cell">Status</th>
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
                      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                        <span className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors font-bold uppercase truncate max-w-[80px] block">
                          #{tx._id.slice(-8)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <Badge className={`font-black uppercase text-[8px] tracking-widest px-2 py-0.5 border-none ${tx.type === 'buy' ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'
                          }`}>
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-muted-foreground font-sans text-[10px] sm:text-[11px] font-medium hidden sm:table-cell">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span>{format(new Date(tx.createdAt), 'MMM dd, yyyy · HH:mm')}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right font-bold text-[10px] sm:text-xs">₦{(tx.price || 0).toLocaleString()}</td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <span className="font-bold">{tx.amount.toLocaleString()}</span>
                        <span className="text-[8px] text-muted-foreground ml-0.5 font-sans font-black uppercase">kg</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right font-black text-foreground hidden md:table-cell">₦{tx.total?.toLocaleString()}</td>
                      <td className="px-4 sm:px-6 py-4 text-right hidden min-[400px]:table-cell">
                        <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                          <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${tx.status === 'completed' ? 'bg-primary' : 'bg-amber-500'} animate-pulse`} />
                          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tighter text-muted-foreground">{tx.status}</span>
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
