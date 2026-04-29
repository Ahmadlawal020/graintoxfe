import React, { useState } from "react";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Thermometer,
  Droplets,
  Eye,
  Edit,
  MoreHorizontal,
  ArrowUpRight,
  Package,
  Activity,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useGetWarehousesQuery } from "@/services/api/warehouseApiSlice";
import { Skeleton } from "@/components/ui/skeleton";

const Warehouses = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data: warehouses = [], isLoading, isError, error } = useGetWarehousesQuery(undefined);

  const filteredWarehouses = warehouses.filter((wh: any) => {
    const managerName = wh.managerId ? `${wh.managerId.firstName} ${wh.managerId.lastName}` : "Unassigned";
    return wh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           wh.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
           managerName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalCapacity = warehouses.reduce((acc: number, wh: any) => acc + (wh.capacity || 0), 0);
  const totalAvailable = warehouses.reduce((acc: number, wh: any) => acc + (wh.availableCapacity || 0), 0);
  const totalStock = totalCapacity - totalAvailable;
  const utilization = totalCapacity > 0 ? Math.round((totalStock / totalCapacity) * 100) : 0;

  const getUtilizationColor = (pct: number) => {
    if (pct >= 90) return "text-red-500 bg-red-500";
    if (pct >= 70) return "text-amber-500 bg-amber-500";
    return "text-primary bg-primary";
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-2">
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-64 w-full rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500">
        <h2 className="text-xl font-bold">Error loading warehouses</h2>
        <pre className="text-sm mt-4 text-left bg-red-500/10 p-4 rounded-lg overflow-auto">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Warehouses</h1>
          <p className="text-muted-foreground">
            Monitor storage facilities, capacity, and environmental conditions
          </p>
        </div>
        <Button
          className="bg-primary/90 hover:bg-primary/90 text-foreground shadow-lg shadow-primary/90/20"
          onClick={() => navigate("/warehouses/create")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Register Warehouse
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Facilities", value: warehouses.length, icon: Building2, color: "text-primary", bg: "bg-primary/10", sub: `${warehouses.filter((w: any) => w.status === "Active").length} operational` },
          { title: "Total Capacity", value: `${(totalCapacity / 1000).toFixed(1)}K kg`, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10", sub: "kg overall" },
          { title: "Current Stock", value: `${(totalStock / 1000).toFixed(1)}K kg`, icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10", sub: `${utilization}% overall utilization` },
          { title: "Avg Storage Fee", value: `₦${Math.round(warehouses.reduce((a: number, w: any) => a + (w.storageFeePerKg || 0), 0) / (warehouses.length || 1))}`, icon: Thermometer, color: "text-amber-500", bg: "bg-amber-500/10", sub: "Per kg" },
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search warehouses by name, location, or manager..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Warehouse Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredWarehouses.map((wh: any) => {
          const cap = wh.capacity || 1;
          const avail = wh.availableCapacity || 0;
          const currentStock = cap - avail;
          const pct = Math.round((currentStock / cap) * 100);
          const colorClass = getUtilizationColor(pct);
          const isOperational = wh.status === "Active";

          return (
            <Card key={wh._id} className="card-hover group cursor-pointer" onClick={() => navigate(`/warehouses/${wh._id}`)}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{wh.name}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="mr-1 h-3 w-3" />
                      {wh.location}
                    </CardDescription>
                  </div>
                  <Badge variant={isOperational ? "default" : "secondary"} className={isOperational ? "bg-primary/90" : ""}>
                    {wh.status || "Unknown"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Utilization Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Storage Utilization</span>
                    <span className={`font-semibold ${colorClass.split(" ")[0]}`}>{pct}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${colorClass.split(" ")[1]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{currentStock.toLocaleString()} kg stored</span>
                    <span>{cap.toLocaleString()} kg capacity</span>
                  </div>
                </div>

                {/* Manager & Type */}
                <div className="flex justify-between items-center text-sm pt-2">
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-xs">Manager</span>
                    <p className="font-medium">{wh.managerId ? `${wh.managerId.firstName} ${wh.managerId.lastName}` : "Unassigned"}</p>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <span className="text-muted-foreground text-xs">Facility Type</span>
                    <p className="font-medium">{wh.warehouseType || "Silo"}</p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-2 border-t flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Owner: <span className="font-medium text-foreground">{wh.ownerName || "Unknown"}</span>
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/warehouses/${wh._id}`); }}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/warehouses/edit/${wh._id}`); }}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Warehouses;
