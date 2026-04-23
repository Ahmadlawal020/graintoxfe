import React, { useState } from "react";
import {
  Coins,
  Search,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  BarChart3,
  Wallet,
  Clock,
  User,
} from "lucide-react";
import { useGetAllTradesQuery } from "@/services/api/financeApiSlice";
import { useGetCropsQuery } from "@/services/api/cropApiSlice";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const TokenTrading = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");

  const { data: allTrades, isLoading: tradesLoading } = useGetAllTradesQuery(undefined);
  const { data: realCrops, isLoading: cropsLoading } = useGetCropsQuery(undefined);

  const tradingVolume = React.useMemo(() => {
    if (!allTrades) return [];
    
    // Get last 7 days labels
    const days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return format(d, 'MMM dd');
    });

    return days.map(day => {
      const dayTrades = allTrades.filter((t: any) => 
        format(new Date(t.createdAt), 'MMM dd') === day
      );
      
      return {
        date: day,
        buy: dayTrades
          .filter((t: any) => t.type?.toUpperCase() === 'BUY')
          .reduce((acc: number, t: any) => acc + (t.total || 0), 0),
        sell: dayTrades
          .filter((t: any) => t.type?.toUpperCase() === 'SELL')
          .reduce((acc: number, t: any) => acc + (t.total || 0), 0)
      };
    });
  }, [allTrades]);

  if (tradesLoading || cropsLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const tokens = realCrops?.map((c: any) => ({
    symbol: c.tokenSymbol,
    name: c.name,
    price: c.pricePerUnit,
    change24h: c.priceChange || 0,
    volume24h: (c.totalStock || 0) * (c.pricePerUnit * 0.05), // Mocked for now based on stock
    marketCap: (c.totalStock || 0) * c.pricePerUnit,
    supply: c.totalStock,
    status: "Active"
  })) || [];

  const recentTrades = allTrades?.slice(0, 10).map((t: any) => ({
    id: t._id,
    type: t.type.toUpperCase(),
    token: t.symbol,
    amount: t.amount,
    price: t.price,
    total: t.total,
    buyer: `${t.user?.firstName || "Unknown"} ${t.user?.lastName || ""}`,
    time: format(new Date(t.createdAt), 'HH:mm'),
    timestamp: new Date(t.createdAt)
  })) || [];


  const totalVolume24h = tokens.reduce((acc, t) => acc + t.volume24h, 0);
  const totalMarketCap = tokens.reduce((acc, t) => acc + t.marketCap, 0);

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Token & Trading</h1>
          <p className="text-muted-foreground">
            Monitor grain-backed token markets and trading activity
          </p>
        </div>
        <div className="flex gap-2">
          {["24h", "7d", "30d"].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className={selectedPeriod === period ? "bg-primary/90 hover:bg-primary/90" : ""}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Active Tokens", value: tokens.length, icon: Coins, color: "text-primary", bg: "bg-primary/10", sub: "Grain-backed assets" },
          { title: "24h Volume", value: `₦${(totalVolume24h / 1e6).toFixed(1)}M`, icon: Activity, color: "text-blue-500", bg: "bg-blue-500/10", sub: `${recentTrades.length} recent trades` },
          { title: "Total Market Cap", value: `₦${(totalMarketCap / 1e9).toFixed(2)}B`, icon: BarChart3, color: "text-purple-500", bg: "bg-purple-500/10", sub: "All token value" },
          { title: "Avg Price Change", value: `+${(tokens.reduce((a, t) => a + t.change24h, 0) / tokens.length).toFixed(1)}%`, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10", sub: "Across all tokens" },
        ].map((stat, i) => (
          <Card key={i} className="glass-card overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trading Volume Chart */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Trading Volume Trend</CardTitle>
          <CardDescription>Buy vs sell volume over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={tradingVolume}>
              <defs>
                <linearGradient id="colorBuy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSell" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.1)" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1e6).toFixed(0)}M`} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }} formatter={(v: number) => [`₦${(v / 1e6).toFixed(1)}M`, '']} />
              <Legend />
              <Area type="monotone" dataKey="buy" stroke="#10B981" fill="url(#colorBuy)" name="Buy Volume" strokeWidth={2} />
              <Area type="monotone" dataKey="sell" stroke="#EF4444" fill="url(#colorSell)" name="Sell Volume" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Token Markets Table */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Token Markets</CardTitle>
            <CardDescription>Live prices for all grain-backed tokens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>24h Change</TableHead>
                    <TableHead>24h Volume</TableHead>
                    <TableHead>Market Cap</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokens.map((token) => (
                    <TableRow key={token.symbol} className="hover:bg-muted/50 transition cursor-pointer">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Coins className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">{token.symbol}</div>
                            <div className="text-xs text-muted-foreground">{token.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">₦{token.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`flex items-center text-sm font-medium ${token.change24h >= 0 ? "text-primary" : "text-red-500"}`}>
                          {token.change24h >= 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                          {Math.abs(token.change24h)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">₦{(token.volume24h / 1e6).toFixed(1)}M</TableCell>
                      <TableCell className="text-sm">₦{(token.marketCap / 1e6).toFixed(0)}M</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Trades */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-transparent hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-full ${trade.type === "BUY" ? "bg-primary/20 text-primary" : "bg-red-500/20 text-red-500"}`}>
                      {trade.type === "BUY" ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {trade.type} {trade.amount} {trade.token}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {trade.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">₦{trade.total.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                      <User className="w-3 h-3" /> {trade.buyer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TokenTrading;
