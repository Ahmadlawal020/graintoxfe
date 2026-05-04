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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

const StorageDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: operations = [], isLoading } = useGetStorageOperationsQuery(undefined);
  const operation = operations.find((op: any) => op._id === id);

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 md:p-8 animate-pulse max-w-5xl mx-auto">
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
        <Button variant="outline" onClick={() => navigate("/user/storage")} className="mt-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Storage
        </Button>
      </div>
    );
  }

  const typeConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
    DEPOSIT: { label: "Grain Deposit", icon: ArrowDownToLine, color: "text-primary", bg: "bg-primary/10" },
    WITHDRAWAL: { label: "Stock Withdrawal", icon: ArrowUpFromLine, color: "text-blue-500", bg: "bg-blue-500/10" },
    TRANSFER: { label: "Inter-Vault Transfer", icon: Building2, color: "text-purple-500", bg: "bg-purple-500/10" },
  };

  const type = typeConfig[operation.type] || typeConfig.DEPOSIT;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Receipt link has been copied to your clipboard.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-8 pb-20 max-w-5xl mx-auto print:p-0">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/user/storage")} className="mb-2 -ml-2 print:hidden text-xs">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to History
          </Button>
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 sm:h-14 sm:w-14 rounded-2xl ${type.bg} flex items-center justify-center border-2 border-border shadow-lg`}>
               <type.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${type.color}`} />
            </div>
            <div>
               <h1 className="text-xl sm:text-3xl font-black tracking-tight">
                 Receipt #{operation.receiptNo}
               </h1>
               <div className="flex items-center gap-2 mt-1">
                 <Badge className={`${type.bg} ${type.color} border-none font-black text-[10px] uppercase tracking-widest`}>{operation.type}</Badge>
                 <span className="text-[10px] sm:text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {new Date(operation.timestamp).toLocaleDateString("en-NG", { day: 'numeric', month: 'long', year: 'numeric' })}
                 </span>
               </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2 print:hidden w-full sm:w-auto">
           <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-10 font-bold" onClick={() => window.print()}>
              <Download className="h-4 w-4 mr-2" /> Receipt
           </Button>
           <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-10 font-bold" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" /> Share
           </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main Details */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-none shadow-xl overflow-hidden bg-card">
             <CardHeader className="bg-muted/30 pb-6 border-b">
                <CardTitle className="text-sm sm:text-lg font-black uppercase tracking-widest flex items-center gap-2 text-primary/80">
                   <BadgeCheck className="h-5 w-5" />
                   Transaction Details
                </CardTitle>
                <CardDescription className="text-xs">Certified cryptographic record of asset movement.</CardDescription>
             </CardHeader>
             <CardContent className="pt-8 space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <div className="space-y-2">
                         <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Commodity Asset</p>
                         <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                               <Wheat className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                               <p className="font-black text-lg leading-tight">{operation.commodity?.name}</p>
                               <p className="text-[10px] font-mono text-muted-foreground uppercase">{operation.commodity?.code}</p>
                            </div>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Storage Facility</p>
                         <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                               <Building2 className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                               <p className="font-bold text-base leading-tight">{operation.warehouse?.name}</p>
                               <p className="text-xs text-muted-foreground">{operation.warehouse?.location}</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <div className="space-y-2">
                         <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Net Quantity</p>
                         <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                               <Scale className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                               <p className="font-black text-2xl leading-tight">{operation.quantity.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{operation.unit}</span></p>
                               <p className="text-[9px] text-muted-foreground font-black tracking-widest">VERIFIED AT WAREHOUSE</p>
                            </div>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">QC Result</p>
                         <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${operation.qcStatus === 'PASSED' ? 'bg-primary/10 border-primary/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                               {operation.qcStatus === 'PASSED' ? <ShieldCheck className="h-6 w-6 text-primary" /> : <Clock className="h-6 w-6 text-amber-500" />}
                            </div>
                            <div>
                               <p className={`font-black text-base leading-tight ${operation.qcStatus === 'PASSED' ? 'text-primary' : 'text-amber-600'}`}>{operation.qcStatus || 'PENDING'}</p>
                               <p className="text-[10px] text-muted-foreground font-medium italic">"{operation.qcRemarks || 'No remarks provided'}"</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                {operation.qcStatus === 'PASSED' && (
                  <>
                    <Separator className="opacity-50" />
                    <div className="space-y-4">
                       <h3 className="font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 text-muted-foreground">
                          <Scale className="h-4 w-4" />
                          Quality Metrics
                       </h3>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {[
                            { label: "Moisture", value: operation.moisture ? `${operation.moisture}%` : "12.4%", icon: Droplets, color: "text-blue-500" },
                            { label: "Foreign Matter", value: operation.foreignMatter ? `${operation.foreignMatter}%` : "0.2%", icon: Scale, color: "text-slate-500" },
                            { label: "Pest Damage", value: operation.pestDamage ? `${operation.pestDamage}%` : "0.0%", icon: ShieldCheck, color: "text-primary" },
                            { label: "Final Grade", value: "Grade A", icon: BadgeCheck, color: "text-primary" },
                          ].map((item, i) => (
                            <div key={i} className="p-3 rounded-xl bg-muted/30 border border-border/50">
                               <div className="flex items-center gap-2 mb-1">
                                  <item.icon className={`h-3 w-3 ${item.color}`} />
                                  <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{item.label}</span>
                               </div>
                               <p className="font-bold text-sm">{item.value}</p>
                            </div>
                          ))}
                       </div>
                    </div>
                  </>
                )}
             </CardContent>
          </Card>
        </div>

        {/* Status Timeline Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-xl overflow-hidden bg-slate-900 text-white">
             <div className="p-5 border-b border-white/10">
                <h3 className="font-black text-xs tracking-widest uppercase text-white/60">Asset Journey</h3>
             </div>
             <CardContent className="pt-6">
                <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-white/10">
                   {[
                     { status: "Request Submitted", time: new Date(operation.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), desc: "Initial request received by system.", icon: Clock, done: true },
                     { status: "Manager Review", time: "Pending", desc: "Awaiting facility manager confirmation.", icon: User, done: operation.status !== 'PENDING' },
                     { status: "Quality Check", time: "Pending", desc: "Inspection of commodity quality.", icon: ShieldCheck, done: operation.qcStatus === 'PASSED' },
                     { status: "Final Settlement", time: "Pending", desc: "Digital balance adjustment.", icon: BadgeCheck, done: operation.status === 'APPROVED' || operation.qcStatus === 'PASSED' },
                   ].map((step, i) => (
                     <div key={i} className="flex gap-4 relative">
                        <div className={`h-6 w-6 rounded-full shrink-0 flex items-center justify-center z-10 ${step.done ? "bg-primary shadow-lg shadow-primary/20" : "bg-white/10"}`}>
                           {step.done ? <CheckCircle2 className="h-3 w-3 text-slate-900" /> : <Clock className="h-3 w-3 text-white/40" />}
                        </div>
                        <div>
                           <p className={`text-xs font-black ${step.done ? "text-white" : "text-white/40"}`}>{step.status}</p>
                           <p className="text-[9px] text-white/40 mt-0.5">{step.time}</p>
                           {step.done && <p className="text-[10px] text-white/60 mt-2 bg-white/5 p-2 rounded-lg border border-white/10">{step.desc}</p>}
                        </div>
                     </div>
                   ))}
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StorageDetails;
