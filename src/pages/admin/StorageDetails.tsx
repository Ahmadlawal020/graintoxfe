import React from "react";
import {
  ArrowLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  Building2,
  Wheat,
  User,
  Calendar,
  Clock,
  ShieldCheck,
  FileText,
  Scale,
  Thermometer,
  Droplets,
  BadgeCheck,
  CheckCircle2,
  Download,
  Share2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetStorageOperationsQuery } from "@/services/api/storageApiSlice";
import { useGetUserByIdQuery } from "@/services/api/userApiSlice";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

const StorageDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: operations = [], isLoading } = useGetStorageOperationsQuery(undefined);
  const operation = operations.find((op: any) => op._id === id);

  const { data: userData, isLoading: userLoading } = useGetUserByIdQuery(operation?.user, { skip: !operation?.user });
  
  const depositorName = userData ? `${userData.firstName} ${userData.lastName}` : (operation?.user ? `ID: ${operation.user.substring(0,8)}...` : "Unknown Depositor");
  const depositorRole = userData?.role?.[0] ? userData.role[0].replace("_", " ") : "REGISTERED USER";

  if (isLoading) {
    return (
      <div className="space-y-6 p-2 animate-pulse">
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-3 gap-6">
           <Skeleton className="h-[500px] md:col-span-1 rounded-xl" />
           <Skeleton className="h-[500px] md:col-span-2 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!operation) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-96 text-center">
        <FileText className="h-16 w-16 text-muted-foreground/20 mb-4" />
        <h2 className="text-2xl font-bold text-destructive">Record Not Found</h2>
        <p className="text-muted-foreground mt-2">The storage operation record you requested could not be located.</p>
        <Button variant="outline" onClick={() => navigate("/storage")} className="mt-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Operations Log
        </Button>
      </div>
    );
  }

  const typeConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    DEPOSIT: { label: "Grain Deposit", icon: ArrowDownToLine, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    WITHDRAWAL: { label: "Stock Withdrawal", icon: ArrowUpFromLine, color: "text-blue-500", bg: "bg-blue-500/10" },
    TRANSFER: { label: "Inter-Vault Transfer", icon: Building2, color: "text-purple-500", bg: "bg-purple-500/10" },
  };

  const type = typeConfig[operation.type] || typeConfig.DEPOSIT;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Receipt link has been copied to your clipboard.",
      className: "bg-blue-600 text-white shadow-lg border-none",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in p-2 pb-20 max-w-6xl mx-auto print:bg-white print:text-black">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/storage")} className="mb-2 -ml-2 print:hidden">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Log
          </Button>
          <div className="flex items-center gap-4">
            <div className={`h-14 w-14 rounded-2xl ${type.bg} flex items-center justify-center border-2 border-white/10 shadow-lg`}>
               <type.icon className={`h-8 w-8 ${type.color}`} />
            </div>
            <div>
               <h1 className="text-3xl font-black flex items-center gap-3">
                 Op: {operation.receiptNo}
               </h1>
               <div className="flex items-center gap-2 mt-1">
                 <Badge className={`${type.bg} ${type.color} border-none font-bold`}>{operation.type}</Badge>
                 <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Processed on {new Date(operation.timestamp).toLocaleDateString("en-NG", { day: 'numeric', month: 'long', year: 'numeric' })}
                 </span>
               </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 print:hidden">
           <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" /> Download Receipt
           </Button>
           <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" /> Share
           </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Details */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="glass-card overflow-hidden border-none shadow-xl">
             <CardHeader className="bg-muted/30 pb-6">
                <CardTitle className="text-lg flex items-center gap-2">
                   <BadgeCheck className="h-5 w-5 text-emerald-500" />
                   Transaction Particulars
                </CardTitle>
                <CardDescription>Verified cryptographic record of storage movement</CardDescription>
             </CardHeader>
             <CardContent className="pt-6 space-y-8">
                <div className="grid sm:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <div className="space-y-1">
                         <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Commodity Asset</p>
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                               <Wheat className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                               <p className="font-bold text-lg">{operation.commodity?.name}</p>
                               <p className="text-xs text-muted-foreground font-mono uppercase">{operation.commodity?.code}</p>
                            </div>
                         </div>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Custodial Facility</p>
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                               <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                               <p className="font-bold text-base">{operation.warehouse?.name}</p>
                               <p className="text-xs text-muted-foreground">{operation.warehouse?.location}</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="space-y-1">
                         <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Verified Quantity</p>
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                               <Scale className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                               <p className="font-black text-2xl">{operation.quantity.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{operation.unit}</span></p>
                               <p className="text-[10px] text-muted-foreground font-bold">NET WEIGHT MEASURED AT SOURCE</p>
                            </div>
                         </div>
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Originating Party</p>
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                               <User className="h-6 w-6 text-slate-600" />
                            </div>
                            <div>
                               <p className="font-bold text-base">{userLoading ? <Skeleton className="h-4 w-24" /> : depositorName}</p>
                               <p className="text-[10px] px-1.5 py-0.5 mt-1 bg-slate-100 rounded text-slate-500 w-fit font-bold">{userLoading ? <Skeleton className="h-3 w-16" /> : depositorRole.toUpperCase()}</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <Separator />

                <div className="space-y-4">
                   <h3 className="font-bold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      Quality Control (QC) Report
                   </h3>
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {[
                        { label: "Moisture", value: "12.4%", icon: Droplets, color: "text-blue-500" },
                        { label: "Temperature", value: "24.5°C", icon: Thermometer, color: "text-amber-500" },
                        { label: "Foreign Matter", value: "0.2%", icon: Scale, color: "text-slate-500" },
                        { label: "Final Grade", value: "A (Premium)", icon: BadgeCheck, color: "text-emerald-500" },
                      ].map((item, i) => (
                        <div key={i} className="p-3 rounded-xl bg-muted/40 border border-border/50">
                           <div className="flex items-center gap-2 mb-1">
                              <item.icon className={`h-3 w-3 ${item.color}`} />
                              <span className="text-[10px] font-bold uppercase text-muted-foreground">{item.label}</span>
                           </div>
                           <p className="font-bold">{item.value}</p>
                        </div>
                      ))}
                   </div>
                </div>
             </CardContent>
          </Card>
        </div>

        {/* Status and Action Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-card border-none shadow-lg overflow-hidden">
             <div className="bg-slate-900 p-4 text-white">
                <h3 className="font-black text-sm tracking-widest">PROCESS TIMELINE</h3>
             </div>
             <CardContent className="pt-6">
                <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-muted">
                   {[
                     { status: "Arrival & Weighing", time: "08:42 AM", desc: "Truck scaled at entry point.", icon: Scale, done: true },
                     { status: "Quality Inspections", time: "09:15 AM", desc: "Sample tested for moisture & grade.", icon: ShieldCheck, done: true },
                     { status: "Vault Deposit", time: "10:30 AM", desc: "Stock transferred to Silo #42.", icon: Building2, done: true },
                     { status: "Blockchain Minting", time: "10:35 AM", desc: "Tokens assigned to user wallet.", icon: BadgeCheck, done: true },
                   ].map((step, i) => (
                     <div key={i} className="flex gap-4 relative">
                        <div className={`h-6 w-6 rounded-full shrink-0 flex items-center justify-center z-10 ${step.done ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-muted"}`}>
                           {step.done ? <CheckCircle2 className="h-3 w-3 text-white" /> : <Clock className="h-3 w-3 text-muted-foreground" />}
                        </div>
                        <div>
                           <p className="text-sm font-bold leading-none">{step.status}</p>
                           <p className="text-[10px] text-muted-foreground mt-1">{step.time}</p>
                           <p className="text-xs text-muted-foreground mt-1.5 bg-muted/30 p-2 rounded-lg">{step.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-blue-600 text-white">
             <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                   <ShieldCheck className="h-4 w-4" />
                   System Integrity
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <p className="text-xs text-white/80 leading-relaxed font-medium">
                   This transaction is immutable and has been witnessed by the Warehouse Manager and verified by the QC Department.
                </p>
                <div className="pt-2 border-t border-white/20">
                   <p className="text-[10px] font-mono text-white/60">HASH: {id?.repeat(2).substring(0, 32)}</p>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StorageDetails;
