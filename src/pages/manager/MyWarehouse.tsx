import React, { useState } from "react";
import {
  Building2, Thermometer, Droplets, MapPin, Package,
  ShieldCheck, AlertTriangle, Settings, Activity, CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useGetWarehousesQuery } from "@/services/api/warehouseApiSlice";
import { useGetUserByIdQuery } from "@/services/api/userApiSlice";
import useAuth from "@/hooks/useAuth";

const MyWarehouse = () => {
  const { id: currentUserId } = useAuth();
  const { data: allWarehouseData } = useGetWarehousesQuery(undefined);
  const { data: userProfile } = useGetUserByIdQuery(currentUserId, { skip: !currentUserId });

  const allWarehouses = Array.isArray(allWarehouseData) ? allWarehouseData : [];
  
  const assignedWarehouses = React.useMemo(() => {
    const assigned = Array.isArray(userProfile?.assignedWarehouse) 
      ? userProfile.assignedWarehouse 
      : (userProfile?.assignedWarehouse ? [userProfile.assignedWarehouse] : []);
      
    return allWarehouses.filter((wh: any) => {
      const matchProfile = assigned.includes(wh.name) || assigned.includes(wh._id);
      const matchManagerId = wh.managerId === currentUserId || wh.managerId?._id === currentUserId;
      return matchProfile || matchManagerId;
    });
  }, [allWarehouses, userProfile, currentUserId]);

  const liveWarehouse = assignedWarehouses.length > 0 ? assignedWarehouses[0] : null;

  const warehouse = liveWarehouse ? {
    name: liveWarehouse.name,
    location: liveWarehouse.location,
    state: liveWarehouse.state,
    capacity: liveWarehouse.capacity || 5000,
    currentStock: liveWarehouse.capacity - (liveWarehouse.availableCapacity || liveWarehouse.capacity),
    sections: [
      { id: "A", name: "Section A — Main Vault", capacity: liveWarehouse.capacity || 2000, stock: liveWarehouse.capacity - (liveWarehouse.availableCapacity || liveWarehouse.capacity), temp: 24, humidity: 44, status: "Normal" },
    ],
    lastInspection: "System Generated",
    certExpiry: "End of Year",
    manager: userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "Active Manager",
  } : {
    name: "No Facility Assigned",
    location: "Location Pending",
    state: "State Pending",
    capacity: 0,
    currentStock: 0,
    sections: [],
    lastInspection: "—",
    certExpiry: "—",
    manager: "—",
  };

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Warehouse</h1>
          <p className="text-muted-foreground flex items-center gap-1">
            <MapPin className="w-4 h-4" /> {warehouse.location}, {warehouse.state}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" /> Facility Settings
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Capacity", value: `${warehouse.capacity.toLocaleString()} MT`, icon: Building2, color: "text-primary", bg: "bg-primary/10" },
          { title: "Current Stock", value: `${warehouse.currentStock.toLocaleString()} MT`, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Last Inspection", value: warehouse.lastInspection, icon: ShieldCheck, color: "text-purple-500", bg: "bg-purple-500/10" },
          { title: "Cert. Expiry", value: warehouse.certExpiry, icon: CheckCircle2, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon className={`h-4 w-4 ${stat.color}`} /></div>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stat.value}</div></CardContent>
          </Card>
        ))}
      </div>

      {/* Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Storage Sections
          </CardTitle>
          <CardDescription>Real-time monitoring of each storage section</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {warehouse.sections.map((section) => {
              const pct = Math.round((section.stock / section.capacity) * 100);
              const isWarning = section.status === "Warning";
              return (
                <Card key={section.id} className={`border ${isWarning ? "border-amber-500/30" : "border-border"}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{section.name}</CardTitle>
                      <Badge className={isWarning ? "bg-amber-500 text-foreground" : "bg-primary/90 text-foreground"}>
                        {section.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Utilization */}
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Utilization</span>
                        <span className="font-semibold">{pct}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className={`h-2 rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{section.stock} / {section.capacity} MT</p>
                    </div>
                    {/* Environment */}
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center">
                        <Thermometer className={`mr-1 h-3.5 w-3.5 ${isWarning ? "text-red-500" : "text-amber-500"}`} />
                        <span className={isWarning ? "text-red-500 font-semibold" : ""}>{section.temp}°C</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Droplets className="mr-1 h-3.5 w-3.5 text-blue-500" />
                        {section.humidity}%
                      </div>
                    </div>
                    {isWarning && (
                      <div className="flex items-center gap-1 text-xs text-amber-500 bg-amber-500/10 p-2 rounded-lg">
                        <AlertTriangle className="w-3 h-3" />
                        Temperature exceeds 28°C threshold
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyWarehouse;
