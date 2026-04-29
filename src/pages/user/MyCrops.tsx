import React from 'react';
import { Wheat, History, TrendingUp, TrendingDown, ArrowUpRight, Search, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useAuth from "@/hooks/useAuth";
import { useGetUserByIdQuery } from "@/services/api/userApiSlice";
import { useGetCropsQuery } from "@/services/api/cropApiSlice";
import { useNavigate } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton";

const MyCrops = () => {
  console.log("Rendering MyCrops Page...");
  const { id } = useAuth();
  const navigate = useNavigate();
  const { data: userData, isLoading: userLoading } = useGetUserByIdQuery(id || "", { pollingInterval: 10000 });
  const { data: crops, isLoading: cropsLoading } = useGetCropsQuery(undefined, { pollingInterval: 30000 });

  if (userLoading || cropsLoading) {
    return (
      <div className="p-4 sm:p-8 space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const holdings = userData?.holdings || [];

  const portfolioSummary = holdings.reduce((acc: any, h: any) => {
    const cropInfo = crops?.find((c: any) => c.tokenSymbol === h.tokenSymbol);
    const currentPrice = cropInfo?.pricePerUnit || h.averagePrice;
    const value = h.amount * currentPrice;
    const cost = h.amount * h.averagePrice;
    return {
      totalValue: acc.totalValue + value,
      totalProfit: acc.totalProfit + (value - cost),
    };
  }, { totalValue: 0, totalProfit: 0 });

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-foreground flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-2xl">
              <Wheat className="h-8 w-8 text-primary" />
            </div>
            My Digital <span className="text-primary">Silo</span>
          </h1>
          <p className="text-muted-foreground font-medium">Real-time valuation of your agricultural asset portfolio.</p>
        </div>
        <div className="flex items-center gap-4 bg-card border border-border/50 p-4 rounded-[2rem] shadow-xl shadow-black/5">
          <div className="text-right border-r border-border/50 pr-4">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total Value</p>
            <p className="text-2xl font-black font-mono text-primary">₦{portfolioSummary.totalValue.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Net Profit</p>
            <p className={`text-sm font-black font-mono ${portfolioSummary.totalProfit >= 0 ? 'text-primary' : 'text-red-500'}`}>
              {portfolioSummary.totalProfit >= 0 ? '+' : ''}₦{portfolioSummary.totalProfit.toLocaleString()}
            </p>
          </div>
          <Button
            onClick={() => navigate('/user/market')}
            size="icon"
            className="h-12 w-12 bg-primary hover:bg-primary/90 !text-white rounded-2xl shadow-lg shadow-primary/20 ml-2"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {holdings.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/20 py-24 rounded-[3rem]">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-6">
            <div className="h-24 w-24 rounded-[2.5rem] bg-muted flex items-center justify-center rotate-12">
              <Wheat className="h-12 w-12 text-muted-foreground opacity-50" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight">Your silo is empty.</h3>
              <p className="text-muted-foreground max-w-xs mx-auto font-medium">
                You haven't acquired any digital commodity tokens yet. Explore the marketplace to start your agricultural investment journey.
              </p>
            </div>
            <Button onClick={() => navigate('/user/market')} className="bg-primary !text-white px-10 h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20">
              Go to Marketplace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {holdings.map((holding: any) => {
            const cropInfo = crops?.find((c: any) => c.tokenSymbol === holding.tokenSymbol);
            const currentPrice = cropInfo?.pricePerUnit || holding.averagePrice;
            const totalValue = holding.amount * currentPrice;
            const profitLoss = (currentPrice - holding.averagePrice) * holding.amount;
            const profitPct = ((currentPrice - holding.averagePrice) / holding.averagePrice) * 100;

            return (
              <Card 
                key={holding.tokenSymbol} 
                className="group relative overflow-hidden border-border/40 hover:border-primary/40 transition-all duration-500 hover:shadow-[0_40px_80px_-15px_rgba(46,125,50,0.1)] rounded-[2.5rem] bg-card cursor-pointer"
                onClick={() => navigate(`/user/crops/${holding.tokenSymbol}`)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                
                <CardHeader className="pb-4 border-b border-border/40 bg-muted/10">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-primary/10 text-primary border-none font-black px-4 py-1.5 uppercase tracking-widest text-[10px] rounded-full">
                      {holding.tokenSymbol} Ledger
                    </Badge>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${profitPct >= 0 ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}`}>
                      {profitPct >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                      {profitPct.toFixed(2)}%
                    </div>
                  </div>
                  <CardTitle className="text-3xl font-black tracking-tighter flex flex-col">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">{cropInfo?.name || 'Unknown Asset'}</span>
                    <span>{holding.amount.toLocaleString()} <span className="text-lg opacity-40">kg</span></span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em]">Asset Valuation</span>
                      <p className="text-xl font-black font-mono text-foreground">₦{totalValue.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em]">Market Price</span>
                      <p className="text-xl font-black font-mono text-primary">₦{currentPrice.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Entry Benchmark</p>
                      <p className="text-sm font-bold font-mono">₦{holding.averagePrice.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Net Result</p>
                      <p className={`text-sm font-black font-mono ${profitLoss >= 0 ? 'text-primary' : 'text-red-500'}`}>
                        {profitLoss >= 0 ? '+' : ''}₦{Math.abs(profitLoss).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-2">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/user/crops/${holding.tokenSymbol}`);
                      }}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-[0.2em] h-12 rounded-2xl shadow-xl"
                    >
                      View History
                    </Button>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/user/market');
                      }}
                      variant="outline"
                      className="h-12 w-12 p-0 rounded-2xl border-2 border-border hover:border-primary hover:text-primary transition-all active:scale-95"
                    >
                      <ArrowUpRight className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCrops;
