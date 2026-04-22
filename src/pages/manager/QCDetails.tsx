import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, FileText, Scale, Droplets, Bug, Microscope } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetStorageOperationsQuery, useUpdateStorageOperationMutation } from "@/services/api/storageApiSlice";
import { useGetPlatformUsersQuery } from "@/services/api/userApiSlice";

const QCDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: operations = [], isLoading } = useGetStorageOperationsQuery(undefined);
  const { data: users = [], isLoading: usersLoading } = useGetPlatformUsersQuery(undefined);
  const [updateStorageOperation, { isLoading: isUpdating }] = useUpdateStorageOperationMutation();

  const operation = operations.find((op: any) => op._id === id);
  const depositor = users.find((u: any) => u._id === operation?.user);
  const depositorName = depositor ? `${depositor.firstName} ${depositor.lastName}` : "Unknown";

  const [formData, setFormData] = useState({
    moisture: "",
    foreignMatter: "",
    pestDamage: "",
    qcRemarks: "",
  });

  useEffect(() => {
    if (operation) {
      setFormData({
        moisture: operation.moisture?.toString() || "",
        foreignMatter: operation.foreignMatter?.toString() || "",
        pestDamage: operation.pestDamage?.toString() || "",
        qcRemarks: operation.qcRemarks || "",
      });
    }
  }, [operation]);

  const handleAction = async (status: "PASSED" | "FAILED") => {
    try {
      await updateStorageOperation({
        id,
        qcStatus: status,
        moisture: Number(formData.moisture),
        foreignMatter: Number(formData.foreignMatter),
        pestDamage: Number(formData.pestDamage),
        qcRemarks: formData.qcRemarks,
      }).unwrap();
      
      toast({
        title: status === "PASSED" ? "QC Passed" : "QC Failed",
        description: `Deposit evaluation has been marked as ${status}.`,
        variant: status === "FAILED" ? "destructive" : "default",
      });
      navigate("/manager/qc");
    } catch (error: any) {
      toast({
        title: "Error Processing QC",
        description: error.data?.message || "An error occurred while saving the metrics.",
        variant: "destructive",
      });
    }
  };

  if (isLoading || usersLoading) {
    return (
      <div className="space-y-6 p-2 animate-pulse">
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-2 gap-6">
           <Skeleton className="h-[400px] rounded-xl" />
           <Skeleton className="h-[400px] rounded-xl" />
        </div>
      </div>
    );
  }

  if (!operation) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-96 text-center">
        <AlertTriangle className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <h2 className="text-2xl font-bold text-destructive">Record Not Found</h2>
        <Button variant="outline" onClick={() => navigate("/manager/qc")} className="mt-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Inspections
        </Button>
      </div>
    );
  }

  const isPending = operation.qcStatus === "PENDING";

  return (
    <div className="space-y-6 animate-fade-in p-2 max-w-5xl mx-auto">
      <header>
        <Button variant="ghost" size="sm" onClick={() => navigate("/manager/qc")} className="mb-2 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Inspections
        </Button>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-3 tracking-tight">
              QC Process: {operation.receiptNo}
            </h1>
            <p className="text-muted-foreground mt-1">Review metrics and certify deposit compliance</p>
          </div>
          {operation.qcStatus !== "PENDING" && (
            <Badge className={operation.qcStatus === "PASSED" ? "bg-emerald-500 text-white font-black px-3 py-1" : "bg-red-500 text-white font-black px-3 py-1"}>
              Status: {operation.qcStatus}
            </Badge>
          )}
        </div>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Deposit Info Panel */}
        <Card className="glass-card border-none shadow-xl">
          <CardHeader className="bg-muted/30 pb-6">
             <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-500" />
                Deposit Particulars
             </CardTitle>
             <CardDescription>Cargo data registered at intake</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                 <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Originating Party</p>
                 <p className="font-bold text-base">{depositorName}</p>
                 <p className="text-[10px] px-1.5 py-0.5 mt-1 bg-slate-100 rounded text-slate-500 w-fit font-bold">DEPOSITOR</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Commodity</p>
                 <p className="font-bold text-base">{operation.commodity?.name}</p>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Intake Quantity</p>
                 <p className="font-black text-2xl text-emerald-600">{operation.quantity} <span className="text-sm font-normal text-muted-foreground">{operation.unit}</span></p>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Timestamp</p>
                 <p className="font-bold text-sm">{new Date(operation.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quality Input Form */}
        <Card className={`glass-card shadow-xl transition-all ${isPending ? "border-emerald-500/30" : "border-none opacity-80"}`}>
          <CardHeader>
             <CardTitle className="text-lg flex items-center gap-2">
                <Microscope className="h-5 w-5 text-blue-500" />
                Laboratory Metrics
             </CardTitle>
             <CardDescription>Enter values attained from core sampling and testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Droplets className="h-4 w-4 text-blue-500" /> Moisture Percentage (%)</Label>
                <Input 
                  type="number" 
                  step="0.1"
                  value={formData.moisture} 
                  onChange={(e) => setFormData({...formData, moisture: e.target.value})}
                  disabled={!isPending || isUpdating}
                  placeholder="e.g. 12.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Scale className="h-4 w-4 text-amber-500" /> Foreign Matter (%)</Label>
                  <Input 
                    type="number" 
                    step="0.1"
                    value={formData.foreignMatter} 
                    onChange={(e) => setFormData({...formData, foreignMatter: e.target.value})}
                    disabled={!isPending || isUpdating}
                    placeholder="e.g. 0.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Bug className="h-4 w-4 text-red-500" /> Pest Damage (%)</Label>
                  <Input 
                    type="number" 
                    step="0.1"
                    value={formData.pestDamage} 
                    onChange={(e) => setFormData({...formData, pestDamage: e.target.value})}
                    disabled={!isPending || isUpdating}
                    placeholder="e.g. 0.2"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Inspector's Remarks (Optional)</Label>
                <Textarea 
                  value={formData.qcRemarks} 
                  onChange={(e) => setFormData({...formData, qcRemarks: e.target.value})}
                  disabled={!isPending || isUpdating}
                  placeholder="Add any specific observations..."
                  className="resize-none"
                  rows={3}
                />
              </div>
            </div>

            {isPending && (
              <div className="pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full text-red-500 border-red-500/20 hover:bg-red-500/10 font-bold"
                  onClick={() => handleAction("FAILED")}
                  disabled={isUpdating}
                >
                  <XCircle className="w-4 h-4 mr-2" /> Reject Deposit
                </Button>
                <Button 
                  type="button"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20 font-bold"
                  onClick={() => handleAction("PASSED")}
                  disabled={isUpdating}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Certify & Pass
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QCDetails;
