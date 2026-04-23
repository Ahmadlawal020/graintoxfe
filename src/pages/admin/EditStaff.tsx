import React, { useEffect, useState } from "react";
import {
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
import { useNavigate, useParams } from "react-router-dom";
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
  useUpdateUserMutation,
  useGetDepartmentsQuery,
  useGetUserByIdQuery,
} from "@/services/api/userApiSlice";
import { useGetWarehousesQuery } from "@/services/api/warehouseApiSlice";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const EditStaff = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: departmentData = [] } = useGetDepartmentsQuery();
  const { data: warehouseData = [] } = useGetWarehousesQuery();
  const { data: userData, isLoading: loadingUser } = useGetUserByIdQuery(id || "");
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

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
    role: [] as string[],
    status: "Active",
    gender: "Male",
    password: "",
    confirmPassword: "",
    assignedWarehouse: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (userData) {
      setFormData((prev) => ({
        ...prev,
        ...userData,
        assignedWarehouse: Array.isArray(userData.assignedWarehouse) ? userData.assignedWarehouse : (userData.assignedWarehouse ? [userData.assignedWarehouse] : []),
        password: "",
        confirmPassword: "",
      }));
    }
  }, [userData]);

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
    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (formData.role.length === 0) newErrors.role = "At least one role must be selected";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const { confirmPassword, ...submitData } = formData;
      if (!submitData.password) {
        delete (submitData as any).password;
      }
      
      await updateUser({ id, ...submitData }).unwrap();
      toast({
        title: "Staff Updated",
        description: `Records for ${formData.firstName} have been successfully updated.`,
      });
      navigate("/staff");
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.data?.message || "An error occurred while updating staff records.",
        variant: "destructive",
      });
    }
  };

  if (loadingUser) {
    return (
      <div className="flex flex-col items-center justify-center h-96 animate-fade-in">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">Retrieving Secured Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-2 pb-20">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/staff")}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Staff Management
          </Button>
          <h1 className="text-3xl font-black text-foreground flex items-center gap-3 tracking-tighter uppercase">
             <Shield className="h-8 w-8 text-blue-500" />
             Edit Staff Records
          </h1>
          <p className="text-muted-foreground font-medium">
            Modify multi-facility access and administrative permissions
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Identity Section */}
          <Card className="glass-card border-primary/10 h-full">
            <CardHeader>
              <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-wide">
                <UserCheck className="h-4 w-4 text-primary" />
                Personal Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <Label htmlFor="title">Title</Label>
                  <Select value={formData.title} onValueChange={(v) => handleSelectChange("title", v)}>
                    <SelectTrigger className="mt-1 h-11 bg-muted/30 border-none">
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
                    <SelectTrigger className="mt-1 h-11 bg-muted/30 border-none">
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
                  value={formData.firstName} 
                  onChange={handleChange}
                  className={`h-11 bg-muted/30 border-none focus:ring-2 focus:ring-primary/20 font-bold ${errors.firstName ? "border-destructive ring-1 ring-destructive" : ""}`}
                />
                {errors.firstName && <p className="text-[10px] text-destructive">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange}
                  className={`h-11 bg-muted/30 border-none focus:ring-2 focus:ring-primary/20 font-bold ${errors.lastName ? "border-destructive ring-1 ring-destructive" : ""}`}
                />
                 {errors.lastName && <p className="text-[10px] text-destructive">{errors.lastName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="userId">Employee / Staff ID</Label>
                <Input 
                  id="userId" 
                  name="userId" 
                  value={formData.userId} 
                  onChange={handleChange}
                  className={`h-11 bg-muted/30 border-none focus:ring-2 focus:ring-primary/20 font-mono font-bold ${errors.userId ? "border-destructive ring-1 ring-destructive" : ""}`}
                />
                 {errors.userId && <p className="text-[10px] text-destructive">{errors.userId}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Contact & Security */}
          <Card className="glass-card border-blue-500/10 h-full">
            <CardHeader>
              <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-wide">
                <Mail className="h-4 w-4 text-blue-500" />
                Contact & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  className={`h-11 bg-muted/30 border-none focus:ring-2 focus:ring-blue-500/20 font-medium ${errors.email ? "border-destructive ring-1 ring-destructive" : ""}`}
                  value={formData.email} 
                  onChange={handleChange}
                />
                 {errors.email && <p className="text-[10px] text-destructive">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  type="tel"
                  className="h-11 bg-muted/30 border-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                  value={formData.phone} 
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2 pt-2 border-t mt-4">
                <Label htmlFor="password">Update Password</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    name="password" 
                    placeholder="••••••••••••"
                    type={showPassword ? "text" : "password"}
                    className={`h-11 bg-muted/20 border-none focus:ring-2 focus:ring-blue-500/20 ${errors.password ? "border-destructive ring-1 ring-destructive" : ""}`}
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
                <p className="text-[10px] text-muted-foreground mt-1">Leave blank to keep existing password.</p>
              </div>
            </CardContent>
          </Card>

          {/* Multi-Warehouse Allocation */}
          <Card className="glass-card border-purple-500/10 h-full">
            <CardHeader>
              <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-wide">
                <MapPin className="h-4 w-4 text-purple-500" />
                Facility Allocation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                 <Label className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Active Facilities</span>
                    <Badge className="bg-primary text-foreground font-black text-[9px] h-4 py-0 border-none">
                       {formData.assignedWarehouse.length} ASSIGNED
                    </Badge>
                 </Label>
                 
                 <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {warehouses.map((w: any) => (
                       <div 
                         key={w._id} 
                         className={`flex items-center space-x-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${formData.assignedWarehouse.includes(w.name) ? "bg-primary/10/50 border-primary/30 shadow-sm" : "border-transparent bg-muted/30 opacity-60 hover:opacity-100 hover:bg-muted"}`}
                         onClick={() => handleWarehouseToggle(w.name, !formData.assignedWarehouse.includes(w.name))}
                       >
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${formData.assignedWarehouse.includes(w.name) ? "bg-primary text-foreground shadow-lg shadow-primary/30" : "bg-muted text-muted-foreground"}`}>
                             <Building className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <p className={`text-sm tracking-tight font-black uppercase transition-colors ${formData.assignedWarehouse.includes(w.name) ? "text-primary/90" : "text-muted-foreground"}`}>{w.name}</p>
                             <p className="text-[9px] text-muted-foreground truncate font-bold uppercase opacity-60">{w.location}</p>
                          </div>
                          {formData.assignedWarehouse.includes(w.name) && (
                             <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          )}
                       </div>
                    ))}
                 </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                 <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Status & Roles</Label>
                 <div className="flex flex-wrap gap-2 pt-1">
                    {formData.role.map(r => (
                       <Badge key={r} variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none text-[10px] font-bold">
                          {r}
                       </Badge>
                    ))}
                    <Badge className={formData.status === "Active" ? "bg-primary" : "bg-amber-500"}>
                       {formData.status}
                    </Badge>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t mt-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => navigate("/staff")}
            className="px-8 font-black uppercase text-xs h-12"
          >
            Abort
          </Button>
          <Button 
            type="submit" 
            disabled={isUpdating}
            className="bg-blue-600 hover:bg-blue-700 text-foreground px-10 shadow-2xl shadow-blue-600/30 font-black h-12 text-sm tracking-widest uppercase"
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating Network...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Commit Records
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditStaff;
