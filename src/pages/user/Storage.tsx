import React, { useState } from "react";
import { Wheat, Plus, ArrowLeft, History, Building2, ShieldCheck, Clock, Package, X, MessageSquare, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useGetStorageOperationsQuery, useCreateStorageOperationMutation } from "@/services/api/storageApiSlice";
import { useGetCropsQuery } from "@/services/api/cropApiSlice";
import { useGetWarehousesQuery } from "@/services/api/warehouseApiSlice";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useAuth from "@/hooks/useAuth";

const Storage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { firstName, lastName } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);

  const { data: crops = [] } = useGetCropsQuery(undefined, { pollingInterval: 60000 });
  const { data: warehouses = [] } = useGetWarehousesQuery(undefined, { pollingInterval: 60000 });
  const { data: operations = [], isLoading: isOpsLoading } = useGetStorageOperationsQuery(undefined, { pollingInterval: 15000 });
  const [createRequest, { isLoading: isSubmitting }] = useCreateStorageOperationMutation();

  const [formData, setFormData] = useState({
    type: "DEPOSIT",
    commodity: "",
    quantity: "",
    warehouse: "",
    deliveryMethod: "DROP_OFF",
    receiptNo: `RQ-${Math.floor(1000 + Math.random() * 9000)}`,
    notes: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.commodity || !formData.warehouse || !formData.quantity) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      await createRequest({
        ...formData,
        quantity: Number(formData.quantity)
      }).unwrap();
      toast({ title: "Request Submitted", description: "Your storage request has been sent for review." });
      setIsRequesting(false);
    } catch (error: any) {
      toast({ title: "Error", description: error?.data?.message || "Failed to submit request", variant: "destructive" });
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
          onClick={() => setIsRequesting(true)} 
          className="bg-primary/90 hover:bg-primary/90 !text-white shadow-lg shadow-primary/90/20 w-full sm:w-auto"
          size="sm"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> New Deposit
        </Button>
      </header>

      {/* New Request Dialog */}
      <Dialog open={isRequesting} onOpenChange={setIsRequesting}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 bg-primary/90 text-white space-y-1">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Package className="w-5 h-5" /> Request Storage Space
            </DialogTitle>
            <DialogDescription className="text-white/80 text-xs">
              Fill in the details of the commodities you wish to deposit.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-background">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Commodity Type</Label>
                <Select onValueChange={(v) => setFormData({...formData, commodity: v})}>
                  <SelectTrigger className="h-11 border-primary/20 focus:ring-primary/30">
                    <SelectValue placeholder="Select crop" />
                  </SelectTrigger>
                  <SelectContent>
                    {crops.map((crop: any) => (
                      <SelectItem key={crop._id} value={crop._id}>{crop.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quantity (kg)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g. 50" 
                  value={formData.quantity} 
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="h-11 border-primary/20 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Target Warehouse</Label>
                <Select onValueChange={(v) => setFormData({...formData, warehouse: v})}>
                  <SelectTrigger className="h-11 border-primary/20 focus:ring-primary/30">
                    <SelectValue placeholder="Select facility" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((wh: any) => (
                      <SelectItem key={wh._id} value={wh._id}>{wh.name} ({wh.location})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Delivery Method</Label>
                <Select onValueChange={(v) => setFormData({...formData, deliveryMethod: v})}>
                  <SelectTrigger className="h-11 border-primary/20 focus:ring-primary/30">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DROP_OFF">Drop-off (I'll bring it)</SelectItem>
                    <SelectItem value="PICK_UP">Request Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Additional Notes (Optional)</Label>
              <Input 
                placeholder="e.g. Crop variety, moisture level..." 
                value={formData.notes} 
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="h-11 border-primary/20 focus:ring-primary/30"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsRequesting(false)} 
                className="flex-1 h-11 border-primary/20 text-primary hover:bg-primary/5"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="flex-1 h-11 bg-primary/90 hover:bg-primary !text-white shadow-lg shadow-primary/20"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <div className="space-y-4 sm:space-y-6">
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
                      <tr key={op._id} className="hover:bg-muted/50 transition-colors">
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
                <div key={op._id} className="flex flex-col p-3 sm:p-4 rounded-xl border border-muted hover:bg-muted/10 transition-all gap-3">
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
                        className={`text-[9px] sm:text-[10px] ${
                          op.status === 'REJECTED' ? 'bg-red-500/10 text-red-600' :
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
