import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, 
  Save, 
  Wheat, 
  Coins, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  AlertTriangle,
  Info,
  ChevronDown,
  LayoutDashboard
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  useGetCropByIdQuery, 
  useUpdateCropMutation 
} from "@/services/api/cropApiSlice";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const EditCrop = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: crop, isLoading: isFetching, isError } = useGetCropByIdQuery(id || "");
  const [updateCrop, { isLoading }] = useUpdateCropMutation();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category: "Cereal",
    pricePerUnit: "",
    tokenSymbol: "",
    quality: "Grade A",
    status: "Active"
  });

  useEffect(() => {
    if (crop) {
      setFormData({
        name: crop.name || "",
        code: crop.code || "",
        category: crop.category || "Cereal",
        pricePerUnit: crop.pricePerUnit?.toString() || "",
        tokenSymbol: crop.tokenSymbol || "",
        quality: crop.quality || "Grade A",
        status: crop.status || "Active"
      });
    }
  }, [crop]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCrop({
        id,
        ...formData,
        pricePerUnit: Number(formData.pricePerUnit)
      }).unwrap();
      
      toast({ 
        title: "Market Price Updated", 
        description: `Changes to ${formData.name} are now live across the platform.`,
        className: "bg-emerald-600 text-white border-none shadow-lg"
      });
      navigate(`/crops/${id}`);
    } catch (error: any) {
      toast({ 
        title: "Update Failed", 
        description: error?.data?.message || "Failed to update market asset.", 
        variant: "destructive" 
      });
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-64 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-destructive font-bold text-xl">Asset Configuration Error</p>
        <p className="text-muted-foreground mt-2">Could not retrieve market data for this commodity.</p>
        <Button onClick={() => navigate("/crops")} className="mt-4" variant="outline">
           <ArrowLeft className="mr-2 h-4 w-4" /> Back to Market
        </Button>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="space-y-6 p-2 animate-pulse max-w-5xl mx-auto">
        <Skeleton className="h-10 w-64" />
        <div className="grid md:grid-cols-2 gap-6">
           <Skeleton className="h-[400px] w-full rounded-2xl" />
           <Skeleton className="h-[400px] w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const priceFormatted = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(Number(formData.pricePerUnit));

  return (
    <div className="space-y-8 animate-fade-in p-2 pb-20 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/crops/${id}`)} className="mb-2 -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Asset Summary
          </Button>
          <div className="flex items-center gap-4">
             <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center border-2 border-emerald-500/10">
                <Wheat className="h-8 w-8 text-emerald-600" />
             </div>
             <div>
                <h1 className="text-3xl font-black text-foreground">Market Controller</h1>
                <p className="text-muted-foreground font-medium">{formData.name} ({formData.code})</p>
             </div>
          </div>
        </div>
        <div className="flex gap-3">
           <Badge variant="outline" className="bg-muted px-3 py-1.5 h-fit font-mono text-xs">
              ID: {id?.substring(0, 8)}...
           </Badge>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
         <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="glass-card overflow-hidden shadow-xl border-none">
                 <div className="h-1.5 bg-emerald-500" />
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <Activity className="h-5 w-5 text-emerald-500" />
                       Asset Specifications
                    </CardTitle>
                    <CardDescription>Fundamental characteristics of the listed commodity</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Display Name</Label>
                          <Input name="name" value={formData.name} onChange={handleChange} required className="h-11 bg-muted/30 border-none focus:ring-2 focus:ring-emerald-500/20 font-semibold" />
                       </div>
                       <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Asset Code</Label>
                          <Input name="code" value={formData.code} onChange={handleChange} required className="h-11 bg-muted/30 border-none focus:ring-2 focus:ring-emerald-500/20 font-mono" />
                       </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Asset Category</Label>
                          <Select value={formData.category} onValueChange={(v) => handleSelectChange("category", v)}>
                            <SelectTrigger className="h-11 bg-muted/30 border-none focus:ring-2 focus:ring-emerald-500/20">
                               <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["Cereal", "Legume", "Tuber", "Oilseed", "Cash Crop"].map(c => (
                                <SelectItem key={c} value={c}>{c}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                       </div>
                       <div className="space-y-2">
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quality Grade Tier</Label>
                          <Select value={formData.quality} onValueChange={(v) => handleSelectChange("quality", v)}>
                            <SelectTrigger className="h-11 bg-muted/30 border-none focus:ring-2 focus:ring-emerald-500/20">
                               <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Grade A">Grade A (Premium)</SelectItem>
                              <SelectItem value="Grade B">Grade B (Standard)</SelectItem>
                              <SelectItem value="Grade C">Grade C (Industrial)</SelectItem>
                            </SelectContent>
                          </Select>
                       </div>
                    </div>
                 </CardContent>
              </Card>

              <Card className="glass-card shadow-xl border-none bg-slate-900 text-white overflow-hidden">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                       <Coins className="h-5 w-5 text-emerald-400" />
                       Market Price Control
                    </CardTitle>
                    <CardDescription className="text-white/60">Manage live benchmark pricing and token indices</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <Label className="text-xs font-bold uppercase tracking-wider text-white/50">Current Market Price (₦ / MT)</Label>
                          <div className="relative">
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">₦</span>
                             <Input 
                                name="pricePerUnit" 
                                type="number" 
                                value={formData.pricePerUnit} 
                                onChange={handleChange} 
                                required 
                                className="h-14 pl-8 bg-white/5 border-white/10 text-2xl font-black focus:ring-emerald-400/50" 
                             />
                          </div>
                          <p className="text-[10px] text-white/40 italic flex items-center gap-1">
                             <Info className="h-3 w-3" />
                             Estimated Trade Value: {priceFormatted} per Metric Ton.
                          </p>
                       </div>
                       <div className="space-y-3">
                          <Label className="text-xs font-bold uppercase tracking-wider text-white/50">Token Symbol (GTX-SYNC)</Label>
                          <Input 
                            name="tokenSymbol" 
                            value={formData.tokenSymbol} 
                            onChange={handleChange} 
                            required 
                            className="h-14 uppercase bg-white/5 border-white/10 text-2xl font-mono font-bold focus:ring-emerald-400/50" 
                          />
                       </div>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-4">
                       <div className="h-10 w-10 shrink-0 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/20">
                          <AlertTriangle className="h-5 w-5 text-amber-400" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-amber-400">Market Transparency Notice</p>
                          <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
                             Altering the price will trigger an immediate recalculation of all User portfolio values and Tokenized Asset balances based on the new index.
                          </p>
                       </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-white/10">
                       <Button 
                         type="submit" 
                         disabled={isLoading} 
                         className="flex-1 h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg shadow-2xl shadow-emerald-500/30 group"
                       >
                         {isLoading ? "Synchronizing..." : "Update Live Global Price"}
                         <TrendingUp className="ml-2 h-5 w-5 group-hover:translate-y-[-2px] transition-transform" />
                       </Button>
                       <Button 
                         variant="ghost" 
                         type="button" 
                         onClick={() => navigate(`/crops/${id}`)}
                         className="h-14 px-8 border border-white/10 text-white/80 hover:bg-white/5"
                       >
                         Cancel
                       </Button>
                    </div>
                 </CardContent>
              </Card>
            </form>
         </div>

         {/* Sidebar Controls */}
         <div className="space-y-6">
            <Card className="glass-card shadow-sm border-none bg-muted/20">
               <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                     <ShieldCheck className="h-4 w-4 text-emerald-500" />
                     Market Visibility
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-background border shadow-sm">
                     <span className="text-sm font-medium">Trading Status</span>
                     <Badge className="bg-emerald-500">LIVE</Badge>
                  </div>
                  <div className="p-3 rounded-xl bg-background border shadow-sm space-y-2">
                     <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Pricing Model</p>
                     <p className="text-sm font-semibold flex items-center justify-between">
                        Administrative Manual
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                     </p>
                  </div>
                  <Separator />
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                     Governance rules state that benchmark price updates should not exceed 15% fluctuation within a 24-hour period unless volatility overrides are active.
                  </p>
               </CardContent>
            </Card>

            <Card className="glass-card shadow-sm border-none bg-blue-500/5">
                <CardHeader>
                   <CardTitle className="text-base flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4 text-blue-500" />
                      Utility Links
                   </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-2">
                   <Button variant="ghost" className="justify-start text-xs h-9 hover:bg-blue-500/10">
                      View Order Book
                   </Button>
                   <Button variant="ghost" className="justify-start text-xs h-9 hover:bg-blue-500/10">
                      Warehouse Registry
                   </Button>
                   <Button variant="ghost" className="justify-start text-xs h-9 hover:bg-blue-500/10">
                      KYC Requirements
                   </Button>
                </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
};

export default EditCrop;
