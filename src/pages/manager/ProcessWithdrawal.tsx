import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Search, 
  Wheat, 
  User, 
  Weight, 
  Package, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Building2,
  ChevronRight,
  ArrowUpFromLine
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import useAuth from "@/hooks/useAuth";
import { useGetCropsQuery } from "@/services/api/cropApiSlice";
import { useGetPlatformUsersQuery, useGetUserByIdQuery } from "@/services/api/userApiSlice";
import { useCreateStorageOperationMutation } from "@/services/api/storageApiSlice";
import { useGetWarehousesQuery } from "@/services/api/warehouseApiSlice";

const ProcessWithdrawal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id: currentUserId } = useAuth();
  
  const { data: crops, isLoading: loadingCrops } = useGetCropsQuery({});
  const { data: users, isLoading: loadingUsers } = useGetPlatformUsersQuery({});
  const { data: allWarehouseData, isLoading: loadingWarehouses } = useGetWarehousesQuery(undefined);
  const { data: userProfile, isLoading: loadingProfile } = useGetUserByIdQuery(currentUserId, { skip: !currentUserId });
  const [createStorageOperation, { isLoading: isSubmitting }] = useCreateStorageOperationMutation();

  const allWarehouses = Array.isArray(allWarehouseData) ? allWarehouseData : [];

  const myWarehouses = useMemo(() => {
    const assigned = Array.isArray(userProfile?.assignedWarehouse) 
      ? userProfile.assignedWarehouse 
      : (userProfile?.assignedWarehouse ? [userProfile.assignedWarehouse] : []);
      
    return allWarehouses.filter((wh: any) => {
      const matchProfile = assigned.includes(wh.name) || assigned.includes(wh._id);
      const matchManagerId = wh.managerId === currentUserId || wh.managerId?._id === currentUserId;
      return matchProfile || matchManagerId;
    });
  }, [allWarehouses, userProfile, currentUserId]);

  const [selectedCrop, setSelectedCrop] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  const [cropSearch, setCropSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [formData, setFormData] = useState({
    bags: "",
    weight: "",
    notes: ""
  });

  useEffect(() => {
    if (myWarehouses.length === 1 && !selectedWarehouseId) {
      setSelectedWarehouseId(myWarehouses[0]._id);
    }
  }, [myWarehouses, selectedWarehouseId]);

  const filteredCrops = crops?.filter((c: any) => 
    c.name.toLowerCase().includes(cropSearch.toLowerCase()) || 
    c.code.toLowerCase().includes(cropSearch.toLowerCase())
  );

  const filteredUsers = users?.filter((u: any) => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCrop || !selectedUser || !formData.bags || !formData.weight || !selectedWarehouseId) {
      toast({
        title: "Missing Information",
        description: "Please ensure all required fields are filled.",
        variant: "destructive"
      });
      return;
    }

    try {
      const receiptNo = `WD-${Date.now().toString().slice(-6)}`;
      await createStorageOperation({
        type: "WITHDRAWAL",
        commodity: selectedCrop._id,
        user: selectedUser._id,
        agent: currentUserId,
        warehouse: selectedWarehouseId,
        quantity: Number(formData.weight),
        bags: Number(formData.bags),
        qcStatus: "PASSED", // Withdrawals don't need QC to pass like deposits do logically
        receiptNo: receiptNo,
        notes: formData.notes
      }).unwrap();

      toast({
        title: "Withdrawal Processed",
        description: `Successfully reduced inventory by ${formData.weight} MT. Dispatch Receipt: ${receiptNo}`,
        className: "bg-blue-600 text-white border-none shadow-lg shadow-blue-500/20"
      });
      navigate("/manager/stock");
    } catch (error: any) {
      toast({
        title: "Failed to Process Withdrawal",
        description: error?.data?.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in p-2 pb-10 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/manager/stock")} 
            className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Stock Inventory
          </Button>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Process Withdrawal</h1>
          <p className="text-muted-foreground font-medium">Log an outbound commodity dispatch from the facility</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
          <Badge className="bg-blue-500 hover:bg-blue-600">Dispatch Session</Badge>
          <span className="text-xs font-mono text-blue-600 font-bold uppercase tracking-widest">WH-DISPATCH-2026</span>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          <Card className="glass-card overflow-hidden border-none shadow-xl">
             <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                   <Building2 className="h-5 w-5 text-blue-500" />
                   Storage Facility
                </CardTitle>
             </CardHeader>
             <CardContent>
                <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId} required>
                   <SelectTrigger className="h-12 bg-muted/30 border-none font-bold">
                      <SelectValue placeholder="Select Warehouse Site..." />
                   </SelectTrigger>
                   <SelectContent>
                      {myWarehouses.map((wh: any) => (
                         <SelectItem key={wh._id} value={wh._id}>{wh.name} (Current Cap: {wh.capacity - wh.availableCapacity} MT used)</SelectItem>
                      ))}
                   </SelectContent>
                </Select>
             </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="glass-card overflow-hidden border-none shadow-xl">
              <div className="h-1.5 bg-emerald-500" />
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wheat className="h-5 w-5 text-emerald-500" /> Commodity
                </CardTitle>
                <div className="relative mt-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search crops..." 
                    className="pl-9 bg-muted/50 border-none h-10"
                    value={cropSearch} onChange={(e) => setCropSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="px-0">
                <ScrollArea className="h-[240px] px-4">
                  <div className="space-y-2 pb-4">
                    {loadingCrops ? <div className="p-4 text-center">Loading...</div> : 
                      filteredCrops?.map((crop: any) => (
                        <div 
                          key={crop._id} onClick={() => setSelectedCrop(crop)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                            selectedCrop?._id === crop._id ? "bg-emerald-500/10 border-emerald-500" : "bg-background hover:bg-muted"
                          }`}
                        >
                          <div className="font-bold text-sm">{crop.name}</div>
                          {selectedCrop?._id === crop._id && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                        </div>
                      ))
                    }
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="glass-card overflow-hidden border-none shadow-xl">
              <div className="h-1.5 bg-blue-500" />
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-500" /> Account Holder
                </CardTitle>
                <div className="relative mt-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search users..." 
                    className="pl-9 bg-muted/50 border-none h-10"
                    value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="px-0">
                <ScrollArea className="h-[240px] px-4">
                  <div className="space-y-2 pb-4">
                    {loadingUsers ? <div className="p-4 text-center">Loading...</div> : 
                      filteredUsers?.map((u: any) => (
                        <div 
                          key={u._id} onClick={() => setSelectedUser(u)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer ${
                            selectedUser?._id === u._id ? "bg-blue-500/10 border-blue-500" : "bg-background hover:bg-muted"
                          }`}
                        >
                          <div className="font-bold text-sm">{u.firstName} {u.lastName}</div>
                          {selectedUser?._id === u._id && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                        </div>
                      ))
                    }
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-none shadow-2xl p-6">
             <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 flex items-center justify-center bg-blue-500/10 rounded-xl">
                   <ArrowUpFromLine className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Dispatch Specifications</h3>
             </div>
             
             <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                   <Label className="text-xs font-black uppercase text-muted-foreground">Quantity (Total Bags)</Label>
                   <Input name="bags" type="number" placeholder="e.g. 50" className="h-12 bg-muted/30 border-none font-bold" value={formData.bags} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                   <Label className="text-xs font-black uppercase text-muted-foreground">Total Weight (MT)</Label>
                   <Input name="weight" type="number" step="0.01" placeholder="e.g. 2.50" className="h-12 bg-muted/30 border-none font-bold" value={formData.weight} onChange={handleInputChange} required />
                </div>
                <div className="md:col-span-2 space-y-2">
                   <Label className="text-xs font-black uppercase text-muted-foreground">Dispatch Notes</Label>
                   <textarea name="notes" rows={2} className="w-full bg-muted/30 border-none rounded-xl p-4 text-sm font-medium" placeholder="Truck plate number, destination..." value={formData.notes} onChange={handleInputChange} />
                </div>
             </div>
          </Card>
        </div>

        <div className="space-y-8">
           <Card className="glass-card border-none shadow-2xl overflow-hidden sticky top-24">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
              <CardHeader>
                 <CardTitle className="text-lg">Dispatch Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                 {selectedCrop && selectedUser ? (
                    <div className="space-y-4">
                       <div className="p-4 rounded-2xl bg-muted/30 space-y-3 font-medium">
                          <div className="flex justify-between text-xs"><span>Account</span><span className="font-bold">{selectedUser.firstName} {selectedUser.lastName}</span></div>
                          <div className="flex justify-between text-xs"><span>Commodity</span><span className="font-bold">{selectedCrop.name}</span></div>
                          <div className="flex justify-between text-xs pt-2 border-t"><span>Deduction Volume</span><span className="font-black">{formData.weight || 0} MT</span></div>
                       </div>
                       
                       <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-black text-lg">
                          {isSubmitting ? "Processing..." : "Authorize Dispatch"}
                       </Button>
                    </div>
                 ) : (
                    <div className="py-8 text-center"><p className="text-sm text-muted-foreground">Select commodity and account to continue.</p></div>
                 )}
              </CardContent>
           </Card>
        </div>
      </form>
    </div>
  );
};

export default ProcessWithdrawal;
