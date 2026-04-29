import React, { useState } from "react";
import { 
  ShieldCheck, Search, CheckCircle2, XCircle, Clock, Eye, Wheat, 
  Scale, Microscope, AlertTriangle, Truck, ClipboardCheck, History as HistoryIcon, Package
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetStorageOperationsQuery, useUpdateStorageOperationMutation } from "@/services/api/storageApiSlice";
import { useGetPlatformUsersQuery, useGetUserByIdQuery } from "@/services/api/userApiSlice";
import { useGetWarehousesQuery } from "@/services/api/warehouseApiSlice";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

const QualityControl = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("requests");
  const navigate = useNavigate();
  const { toast } = useToast();

  const { id: currentUserId } = useAuth();
  const { data: userProfile } = useGetUserByIdQuery(currentUserId, { skip: !currentUserId, pollingInterval: 60000 });
  const { data: allWarehouseData } = useGetWarehousesQuery(undefined, { pollingInterval: 60000 });
  const { data: operations = [], isLoading: opsLoading } = useGetStorageOperationsQuery(undefined, { pollingInterval: 10000 });
  const { data: users = [], isLoading: usersLoading } = useGetPlatformUsersQuery(undefined, { pollingInterval: 60000 });
  const [updateStatus, { isLoading: isUpdating }] = useUpdateStorageOperationMutation();

  const allWarehouses = Array.isArray(allWarehouseData) ? allWarehouseData : [];
  const myWarehouses = React.useMemo(() => {
    const assigned = Array.isArray(userProfile?.assignedWarehouse) 
      ? userProfile.assignedWarehouse 
      : (userProfile?.assignedWarehouse ? [userProfile.assignedWarehouse] : []);
      
    return allWarehouses.filter((wh: any) => {
      const matchProfile = assigned.includes(wh.name) || assigned.includes(wh._id);
      const matchManagerId = wh.managerId === currentUserId || wh.managerId?._id === currentUserId;
      return matchProfile || matchManagerId;
    });
  }, [allWarehouses, userProfile, currentUserId]);

  const warehouseIds = myWarehouses.map((wh: any) => wh._id);

  const handleStatusUpdate = async (id: string, newStatus: string, message: string) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
      toast({ title: "Success", description: message });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error?.data?.message || "Failed to update status", 
        variant: "destructive" 
      });
    }
  };

  const getStatusConfig = (status: string, qcStatus?: string) => {
    if (status === "PENDING") return { icon: <Clock className="w-3 h-3 mr-1" />, class: "bg-amber-500/10 text-amber-500", label: "Request Pending" };
    if (status === "APPROVED") return { icon: <Truck className="w-3 h-3 mr-1" />, class: "bg-blue-500/10 text-blue-500", label: "Awaiting Delivery" };
    if (status === "REJECTED") return { icon: <XCircle className="w-3 h-3 mr-1" />, class: "bg-red-500/10 text-red-500", label: "Rejected" };
    if (status === "DEPOSITED") {
      if (qcStatus === "PASSED") return { icon: <CheckCircle2 className="w-3 h-3 mr-1" />, class: "bg-primary/10 text-primary", label: "QC Passed" };
      if (qcStatus === "FAILED") return { icon: <XCircle className="w-3 h-3 mr-1" />, class: "bg-red-500/10 text-red-500", label: "QC Failed" };
      return { icon: <Microscope className="w-3 h-3 mr-1" />, class: "bg-purple-500/10 text-purple-500", label: "QC Pending" };
    }
    return { icon: <Clock className="w-3 h-3 mr-1" />, class: "bg-muted text-muted-foreground", label: status };
  };

  const filteredOps = operations.filter((op: any) => {
    const isMine = warehouseIds.includes(op.warehouse?._id || op.warehouse);
    if (!isMine) return false;

    const matchesSearch = 
      op.receiptNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      op.commodity?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    switch (activeTab) {
      case "requests": return op.status === "PENDING";
      case "deliveries": return op.status === "APPROVED";
      case "qc": return op.status === "DEPOSITED" && op.qcStatus === "PENDING";
      case "history": return op.status === "REJECTED" || (op.status === "DEPOSITED" && op.qcStatus !== "PENDING");
      default: return true;
    }
  });

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Warehouse Operations</h1>
          <p className="text-muted-foreground">Manage requests, deliveries, and quality control</p>
        </div>
      </div>

      <Tabs defaultValue="requests" onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4" /> Requests
            {operations.filter(op => op.status === "PENDING" && warehouseIds.includes(op.warehouse?._id)).length > 0 && (
              <Badge className="ml-1 px-1.5 h-4 min-w-[1rem] bg-amber-500 text-[10px]">
                {operations.filter(op => op.status === "PENDING" && warehouseIds.includes(op.warehouse?._id)).length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="deliveries" className="flex items-center gap-2">
            <Truck className="w-4 h-4" /> Deliveries
          </TabsTrigger>
          <TabsTrigger value="qc" className="flex items-center gap-2">
            <Microscope className="w-4 h-4" /> QC Needed
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <HistoryIcon className="w-4 h-4" /> History
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search records..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lot / Receipt</TableHead>
                    <TableHead>Commodity</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOps.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                        No records found in this section.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOps.map((op: any) => {
                      const config = getStatusConfig(op.status, op.qcStatus);
                      return (
                        <TableRow key={op._id} className="hover:bg-muted/50 transition">
                          <TableCell className="font-mono text-xs text-primary/90">{op.receiptNo}</TableCell>
                          <TableCell className="font-medium flex items-center gap-1.5">
                            <Wheat className="h-4 w-4 text-primary" />{op.commodity?.name}
                          </TableCell>
                          <TableCell className="text-sm font-semibold">{op.quantity} {op.unit || "kg"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] uppercase font-bold">
                              {op.deliveryMethod === "PICK_UP" ? "Pickup" : "Drop-off"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`${config.class} border-transparent flex items-center w-fit`}>
                              {config.icon} {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {activeTab === "requests" && (
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" className="text-red-500 border-red-500/20 hover:bg-red-500/10" 
                                  onClick={() => handleStatusUpdate(op._id, "REJECTED", "Request rejected")}>
                                  Reject
                                </Button>
                                <Button size="sm" className="bg-primary/90 hover:bg-primary text-primary-foreground"
                                  onClick={() => handleStatusUpdate(op._id, "APPROVED", "Request approved")}>
                                  Approve
                                </Button>
                              </div>
                            )}
                            {activeTab === "deliveries" && (
                              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white"
                                onClick={() => handleStatusUpdate(op._id, "DEPOSITED", "Marked as deposited")}>
                                <Package className="w-4 h-4 mr-2" /> Mark Received
                              </Button>
                            )}
                            {activeTab === "qc" && (
                              <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white"
                                onClick={() => navigate(`/manager/deposits/${op._id}`)}>
                                <Microscope className="w-4 h-4 mr-2" /> Run QC
                              </Button>
                            )}
                            {activeTab === "history" && (
                              <Button variant="ghost" size="sm" onClick={() => navigate(`/manager/deposits/${op._id}`)}>
                                <Eye className="w-4 h-4 mr-2" /> Details
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

export default QualityControl;
