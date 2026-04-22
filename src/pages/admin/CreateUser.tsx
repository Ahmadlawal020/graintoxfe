import React, { useState } from "react";
import { UserPlus, ArrowLeft, UserCheck, Mail, Phone, Key, Eye, EyeOff, Save, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateUserMutation } from "@/services/api/userApiSlice";
import { useToast } from "@/components/ui/use-toast";

const CreateUser = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [createUser, { isLoading }] = useCreateUserMutation();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    title: "Mr",
    email: "",
    phone: "",
    role: ["User"],
    status: "Active",
    gender: "Male",
    password: "",
    confirmPassword: "",
    department: "",
  });

  const [errors, setErrors] = useState({ password: "", confirmPassword: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "password" || name === "confirmPassword") {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "role") {
      setFormData((prev) => ({ ...prev, role: [value] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validatePassword = () => {
    let isValid = true;
    const newErrors = { password: "", confirmPassword: "" };
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;

    try {
      const { confirmPassword, ...userData } = formData;
      await createUser(userData).unwrap();
      toast({ title: "Success", description: "User created successfully" });
      navigate("/users");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.data?.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <header>
        <Button variant="ghost" size="sm" onClick={() => navigate("/users")} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Users
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Add New User</h1>
        <p className="text-muted-foreground">Register a new platform user — general user or manager</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Personal Information */}
          <div className="space-y-4 border rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-medium">Personal Information</h2>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="userId">User ID</Label>
                <Input id="userId" name="userId" value={formData.userId} onChange={handleChange} required placeholder="e.g. GRN-001" />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Select value={formData.title} onValueChange={(v) => handleSelectChange("title", v)}>
                  <SelectTrigger><SelectValue placeholder="Select title" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mr">Mr</SelectItem>
                    <SelectItem value="Mrs">Mrs</SelectItem>
                    <SelectItem value="Miss">Miss</SelectItem>
                    <SelectItem value="Dr">Dr</SelectItem>
                    <SelectItem value="Alhaji">Alhaji</SelectItem>
                    <SelectItem value="Chief">Chief</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(v) => handleSelectChange("gender", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact & Role */}
          <div className="space-y-4 border rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-medium">Contact & Role</h2>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="user@graintox.ng" />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+234 800 000 0000" />
              </div>
              <div>
                <Label htmlFor="role">Platform Role</Label>
                <Select value={formData.role[0]} onValueChange={(v) => handleSelectChange("role", v)}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Administrator</SelectItem>
                    <SelectItem value="Warehouse_Manager">Warehouse Manager</SelectItem>
                    <SelectItem value="User">Platform User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Account Status</Label>
                <Select value={formData.status} onValueChange={(v) => handleSelectChange("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                    <SelectItem value="Pending">Pending Verification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="space-y-4 border rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-emerald-500" />
              <h2 className="text-lg font-medium">Security</h2>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" name="password" type={showPassword ? "text" : "password"} value={formData.password} onChange={handleChange} required />
                  <button type="button" className="absolute right-2 top-2.5 text-muted-foreground" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} value={formData.confirmPassword} onChange={handleChange} required />
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => navigate("/users")}>Cancel</Button>
          <Button type="submit" disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Create User"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;
