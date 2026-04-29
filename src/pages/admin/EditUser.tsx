import React, { useState, useEffect } from "react";
import { ArrowLeft, UserCheck, Mail, Key, Save, Shield, AlertTriangle, Info } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetUserByIdQuery, useUpdateUserMutation } from "@/services/api/userApiSlice";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const EditUser = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: user, isLoading: isFetching, isError } = useGetUserByIdQuery(id || "");
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    title: "Mr",
    email: "",
    phone: "",
    gender: "Male",
    role: "User",
    status: "Active",
    kycStatus: "PENDING",
    assignedWarehouse: "",
    farmLocation: "",
  });

  // Populate form once user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        title: user.title || "Mr",
        email: user.email || "",
        phone: user.phone || "",
        gender: user.gender || "Male",
        role: user.role?.[0] || "User",
        status: user.status || "Active",
        kycStatus: user.kycStatus || "PENDING",
        assignedWarehouse: user.assignedWarehouse || "",
        farmLocation: user.farmLocation || "",
      });
    }
  }, [user]);

  const isVerified = user?.kycStatus === "VERIFIED";

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
      // In a real scenario, the backend should also enforce these restrictions
      await updateUser({
        id,
        ...formData,
        role: [formData.role],
      }).unwrap();
      toast({ title: "Success", description: "User records updated and logged." });
      navigate(`/users/${id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.data?.message || "Failed to update user",
        variant: "destructive",
      });
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-destructive">Failed to load user details</p>
        <Button variant="outline" onClick={() => navigate("/users")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6">
      <header>
        <Button variant="ghost" size="sm" onClick={() => navigate(`/users/${id}`)} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to User Profile
        </Button>
        <h1 className="text-3xl font-bold text-foreground">
          {isFetching ? <Skeleton className="h-9 w-64" /> : `Manage — ${user?.firstName} ${user?.lastName}`}
        </h1>
        <p className="text-muted-foreground">Adjust account standing and administrative parameters</p>
      </header>

      {isVerified && (
        <Alert className="bg-blue-500/10 border-blue-500/20 text-blue-500">
          <Info className="h-4 w-4" />
          <AlertTitle>Identity Protection Active</AlertTitle>
          <AlertDescription>
            This user is KYC Verified. Legal name, gender, and primary identity fields are locked to prevent fraud. 
            To change these, a KYC Re-verification process must be initiated.
          </AlertDescription>
        </Alert>
      )}

      <Alert className="bg-amber-500/10 border-amber-500/20 text-amber-600">
        <Shield className="h-4 w-4" />
        <AlertTitle>Audit Logging Enabled</AlertTitle>
        <AlertDescription>
          All administrative changes made here are permanently recorded in the system audit trail with your Admin ID.
        </AlertDescription>
      </Alert>

      {isFetching ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-4 shadow-sm">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Personal Information */}
            <div className="space-y-4 border rounded-lg p-4 shadow-sm bg-card">
              <div className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-medium">Identity & Personal</h2>
              </div>
              <div className="space-y-3">
                <div className="opacity-80">
                  <Label htmlFor="title">Title</Label>
                  <Select value={formData.title} onValueChange={(v) => handleSelectChange("title", v)} disabled={isVerified}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Mr", "Mrs", "Miss", "Dr", "Alhaji", "Chief"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required disabled={isVerified} className={isVerified ? "bg-muted cursor-not-allowed" : ""} />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required disabled={isVerified} className={isVerified ? "bg-muted cursor-not-allowed" : ""} />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(v) => handleSelectChange("gender", v)} disabled={isVerified}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contact & Status */}
            <div className="space-y-4 border rounded-lg p-4 shadow-sm bg-card">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-blue-500" />
                <h2 className="text-lg font-medium">Contact & Account Status</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    Email Address
                    <AlertTriangle className="h-3 w-3 text-amber-600" />
                  </Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required disabled className="bg-muted cursor-not-allowed opacity-70" />
                  <p className="text-[10px] text-muted-foreground mt-1 text-amber-700">Email is fixed to prevent account hijacking.</p>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="status">Account Status</Label>
                  <Select value={formData.status} onValueChange={(v) => handleSelectChange("status", v)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Suspended">Suspended</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="role">Platform Role</Label>
                  <Select value={formData.role} onValueChange={(v) => handleSelectChange("role", v)} disabled>
                    <SelectTrigger className="mt-1 bg-muted opacity-70"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="User">Platform User</SelectItem>
                      <SelectItem value="Warehouse_Manager">Warehouse Manager</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                   <p className="text-[10px] text-muted-foreground mt-1 italic">Role conversion requires system re-registration.</p>
                </div>
              </div>
            </div>

            {/* Platform Settings */}
            <div className="space-y-4 border rounded-lg p-4 shadow-sm bg-card">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-purple-500" />
                <h2 className="text-lg font-medium">Platform & Location</h2>
              </div>
              <div className="space-y-3">
                {formData.role === "User" && (
                  <>
                    <div>
                      <Label htmlFor="farmLocation">Primary Farm Location</Label>
                      <Input id="farmLocation" name="farmLocation" value={formData.farmLocation} onChange={handleChange} placeholder="e.g. Dawanau, Kano" />
                    </div>
                  </>
                )}
                {formData.role === "Warehouse_Manager" && (
                  <div>
                    <Label htmlFor="assignedWarehouse">Assigned Warehouse Facility</Label>
                    <Input id="assignedWarehouse" name="assignedWarehouse" value={formData.assignedWarehouse} onChange={handleChange} placeholder="e.g. Kano Central Silo" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-muted/40 rounded-lg border-2 border-dashed gap-4">
            <div className="flex items-center gap-3">
               <AlertTriangle className="h-5 w-5 text-red-500" />
               <div className="text-center sm:text-left">
                  <p className="text-sm font-semibold">Security Confirmation</p>
                  <p className="text-xs text-muted-foreground">Submit changes to record updates in the secondary immutable audit log.</p>
               </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 w-full sm:w-auto">
              <Button variant="outline" type="button" onClick={() => navigate(`/users/${id}`)}>Cancel</Button>
              <Button type="submit" disabled={isUpdating} className="bg-primary/90 hover:bg-primary/90 text-foreground shadow-lg shadow-primary/90/20 px-8">
                {isUpdating ? "Processing..." : "Authorized Update"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditUser;
