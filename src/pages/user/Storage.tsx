import React, { useState } from "react";
import { Wheat, Plus, ArrowLeft, History, Building2, ShieldCheck, Clock, Package, X } from "lucide-react";
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
import useAuth from "@/hooks/useAuth";

const Storage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { firstName, lastName } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);

  const { data: crops = [] } = useGetCropsQuery(undefined);
  const { data: warehouses = [] } = useGetWarehousesQuery(undefined);
  const { data: operations = [], isLoading: isOpsLoading } = useGetStorageOperationsQuery(undefined);
  const [createRequest, { isLoading: isSubmitting }] = useCreateStorageOperationMutation();

  const [formData, setFormData] = useState({
    type: "DEPOSIT",
    commodity: "",
    quantity: "",
    warehouse: "",
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
          className="bg-primary/90 hover:bg-primary/90 text-foreground shadow-lg shadow-primary/90/20 w-full sm:w-auto"
          size="sm"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> New Deposit
        </Button>
      </header>

      {/* New Request Form */}
      {isRequesting && (
        <>
          {/* Mobile: bottom sheet */}
          <div className="sm:hidden fixed inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsRequesting(false)} />
            <div className="relative bg-background rounded-t-2xl border-t max-h-[85vh] overflow-y-auto">
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="px-4 pb-2 flex items-center justify-between">
                <h3 className="font-bold text-base">Request Storage</h3>
                <button onClick={() => setIsRequesting(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-4 pt-2 space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Commodity Type</Label>
                  <Select onValueChange={(v) => setFormData({...formData, commodity: v})}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Select crop" /></SelectTrigger>
                    <SelectContent>
                      {crops.map((crop: any) => (
                        <SelectItem key={crop._id} value={crop._id}>{crop.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Quantity (MT)</Label>
                  <Input type="number" placeholder="e.g. 50" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Target Warehouse</Label>
                  <Select onValueChange={(v) => setFormData({...formData, warehouse: v})}>
                    <SelectTrigger className="h-11"><SelectValue placeholder="Select facility" /></SelectTrigger>
                    <SelectContent>
                      {warehouses.map((wh: any) => (
                        <SelectItem key={wh._id} value={wh._id}>{wh.name} ({wh.location})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Notes (optional)</Label>
                  <Input placeholder="Crop variety, moisture level..." value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="h-11" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsRequesting(false)} className="flex-1 h-11">Cancel</Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1 h-11 bg-primary/90 hover:bg-primary/90 text-foreground">
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Desktop: inline card */}
          <Card className="hidden sm:block max-w-2xl border-primary/20 shadow-xl animate-in zoom-in-95">
            <CardHeader className="bg-primary/5">
              <CardTitle>Request Storage Space</CardTitle>
              <CardDescription>Fill in the details of the commodities you wish to deposit.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Commodity Type</Label>
                    <Select onValueChange={(v) => setFormData({...formData, commodity: v})}>
                      <SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger>
                      <SelectContent>
                        {crops.map((crop: any) => (
                          <SelectItem key={crop._id} value={crop._id}>{crop.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity (MT)</Label>
                    <Input type="number" placeholder="e.g. 50" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Target Warehouse</Label>
                  <Select onValueChange={(v) => setFormData({...formData, warehouse: v})}>
                    <SelectTrigger><SelectValue placeholder="Select facility" /></SelectTrigger>
                    <SelectContent>
                      {warehouses.map((wh: any) => (
                        <SelectItem key={wh._id} value={wh._id}>{wh.name} ({wh.location})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Additional Notes</Label>
                  <Input placeholder="e.g. Crop variety, moisture level if known..." value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsRequesting(false)}>Cancel</Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-primary/90 hover:bg-primary/90 text-foreground">
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </>
      )}

      {!isRequesting && (
        <div className="space-y-4 sm:space-y-6">
          {/* Active Holdings */}
          <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="bg-primary/90 text-foreground p-3 sm:p-4">
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
                        <span><strong className="text-foreground">{op.quantity} MT</strong> stored</span>
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
                          <td className="px-4 lg:px-6 py-3">{op.quantity} MT</td>
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
                  <div key={op._id} className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-muted hover:bg-muted/10 transition-all gap-3">
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
                        <p className="text-sm font-bold">{op.quantity} MT</p>
                        <p className="text-[10px] text-muted-foreground">{op.warehouse?.name}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[9px] sm:text-[10px] ${op.qcStatus === 'PASSED' ? 'bg-primary/10 text-primary/90' : 'bg-amber-100/10 text-amber-600'}`}
                      >
                        {op.qcStatus || 'PROCESSING'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Storage;
