import React from "react";
import {
  PieChart as PieIcon, Wallet, Coins, TrendingUp,
  ArrowUpRight, ArrowDownRight, Activity, Clock,
  ShoppingCart, BarChart3, Eye, EyeOff, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";

import useAuth from "@/hooks/useAuth";
import { useGetUserByIdQuery } from "@/services/api/userApiSlice";
import { useGetCropsQuery } from "@/services/api/cropApiSlice";
import { useGetUserTradesQuery } from "@/services/api/financeApiSlice";
import { Loader2 } from "lucide-react";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { id } = useAuth();
  const [showBalance, setShowBalance] = useState(true);

  const { data: userData, isLoading: userLoading } = useGetUserByIdQuery(id || "");
  const { data: crops, isLoading: cropsLoading } = useGetCropsQuery(undefined);
  const { data: trades, isLoading: tradesLoading } = useGetUserTradesQuery(undefined);

  const portfolioHistory = [
    { date: "Jan", value: 8500000 },
    { date: "Feb", value: 9200000 },
    { date: "Mar", value: 10100000 },
    { date: "Apr", value: 12500000 },
  ];

  const holdings = useMemo(() => {
    if (!userData?.holdings || !crops) return [];
    const colors = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EC4899"];
    
    return userData.holdings.map((h: any, i: number) => {
      const crop = crops.find((c: any) => c.tokenSymbol === h.tokenSymbol);
      const price = crop ? crop.pricePerUnit : h.averagePrice;
      const value = h.amount * price;
      
      return {
        name: h.tokenSymbol,
        tokens: h.amount,
        amount: value,
        value: h.amount, // for pie chart percentage
        color: colors[i % colors.length]
      };
    });
  }, [userData, crops]);

  const recentActivity = useMemo(() => {
    if (!trades) return [];
    return trades.slice(0, 4).map((t: any) => ({
      id: t._id,
      type: t.type.toUpperCase(),
      token: t.symbol,
      amount: t.amount,
      total: t.total,
      time: formatDistanceToNow(new Date(t.createdAt)) + " ago"
    }));
  }, [trades]);

  if (userLoading || cropsLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const walletBalance = userData?.walletBalance || 0;
  const portfolioValue = holdings.reduce((acc: number, h: any) => acc + h.amount, 0);
  const totalTokens = holdings.reduce((acc: number, h: any) => acc + h.tokens, 0);
  const holdingsCount = holdings.length;
  const roi = 0; // ROI calculation requires historical snapshot, setting to 0 for now

  const formatValue = (val: number) => {
    if (!showBalance) return "****";
    if (val >= 1e6) return `₦${(val / 1e6).toFixed(1)}M`;
    if (val >= 1e3) return `₦${(val / 1e3).toFixed(0)}K`;
    return `₦${val.toLocaleString()}`;
  };

  const stats = [
    { title: "Portfolio Value", value: formatValue(portfolioValue), icon: PieIcon, color: "text-emerald-500", bg: "bg-emerald-500/10", sub: <span className="text-emerald-500 flex items-center"><ArrowUpRight className="w-3 h-3 mr-0.5" /> +{roi}% ROI</span> },
    { title: "Wallet Balance", value: formatValue(walletBalance), icon: Wallet, color: "text-blue-500", bg: "bg-blue-500/10", sub: "Available to invest" },
    { title: "Tokens Held", value: showBalance ? totalTokens.toLocaleString() : "****", icon: Coins, color: "text-purple-500", bg: "bg-purple-500/10", sub: `${holdingsCount} commodities` },
    { title: "Daily Return", value: showBalance ? "₦0" : "****", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10", sub: "Calculated daily" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your portfolio overview and market activity</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowBalance(!showBalance)}
          >
            {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
            onClick={() => navigate("/user/market")}
          >
            <TrendingUp className="w-4 h-4 mr-1.5" /> Trade Now
          </Button>
        </div>
      </div>

      {/* Stats - scrollable on very small screens */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="glass-card overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 p-3 sm:p-4">
              <CardTitle className="text-[11px] sm:text-sm font-medium leading-tight">{stat.title}</CardTitle>
              <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bg} shrink-0`}><stat.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${stat.color}`} /></div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-2xl font-bold truncate">{stat.value}</div>
              <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 truncate">{stat.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Portfolio Growth */}
        <Card className="card-hover">
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-base sm:text-lg">Portfolio Growth</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Total value over the last 4 months</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 lg:p-6 pt-0">
            <div className="h-[180px] sm:h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={portfolioHistory}>
                  <defs>
                    <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.1)" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1e6).toFixed(0)}M`} tick={{ fontSize: 10 }} width={50} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} formatter={(v: number) => [`₦${(v / 1e6).toFixed(1)}M`, '']} />
                  <Area type="monotone" dataKey="value" stroke="#10B981" fill="url(#portGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Holdings Breakdown */}
        <Card className="card-hover">
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-base sm:text-lg">Token Holdings</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Your commodity portfolio distribution</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 lg:p-6 pt-0">
            <div className="h-[140px] sm:h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={holdings} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={5} dataKey="value">
                    {holdings.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {holdings.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full mr-2 shrink-0" style={{ backgroundColor: h.color }} />
                    <span className="font-mono text-[10px] sm:text-xs font-medium truncate">{h.name}</span>
                    <span className="text-muted-foreground ml-1.5 text-[10px] sm:text-xs hidden sm:inline">{h.tokens} tokens</span>
                  </div>
                  <span className="font-semibold shrink-0 ml-2">{showBalance ? `₦${(h.amount / 1e6).toFixed(1)}M` : '****'}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Mobile */}
      <div className="grid grid-cols-2 sm:hidden gap-3">
        <Button
          variant="outline"
          className="h-14 flex-col gap-1 border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-500"
          onClick={() => navigate("/user/market")}
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase">Buy Tokens</span>
        </Button>
        <Button
          variant="outline"
          className="h-14 flex-col gap-1 border-blue-500/20 hover:bg-blue-500/5 hover:text-blue-500"
          onClick={() => navigate("/user/wallet")}
        >
          <Wallet className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase">My Wallet</span>
        </Button>
      </div>

      {/* Recent Activity */}
      <Card className="card-hover">
        <CardHeader className="p-3 sm:p-4 lg:p-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" /> Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 lg:p-6 pt-0">
          <div className="space-y-2 sm:space-y-3">
            {recentActivity.map((act) => (
              <div key={act.id} className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-muted/20 border border-transparent hover:border-emerald-500/20 transition-all">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className={`p-1 sm:p-1.5 rounded-full shrink-0 ${
                    act.type === "BUY" ? "bg-emerald-500/20 text-emerald-500" :
                    act.type === "SELL" ? "bg-red-500/20 text-red-500" :
                    "bg-blue-500/20 text-blue-500"
                  }`}>
                    {act.type === "BUY" ? <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> :
                     act.type === "SELL" ? <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> :
                     <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-medium truncate">
                      {act.type === "DIVIDEND" ? `${act.token} Dividend` : `${act.type} ${act.amount} ${act.token}`}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {act.time}
                    </div>
                  </div>
                </div>
                <span className={`font-semibold text-xs sm:text-sm shrink-0 ml-2 ${act.type === "SELL" ? "text-red-500" : "text-emerald-500"}`}>
                  {act.type === "SELL" ? "-" : "+"}₦{(act.total / 1e3).toFixed(0)}K
                </span>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full mt-3 sm:mt-4 border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-500 text-xs sm:text-sm"
          >
            View Full History <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
