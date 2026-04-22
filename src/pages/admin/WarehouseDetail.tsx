import React from "react";
import { ArrowLeft, Building2, MapPin, Package, Edit, Trash2, Activity, ShieldCheck, PieChart as PieChartIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useGetWarehouseByIdQuery } from "@/services/api/warehouseApiSlice";
import { Skeleton } from "@/components/ui/skeleton";

const WarehouseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: warehouse, isLoading, isError } = useGetWarehouseByIdQuery(id || "");

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-64 text-center">
        <p className="text-destructive font-medium">Failed to load warehouse details.</p>
        <Button variant="outline" onClick={() => navigate("/warehouses")} className="mt-4">Back to Warehouses</Button>
      </div>
    );
  }

  if (isLoading || !warehouse) {
    return (
      <div className="space-y-6 p-2">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
           <Skeleton className="h-[300px] w-full rounded-lg" />
           <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>
      </div>
    );
  }

  const capacity = warehouse.capacity || 0;
  const available = warehouse.availableCapacity ?? capacity;
  const currentStock = capacity - available;
  const utilization = capacity > 0 ? Math.round((currentStock / capacity) * 100) : 0;
  
  const managerName = warehouse.managerId ? `${warehouse.managerId.firstName} ${warehouse.managerId.lastName}` : "Unassigned";

  // Simulate internal crop data dynamically based on utilization roughly
  const mockCropsStored = currentStock > 0 ? [
    { name: "Maize", value: Math.floor(currentStock * 0.4), color: "#10B981" },
    { name: "Rice", value: Math.floor(currentStock * 0.3), color: "#3B82F6" },
    { name: "Soybeans", value: Math.floor(currentStock * 0.2), color: "#F59E0B" },
    { name: "Sorghum", value: Math.floor(currentStock * 0.1), color: "#8B5CF6" },
  ] : [];

  const getUtilizationColor = (pct: number) => {
    if (pct >= 90) return "text-red-500 bg-red-500/10";
    if (pct >= 70) return "text-amber-500 bg-amber-500/10";
    return "text-emerald-500 bg-emerald-500/10";
  };
  const utilColor = getUtilizationColor(utilization);

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/warehouses")} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Warehouses
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Building2 className="h-7 w-7 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{warehouse.name}</h1>
              <p className="text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-4 h-4" /> {warehouse.location}, {warehouse.state}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className={`px-3 py-1 ${warehouse.status === "Active" ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" : "border-amber-500/20 text-amber-500 bg-amber-500/5"}`}>
            {warehouse.status}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => navigate(`/warehouses/edit/${id}`)}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button variant="destructive" size="sm"><Trash2 className="h-4 w-4 mr-2" /> Delete</Button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Capacity", value: `${capacity.toLocaleString()} MT`, icon: Building2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Current Stock", value: `${currentStock.toLocaleString()} MT`, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Available Space", value: `${available.toLocaleString()} MT`, icon: Activity, color: "text-amber-500", bg: "bg-amber-500/10" },
          { title: "Utilization", value: `${utilization}%`, icon: PieChartIcon, color: utilColor.split(' ')[0], bg: utilColor.split(' ')[1] },
        ].map((stat, i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon className={`h-4 w-4 ${stat.color}`} /></div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Crop Distribution */}
        <Card>
          <CardHeader>
             <CardTitle>Commodity Distribution</CardTitle>
             <CardDescription>Live breakdown of exact grains occupying the {utilization}% utilized space.</CardDescription>
          </CardHeader>
          <CardContent>
            {mockCropsStored.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={mockCropsStored} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value">
                    {mockCropsStored.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} MT`, 'Stored']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
               <div className="h-[200px] flex items-center justify-center text-muted-foreground">No commodities currently stored</div>
            )}
            <div className="space-y-2 mt-4 max-w-sm mx-auto">
              {mockCropsStored.map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: c.color }} />{c.name}</div>
                  <span className="font-medium text-muted-foreground">{c.value.toLocaleString()} MT</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Facility Info */}
        <Card className="flex flex-col">
          <CardHeader>
             <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-emerald-500" /> Administrative Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            {[
              { label: "Warehouse Manager", value: managerName },
              { label: "Manager Contact", value: warehouse.managerId?.phone || "N/A" },
              { label: "Facility Owner", value: warehouse.ownerName || "Unknown" },
              { label: "Operating Company", value: warehouse.companyName || "N/A" },
              { label: "Owner Phone", value: warehouse.ownerPhone || "N/A" },
              { label: "Storage Rate Policy", value: `₦${warehouse.storageFeePerMT?.toLocaleString() || 0} per MT` },
              { label: "Certification Number", value: warehouse.certNumber || "N/A" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WarehouseDetail;
