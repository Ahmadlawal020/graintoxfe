import React, { useState } from "react";
import { Wheat, Plus, ArrowLeft, History, Building2, ShieldCheck, Clock, Package, RefreshCw, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useGetStorageOperationsQuery } from "@/services/api/storageApiSlice";
import { useGetStorageBalancesQuery, useTransferTradingCropsMutation } from "@/services/api/storageApiSlice";
import { useGetCropsQuery } from "@/services/api/cropApiSlice";
import { useGetWarehousesQuery } from "@/services/api/warehouseApiSlice";
import { useGetUserByIdQuery } from "@/services/api/userApiSlice";
import { Badge } from "@/components/ui/badge";
import useAuth from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Storage = () => {
  const navigate = useNavigate();
  const { id, firstName, lastName } = useAuth();
  const { data: crops = [] } = useGetCropsQuery(undefined, { pollingInterval: 60000 });
  const { data: warehouses = [] } = useGetWarehousesQuery(undefined, { pollingInterval: 60000 });
  const { data: userData } = useGetUserByIdQuery(id || "");
  const { data: operations = [], isLoading: isOpsLoading } = useGetStorageOperationsQuery(undefined, { pollingInterval: 15000 });
  const { data: storageBalances = [] } = useGetStorageBalancesQuery(undefined, { pollingInterval: 15000 });
  const [transferTradingCrops, { isLoading: isTransferring }] = useTransferTradingCropsMutation();
  const [cropTransferDirection, setCropTransferDirection] = useState<"storage_to_trading" | "trading_to_storage">("storage_to_trading");
  const [selectedStoredBalance, setSelectedStoredBalance] = useState("");
  const [selectedTradingCrop, setSelectedTradingCrop] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [cropTransferQuantity, setCropTransferQuantity] = useState("");

  const selectedBalance = storageBalances.find((balance: any) => {
    const key = `${balance.commodity?._id}-${balance.warehouse?._id}`;
    return key === selectedStoredBalance;
  });

  const selectedHolding = userData?.holdings?.find((holding: any) => holding.crop === selectedTradingCrop || holding.tokenSymbol === selectedTradingCrop);

  const handleCropTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseFloat(cropTransferQuantity);

    if (!quantity || quantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    const commodity = cropTransferDirection === "storage_to_trading"
      ? selectedBalance?.commodity?._id
      : selectedTradingCrop;
    const warehouse = cropTransferDirection === "storage_to_trading"
      ? selectedBalance?.warehouse?._id
      : selectedWarehouse;

    if (!commodity || !warehouse) {
      toast.error("Please select crop and warehouse");
      return;
    }

    try {
      await transferTradingCrops({
        direction: cropTransferDirection,
        commodity,
        warehouse,
        quantity,
      }).unwrap();
      toast.success("Crop balance moved successfully");
      setCropTransferQuantity("");
    } catch (error: any) {
      toast.error(error.data?.message || "Crop transfer failed");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-1 sm:p-2">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/user")} className="mb-1 -ml-2 text-xs">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Storage Management {firstName && `- ${firstName}`}
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm flex items-center gap-1.5 mt-0.5">
            <Building2 className="w-3.5 h-3.5 text-primary/90" />
            Manage your grain deposits and warehouse requests
          </p>
        </div>
        <Button 
          onClick={() => navigate("/user/storage/request")} 
          className="bg-primary/90 hover:bg-primary/90 !text-white shadow-lg shadow-primary/90/20 w-full sm:w-auto"
          size="sm"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> New Deposit
        </Button>
      </header>

      <div className="space-y-4 sm:space-y-6">
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="p-3 sm:p-4">
            <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Move Crops For Trading
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Move warehouse crops into trading, or move trading crops back to storage.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <form onSubmit={handleCropTransfer} className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-end">
              <div className="lg:col-span-1 space-y-2">
                <Label className="text-xs font-black uppercase text-muted-foreground">Direction</Label>
                <select
                  className="w-full h-10 rounded-md bg-muted/40 px-3 text-sm outline-none"
                  value={cropTransferDirection}
                  onChange={(e) => {
                    setCropTransferDirection(e.target.value as "storage_to_trading" | "trading_to_storage");
                    setCropTransferQuantity("");
                  }}
                >
                  <option value="storage_to_trading">Storage to Trading</option>
                  <option value="trading_to_storage">Trading to Storage</option>
                </select>
              </div>

              {cropTransferDirection === "storage_to_trading" ? (
                <div className="lg:col-span-2 space-y-2">
                  <Label className="text-xs font-black uppercase text-muted-foreground">Stored Crop</Label>
                  <select
                    className="w-full h-10 rounded-md bg-muted/40 px-3 text-sm outline-none"
                    value={selectedStoredBalance}
                    onChange={(e) => setSelectedStoredBalance(e.target.value)}
                  >
                    <option value="">Select stored crop</option>
                    {storageBalances.map((balance: any) => (
                      <option key={`${balance.commodity?._id}-${balance.warehouse?._id}`} value={`${balance.commodity?._id}-${balance.warehouse?._id}`}>
                        {balance.commodity?.name} - {balance.warehouse?.name} ({balance.quantity} kg)
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <>
                  <div className="lg:col-span-1 space-y-2">
                    <Label className="text-xs font-black uppercase text-muted-foreground">Trading Crop</Label>
                    <select
                      className="w-full h-10 rounded-md bg-muted/40 px-3 text-sm outline-none"
                      value={selectedTradingCrop}
                      onChange={(e) => setSelectedTradingCrop(e.target.value)}
                    >
                      <option value="">Select crop</option>
                      {userData?.holdings?.map((holding: any) => (
                        <option key={holding._id} value={holding.crop || holding.tokenSymbol}>
                          {holding.tokenSymbol} ({holding.amount} kg)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="lg:col-span-1 space-y-2">
                    <Label className="text-xs font-black uppercase text-muted-foreground">Warehouse</Label>
                    <select
                      className="w-full h-10 rounded-md bg-muted/40 px-3 text-sm outline-none"
                      value={selectedWarehouse}
                      onChange={(e) => setSelectedWarehouse(e.target.value)}
                    >
                      <option value="">Select warehouse</option>
                      {warehouses.map((warehouse: any) => (
                        <option key={warehouse._id} value={warehouse._id}>{warehouse.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase text-muted-foreground">Quantity</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={cropTransferQuantity}
                  onChange={(e) => setCropTransferQuantity(e.target.value)}
                  className="h-10 bg-muted/40 border-none"
                />
                <p className="text-[10px] text-muted-foreground">
                  Available: {cropTransferDirection === "storage_to_trading"
                    ? selectedBalance?.quantity || 0
                    : selectedHolding?.amount || 0} kg
                </p>
              </div>

              <Button type="submit" disabled={isTransferring} className="h-10 !text-white">
                {isTransferring ? "Moving..." : "Move Crop"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active Holdings */}
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-primary/90 !text-white p-3 sm:p-4">
            <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
              <Wheat className="w-4 h-4 sm:w-5 sm:h-5" /> Current Stored Assets
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="sm:hidden divide-y divide-muted">
              {operations.length > 0 ? (
                operations.slice(0, 5).map((op: any) => (
                  <div key={op._id} className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="w-4 h-4 text-primary/90" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{op.commodity?.name}</p>
                          <p className="text-[10px] text-muted-foreground">{op.warehouse?.name}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-primary/10 text-primary/90 border-primary/30 text-[10px]">
                        Active
                      </Badge>
                    </div>
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span><strong className="text-foreground">{op.quantity} kg</strong> stored</span>
                      <span className="flex items-center gap-1">
                        {op.qcStatus === 'PASSED' ? <ShieldCheck className="w-3 h-3 text-primary" /> : <Clock className="w-3 h-3 text-amber-500" />}
                        QC: {op.qcStatus || 'Pending'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-muted-foreground text-sm">
                  No active storage holdings found.
                </div>
              )}
            </div>

            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-4 lg:px-6 py-3">Commodity</th>
                    <th className="px-4 lg:px-6 py-3">Warehouse</th>
                    <th className="px-4 lg:px-6 py-3">Total Qty</th>
                    <th className="px-4 lg:px-6 py-3">Status</th>
                    <th className="px-4 lg:px-6 py-3">Last QC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-muted">
                  {operations.length > 0 ? (
                    operations.slice(0, 5).map((op: any) => (
                      <tr 
                      key={op._id} 
                      className="hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/user/storage/${op._id}`)}
                    >
                        <td className="px-4 lg:px-6 py-3 font-medium">{op.commodity?.name}</td>
                        <td className="px-4 lg:px-6 py-3">{op.warehouse?.name}</td>
                        <td className="px-4 lg:px-6 py-3">{op.quantity} kg</td>
                        <td className="px-4 lg:px-6 py-3">
                          <Badge variant="outline" className="bg-primary/10 text-primary/90 border-primary/30">Active</Badge>
                        </td>
                        <td className="px-4 lg:px-6 py-3">
                          <div className="flex items-center gap-1.5 text-xs">
                            {op.qcStatus === 'PASSED' ? <ShieldCheck className="w-3.5 h-3.5 text-primary" /> : <Clock className="w-3.5 h-3.5 text-amber-500" />}
                            {op.qcStatus || 'Pending'}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                        No active storage holdings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Request History */}
        <Card className="border-none shadow-md">
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
              <History className="w-4 h-4 sm:w-5 sm:h-5 text-primary/90" /> Request Timeline
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">Track the status of your recent deposits and requests.</CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 lg:p-6 pt-0">
            <div className="space-y-2 sm:space-y-3">
              {operations.map((op: any) => (
                <div 
                  key={op._id} 
                  className="flex flex-col p-3 sm:p-4 rounded-xl border border-muted hover:bg-muted/10 transition-all gap-3 cursor-pointer"
                  onClick={() => navigate(`/user/storage/${op._id}`)}
                >
                  <div className="flex items-center justify-between w-full gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                      <div className={`p-1.5 sm:p-2 rounded-lg shrink-0 ${op.type === 'DEPOSIT' ? 'bg-primary/20 text-primary/90' : 'bg-blue-100 text-blue-700'}`}>
                        {op.type === 'DEPOSIT' ? <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs sm:text-sm truncate">{op.type} - {op.commodity?.name}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {op.receiptNo} · {new Date(op.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold">{op.quantity} kg</p>
                        <p className="text-[10px] text-muted-foreground">{op.warehouse?.name}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[9px] sm:text-[10px] ${op.status === 'REJECTED' ? 'bg-red-500/10 text-red-600' :
                            op.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600' :
                              op.status === 'APPROVED' ? 'bg-blue-500/10 text-blue-600' :
                                op.qcStatus === 'PASSED' ? 'bg-primary/10 text-primary/90' :
                                  op.qcStatus === 'FAILED' ? 'bg-red-500/10 text-red-600' :
                                    'bg-purple-500/10 text-purple-600'
                          }`}
                      >
                        {op.status === 'REJECTED' ? 'REJECTED' :
                          op.status === 'PENDING' ? 'AWAITING APPROVAL' :
                            op.status === 'APPROVED' ? 'APPROVED / DELIVER NOW' :
                              op.qcStatus === 'PASSED' ? 'DEPOSITED / QC PASSED' :
                                op.qcStatus === 'FAILED' ? 'DEPOSITED / QC FAILED' :
                                  'DEPOSITED / QC PENDING'}
                      </Badge>
                    </div>
                  </div>
                  {op.qcRemarks && (
                    <div className="p-2 bg-muted/30 rounded-lg border border-dashed border-muted">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" /> Manager Feedback
                      </p>
                      <p className="text-xs text-foreground/80 mt-1 italic">"{op.qcRemarks}"</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Storage;
