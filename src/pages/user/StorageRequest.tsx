import React, { useState } from "react";
import { Package, ArrowLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useCreateStorageOperationMutation } from "@/services/api/storageApiSlice";
import { useGetCropsQuery } from "@/services/api/cropApiSlice";
import { useGetWarehousesQuery } from "@/services/api/warehouseApiSlice";
import { useGetUserByIdQuery } from "@/services/api/userApiSlice";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useAuth from "@/hooks/useAuth";

const StorageRequest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id } = useAuth();

  const { data: crops = [] } = useGetCropsQuery(undefined, { pollingInterval: 60000 });
  const { data: warehouses = [] } = useGetWarehousesQuery(undefined, { pollingInterval: 60000 });
  const { data: userData } = useGetUserByIdQuery(id || "");
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
      navigate("/user/storage");
    } catch (error: any) {
      toast({ title: "Error", description: error?.data?.message || "Failed to submit request", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-8 max-w-2xl mx-auto">
      <header>
        <Button variant="ghost" size="sm" onClick={() => navigate("/user/storage")} className="mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Storage
        </Button>
        <h1 className="text-3xl font-black tracking-tighter">
          New <span className="text-primary">Request</span>
        </h1>
        <p className="text-muted-foreground text-sm font-medium">Submit a new deposit or withdrawal request for your agricultural assets.</p>
      </header>

      <Card className="border-none shadow-2xl overflow-hidden bg-card">
        <CardHeader className="bg-primary/90 text-white p-6">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Package className="w-5 h-5" /> {formData.type === "DEPOSIT" ? "Request Storage Space" : "Request Crop Withdrawal"}
          </CardTitle>
          <CardDescription className="text-white/80">
            {formData.type === "DEPOSIT" 
              ? "Fill in the details of the commodities you wish to deposit." 
              : "Submit a request to withdraw your stored crops from the warehouse."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-background">
            <Tabs 
              defaultValue="DEPOSIT" 
              className="w-full"
              onValueChange={(v) => setFormData({...formData, type: v})}
            >
              <TabsList className="grid w-full grid-cols-2 h-12 bg-muted/50 p-1 rounded-xl">
                <TabsTrigger value="DEPOSIT" className="text-xs font-black uppercase tracking-widest rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Deposit</TabsTrigger>
                <TabsTrigger value="WITHDRAWAL" className="text-xs font-black uppercase tracking-widest rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Withdrawal</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Commodity Type</Label>
                <Select onValueChange={(v) => setFormData({...formData, commodity: v})}>
                  <SelectTrigger className="h-12 bg-muted/30 border-none font-bold text-sm focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder={formData.type === "DEPOSIT" ? "Select crop" : "Select from holdings"} />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.type === "DEPOSIT" ? (
                      crops.map((crop: any) => (
                        <SelectItem key={crop._id} value={crop._id}>{crop.name}</SelectItem>
                      ))
                    ) : (
                      userData?.holdings?.map((h: any) => (
                        <SelectItem key={h.crop} value={h.crop}>{h.tokenSymbol} ({h.amount} kg available)</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Quantity (kg)</Label>
                <Input 
                  type="number" 
                  placeholder="e.g. 50" 
                  value={formData.quantity} 
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="h-12 bg-muted/30 border-none font-bold text-lg focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Target Warehouse</Label>
                <Select onValueChange={(v) => setFormData({...formData, warehouse: v})}>
                  <SelectTrigger className="h-12 bg-muted/30 border-none font-bold text-sm focus:ring-2 focus:ring-primary/20">
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
                <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Delivery Method</Label>
                <Select onValueChange={(v) => setFormData({...formData, deliveryMethod: v})}>
                  <SelectTrigger className="h-12 bg-muted/30 border-none font-bold text-sm focus:ring-2 focus:ring-primary/20">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.type === "DEPOSIT" ? (
                      <>
                        <SelectItem value="DROP_OFF">Drop-off (I'll bring it)</SelectItem>
                        <SelectItem value="PICK_UP">Request Pickup</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="SELF_COLLECT">Self-Collection</SelectItem>
                        <SelectItem value="DELIVERY">Request Delivery</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-wider text-muted-foreground">Additional Notes (Optional)</Label>
              <Input 
                placeholder="e.g. Crop variety, moisture level..." 
                value={formData.notes} 
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="h-12 bg-muted/30 border-none font-bold text-sm focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full h-14 bg-primary hover:bg-primary/90 !text-white text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorageRequest;
