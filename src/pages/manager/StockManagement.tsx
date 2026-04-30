import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Search, ArrowDownToLine, ArrowUpFromLine, Wheat, Eye, Plus, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetStorageOperationsQuery } from "@/services/api/storageApiSlice";
import { useGetPlatformUsersQuery, useGetUserByIdQuery } from "@/services/api/userApiSlice";
import { useGetWarehousesQuery } from "@/services/api/warehouseApiSlice";
import useAuth from "@/hooks/useAuth";

const StockManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

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
      
    return allWarehouses.filter((wh: any) => {
      const matchProfile = assigned.includes(wh.name) || assigned.includes(wh._id);
      const matchManagerId = wh.managerId === currentUserId || wh.managerId?._id === currentUserId;
      return matchProfile || matchManagerId;
    });
  }, [allWarehouses, userProfile, currentUserId]);

  const filteredOps = React.useMemo(() => {
    const warehouseIds = myWarehouses.map((wh: any) => wh._id);
    return operations.filter((op: any) => warehouseIds.includes(op.warehouse?._id || op.warehouse));
  }, [operations, myWarehouses]);

  const stockItems = filteredOps.map((op: any) => {
    const depositorData = users.find((u: any) => u._id === op.user);
    const depositorName = depositorData ? `${depositorData.firstName} ${depositorData.lastName}` : (op.user ? `ID: ${op.user.substring(0,6)}...` : "Unknown");

    return {
      _id: op._id,
      commodity: op.commodity?.name || "Unknown",
      lot: op.receiptNo || `OP-${op._id.substring(0, 6)}`,
      bags: op.quantity || 0, // Using quantity as bags since weight is also stored or we can just show value
      weight: op.quantity || 0,
      unit: op.unit || "kg",
      section: op.section || "Main Vault",
      depositor: depositorName,
      depositDate: new Date(op.timestamp).toLocaleDateString(),
      quality: op.qcStatus === "PASSED" ? "Grade A" : (op.qcStatus === "PENDING" ? "Pending QC" : "Grade C"),
      tokenized: op.qcStatus === "PASSED"
    };
  });

  const filteredItems = stockItems.filter((item: any) =>
    item.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.lot.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.depositor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stock Management</h1>
          <p className="text-muted-foreground">Manage grain lots, track inventory, and process deposits/withdrawals</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-9 text-xs" onClick={() => navigate("/manager/stock/withdraw")}><ArrowUpFromLine className="mr-1.5 h-3.5 w-3.5" /> Withdraw</Button>
          <Button 
            className="flex-1 sm:flex-none h-9 text-xs bg-primary/90 hover:bg-primary/90 text-foreground shadow-lg shadow-primary/90/20" 
            size="sm"
            onClick={() => navigate("/manager/stock/record")}
          >
            <ArrowDownToLine className="mr-1.5 h-3.5 w-3.5" /> Deposit
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: "Total Lots", value: stockItems.length, icon: Package, color: "text-primary", bg: "bg-primary/10" },
          { title: "Total Weight", value: `${stockItems.reduce((a, s) => a + s.weight, 0)} kg`, icon: Wheat, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Pending QC", value: stockItems.filter(s => s.quality === "Pending QC").length, icon: Eye, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon className={`h-4 w-4 ${stat.color}`} /></div>
            </CardHeader>
            <CardContent><div className="text-xl sm:text-2xl font-bold">{stat.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle>Inventory Register</CardTitle>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by commodity, lot, or investor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Commodity</TableHead>
                    <TableHead className="hidden md:table-cell">Lot #</TableHead>
                    <TableHead className="hidden lg:table-cell">Bags</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead className="hidden xl:table-cell">Section</TableHead>
                    <TableHead className="hidden md:table-cell">Depositor</TableHead>
                    <TableHead className="hidden lg:table-cell">Quality</TableHead>
                    <TableHead className="hidden xl:table-cell">Tokenized</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item._id} className="hover:bg-muted/50 transition cursor-pointer">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1.5 truncate max-w-[120px] sm:max-w-none">
                          <Wheat className="h-3.5 w-3.5 text-primary shrink-0" />{item.commodity}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-[10px] text-primary/90 hidden md:table-cell">{item.lot}</TableCell>
                      <TableCell className="hidden lg:table-cell">{item.bags.toLocaleString()}</TableCell>
                      <TableCell className="font-semibold text-xs sm:text-sm whitespace-nowrap">{item.weight} kg</TableCell>
                      <TableCell className="hidden xl:table-cell"><Badge variant="outline" className="text-[10px]">{item.section}</Badge></TableCell>
                      <TableCell className="text-[10px] sm:text-xs truncate max-w-[100px] hidden md:table-cell">{item.depositor}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge className={`text-[10px] py-0 ${
                          item.quality === "Grade A" ? "bg-primary/90 text-foreground" :
                            item.quality === "Grade B" ? "bg-amber-500 text-foreground" :
                              "bg-gray-500 text-foreground"
                        }`}>{item.quality}</Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        {item.tokenized ? (
                          <Badge variant="outline" className="text-primary border-primary/20 bg-primary/10 text-[10px] py-0">Yes</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-[10px] py-0">No</Badge>
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

export default StockManagement;
