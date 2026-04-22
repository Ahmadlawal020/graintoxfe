import React, { useState } from "react";
import {
  Wheat,
  Search,
  Plus,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  Coins,
  BarChart3,
  Activity,
  ChevronRight,
  Target,
  RefreshCw,
} from "lucide-react";
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
import { useNavigate } from "react-router-dom";
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
} from "recharts";
import { useGetCropsQuery } from "@/services/api/cropApiSlice";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

const CropManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: crops = [], isLoading, isError, refetch } = useGetCropsQuery(undefined);

  const filteredCrops = crops.filter((crop: any) =>
    (crop.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (crop.code || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalStock = crops.reduce((acc: number, c: any) => acc + (c.totalStock || 0), 0);
  const totalValue = crops.reduce((acc: number, c: any) => acc + ((c.totalStock || 0) * (c.pricePerUnit || 0)), 0);

  // Simulated chart data for price trend across all commodities
  const marketTrendData = [
    { name: "Mon", value: 4000 },
    { name: "Tue", value: 3000 },
    { name: "Wed", value: 5000 },
    { name: "Thu", value: 2780 },
    { name: "Fri", value: 1890 },
    { name: "Sat", value: 2390 },
    { name: "Sun", value: 3490 },
  ];

  const handleRefresh = async () => {
    await refetch();
    toast({
      title: "Market Data Refreshed",
      description: "Live prices and stock levels have been updated.",
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-2 animate-pulse">
        <div className="flex justify-between items-center">
           <Skeleton className="h-10 w-64" />
           <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-2 pb-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <Wheat className="h-10 w-10 text-emerald-500" />
            Commodity Market
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Global GrainTox Agricultural Asset Index & Pricing Controller
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh Market Data">
             <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-500/20 px-6"
            onClick={() => navigate("/crops/create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Deploy Asset
          </Button>
        </div>
      </header>

      {/* Market Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Market Depth", value: crops.length, sub: "Listed Commodities", icon: Target, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Aggregated Stock", value: `${(totalStock / 1000).toFixed(1)}K`, sub: "Metric Tons", icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Market Cap", value: `₦${(totalValue / 1e9).toFixed(2)}B`, sub: "Gross Liquidity", icon: Coins, color: "text-amber-500", bg: "bg-amber-500/10" },
          { title: "Global Volume", value: "+12.4%", sub: "Last 24h Trend", icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="glass-card border-none shadow-sm overflow-hidden relative group">
            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-125 ${stat.bg}`} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black">{stat.value}</div>
              <p className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-widest">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Marketplace Explorer */}
        <Card className="lg:col-span-8 glass-card border-none shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                   <BarChart3 className="h-5 w-5 text-emerald-500" />
                   Marketplace Assets
                </CardTitle>
                <CardDescription>Live trading pairs and administrative pricing controls</CardDescription>
              </div>
              <div className="relative w-full max-w-[240px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter commodities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 border-none bg-muted/40 focus:ring-1 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50 border-none">
                  <TableRow>
                    <TableHead className="pl-6 uppercase text-[10px] font-bold tracking-widest">Asset / Code</TableHead>
                    <TableHead className="uppercase text-[10px] font-bold tracking-widest text-center">Category</TableHead>
                    <TableHead className="uppercase text-[10px] font-bold tracking-widest">Market Price</TableHead>
                    <TableHead className="uppercase text-[10px] font-bold tracking-widest">Inventory</TableHead>
                    <TableHead className="uppercase text-[10px] font-bold tracking-widest">Grade</TableHead>
                    <TableHead className="uppercase text-[10px] font-bold tracking-widest text-right pr-6">Value / Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCrops.length > 0 ? filteredCrops.map((crop: any) => (
                    <TableRow 
                      key={crop._id} 
                      className="group cursor-pointer hover:bg-emerald-500/5 transition-colors border-b border-border/40"
                      onClick={() => navigate(`/crops/${crop._id}`)}
                    >
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10 shadow-inner group-hover:bg-emerald-500/20 transition-colors">
                             <Wheat className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <div className="font-bold text-base">{crop.name}</div>
                            <div className="flex items-center gap-2">
                               <Badge className="h-4 py-0 text-[9px] bg-emerald-500 text-white border-none">{crop.tokenSymbol}</Badge>
                               <span className="text-[10px] font-mono text-muted-foreground">{crop.code}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                         <Badge variant="outline" className="text-[10px] bg-muted/50 border-none px-2">{crop.category}</Badge>
                      </TableCell>
                      <TableCell>
                         <div className="font-black text-lg">₦{((crop.pricePerUnit || 0) / 1000).toFixed(0)}K</div>
                         <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                            <TrendingUp className="h-3 w-3" />
                            +2.4%
                         </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-1.5 font-bold">
                            <span>{(crop.totalStock || 0).toLocaleString()}</span>
                            <span className="text-[10px] text-muted-foreground font-normal">MT</span>
                         </div>
                         <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                            <Package className="h-2.5 w-2.5" />
                            {(crop.totalTokenized || 0).toLocaleString()} Tokenized
                         </div>
                      </TableCell>
                      <TableCell>
                         <Badge className={crop.quality === "Grade A" ? "bg-emerald-500" : "bg-amber-500"}>
                            {crop.quality?.split(' ')?.[1] || "A"}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                         <div className="font-bold text-sm">₦{(((crop.totalStock || 0) * (crop.pricePerUnit || 0)) / 1e6).toFixed(1)}M</div>
                         <Button variant="link" size="sm" className="h-auto p-0 text-[10px] text-blue-500">
                            Details
                         </Button>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                         No commodities found matching your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Market Insights Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-card border-none shadow-xl bg-slate-900 text-white overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                 <Activity className="h-5 w-5 text-emerald-400" />
                 Market Heatmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={marketTrendData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px" }}
                      itemStyle={{ color: "#10b981" }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#10B981" fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                 <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] uppercase font-bold text-white/50">Top Gainer</p>
                    <p className="font-bold text-emerald-400">Maize +5.2%</p>
                 </div>
                 <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-[10px] uppercase font-bold text-white/50">Trading Vol</p>
                    <p className="font-bold text-blue-400">142.1M</p>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-none shadow-sm">
             <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                   <Target className="h-4 w-4 text-emerald-500" />
                   Price Controller Notes
                </CardTitle>
             </CardHeader>
             <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>Prices listed here are the **Benchmark Rates** used for warehouse swaps and automated trading orders.</p>
                <p className="text-xs bg-muted p-2 rounded-lg border">
                   **Pro Tip:** Updating a commodity price here will trigger a live refresh on all User dashboards within 60 seconds.
                </p>
                <Button variant="outline" className="w-full text-xs" onClick={() => navigate("/reports")}>
                   View Detailed Price History
                </Button>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CropManagement;
