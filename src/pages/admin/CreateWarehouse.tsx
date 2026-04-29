import React, { useState } from "react";
import { ArrowLeft, Building2, MapPin, Save, User, UserSquare2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useCreateWarehouseMutation } from "@/services/api/warehouseApiSlice";
import { useGetUsersQuery } from "@/services/api/userApiSlice";

const CreateWarehouse = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [createWarehouse, { isLoading }] = useCreateWarehouseMutation();
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
    managerId: "",
  });

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
      await createWarehouse({
        ...formData,
        capacity: Number(formData.capacity),
        // If managerId is explicitly "none", send null, otherwise send string id
        managerId: formData.managerId === "none" || !formData.managerId ? null : formData.managerId
      }).unwrap();
      
      toast({ title: "Success", description: "Warehouse registered successfully" });
      navigate("/warehouses");
    } catch (error: any) {
      toast({ title: "Error", description: error?.data?.message || "Failed to register warehouse", variant: "destructive" });
    }
  };

  const nigerianStates = [
    "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
    "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
    "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
    "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
    "Yobe","Zamfara",
  ];

  return (
    <div className="space-y-6 animate-fade-in p-2 pb-10">
      <header>
        <Button variant="ghost" size="sm" onClick={() => navigate("/warehouses")} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Warehouses
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Register New Warehouse</h1>
        <p className="text-muted-foreground">Submit detailed information about the facility, its owner, and strictly assign a registered manager.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          
          {/* Facility Information */}
          <div className="space-y-4 border rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium">Facility Information</h2>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="name">Warehouse Name *</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Kano Central Silo" />
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
                <Label htmlFor="capacity">Capacity (kg) *</Label>
                <Input id="capacity" name="capacity" type="number" value={formData.capacity} onChange={handleChange} required placeholder="e.g. 5000" />
              </div>
              <div>
                <Label htmlFor="certNumber">Certification Number</Label>
                <Input id="certNumber" name="certNumber" value={formData.certNumber} onChange={handleChange} placeholder="e.g. WH-KN-0042" />
              </div>
              <div>
                <Label htmlFor="certExpiry">Certification Expiry</Label>
                <Input id="certExpiry" name="certExpiry" type="date" value={formData.certExpiry} onChange={handleChange} />
              </div>
            </div>
          </div>

          {/* Owner Details */}
          <div className="space-y-4 border rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <UserSquare2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-medium">Owner / Principal Details</h2>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="ownerName">Owner Name *</Label>
                <Input id="ownerName" name="ownerName" value={formData.ownerName} onChange={handleChange} required placeholder="e.g. Alhaji Dangote" />
              </div>
              <div>
                <Label htmlFor="companyName">Corporate Name (Optional)</Label>
                <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleChange} placeholder="e.g. Dawanau Holdings Ltd" />
              </div>
              <div>
                <Label htmlFor="ownerPhone">Contact Number</Label>
                <Input id="ownerPhone" name="ownerPhone" value={formData.ownerPhone} onChange={handleChange} placeholder="+234..." />
              </div>
              <div>
                <Label htmlFor="ownerEmail">Contact Email</Label>
                <Input id="ownerEmail" name="ownerEmail" type="email" value={formData.ownerEmail} onChange={handleChange} placeholder="owner@domain.com" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
             {/* Location */}
            <div className="space-y-4 border rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-medium">Location Details</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="location">Full Address *</Label>
                  <Input id="location" name="location" value={formData.location} onChange={handleChange} required placeholder="e.g. Bompai Industrial Area, Kano" />
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
                    This directly links a Warehouse Manager account securely to this facility.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" type="button" onClick={() => navigate("/warehouses")}>Cancel</Button>
          <Button type="submit" disabled={isLoading} className="bg-primary/90 hover:bg-primary/90 text-foreground shadow-lg shadow-primary/20 px-8">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Warehouse"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateWarehouse;
