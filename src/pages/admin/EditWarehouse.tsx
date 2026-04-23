import React, { useState, useEffect } from "react";
import { ArrowLeft, Building2, MapPin, Save, User, UserSquare2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  useGetWarehouseByIdQuery, 
  useUpdateWarehouseMutation 
} from "@/services/api/warehouseApiSlice";
import { useGetUsersQuery } from "@/services/api/userApiSlice";

const EditWarehouse = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: warehouse, isLoading: isFetching, isError } = useGetWarehouseByIdQuery(id || "");
  const [updateWarehouse, { isLoading: isUpdating }] = useUpdateWarehouseMutation();
  const { data: users = [] } = useGetUsersQuery(undefined);
  
  const managers = users.filter((u: any) => u.role?.includes("Warehouse_Manager"));

  const [formData, setFormData] = useState({
    name: "",
    warehouseType: "Silo",
    capacity: "",
    status: "Active",
    location: "",
    state: "",
    certNumber: "",
    certExpiry: "",
    ownerName: "",
    companyName: "",
    ownerPhone: "",
    ownerEmail: "",
    managerId: "none",
  });

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name || "",
        warehouseType: warehouse.warehouseType || "Silo",
        capacity: warehouse.capacity?.toString() || "",
        status: warehouse.status || "Active",
        location: warehouse.location || "",
        state: warehouse.state || "",
        certNumber: warehouse.certNumber || "",
        certExpiry: warehouse.certExpiry ? new Date(warehouse.certExpiry).toISOString().split('T')[0] : "",
        ownerName: warehouse.ownerName || "",
        companyName: warehouse.companyName || "",
        ownerPhone: warehouse.ownerPhone || "",
        ownerEmail: warehouse.ownerEmail || "",
        // managerId can be populated from the object relation
        managerId: warehouse.managerId?._id || warehouse.managerId || "none",
      });
    }
  }, [warehouse]);

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
      await updateWarehouse({
        id,
        ...formData,
        capacity: Number(formData.capacity),
        managerId: formData.managerId === "none" || !formData.managerId ? null : formData.managerId
      }).unwrap();
      
      toast({ title: "Success", description: "Warehouse updated successfully" });
      navigate(`/warehouses/${id}`);
    } catch (error: any) {
      toast({ title: "Error", description: error?.data?.message || "Failed to update warehouse", variant: "destructive" });
    }
  };

  const nigerianStates = [
    "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
    "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
    "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
    "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
    "Yobe","Zamfara",
  ];

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-64 text-center">
        <p className="text-destructive font-medium">Failed to load warehouse data.</p>
        <Button variant="outline" onClick={() => navigate("/warehouses")} className="mt-4">Back to Warehouses</Button>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="space-y-6 p-2">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-64 w-full rounded-lg" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-2 pb-10">
      <header>
        <Button variant="ghost" size="sm" onClick={() => navigate(`/warehouses/${id}`)} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Details
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Edit Warehouse</h1>
        <p className="text-muted-foreground">Modify facility configurations and owner information securely.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          
          {/* Facility Information */}
          <div className="space-y-4 border rounded-lg p-4 bg-muted/10">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-medium">Facility Information</h2>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Warehouse Name *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="warehouseType">Facility Type</Label>
                  <Select value={formData.warehouseType} onValueChange={(v) => handleSelectChange("warehouseType", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Silo">Silo</SelectItem>
                      <SelectItem value="Flat Store">Flat Store</SelectItem>
                      <SelectItem value="Cold Storage">Cold Storage</SelectItem>
                      <SelectItem value="Open Yard">Open Yard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Operating Status</Label>
                  <Select value={formData.status} onValueChange={(v) => handleSelectChange("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="capacity">Capacity (Metric Tonnes) *</Label>
                <Input id="capacity" name="capacity" type="number" value={formData.capacity} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="certNumber">Certification Number</Label>
                <Input id="certNumber" name="certNumber" value={formData.certNumber} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="certExpiry">Certification Expiry</Label>
                <Input id="certExpiry" name="certExpiry" type="date" value={formData.certExpiry} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Owner Details */}
          <div className="space-y-4 border rounded-lg p-4 bg-muted/10">
            <div className="flex items-center space-x-2">
              <UserSquare2 className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-medium">Owner / Principal Details</h2>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="ownerName">Owner Name *</Label>
                <Input id="ownerName" name="ownerName" value={formData.ownerName} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="companyName">Corporate Name</Label>
                <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="ownerPhone">Contact Number</Label>
                <Input id="ownerPhone" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="ownerEmail">Contact Email</Label>
                <Input id="ownerEmail" name="ownerEmail" type="email" value={formData.ownerEmail} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
             {/* Location */}
            <div className="space-y-4 border rounded-lg p-4 bg-muted/10">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-medium">Location Details</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="location">Full Address *</Label>
                  <Input id="location" name="location" value={formData.location} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Select value={formData.state} onValueChange={(v) => handleSelectChange("state", v)}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {nigerianStates.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Manager Assignment */}
            <div className="space-y-4 border rounded-lg p-4 bg-primary/5 border-primary/30">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary/90" />
                <h2 className="text-lg font-medium text-primary/90 dark:text-primary/80">Warehouse Manager Assignment</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="managerId" className="text-primary/90 dark:text-primary/50">Select Operating Manager</Label>
                  <Select value={formData.managerId} onValueChange={(v) => handleSelectChange("managerId", v)}>
                    <SelectTrigger className="border-primary/30">
                      <SelectValue placeholder="-- Select Manager --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Leave Unassigned</SelectItem>
                      {managers.map((m: any) => (
                        <SelectItem key={m._id} value={m._id}>
                          {m.firstName} {m.lastName} ({m.userId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Re-assigning will instantly shift warehouse access protocols.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" type="button" onClick={() => navigate(`/warehouses/${id}`)}>Cancel</Button>
          <Button type="submit" disabled={isUpdating} className="bg-primary/90 hover:bg-primary/90 text-foreground shadow-lg shadow-primary/20 px-8">
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditWarehouse;
