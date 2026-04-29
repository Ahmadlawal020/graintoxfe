import React, { useMemo } from "react";
import { PieChart as PieIcon, Coins, TrendingUp, ArrowUpRight, ArrowDownRight, Wheat, BarChart3, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/services/authSlice";
import { useGetUserByIdQuery } from "@/services/api/userApiSlice";
import { useGetCropsQuery } from "@/services/api/cropApiSlice";

const Portfolio = () => {
  const user = useSelector(selectCurrentUser);
  const { data: userData, isLoading: userLoading } = useGetUserByIdQuery(user?.id || "", { pollingInterval: 10000 });
  const { data: crops, isLoading: cropsLoading } = useGetCropsQuery(undefined, { pollingInterval: 30000 });

  const holdings = useMemo(() => {
    if (!userData?.holdings || !crops) return [];

    const colors = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899", "#6366F1"];

    return userData.holdings.map((h: any, i: number) => {
      const crop = crops.find((c: any) => c.tokenSymbol === h.tokenSymbol);
      const currentPrice = crop ? crop.pricePerUnit : h.averagePrice;
      const value = h.amount * currentPrice;
      const cost = h.amount * h.averagePrice;
      const change = h.averagePrice > 0 ? ((currentPrice - h.averagePrice) / h.averagePrice) * 100 : 0;

      return {
        symbol: h.tokenSymbol,
        name: crop ? crop.name : h.tokenSymbol,
        tokens: h.amount,
        avgBuy: h.averagePrice,
        currentPrice: currentPrice,
        value: value,
        change: change.toFixed(1),
        color: colors[i % colors.length]
      };
    });
  }, [userData, crops]);

  if (userLoading || cropsLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalValue = holdings.reduce((a, h) => a + h.value, 0);
  const totalCost = holdings.reduce((a, h) => a + (h.tokens * h.avgBuy), 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPct = totalCost > 0 ? ((totalPnL / totalCost) * 100).toFixed(1) : "0.0";

  const pieData = holdings.map((h) => ({ name: h.symbol, value: h.value, color: h.color }));

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-4 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Portfolio</h1>
        <p className="text-sm text-muted-foreground">Detailed breakdown of your grain token investments</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { title: "Total Value", value: `₦${(totalValue / 1e6).toFixed(1)}M`, icon: PieIcon, color: "text-primary", bg: "bg-primary/10" },
          { title: "Total P&L", value: `₦${(totalPnL / 1e6).toFixed(2)}M`, icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10", sub: <span className="text-primary flex items-center text-[10px] sm:text-xs"><ArrowUpRight className="w-3 h-3" /> +{totalPnLPct}%</span> },
          { title: "Tokens Held", value: holdings.reduce((a, h) => a + h.tokens, 0), icon: Coins, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-4">
              <CardTitle className="text-[10px] sm:text-sm font-medium leading-tight">{stat.title}</CardTitle>
              <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bg} shrink-0`}><stat.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${stat.color}`} /></div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-base sm:text-2xl font-bold truncate">{stat.value}</div>
              {stat.sub && <div className="mt-0.5 sm:mt-1">{stat.sub}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-5">
        {/* Allocation Chart */}
        <Card className="card-hover lg:col-span-2">
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-base sm:text-lg">Allocation</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 lg:p-6 pt-0">
            <div className="h-[160px] sm:h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`₦${(v / 1e6).toFixed(1)}M`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {holdings.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center">
                    <div className="w-2.5 h-2.5 rounded-full mr-2 shrink-0" style={{ backgroundColor: h.color }} />
                    <span className="font-mono text-[10px] sm:text-xs">{h.symbol}</span>
                  </div>
                  <span className="font-medium">{Math.round((h.value / totalValue) * 100)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Holdings Detail - Card layout on mobile, table on desktop */}
        <Card className="lg:col-span-3">
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-base sm:text-lg">Holdings Detail</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 lg:p-6 pt-0">
            {/* Mobile: Card-based layout */}
            <div className="space-y-3 sm:hidden">
              {holdings.map((h) => {
                const pnl = (h.currentPrice - h.avgBuy) * h.tokens;
                return (
                  <div key={h.symbol} className="p-3 rounded-xl bg-muted/20 border border-transparent hover:border-primary/20 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }} />
                        <span className="font-mono text-xs font-bold">{h.symbol}</span>
                        <span className="text-muted-foreground text-[10px]">{h.name}</span>
                      </div>
                      <span className={`flex items-center text-xs font-bold ${pnl >= 0 ? "text-primary" : "text-red-500"}`}>
                        {pnl >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {h.change}%
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[10px]">
                      <div>
                        <span className="text-muted-foreground block">Qty</span>
                        <span className="font-semibold">{h.tokens} kg</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Price</span>
                        <span className="font-semibold">₦{h.currentPrice.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Value</span>
                        <span className="font-semibold">₦{(h.value / 1e6).toFixed(1)}M</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop: Table layout */}
            <div className="hidden sm:block rounded-md border overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Token</th>
                    <th className="text-left p-3 font-medium">Qty</th>
                    <th className="text-left p-3 font-medium">Avg Buy</th>
                    <th className="text-left p-3 font-medium">Current</th>
                    <th className="text-left p-3 font-medium">Value</th>
                    <th className="text-left p-3 font-medium">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => {
                    const pnl = (h.currentPrice - h.avgBuy) * h.tokens;
                    return (
                      <tr key={h.symbol} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="p-3 font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: h.color }} />
                            <span className="font-mono text-xs font-semibold">{h.symbol}</span>
                            <span className="text-muted-foreground text-xs">{h.name}</span>
                          </div>
                        </td>
                        <td className="p-3">{h.tokens}</td>
                        <td className="p-3 text-muted-foreground">₦{h.avgBuy.toLocaleString()}</td>
                        <td className="p-3 font-semibold">₦{h.currentPrice.toLocaleString()}</td>
                        <td className="p-3 font-semibold">₦{(h.value / 1e6).toFixed(1)}M</td>
                        <td className="p-3">
                          <span className={`flex items-center text-sm font-medium ${pnl >= 0 ? "text-primary" : "text-red-500"}`}>
                            {pnl >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                            {h.change}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Portfolio;
