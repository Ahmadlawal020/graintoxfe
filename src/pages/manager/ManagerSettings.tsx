import React, { useState } from "react";
import { User, ShieldCheck, Mail, Phone, MapPin, ArrowLeft, Camera, Lock, Bell, Warehouse, Loader2, Eye, EyeOff } from "lucide-react";

const ManagerSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id, firstName, lastName, email, activeRole } = useAuth();
  const { data: userData, isLoading: userLoading } = useGetUserByIdQuery(id || "", { pollingInterval: 30000 });
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  
  const [activeTab, setActiveTab] = useState("profile");

  // Profile States
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  // Password States
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  React.useEffect(() => {
    if (userData) {
      setProfileData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phone: userData.phone || "",
      });
    }
  }, [userData]);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const handleSave = async () => {
    try {
      await updateUser({
        id,
        email,
        ...profileData
      }).unwrap();
      toast({
        title: "Profile Updated",
        description: "Your information has been saved successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Mismatch",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    try {
      await changePassword({
        id,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }).unwrap();
      
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      });
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.data?.message || "Failed to change password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in p-2 max-w-5xl mx-auto">
      <header>
        <Button variant="ghost" size="sm" onClick={() => navigate("/manager")} className="mb-2 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
            <p className="text-muted-foreground">Manage your manager profile and security preferences</p>
          </div>
          <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
            <Warehouse className="w-3.5 h-3.5 mr-1.5" /> Warehouse Manager
          </Badge>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map(tab => (
            <Button 
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"} 
              className={`w-full justify-start gap-2 ${activeTab === tab.id ? "bg-primary/90" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === "profile" && (
            <Card className="glass-card border-none shadow-xl">
              <CardHeader>
                <CardTitle>Manager Profile</CardTitle>
                <CardDescription>Update your personal information displayed on the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary">
                      {firstName?.[0]}{lastName?.[0]}
                    </div>
                    <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-lg border text-primary">
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <h3 className="font-bold">{firstName} {lastName}</h3>
                    <p className="text-sm text-muted-foreground">{activeRole}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input 
                      value={profileData.firstName} 
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input 
                      value={profileData.lastName} 
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input value={email} disabled className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input 
                      value={profileData.phone} 
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      placeholder="+234..." 
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleSave} 
                    disabled={isUpdatingUser}
                    className="bg-primary/90 hover:bg-primary !text-foreground font-bold"
                  >
                    {isUpdatingUser ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="glass-card border-none shadow-xl">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Maintain account safety with password and session controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <div className="relative">
                      <Input 
                        type={showCurrentPassword ? "text" : "password"} 
                        className="pr-10"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <div className="relative">
                      <Input 
                        type={showNewPassword ? "text" : "password"} 
                        className="pr-10"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <div className="relative">
                      <Input 
                        type={showConfirmPassword ? "text" : "password"} 
                        className="pr-10"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="pt-4">
                  <Button 
                    onClick={handleUpdatePassword} 
                    disabled={isChangingPassword}
                    className="bg-primary/90 hover:bg-primary !text-foreground font-bold"
                  >
                    {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card className="glass-card border-none shadow-xl">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control how you receive operational alerts and system updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="text-sm font-bold">New Deposit Requests</p>
                      <p className="text-xs text-muted-foreground">Get notified when a user initiates a storage deposit</p>
                    </div>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                    <div>
                      <p className="text-sm font-bold">Withdrawal Approvals</p>
                      <p className="text-xs text-muted-foreground">Notifications for processed stock outbound operations</p>
                    </div>
                    <Button variant="outline" size="sm">Enabled</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerSettings;
