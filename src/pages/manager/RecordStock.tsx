import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Search, 
  Wheat, 
  User, 
  Weight, 
  Package, 
  MapPin, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Building2,
  ChevronRight
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

const RecordStock = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id: currentUserId } = useAuth();
  
  // API Queries & Mutations
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
      
    // Robust match: 
    // 1. Check if the string in 'assigned' matches either the warehouse name OR the warehouse _id
    // 2. ALSO check if the warehouse document itself explicitly lists this manager's ID
    return allWarehouses.filter((wh: any) => {
      const matchProfile = assigned.includes(wh.name) || assigned.includes(wh._id);
      const matchManagerId = wh.managerId === currentUserId || wh.managerId?._id === currentUserId;
      return matchProfile || matchManagerId;
    });
  }, [allWarehouses, userProfile, currentUserId]);

  // Form State
  const [selectedCrop, setSelectedCrop] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  const [cropSearch, setCropSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [formData, setFormData] = useState({
    bags: "",
    weight: "",
    section: "",
    quality: "Grade A",
    notes: ""
  });

  // Auto-select warehouse if there's only one assigned to the manager
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
        description: "Please ensure all required fields are filled, including warehouse, crop and depositor selection.",
        variant: "destructive"
      });
      return;
    }

    try {
      const receiptNo = `REC-${Date.now().toString().slice(-6)}`;
      await createStorageOperation({
        type: "DEPOSIT",
        commodity: selectedCrop._id,
        user: selectedUser._id,
        agent: currentUserId,
        warehouse: selectedWarehouseId,
        quantity: Number(formData.weight),
        bags: Number(formData.bags),
        section: formData.section,
        qcStatus: "PENDING",
        receiptNo: receiptNo,
        notes: formData.notes
      }).unwrap();

      toast({
        title: "Deposit Recorded Successfully",
        description: `Recorded ${formData.weight} kg of ${selectedCrop.name}. Receipt: ${receiptNo}`,
        className: "bg-primary/90 text-foreground border-none shadow-lg shadow-primary/20"
      });
      navigate("/manager/stock");
    } catch (error: any) {
      toast({
        title: "Failed to Record Deposit",
        description: error?.data?.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in p-2 pb-10 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="w-full sm:w-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/manager/stock")} 
            className="mb-1 -ml-2 text-muted-foreground hover:text-foreground h-8 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Stock
          </Button>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">Record New Stock</h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">Log a new commodity deposit</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-xl sm:rounded-2xl shrink-0">
          <Badge className="bg-primary hover:bg-primary/90 text-[10px] sm:text-xs">Active Session</Badge>
          <span className="text-[10px] sm:text-xs font-mono text-primary/90 font-bold uppercase tracking-widest">WH-DEPOSIT-2026</span>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Selection Column */}
        <div className="lg:col-span-2 space-y-8">
          
          <Card className="glass-card overflow-hidden border-none shadow-xl">
             <CardHeader className="pb-4">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                   <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                   Storage Facility
                </CardTitle>
                <CardDescription className="text-xs">Select the warehouse taking the deposit</CardDescription>
             </CardHeader>
             <CardContent>
                <Select value={selectedWarehouseId} onValueChange={setSelectedWarehouseId} required>
                   <SelectTrigger className="h-12 bg-muted/30 border-none font-bold focus:ring-purple-500/20">
                      <SelectValue placeholder="Select Warehouse Site..." />
                   </SelectTrigger>
                   <SelectContent>
                      {myWarehouses.map((wh: any) => (
                         <SelectItem key={wh._id} value={wh._id}>{wh.name} (Available: {wh.availableCapacity} kg)</SelectItem>
                      ))}
                   </SelectContent>
                </Select>
             </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Crop Selection */}
            <Card className="glass-card overflow-hidden border-none shadow-xl">
              <div className="h-1.5 bg-primary" />

              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Wheat className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Select Commodity
                </CardTitle>
                <CardDescription className="text-xs">Choose the crop type</CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search crops..." 
                    className="pl-9 bg-muted/50 border-none h-10"
                    value={cropSearch}
                    onChange={(e) => setCropSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="px-0">
                <ScrollArea className="h-[280px] px-4">
                  <div className="space-y-2 pb-4">
                    {loadingCrops ? (
                      [1, 2, 3].map(i => <div key={i} className="h-14 w-full bg-muted/40 animate-pulse rounded-xl" />)
                    ) : filteredCrops?.length === 0 ? (
                      <div className="py-10 text-center space-y-2">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground italic">No commodities found</p>
                      </div>
                    ) : (
                      filteredCrops?.map((crop: any) => (
                        <div 
                          key={crop._id}
                          onClick={() => setSelectedCrop(crop)}
                          className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                            selectedCrop?._id === crop._id 
                              ? "bg-primary/10 border-primary shadow-sm" 
                              : "bg-background border-transparent hover:border-primary/30 hover:bg-muted/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${selectedCrop?._id === crop._id ? 'bg-primary text-foreground' : 'bg-muted/50 group-hover:bg-primary/20'}`}>
                              <Wheat className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold">{crop.name}</p>
                              <p className="text-[10px] font-mono text-muted-foreground uppercase">{crop.code}</p>
                            </div>
                          </div>
                          {selectedCrop?._id === crop._id && <CheckCircle2 className="h-4 w-4 text-primary" />}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* User Selection */}
            <Card className="glass-card overflow-hidden border-none shadow-xl">
              <div className="h-1.5 bg-blue-500" />
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                  Select Depositor
                </CardTitle>
                <CardDescription className="text-xs">Assign stock ownership</CardDescription>
                <div className="relative mt-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search users..." 
                    className="pl-9 bg-muted/50 border-none h-10"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="px-0">
                <ScrollArea className="h-[280px] px-4">
                  <div className="space-y-2 pb-4">
                    {loadingUsers ? (
                      [1, 2, 3].map(i => <div key={i} className="h-14 w-full bg-muted/40 animate-pulse rounded-xl" />)
                    ) : filteredUsers?.length === 0 ? (
                      <div className="py-10 text-center space-y-2">
                        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground italic">No users found</p>
                      </div>
                    ) : (
                      filteredUsers?.map((u: any) => (
                        <div 
                          key={u._id}
                          onClick={() => setSelectedUser(u)}
                          className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                            selectedUser?._id === u._id 
                              ? "bg-blue-500/10 border-blue-500 shadow-sm" 
                              : "bg-background border-transparent hover:border-blue-500/30 hover:bg-muted/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border">
                              <AvatarImage src={u.avatar} />
                              <AvatarFallback className="bg-blue-50 text-[10px] text-blue-600 font-bold">
                                {u.firstName[0]}{u.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="overflow-hidden">
                              <p className="text-sm font-bold truncate">{u.firstName} {u.lastName}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                            </div>
                          </div>
                          {selectedUser?._id === u._id && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Details Section */}
          <Card className="glass-card border-none shadow-2xl p-6">
             <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 flex items-center justify-center bg-purple-500/10 rounded-xl">
                   <Package className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Stock Specifications</h3>
             </div>
             
             <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                   <Label className="text-xs font-black uppercase tracking-tighter text-muted-foreground">Quantity (Total Bags)</Label>
                   <div className="relative">
                      <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        name="bags"
                        type="number" 
                        placeholder="e.g. 1000" 
                        className="pl-10 h-12 bg-muted/30 border-none font-bold"
                        value={formData.bags}
                        onChange={handleInputChange}
                        required
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <Label className="text-xs font-black uppercase tracking-tighter text-muted-foreground">Total Weight (kg)</Label>
                   <div className="relative">
                      <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        name="weight"
                        type="number" 
                        step="0.01"
                        placeholder="e.g. 50.00" 
                        className="pl-10 h-12 bg-muted/30 border-none font-bold"
                        value={formData.weight}
                        onChange={handleInputChange}
                        required
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <Label className="text-xs font-black uppercase tracking-tighter text-muted-foreground">Warehouse Section</Label>
                   <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        name="section"
                        placeholder="e.g. Section A, Silo 4" 
                        className="pl-10 h-12 bg-muted/30 border-none font-bold"
                        value={formData.section}
                        onChange={handleInputChange}
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <Label className="text-xs font-black uppercase tracking-tighter text-muted-foreground">Quality Grade (Reported)</Label>
                   <Select value={formData.quality} onValueChange={(v) => setFormData(p => ({ ...p, quality: v }))}>
                      <SelectTrigger className="h-12 bg-muted/30 border-none font-bold">
                         <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                         <SelectItem value="Grade A">Grade A (Premium)</SelectItem>
                         <SelectItem value="Grade B">Grade B (Standard)</SelectItem>
                         <SelectItem value="Grade C">Grade C (Industrial)</SelectItem>
                         <SelectItem value="Pending QC">Pending Inspection</SelectItem>
                      </SelectContent>
                   </Select>
                </div>

                <div className="md:col-span-2 space-y-2">
                   <Label className="text-xs font-black uppercase tracking-tighter text-muted-foreground">Administrative Notes</Label>
                   <textarea 
                     name="notes"
                     rows={3}
                     className="w-full bg-muted/30 border-none rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20"
                     placeholder="Additional information about this deposit..."
                     value={formData.notes}
                     onChange={handleInputChange}
                   />
                </div>
             </div>
          </Card>
        </div>

        {/* Summary & Submit Column */}
        <div className="space-y-8">
           <Card className="glass-card border-none shadow-2xl overflow-hidden sticky top-24">
              <div className="h-1 bg-gradient-to-r from-primary to-blue-500" />
              <CardHeader>
                 <CardTitle className="text-lg">Operation Summary</CardTitle>
                 <CardDescription>Real-time calculation of deposit data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 {selectedCrop && selectedUser ? (
                    <div className="space-y-4">
                        <div className="p-3 sm:p-4 rounded-2xl bg-muted/30 space-y-3 font-medium">
                           <div className="flex justify-between items-center text-[10px] sm:text-xs">
                              <span className="text-muted-foreground italic">Depositor</span>
                              <span className="font-bold text-blue-600 truncate max-w-[120px]">{selectedUser.firstName} {selectedUser.lastName}</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px] sm:text-xs">
                              <span className="text-muted-foreground italic">Commodity</span>
                              <span className="font-bold text-primary/90">{selectedCrop.name}</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px] sm:text-xs">
                              <span className="text-muted-foreground italic">Quantity</span>
                              <span className="font-bold">{formData.bags || 0} Bags</span>
                           </div>
                           <div className="flex justify-between items-center text-[10px] sm:text-xs pt-2 border-t">
                              <span className="text-muted-foreground font-bold">Total Payload</span>
                              <span className="font-black text-base sm:text-lg">{formData.weight || 0} kg</span>
                           </div>
                        </div>
                       
                       <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
                          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                             All recorded deposits are marked as "Pending QC" until verified by the quality control department. Tokenization is only available for Grade A stock.
                          </p>
                       </div>

                       <Button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="w-full h-12 sm:h-14 bg-primary/90 hover:bg-primary/90 text-foreground font-black text-base sm:text-lg shadow-xl shadow-primary/20 group"
                       >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              Authorize Deposit
                              <ChevronRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                       </Button>
                    </div>
                 ) : (
                    <div className="py-8 text-center space-y-4">
                       <div className="h-16 w-16 bg-muted/40 rounded-full mx-auto flex items-center justify-center">
                          <Package className="h-8 w-8 text-muted-foreground/50" />
                       </div>
                       <p className="text-sm text-muted-foreground px-4 italic leading-relaxed">
                          Select a commodity and a depositor to generate the operation manifest.
                       </p>
                    </div>
                 )}
              </CardContent>
           </Card>

           <div className="p-4 rounded-2xl border-2 border-dashed border-muted flex items-start gap-4">
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-1" />
              <div>
                 <p className="text-xs font-bold text-foreground">Digital Trust Protocol</p>
                 <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                    Entering this data will issue a provisional warehouse receipt tracked on the GrainTox immutable ledger.
                 </p>
              </div>
           </div>
        </div>
      </form>
    </div>
  );
};

export default RecordStock;
