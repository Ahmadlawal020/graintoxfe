import React, { useState } from "react";
import {
  UserPlus,
  ArrowLeft,
  UserCheck,
  Building,
  Mail,
  Phone,
  Key,
  Eye,
  EyeOff,
  Save,
  Shield,
  MapPin,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useCreateUserMutation,
  useGetDepartmentsQuery,
} from "@/services/api/userApiSlice";
import { useGetWarehousesQuery } from "@/services/api/warehouseApiSlice";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const CreateStaff = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [createUser, { isLoading }] = useCreateUserMutation();
  const { data: departmentData } = useGetDepartmentsQuery(undefined);
  const { data: warehouseData } = useGetWarehousesQuery(undefined);
  
  const departments = Array.isArray(departmentData) ? departmentData : [];
  const warehouses = Array.isArray(warehouseData) ? warehouseData : [];
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    title: "Mr",
    email: "",
    phone: "",
    department: "",
    role: ["Warehouse_Manager"],
    status: "Active",
    gender: "Male",
    password: "",
    confirmPassword: "",
    assignedWarehouse: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    let newRoles = [...formData.role];
    if (checked) {
      if (!newRoles.includes(role)) newRoles.push(role);
    } else {
      newRoles = newRoles.filter((r) => r !== role);
    }
    setFormData((prev) => ({ ...prev, role: newRoles }));
  };

  const handleWarehouseToggle = (warehouseName: string, checked: boolean) => {
    let newWarehouses = [...formData.assignedWarehouse];
    if (checked) {
      if (!newWarehouses.includes(warehouseName)) newWarehouses.push(warehouseName);
    } else {
      newWarehouses = newWarehouses.filter((w) => w !== warehouseName);
    }
    setFormData((prev) => ({ ...prev, assignedWarehouse: newWarehouses }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.userId) newErrors.userId = "Employee ID is required";
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (formData.role.length === 0) newErrors.role = "At least one role must be selected";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const { confirmPassword, ...submitData } = formData;
      await createUser(submitData).unwrap();
      toast({
        title: "Staff Created",
        description: `${formData.firstName} ${formData.lastName} has been added to the system.`,
      });
      navigate("/staff");
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.data?.message || "An error occurred while creating staff member.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/staff")}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Staff Management
          </Button>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
             <UserPlus className="h-8 w-8 text-emerald-500" />
             Add New Staff Member
          </h1>
          <p className="text-muted-foreground">
            Register a new internal team member with multi-facility access
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Identity Section */}
          <Card className="glass-card border-emerald-500/10 h-full">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-500" />
                Personal Identity
              </CardTitle>
              <CardDescription>Legal name and basic identification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <Label htmlFor="title">Title</Label>
                  <Select value={formData.title} onValueChange={(v) => handleSelectChange("title", v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Title" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Mr", "Mrs", "Miss", "Dr", "Prof"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(v) => handleSelectChange("gender", v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Male", "Female", "Other"].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  name="firstName" 
                  placeholder="e.g. John" 
                  value={formData.firstName} 
                  onChange={handleChange}
                  className={errors.firstName ? "border-destructive" : ""}
                />
                {errors.firstName && <p className="text-[10px] text-destructive">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  name="lastName" 
                  placeholder="e.g. Doe" 
                  value={formData.lastName} 
                  onChange={handleChange}
                  className={errors.lastName ? "border-destructive" : ""}
                />
                 {errors.lastName && <p className="text-[10px] text-destructive">{errors.lastName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="userId">Employee / Staff ID</Label>
                <Input 
                  id="userId" 
                  name="userId" 
                  placeholder="e.g. GTX-STAFF-001" 
                  value={formData.userId} 
                  onChange={handleChange}
                  className={`font-mono ${errors.userId ? "border-destructive" : ""}`}
                />
                 {errors.userId && <p className="text-[10px] text-destructive">{errors.userId}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Contact & Security */}
          <Card className="glass-card border-blue-500/10 h-full">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                Contact & Security
              </CardTitle>
              <CardDescription>Authentication and communication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    name="email" 
                    type="email"
                    placeholder="john.doe@graintox.com" 
                    className={`pl-9 ${errors.email ? "border-destructive" : ""}`}
                    value={formData.email} 
                    onChange={handleChange}
                  />
                </div>
                 {errors.email && <p className="text-[10px] text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    name="phone" 
                    type="tel"
                    placeholder="+234 ..." 
                    className="pl-9"
                    value={formData.phone} 
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t mt-4">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Key className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    name="password" 
                    type={showPassword ? "text" : "password"}
                    className={`pl-9 pr-9 ${errors.password ? "border-destructive" : ""}`}
                    value={formData.password} 
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword" 
                  type={showPassword ? "text" : "password"}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                  value={formData.confirmPassword} 
                  onChange={handleChange}
                />
                 {errors.confirmPassword && <p className="text-[10px] text-destructive">{errors.confirmPassword}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Role & Multi-Warehouse Allocation */}
          <Card className="glass-card border-purple-500/10 h-full">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-500" />
                Permissions & Allocation
              </CardTitle>
              <CardDescription>Multi-facility and role assignment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase text-muted-foreground">System Roles</Label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: "Admin", label: "Global Admin", desc: "Full infrastructure access" },
                    { id: "Warehouse_Manager", label: "Manager / Staff", desc: "Operational vault access" }
                  ].map((role) => (
                    <div key={role.id} className={`flex items-start space-x-3 p-2.5 rounded-lg border transition ${formData.role.includes(role.id) ? "bg-purple-500/5 border-purple-500/20 shadow-sm" : "bg-transparent border-border/50"}`}>
                      <Checkbox 
                        id={role.id} 
                        checked={formData.role.includes(role.id)} 
                        onCheckedChange={(checked) => handleRoleChange(role.id, !!checked)}
                        className="mt-1"
                      />
                      <div className="grid gap-1 leading-none">
                        <label htmlFor={role.id} className="text-sm font-bold leading-none cursor-pointer">{role.label}</label>
                        <p className="text-[9px] text-muted-foreground uppercase font-medium">{role.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <Label className="flex items-center justify-between">
                   <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assigned Facilities</span>
                   <Badge variant="outline" className="h-5 py-0 px-2 text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200">
                      {formData.assignedWarehouse.length} Selected
                   </Badge>
                </Label>
                
                <div className="max-h-[220px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                  {warehouses.length > 0 ? (
                    warehouses.map((w: any) => (
                      <div 
                        key={w._id} 
                        className={`flex items-center space-x-3 p-2.5 rounded-xl border transition-all cursor-pointer ${formData.assignedWarehouse.includes(w.name) ? "bg-emerald-50 border-emerald-500/30 text-emerald-700 shadow-sm" : "hover:bg-muted/50 border-border/40"}`}
                        onClick={() => handleWarehouseToggle(w.name, !formData.assignedWarehouse.includes(w.name))}
                      >
                         <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${formData.assignedWarehouse.includes(w.name) ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                            <MapPin className="h-4 w-4" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate leading-tight">{w.name}</p>
                            <p className="text-[10px] text-muted-foreground truncate opacity-70">{w.location}</p>
                         </div>
                         {formData.assignedWarehouse.includes(w.name) && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                         )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed rounded-xl bg-muted/20">
                       <MapPin className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
                       <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">No Facilities Available</p>
                    </div>
                  )}
                </div>
                <p className="text-[9px] text-muted-foreground italic bg-muted/40 p-2 rounded-lg">
                  ** Managers can view stock and log operations for all assigned facilities simultaneously.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t mt-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => navigate("/staff")}
            className="px-8 font-bold"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 shadow-xl shadow-emerald-500/20 font-black tracking-tight"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                DPLOYING...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                INITIALIZE STAFF ACCESS
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateStaff;
