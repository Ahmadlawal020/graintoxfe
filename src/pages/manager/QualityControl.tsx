import React, { useState } from "react";
import { ShieldCheck, Search, CheckCircle2, XCircle, Clock, Eye, Wheat, Scale, Microscope, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetStorageOperationsQuery } from "@/services/api/storageApiSlice";
import { useGetPlatformUsersQuery, useGetUserByIdQuery } from "@/services/api/userApiSlice";
import { useGetWarehousesQuery } from "@/services/api/warehouseApiSlice";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

const QualityControl = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { id: currentUserId } = useAuth();
  const { data: userProfile } = useGetUserByIdQuery(currentUserId, { skip: !currentUserId });
  const { data: allWarehouseData } = useGetWarehousesQuery(undefined);
  const { data: operations = [], isLoading: opsLoading } = useGetStorageOperationsQuery(undefined);
  const { data: users = [], isLoading: usersLoading } = useGetPlatformUsersQuery(undefined);

  const allWarehouses = Array.isArray(allWarehouseData) ? allWarehouseData : [];
  const myWarehouses = React.useMemo(() => {
    const assigned = Array.isArray(userProfile?.assignedWarehouse) 
      ? userProfile.assignedWarehouse 
      : (userProfile?.assignedWarehouse ? [userProfile.assignedWarehouse] : []);
      
    // Exact match for managerId or assignment
    return allWarehouses.filter((wh: any) => {
      const matchProfile = assigned.includes(wh.name) || assigned.includes(wh._id);
      const matchManagerId = wh.managerId === currentUserId || wh.managerId?._id === currentUserId;
      return matchProfile || matchManagerId;
    });
  }, [allWarehouses, userProfile, currentUserId]);

  // Filter only deposits to the manager's assigned warehouses
  const depositOps = React.useMemo(() => {
    const warehouseIds = myWarehouses.map((wh: any) => wh._id);
    return operations.filter(
      (op: any) => op.type === "DEPOSIT" && warehouseIds.includes(op.warehouse?._id || op.warehouse)
    );
  }, [operations, myWarehouses]);

  const inspections = depositOps.map((op: any) => {
    const depositorData = users.find((u: any) => u._id === op.user);
    const depositorName = depositorData ? `${depositorData.firstName} ${depositorData.lastName}` : (op.user ? `ID: ${op.user.substring(0,8)}` : "Unknown");
    
    return {
      _id: op._id,
      lot: op.receiptNo || `OP-${op._id.substring(0, 6)}`,
      commodity: op.commodity?.name || "Unknown",
      investor: depositorName,
      quantity: `${op.quantity} ${op.unit || "kg"}`,
      moisture: op.moisture,
      foreignMatter: op.foreignMatter,
      pestDamage: op.pestDamage,
      grade: op.qcStatus === "PASSED" ? "Grade A" : (op.qcStatus === "FAILED" ? "Rejected" : "Pending"),
      inspector: op.qcStatus !== "PENDING" ? "QC Assigned" : "—",
      date: new Date(op.timestamp).toLocaleDateString(),
      status: op.qcStatus || "PENDING"
    };
  });

  const filteredInspections = inspections.filter((insp: any) =>
    insp.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    insp.lot.toLowerCase().includes(searchTerm.toLowerCase()) ||
    insp.investor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: inspections.length,
    pending: inspections.filter((i) => i.status === "PENDING").length,
    passed: inspections.filter((i) => i.status === "PASSED").length,
    failed: inspections.filter((i) => i.status === "FAILED").length,
  };

  const statusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; class: string; label: string }> = {
      PENDING: { icon: <Clock className="w-3 h-3 mr-1" />, class: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "Pending" },
      PASSED: { icon: <CheckCircle2 className="w-3 h-3 mr-1" />, class: "bg-primary/10 text-primary border-primary/20", label: "Passed" },
      FAILED: { icon: <XCircle className="w-3 h-3 mr-1" />, class: "bg-red-500/10 text-red-500 border-red-500/20", label: "Failed" },
    };
    const c = config[status] || config.PENDING;
    return <Badge variant="outline" className={`${c.class} flex items-center w-fit`}>{c.icon} {c.label}</Badge>;
  };

  const moistureIndicator = (val: number) => {
    if (val > 14) return <span className="text-red-500 font-semibold">{val}%</span>;
    if (val > 12.5) return <span className="text-amber-500 font-semibold">{val}%</span>;
    return <span className="text-primary font-semibold">{val}%</span>;
  };

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quality Control</h1>
          <p className="text-muted-foreground">Inspect and grade incoming grain deposits</p>
        </div>
        <Button className="bg-primary/90 hover:bg-primary/90 text-foreground shadow-lg shadow-primary/90/20" size="sm">
          <Microscope className="mr-2 h-4 w-4" /> Start Inspection
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Inspections", value: stats.total, icon: ShieldCheck, color: "text-primary", bg: "bg-primary/10" },
          { title: "Pending", value: stats.pending, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { title: "Passed", value: stats.passed, icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Failed", value: stats.failed, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
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

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2"><Scale className="w-5 h-5 text-primary" /> Inspection Log</CardTitle>
              <CardDescription>Grain quality assessments with moisture, foreign matter, and pest damage readings</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search inspections..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lot #</TableHead>
                  <TableHead>Commodity</TableHead>
                  <TableHead>Investor</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Moisture</TableHead>
                  <TableHead>Foreign Matter</TableHead>
                  <TableHead>Pest Damage</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInspections.map((insp) => (
                  <TableRow key={insp._id} className="hover:bg-muted/50 transition cursor-pointer" onClick={() => navigate(`/manager/qc/${insp._id}`)}>
                    <TableCell className="font-mono text-xs text-primary/90">{insp.lot}</TableCell>
                    <TableCell className="font-medium flex items-center gap-1.5"><Wheat className="h-4 w-4 text-primary" />{insp.commodity}</TableCell>
                    <TableCell className="text-sm">{insp.investor}</TableCell>
                    <TableCell className="text-sm font-semibold">{insp.quantity}</TableCell>
                    <TableCell>{insp.moisture ? moistureIndicator(insp.moisture) : "—"}</TableCell>
                    <TableCell className={insp.foreignMatter > 1.5 ? "text-red-500 font-semibold" : "text-muted-foreground"}>{insp.foreignMatter ? `${insp.foreignMatter}%` : "—"}</TableCell>
                    <TableCell className={insp.pestDamage > 2 ? "text-red-500 font-semibold" : "text-muted-foreground"}>{insp.pestDamage ? `${insp.pestDamage}%` : "—"}</TableCell>
                    <TableCell>
                      {insp.grade !== "Pending" ? (
                        <Badge className={insp.grade === "Grade A" ? "bg-primary/90 text-foreground" : insp.grade === "Rejected" ? "bg-red-500 text-foreground" : "bg-amber-500 text-foreground"}>{insp.grade}</Badge>
                      ) : <span className="text-muted-foreground text-sm">—</span>}
                    </TableCell>
                    <TableCell>{statusBadge(insp.status)}</TableCell>
                    <TableCell>
                      {insp.status === "PENDING" ? (
                        <Button variant="outline" size="sm" className="h-7 text-[10px] uppercase font-bold" onClick={(e) => { e.stopPropagation(); navigate(`/manager/qc/${insp._id}`); }}>
                           Review
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold text-muted-foreground" onClick={(e) => { e.stopPropagation(); navigate(`/manager/qc/${insp._id}`); }}>
                           View
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QualityControl;
