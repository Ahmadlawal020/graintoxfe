import React, { useState } from "react";
import { UserPlus, ArrowLeft, UserCheck, Mail, Phone, Key, Eye, EyeOff, Save, Shield, MapPin, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useCreateUserMutation } from "@/services/api/userApiSlice";
import { useToast } from "@/components/ui/use-toast";

const CreateUser = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [createUser, { isLoading }] = useCreateUserMutation();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
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
    address: "",
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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const { confirmPassword, ...userData } = formData;
      await createUser(userData).unwrap();
      toast({ 
        title: "User Created", 
        description: `${formData.firstName} ${formData.lastName} has been registered successfully.`,
        className: "bg-primary/90 !text-white border-none"
      });
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
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/users")} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Users
          </Button>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <UserPlus className="h-8 w-8 text-primary" />
            Add New Platform User
          </h1>
          <p className="text-muted-foreground">Register a new platform user with manual details</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Identity Section */}
          <Card className="glass-card border-primary/10 h-full">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-primary" />
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
                      {["Mr", "Mrs", "Miss", "Dr", "Alhaji", "Chief"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
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
            </CardContent>
          </Card>

          {/* Contact & Location Details */}
          <Card className="glass-card border-blue-500/10 h-full">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                Contact & Location
              </CardTitle>
              <CardDescription>Authentication and residence info</CardDescription>
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
                    placeholder="user@graintox.ng" 
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

              <div className="space-y-2">
                <Label htmlFor="address">User Location / City</Label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="address" 
                    name="address" 
                    placeholder="City, State" 
                    className="pl-9"
                    value={formData.address} 
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Platform Role</Label>
                <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-md border border-border/50">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Standard Platform User</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 italic">Role is fixed to 'User' for this portal.</p>
              </div>
            </CardContent>
          </Card>

          {/* Security & Status */}
          <Card className="glass-card border-purple-500/10 h-full">
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-purple-500" />
                Security & Status
              </CardTitle>
              <CardDescription>Account credentials and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status">Account Status</Label>
                <Select value={formData.status} onValueChange={(v) => handleSelectChange("status", v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Suspended">Suspended</SelectItem>
                    <SelectItem value="Pending">Pending Verification</SelectItem>
                  </SelectContent>
                </Select>
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
        </div>

        <div className="flex items-center justify-end gap-3 pt-6 border-t mt-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => navigate("/users")}
            className="px-8 font-bold"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-primary/90 hover:bg-primary/90 text-foreground px-10 shadow-xl shadow-primary/20 font-black tracking-tight"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                CREATING...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                INITIALIZE USER ACCESS
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateUser;

