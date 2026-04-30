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
    <div className="p-2 sm:p-8 space-y-4 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-full overflow-x-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1 sm:space-y-2 min-w-0">
          <h1 className="text-xl sm:text-4xl font-black tracking-tighter text-foreground flex items-center gap-2 sm:gap-3 truncate">
            <div className="p-1 sm:p-2 bg-primary/10 rounded-lg sm:rounded-2xl shrink-0">
              <Wheat className="h-5 w-5 sm:h-8 sm:w-8 text-primary" />
            </div>
            My Digital <span className="text-primary">Silo</span>
          </h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground font-medium truncate">Portfolio valuation & asset tracking.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 bg-card border border-border/50 p-2 sm:p-4 rounded-xl sm:rounded-[2rem] shadow-xl shadow-black/5 w-full lg:w-auto overflow-hidden">
          <div className="flex-1 sm:flex-none text-right border-r border-border/50 pr-2 sm:pr-4 min-w-0">
            <p className="text-[7px] sm:text-[10px] font-black uppercase text-muted-foreground tracking-widest truncate">Total Value</p>
            <p className="text-[12px] sm:text-2xl font-black font-mono text-primary truncate">₦{portfolioSummary.totalValue.toLocaleString()}</p>
          </div>
          <div className="flex-1 sm:flex-none text-right min-w-0">
            <p className="text-[7px] sm:text-[10px] font-black uppercase text-muted-foreground tracking-widest truncate">Net Profit</p>
            <p className={`text-[9px] sm:text-sm font-black font-mono truncate ${portfolioSummary.totalProfit >= 0 ? 'text-primary' : 'text-red-500'}`}>
              {portfolioSummary.totalProfit >= 0 ? '+' : ''}₦{portfolioSummary.totalProfit.toLocaleString()}
            </p>
          </div>
          <Button
            onClick={() => navigate('/user/market')}
            size="icon"
            className="h-8 w-8 sm:h-12 sm:w-12 bg-primary hover:bg-primary/90 !text-white rounded-lg sm:rounded-2xl shadow-lg shadow-primary/20 shrink-0"
          >
            <Plus className="h-4 w-4 sm:h-6 sm:w-6" />
          </Button>
        </div>
      </div>

      {holdings.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/20 py-12 sm:py-24 rounded-2xl sm:rounded-[3rem]">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6 p-6">
            <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-2xl sm:rounded-[2.5rem] bg-muted flex items-center justify-center rotate-12">
              <Wheat className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground opacity-50" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">Your silo is empty.</h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto font-medium">
                You haven't acquired any digital commodity tokens yet. Explore the marketplace to start your agricultural investment journey.
              </p>
            </div>
            <Button onClick={() => navigate('/user/market')} className="w-full sm:w-auto bg-primary !text-white px-10 h-12 sm:h-14 rounded-xl sm:rounded-2xl text-base sm:text-lg font-black shadow-xl shadow-primary/20">
              Go to Marketplace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {holdings.map((holding: any) => {
            const cropInfo = crops?.find((c: any) => c.tokenSymbol === holding.tokenSymbol);
            const currentPrice = cropInfo?.pricePerUnit || holding.averagePrice;
            const totalValue = holding.amount * currentPrice;
            const profitLoss = (currentPrice - holding.averagePrice) * holding.amount;
            const profitPct = ((currentPrice - holding.averagePrice) / holding.averagePrice) * 100;

            return (
              <Card 
                key={holding.tokenSymbol} 
                className="group relative overflow-hidden border-border/40 hover:border-primary/40 transition-all duration-500 hover:shadow-[0_40px_80px_-15px_rgba(46,125,50,0.1)] rounded-2xl sm:rounded-[2.5rem] bg-card cursor-pointer"
                onClick={() => navigate(`/user/crops/${holding.tokenSymbol}`)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                
                <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/40 bg-muted/10">
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-primary/10 text-primary border-none font-black px-3 sm:px-4 py-1 sm:py-1.5 uppercase tracking-widest text-[9px] sm:text-[10px] rounded-full">
                      {holding.tokenSymbol} Ledger
                    </Badge>
                    <div className={`flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black ${profitPct >= 0 ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}`}>
                      {profitPct >= 0 ? <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <TrendingDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
                      {profitPct.toFixed(2)}%
                    </div>
                  </div>
                  <CardTitle className="text-xl sm:text-3xl font-black tracking-tighter flex flex-col">
                    <span className="text-[10px] sm:text-sm font-bold text-muted-foreground uppercase tracking-widest mb-1">{cropInfo?.name || 'Unknown Asset'}</span>
                    <span>{holding.amount.toLocaleString()} <span className="text-base sm:text-lg opacity-40">kg</span></span>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="p-3 sm:p-6 pt-3 sm:pt-6 space-y-3 sm:space-y-6">
                  <div className="grid grid-cols-2 gap-2 sm:gap-6">
                    <div className="space-y-0.5 sm:space-y-1 min-w-0">
                      <span className="text-[7px] sm:text-[10px] uppercase font-black text-muted-foreground tracking-wider truncate block">Valuation</span>
                      <p className="text-[11px] sm:text-xl font-black font-mono text-foreground truncate">₦{totalValue.toLocaleString()}</p>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1 text-right min-w-0">
                      <span className="text-[7px] sm:text-[10px] uppercase font-black text-muted-foreground tracking-wider truncate block">Market Price</span>
                      <p className="text-[11px] sm:text-xl font-black font-mono text-primary truncate">₦{currentPrice.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="p-2 sm:p-4 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between gap-2 overflow-hidden">
                    <div className="min-w-0">
                      <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate">Entry Benchmark</p>
                      <p className="text-[10px] sm:text-sm font-bold font-mono truncate">₦{holding.averagePrice.toLocaleString()}</p>
                    </div>
                    <div className="text-right min-w-0">
                      <p className="text-[8px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest truncate">Net Result</p>
                      <p className={`text-[10px] sm:text-sm font-black font-mono truncate ${profitLoss >= 0 ? 'text-primary' : 'text-red-500'}`}>
                        {profitLoss >= 0 ? '+' : ''}₦{Math.abs(profitLoss).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 sm:gap-4 pt-1 sm:pt-2">
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/user/crops/${holding.tokenSymbol}`);
                      }}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.2em] h-10 sm:h-12 rounded-xl sm:rounded-2xl shadow-xl"
                    >
                      View History
                    </Button>
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/user/market');
                      }}
                      variant="outline"
                      className="h-10 w-10 sm:h-12 sm:w-12 p-0 rounded-xl sm:rounded-2xl border-2 border-border hover:border-primary hover:text-primary transition-all active:scale-95"
                    >
                      <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5" />
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
