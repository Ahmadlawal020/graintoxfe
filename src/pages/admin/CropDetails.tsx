import React from "react";
import { 
  ArrowLeft, 
  Wheat, 
  Edit, 
  Trash2, 
  Coins, 
  TrendingUp, 
  Layers, 
  Activity, 
  BarChart3, 
  ShieldCheck, 
  Clock, 
  Package, 
  Zap,
  Globe
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useGetCropByIdQuery, useDeleteCropMutation } from "@/services/api/cropApiSlice";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const CropDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: crop, isLoading, isError } = useGetCropByIdQuery(id || "");
  const [deleteCrop, { isLoading: isDeleting }] = useDeleteCropMutation();

  // Simulated price history data
  const priceHistory = [
    { time: "09:00", price: 245000 },
    { time: "11:00", price: 248000 },
    { time: "13:00", price: 246500 },
    { time: "15:00", price: 251000 },
    { time: "17:00", price: 249000 },
    { time: "19:00", price: 252000 },
    { time: "21:00", price: 250000 },
  ];

  const handleDelete = async () => {
    if (confirm("CRITICAL ACTION: Are you sure you want to completely de-list this commodity from the GrainTox blockchain? This will freeze all associated trading pairs.")) {
      try {
        await deleteCrop(id).unwrap();
        toast({ 
          title: "Asset De-listed", 
          description: "Commodity has been successfully removed from the active market index.",
          variant: "destructive"
        });
        navigate("/crops");
      } catch (err: any) {
        toast({ title: "Operation Failed", description: err?.data?.message || "Could not de-list asset.", variant: "destructive" });
      }
    }
  };

  if (isError || (!isLoading && !crop)) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-96 text-center animate-fade-in">
        <Activity className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <p className="text-destructive font-black text-2xl tracking-tight">COMMODITY NOT FOUND</p>
        <p className="text-muted-foreground mt-2 max-w-xs mx-auto">This asset class may have been archived or the network ID is invalid.</p>
        <Button variant="outline" onClick={() => navigate("/crops")} className="mt-8 px-8 border-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Market Index
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8 p-2 animate-pulse max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
           <Skeleton className="h-12 w-64 rounded-xl" />
           <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
        <div className="grid gap-6 md:grid-cols-4">
           {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
           <Skeleton className="lg:col-span-2 h-[400px] rounded-2xl" />
           <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  const totalValue = (crop.totalStock || 0) * (crop.pricePerUnit || 0);

  return (
    <div className="space-y-8 animate-fade-in p-2 pb-20 max-w-7xl mx-auto">
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b pb-8">
        <div className="space-y-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/crops")} className="mb-2 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" /> Return to Market Exchange
          </Button>
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-[2rem] bg-primary/10 flex items-center justify-center border-2 border-primary/10 shadow-xl shadow-primary/5 rotate-3 hover:rotate-0 transition-transform duration-500">
              <Wheat className="h-10 w-10 text-primary/90" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black tracking-tighter text-foreground">
                  {crop.name}
                </h1>
                <Badge className="bg-primary text-foreground border-none font-black text-[10px] tracking-widest px-3">
                  {crop.tokenSymbol}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground font-semibold">
                <span className="font-mono text-sm uppercase px-2 py-0.5 bg-muted rounded">{crop.code}</span>
                <Separator orientation="vertical" className="h-3 mx-1" />
                <span className="flex items-center gap-1.5"><Globe className="h-3 w-3" /> {crop.category} Index</span>
                <Separator orientation="vertical" className="h-3 mx-1" />
                <Badge variant="outline" className="border-primary/30 text-primary/90 font-bold bg-primary/10/50">
                  {crop.quality} Grade
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            className="bg-slate-900 text-foreground hover:bg-slate-800 shadow-xl shadow-slate-900/10 px-8 h-12 font-bold group"
            onClick={() => navigate(`/crops/edit/${id}`)}
          >
            <Edit className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" /> 
            Modify Price / Data
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-12 w-12 text-destructive hover:bg-destructive/10"
            disabled={isDeleting} 
            onClick={handleDelete}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Key Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Live Market Benchmark", value: `₦${(crop.pricePerUnit || 0).toLocaleString()}`, sub: "Per Metric Ton", icon: Coins, color: "text-primary", bg: "bg-primary/10" },
          { title: "Active Vaulted Inventory", value: `${(crop.totalStock || 0).toLocaleString()}`, sub: "Metric Tons", icon: Layers, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Net Equity Valuation", value: `₦${(totalValue / 1e6).toFixed(1)}M`, sub: "Market Capitalization", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
          { title: "Tokenized Supply", value: `${Math.round(((crop.totalTokenized || 0) / (crop.totalStock || 1)) * 100)}%`, sub: "Liquidity Ratio", icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="glass-card border-none shadow-sm group hover:translate-y-[-4px] transition-all">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{stat.title}</CardTitle>
              <div className={`p-2 rounded-xl ${stat.bg}`}><stat.icon className={`h-4 w-4 ${stat.color}`} /></div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black tracking-tight">{stat.value}</div>
              <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase opacity-60 tracking-wider font-mono">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Market Visualizer */}
        <Card className="lg:col-span-8 glass-card border-none shadow-xl overflow-hidden bg-accent">
           <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/20">
              <div>
                 <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Intraday Benchmark Performance
                 </CardTitle>
                 <CardDescription>Visualizing market price fluctuations for {crop.code}</CardDescription>
              </div>
              <div className="flex gap-2">
                 <Badge className="bg-primary/20 text-primary/90 border-none">1D</Badge>
                 <Badge variant="ghost" className="opacity-40">1W</Badge>
                 <Badge variant="ghost" className="opacity-40">1M</Badge>
              </div>
           </CardHeader>
           <CardContent className="pt-8">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceHistory}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000008" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                      domain={['dataMin - 1000', 'dataMax + 1000']}
                      tickFormatter={(value) => `₦${(value / 1000)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                      itemStyle={{ color: "#10b981", fontWeight: "bold" }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#chartGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </CardContent>
        </Card>

        {/* System & Trust Panel */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="glass-card border-none shadow-lg overflow-hidden">
              <div className="bg-slate-900 p-4 flex items-center justify-between text-foreground">
                 <h3 className="font-bold text-sm tracking-wide">SYSTEM OVERWATCH</h3>
                 <ShieldCheck className="h-4 w-4 text-primary/80" />
              </div>
              <CardContent className="space-y-5 pt-6">
                 <div className="space-y-4">
                    <div className="flex items-start gap-3">
                       <Zap className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                       <div>
                          <p className="text-sm font-bold">Smart Contract Link</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">Minting permissions active. All trades against this asset are backed by physical Proof-of-Reserve (PoR).</p>
                       </div>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-3">
                       <Package className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                       <div>
                          <p className="text-sm font-bold">Storage Verification</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">Cross-referenced with 4 Active Warehouses. Quality grading certs current.</p>
                       </div>
                    </div>
                    <Separator />
                    <div className="flex items-start gap-3">
                       <Clock className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                       <div>
                          <p className="text-sm font-bold">Last Price Update</p>
                          <p className="text-xs text-muted-foreground">Updated 14 mins ago by System Admin.</p>
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="border-none shadow-sm bg-primary text-foreground">
              <CardHeader className="pb-2">
                 <CardTitle className="text-base font-bold flex items-center gap-2">
                    <Coins className="h-4 w-4" />
                    Liquidity Bridge
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <p className="text-xs text-foreground/80 leading-relaxed font-medium">
                    This asset is currently tradable on the GrainTox Marketplace. High liquidity detected.
                 </p>
                 <Button className="w-full bg-white text-primary/90 hover:bg-primary/10 font-black text-xs h-10">
                    OPEN TRADING TERMINAL
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default CropDetails;
