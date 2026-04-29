import React from 'react';
import { Wheat, History, TrendingUp, TrendingDown, ArrowUpRight, Search } from 'lucide-react';
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

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
            <Wheat className="h-8 w-8 text-primary" />
            My Crops
          </h1>
          <p className="text-muted-foreground font-medium">Manage and monitor your digital commodity holdings.</p>
        </div>
        <Button 
          onClick={() => navigate('/user/market')}
          className="bg-primary hover:bg-primary/90 !text-white rounded-full px-6 shadow-lg shadow-primary/20"
        >
          Buy More Crops
        </Button>
      </div>

      {holdings.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/50 py-16">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              <Wheat className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">No crops found</h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                You haven't purchased any digital crops yet. Start trading to see your holdings here.
              </p>
            </div>
            <Button onClick={() => navigate('/user/market')} variant="outline" className="mt-4">
              Explore Marketplace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {holdings.map((holding: any) => {
            const cropInfo = crops?.find((c: any) => c.tokenSymbol === holding.tokenSymbol);
            const currentPrice = cropInfo?.pricePerUnit || holding.averagePrice;
            const totalValue = holding.amount * currentPrice;
            const profitLoss = (currentPrice - holding.averagePrice) * holding.amount;
            const profitPct = ((currentPrice - holding.averagePrice) / holding.averagePrice) * 100;

            return (
              <Card 
                key={holding.tokenSymbol} 
                className="group relative overflow-hidden border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Wheat className="h-24 w-24 -mr-8 -mt-8 rotate-12" />
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-black px-3 py-1 uppercase tracking-widest text-[10px]">
                      {holding.tokenSymbol}
                    </Badge>
                    <div className={`flex items-center gap-1 text-xs font-bold ${profitPct >= 0 ? 'text-primary' : 'text-red-500'}`}>
                      {profitPct >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {profitPct >= 0 ? '+' : ''}{profitPct.toFixed(2)}%
                    </div>
                  </div>
                  <CardTitle className="text-2xl pt-2 font-black tracking-tight">{holding.tokenSymbol} Digital kg</CardTitle>
                  <CardDescription className="font-mono text-xs uppercase tracking-tighter font-bold">
                    Quantity: {holding.amount.toLocaleString()} kg
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Current Value</span>
                      <p className="text-lg font-black font-mono">₦{totalValue.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Avg Price</span>
                      <p className="text-lg font-black font-mono text-muted-foreground/80">₦{holding.averagePrice.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <Button 
                      onClick={() => navigate(`/user/crops/${holding.tokenSymbol}`)}
                      className="flex-1 bg-accent hover:bg-accent/80 text-foreground font-bold text-xs uppercase tracking-widest"
                    >
                      <History className="h-3.5 w-3.5 mr-2" />
                      View History
                    </Button>
                    <Button 
                      onClick={() => navigate('/user/market')}
                      variant="ghost"
                      className="h-10 w-10 p-0 rounded-lg border border-border/50 hover:border-primary/50 text-primary"
                    >
                      <ArrowUpRight className="h-4 w-4" />
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
