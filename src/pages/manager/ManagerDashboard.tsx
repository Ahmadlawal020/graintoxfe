import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Package,
  Wheat,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Thermometer,
  Droplets,
  ClipboardList,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Layers,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useGetWarehousesQuery } from "@/services/api/warehouseApiSlice";
import { useGetStorageOperationsQuery } from "@/services/api/storageApiSlice";
import { useGetUserByIdQuery } from "@/services/api/userApiSlice";
import useAuth from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("all");
  
  const { id } = useAuth();
  const { data: userProfile, isLoading: profileLoading } = useGetUserByIdQuery(id, { skip: !id });
  const { data: allWarehouses = [], isLoading: whLoading } = useGetWarehousesQuery(undefined);
  const { data: allOps = [], isLoading: opsLoading } = useGetStorageOperationsQuery(undefined);

  const isLoading = profileLoading || whLoading || opsLoading;


  // Filter warehouses assigned to this manager
  const myWarehouses = useMemo(() => {
    const assigned = Array.isArray(userProfile?.assignedWarehouse) 
      ? userProfile.assignedWarehouse 
      : (userProfile?.assignedWarehouse ? [userProfile.assignedWarehouse] : []);
      
    // Robust match: 
    // 1. Check name or _id just in case format changes
    // 2. ALSO check if the warehouse explicitly links this manager by ID
    return allWarehouses.filter((wh: any) => {
      const matchProfile = assigned.includes(wh.name) || assigned.includes(wh._id);
      const matchManagerId = wh.managerId === id || wh.managerId?._id === id;
      return matchProfile || matchManagerId;
    });
  }, [allWarehouses, userProfile, id]);

  const activeWarehouse = useMemo(() => {
    if (selectedFacilityId === "all") return null;
    return myWarehouses.find((wh: any) => wh._id === selectedFacilityId);
  }, [myWarehouses, selectedFacilityId]);

  const filteredOps = useMemo(() => {
    const warehouseIds = selectedFacilityId === "all" 
      ? myWarehouses.map((wh: any) => wh._id)
      : [selectedFacilityId];
    
    return allOps.filter((op: any) => warehouseIds.includes(op.warehouse?._id));
  }, [allOps, myWarehouses, selectedFacilityId]);

  if (isLoading) {
    return (
      <div className="space-y-6 p-2 animate-pulse">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (myWarehouses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] border-2 border-dashed rounded-3xl bg-muted/10 p-8 text-center">
         <div className="h-20 w-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-6 border border-amber-500/20">
            <AlertTriangle className="w-10 h-10 text-amber-500" />
         </div>
         <h2 className="text-2xl font-black uppercase tracking-tight">No Facilities Allocated</h2>
         <p className="text-muted-foreground mt-2 max-w-md">
            Your manager profile is currently not linked to any storage facilities. 
            Contact the infrastructure admin to assign warehouses to your account.
         </p>
         <Button variant="outline" className="mt-8">
            <ShieldCheck className="w-4 h-4 mr-2" /> Request Provisioning
         </Button>
      </div>
    );
  }

  // Calculations
  const displayWarehouses = activeWarehouse ? [activeWarehouse] : myWarehouses;
  const totalCapacity = displayWarehouses.reduce((acc, wh) => acc + (wh.capacity || 0), 0);
  const totalAvailable = displayWarehouses.reduce((acc, wh) => acc + (wh.availableCapacity || 0), 0);
  const currentStock = totalCapacity - totalAvailable;
  const utilization = totalCapacity > 0 ? Math.round((currentStock / totalCapacity) * 100) : 0;

  const stockTrend = [
    { week: "W1", stock: currentStock * 0.85 },
    { week: "W2", stock: currentStock * 0.92 },
    { week: "W3", stock: currentStock * 0.98 },
    { week: "W4", stock: currentStock },
  ];

  return (
    <div className="space-y-6 animate-fade-in p-2 pb-20">
      {/* Smart Header with Site Selection */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-slate-900 text-white p-6 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-4">
             <Layers className="h-10 w-10 text-emerald-400" />
             Infrastructure Control
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2 opacity-80">
            <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 uppercase text-[10px] font-bold">
               {myWarehouses.length} Allocated Sites
            </Badge>
            <span className="text-xs font-medium uppercase tracking-widest flex items-center gap-1">
               <Activity className="h-3 w-3" /> System Heartbeat Stable
            </span>
          </div>
        </div>

        <div className="w-full lg:w-72 relative z-10">
           <Label className="text-[10px] font-black uppercase text-white/50 mb-1.5 block tracking-widest ml-1">Focus Facility</Label>
           <Select value={selectedFacilityId} onValueChange={setSelectedFacilityId}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white h-12 rounded-xl focus:ring-emerald-500/50">
                 <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-emerald-400" />
                    <SelectValue placeholder="All Sites" />
                 </div>
              </SelectTrigger>
              <SelectContent className="bg-slate-900 text-white border-white/10">
                 <SelectItem value="all" className="focus:bg-emerald-500 focus:text-white">Aggregated View (Global)</SelectItem>
                 {myWarehouses.map((wh: any) => (
                    <SelectItem key={wh._id} value={wh._id} className="focus:bg-emerald-500 focus:text-white">
                       {wh.name}
                    </SelectItem>
                 ))}
              </SelectContent>
           </Select>
        </div>
      </header>

      {/* Grid Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Aggregated Stock", value: `${currentStock.toLocaleString()}`, unit: "MT", icon: Package, color: "text-emerald-500", bg: "bg-emerald-500/10", sub: `${utilization}% Total Capacity` },
          { title: "Net Availability", value: `${totalAvailable.toLocaleString()}`, unit: "MT", icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10", sub: "Ready for Deposits" },
          { title: "Network Status", value: "ACTIVE", unit: "", icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10", sub: "All Sensors Online" },
          { title: "Site Alerts", value: "00", unit: "NEW", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", sub: "No critical failures" },
        ].map((stat, i) => (
          <Card key={i} className="glass-card group hover:shadow-2xl transition-all duration-500 border-none relative overflow-hidden">
             <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} -mr-8 -mt-8 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700`}></div>
             <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-xl ${stat.bg}`}>
                   <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
             </CardHeader>
             <CardContent className="relative z-10">
                <div className="flex items-baseline gap-2">
                   <div className="text-4xl font-black tracking-tighter">{stat.value}</div>
                   <div className="text-xs font-bold text-muted-foreground uppercase">{stat.unit}</div>
                </div>
                <p className="text-[11px] font-bold text-muted-foreground mt-1 flex items-center gap-1 opacity-70">
                   <ChevronRight className="h-3 w-3" /> {stat.sub}
                </p>
             </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Analytics Section */}
        <div className="lg:col-span-8 space-y-6">
           <Card className="glass-card border-none shadow-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-muted/20 pb-8">
                 <div>
                    <CardTitle className="text-xl font-black uppercase italic tracking-tight">Stock Propagation</CardTitle>
                    <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Aggregate inventory movement across focus sites</CardDescription>
                 </div>
                 <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest bg-white">
                    Export Data
                 </Button>
              </CardHeader>
              <CardContent className="pt-6">
                 <ResponsiveContainer width="100%" height={320}>
                    <AreaChart data={stockTrend}>
                       <defs>
                          <linearGradient id="managerGrad" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                             <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.1)" />
                       <XAxis dataKey="week" axisLine={false} tickLine={false} className="text-[10px] font-bold" />
                       <YAxis axisLine={false} tickLine={false} className="text-[10px] font-bold" />
                       <Tooltip 
                         contentStyle={{ backgroundColor: 'black', border: 'none', borderRadius: '12px', color: 'white' }}
                         itemStyle={{ fontWeight: 'bold' }}
                       />
                       <Area type="monotone" dataKey="stock" stroke="#10B981" fill="url(#managerGrad)" name="Total MT" strokeWidth={4} dot={{ r: 4, fill: "#10B981" }} />
                    </AreaChart>
                 </ResponsiveContainer>
              </CardContent>
           </Card>

           <Card className="glass-card border-none shadow-xl">
              <CardHeader>
                 <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-500" />
                    Transaction Pulse
                 </CardTitle>
                 <CardDescription>Real-time flow of assets through your managed network</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-3">
                    {filteredOps.slice(0, 6).map((op: any) => (
                       <div key={op._id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-emerald-500/20 transition-all group">
                          <div className="flex items-center gap-4">
                             <div className={`h-11 w-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${op.type === 'DEPOSIT' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'}`}>
                                {op.type === 'DEPOSIT' ? <ArrowDownRight className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                             </div>
                             <div>
                                <p className="font-black text-sm uppercase tracking-tight">{op.type} — {op.quantity} MT</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">{op.commodity?.name} · {op.warehouse?.name}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-xs font-black italic tracking-widest">{new Date(op.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                             <Badge className={op.qcStatus === 'PASSED' ? 'bg-emerald-500 text-[9px] h-4 uppercase font-black px-1.5' : 'bg-amber-500 text-[9px] h-4 uppercase font-black px-1.5'}>
                                {op.qcStatus}
                             </Badge>
                          </div>
                       </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="bg-emerald-600 text-white border-none shadow-2xl p-2 rounded-3xl">
              <CardHeader className="pb-2">
                 <CardTitle className="text-base font-black flex items-center gap-2 uppercase tracking-wide">
                    <ClipboardList className="h-5 w-5" />
                    Duty Roster
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-4">
                 {[
                   { task: "QC Audit Required", site: "Silo Delta", time: "2h" },
                   { task: "Temp Spike Check", site: "Vault Alpha", time: "Now" },
                   { task: "Inventory Sync", site: "All Nodes", time: "EOD" },
                 ].map((t, i) => (
                    <div key={i} className="bg-white/10 p-3 rounded-2xl flex items-center justify-between border border-white/5 hover:bg-white/20 transition-colors pointer-events-auto cursor-pointer">
                       <div>
                          <p className="text-xs font-black uppercase tracking-tight">{t.task}</p>
                          <p className="text-[10px] font-bold text-white/60 tracking-widest">{t.site}</p>
                       </div>
                       <span className="text-[10px] font-black bg-white text-emerald-600 px-2 py-1 rounded-lg">{t.time}</span>
                    </div>
                 ))}
                 <Button onClick={() => navigate("/manager/stock")} className="w-full mt-4 bg-white text-emerald-600 hover:bg-emerald-50 font-black h-12 rounded-2xl shadow-lg uppercase tracking-widest text-xs">
                    Access Ops Terminal
                 </Button>
              </CardContent>
           </Card>

           <Card className="glass-card border-none shadow-xl overflow-hidden rounded-3xl">
              <div className="h-2 bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500"></div>
              <CardHeader>
                 <CardTitle className="text-sm font-black uppercase tracking-widest">Network Topology</CardTitle>
                 <CardDescription>Status of assigned facilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 {myWarehouses.map((wh: any) => (
                    <div key={wh._id} className="flex items-center justify-between pb-3 border-b border-muted last:border-0 last:pb-0">
                       <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full ${wh.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></div>
                          <div>
                             <p className="text-xs font-black uppercase tracking-tight">{wh.name}</p>
                             <p className="text-[9px] text-muted-foreground font-bold uppercase">{wh.state}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black">{Math.round((wh.capacity - (wh.availableCapacity || 0)) / wh.capacity * 100)}% Full</p>
                          <div className="w-16 h-1 bg-muted rounded-full overflow-hidden mt-1">
                             <div 
                               className="h-full bg-emerald-500" 
                               style={{ width: `${Math.round((wh.capacity - (wh.availableCapacity || 0)) / wh.capacity * 100)}%` }}
                             ></div>
                          </div>
                       </div>
                    </div>
                 ))}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
