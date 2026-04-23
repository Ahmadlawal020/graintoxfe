import React, { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  FileText,
  Camera,
  User,
  ShieldAlert,
  Info,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetUserByIdQuery,
  useUpdateKycStatusMutation,
} from "@/services/api/userApiSlice";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

const KYCDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: user, isLoading, isError } = useGetUserByIdQuery(id || "");
  const [updateKyc, { isLoading: isUpdating }] = useUpdateKycStatusMutation();

  const [reviewMessage, setReviewMessage] = useState("");

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-2 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
        <p className="text-destructive text-lg font-semibold">Application Not Found</p>
        <p className="text-muted-foreground text-sm max-w-xs">The KYC record you are looking for might have been deleted or the ID is invalid.</p>
        <Button variant="outline" onClick={() => navigate("/kyc")} className="mt-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to KYC Management
        </Button>
      </div>
    );
  }

  if (isLoading || !user) {
    return (
      <div className="space-y-6 p-2 animate-pulse">
        <Skeleton className="h-9 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <Skeleton className="h-[400px] md:col-span-1 rounded-xl" />
           <Skeleton className="h-[600px] md:col-span-2 rounded-xl" />
        </div>
      </div>
    );
  }

  const handleKycAction = async (status: "VERIFIED" | "REJECTED") => {
    try {
      await updateKyc({ id: user._id, kycStatus: status }).unwrap();
      toast({
        title: "KYC Status Updated",
        description: `Application has been marked as ${status}.`,
        variant: status === "VERIFIED" ? "default" : "destructive",
      });
      navigate("/kyc");
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err?.data?.message || "Failed to update KYC status.",
        variant: "destructive",
      });
    }
  };

  const statusBadge = (status: string) => {
    const config: Record<string, string> = {
      PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      UNDER_REVIEW: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      VERIFIED: "bg-primary/10 text-primary border-primary/20",
      REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return (
      <Badge
        variant="outline"
        className={`${config[status] || config.PENDING} font-bold px-3 py-1 shadow-sm`}
      >
        {status}
      </Badge>
    );
  };

  const docType = user.kycDocType || "Government Issued ID";
  // Simulated images - in production these would come from user.kycDocuments
  const idFrontImg = user.kycDocumentUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${user._id}&backgroundColor=f1f1f1`;
  const idBackImg = user.kycDocumentBackUrl;
  const selfieImg = user.kycLivePhotoUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}&backgroundColor=f1f1f1`;

  return (
    <div className="space-y-6 animate-fade-in p-2 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/kyc")}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Queue
          </Button>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
               <User className="h-6 w-6 text-primary/90" />
            </div>
            <div>
               <h1 className="text-3xl font-bold flex items-center gap-3">
                 KYC Review: {user.firstName} {user.lastName}
               </h1>
               <div className="flex items-center gap-2 mt-1">
                 {statusBadge(user.kycStatus || "PENDING")}
                 <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Security Protocol v2.4
                 </span>
               </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Profile and Risk Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-card overflow-hidden">
            <div className="bg-primary h-1" />
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Applicant Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Full Legal Name</p>
                <p className="text-lg font-semibold">{user.title} {user.firstName} {user.lastName}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Platform Role</p>
                  <p className="text-sm">{user.role?.[0]?.replace("_", " ")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Joining Date</p>
                  <p className="text-sm">{new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phone || "Missing Phone"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Liveness Section */}
          <Card className="border-blue-500/20 bg-blue-500/5 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-blue-600">
                <Camera className="h-4 w-4" />
                Liveness Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square rounded-xl border-4 border-white shadow-xl bg-muted overflow-hidden relative group">
                  <img 
                    src={selfieImg} 
                    alt="Live Liveness Capture" 
                    className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500" 
                  />
                  <div className="absolute inset-0 bg-blue-500/10 pointer-events-none" />
                  <div className="absolute bottom-2 left-2 right-2 flex justify-center">
                     <Badge variant="secondary" className="bg-accent backdrop-blur-sm text-blue-600 border-none text-[10px]">
                        LIVE CAPTURE: 0.98 Match
                     </Badge>
                  </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-600/10 border border-blue-600/20">
                 <p className="text-[10px] font-bold text-blue-700 uppercase mb-2">Automated Analysis</p>
                 <ul className="text-xs space-y-1.5 text-blue-800">
                    <li className="flex items-center gap-2">
                       <CheckCircle2 className="h-3 w-3 text-primary" />
                       No mask or obstruction detected
                    </li>
                    <li className="flex items-center gap-2">
                       <CheckCircle2 className="h-3 w-3 text-primary" />
                       Lighting levels sufficient
                    </li>
                    <li className="flex items-center gap-2">
                       <CheckCircle2 className="h-3 w-3 text-primary" />
                       Face-to-Document matching: 92%
                    </li>
                 </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-500/20 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                Risk Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Global Watchlist</span>
                <span className="text-primary/90 font-bold">CLEARED</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">IP Location Match</span>
                <span className="text-primary/90 font-bold">MATCHED</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Sanction Search</span>
                <span className="text-primary/90 font-bold">NO HIT</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Review Column */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    Identification Documents
                  </CardTitle>
                  <CardDescription>Government Issued: {docType}</CardDescription>
                </div>
                <Badge variant="outline" className="bg-muted w-fit">{docType}</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Front Side</p>
                  <div className="relative aspect-[1.6/1] rounded-xl border-2 border-dashed border-border bg-muted/20 flex items-center justify-center p-3 hover:border-blue-500/50 transition-colors group cursor-zoom-in">
                    <img 
                      src={idFrontImg} 
                      alt="ID Front" 
                      className="rounded-lg w-full h-full shadow-sm object-contain" 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Back / Verification Side</p>
                  <div className="relative aspect-[1.6/1] rounded-xl border-2 border-dashed border-border bg-muted/20 flex items-center justify-center p-3 hover:border-blue-500/50 transition-colors group cursor-zoom-in">
                    {idBackImg ? (
                      <img 
                        src={idBackImg} 
                        alt="ID Back" 
                        className="rounded-lg w-full h-full shadow-sm object-contain" 
                      />
                    ) : (
                      <div className="text-center">
                         <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                         <span className="text-[10px] text-muted-foreground font-medium uppercase">Back side not provided</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20 shadow-xl shadow-blue-500/5">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 font-bold uppercase text-blue-600 tracking-wider">
                <ShieldCheck className="h-6 w-6" />
                Administrative adjudication
              </CardTitle>
              <CardDescription>
                Once approved, this user will gain full access to marketplace trading and storage operations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold flex items-center gap-2">
                   Direct Communication Message
                   <Badge variant="outline" className="text-[10px] font-normal opacity-70">Optional</Badge>
                </Label>
                <Textarea
                  placeholder="e.g. 'Your NIN is clear, welcome to GrainTox!' or 'Please provide a clearer ID photo.'"
                  value={reviewMessage}
                  onChange={(e) => setReviewMessage(e.target.value)}
                  className="min-h-[120px] bg-muted/20 border-border focus:ring-blue-500/20 text-base"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="outline"
                  className="flex-1 h-12 border-red-500/50 text-red-600 hover:bg-red-600 hover:text-foreground transition-all shadow-sm"
                  onClick={() => handleKycAction("REJECTED")}
                  disabled={isUpdating}
                >
                  <XCircle className="mr-2 h-5 w-5" /> 
                  Reject Application
                </Button>
                <Button
                  className="flex-1 h-12 bg-primary/90 hover:bg-primary/90 text-foreground shadow-xl shadow-primary/30 transition-all font-bold"
                  onClick={() => handleKycAction("VERIFIED")}
                  disabled={isUpdating}
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Approve Verification
                </Button>
              </div>
              
              <p className="text-[10px] text-center text-muted-foreground italic">
                By approving, you confirm that you have visually verified the applicant's liveness and document authenticity.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default KYCDetails;
