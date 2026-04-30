import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings as SettingsIcon, Save, ArrowLeft, Edit2, ShieldAlert, Coins } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
} from "@/services/api/settingsApiSlice";
import { useGetUserByIdQuery, useUpdateUserMutation, useChangePasswordMutation } from "@/services/api/userApiSlice";
import useAuth from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { User, Lock, Mail, Phone, Loader2, Globe, Eye, EyeOff } from "lucide-react";

const AdminSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { id, firstName, lastName, email } = useAuth();

  const { data: settingsData, isLoading, isError } = useGetSettingsQuery(undefined);
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();
  const { data: userData } = useGetUserByIdQuery(id || "", { pollingInterval: 30000 });
  const [updateUser, { isLoading: isUpdatingUser }] = useUpdateUserMutation();
  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();

  const [activeMainTab, setActiveMainTab] = useState("platform");
  const [settings, setSettings] = useState({
    tradingFeePercentage: 2.5,
    withdrawalFeePercentage: 1.0,
    baseCurrency: "NGN",
    kycRequiredForTrade: true,
    kycRequiredForDeposit: false,
    maintenanceMode: false,
  });

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

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (settingsData) {
      setSettings({
        tradingFeePercentage: settingsData.tradingFeePercentage ?? 2.5,
        withdrawalFeePercentage: settingsData.withdrawalFeePercentage ?? 1.0,
        baseCurrency: settingsData.baseCurrency || "NGN",
        kycRequiredForTrade: settingsData.kycRequiredForTrade ?? true,
        kycRequiredForDeposit: settingsData.kycRequiredForDeposit ?? false,
        maintenanceMode: settingsData.maintenanceMode ?? false,
      });
    }
    if (userData) {
      setProfileData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phone: userData.phone || "",
      });
    }
  }, [settingsData, userData]);

  const saveSettings = async () => {
    try {
      await updateSettings(settings).unwrap();

      toast({
        title: "Platform Settings Updated",
        description: "Global configurations have been saved successfully.",
        className: "bg-primary/90 text-foreground border-primary/90",
      });
      setIsEditing(false);
    } catch (err: any) {
      toast({
        title: "Settings Update Failed",
        description: err.data?.message || "Failed to update configuration",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProfile = async () => {
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

  const handleChangePassword = async () => {
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

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading Platform Configurations...</div>;
  if (isError) return <div className="p-8 text-center text-red-500 font-bold">Failed to load platform settings. DB might be unreachable.</div>;

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-primary" /> Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage global parameters and personal account preferences.</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border pb-1">
        <Button 
          variant={activeMainTab === "platform" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveMainTab("platform")}
          className="gap-2"
        >
          <Globe className="w-4 h-4" /> Platform Config
        </Button>
        <Button 
          variant={activeMainTab === "personal" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveMainTab("personal")}
          className="gap-2"
        >
          <User className="w-4 h-4" /> Personal Profile
        </Button>
      </div>

      {activeMainTab === "platform" ? (
        <>
          <div className="flex justify-end mb-4">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="bg-blue-600 hover:bg-blue-700">
                <Edit2 className="w-4 h-4 mr-2" /> Modify Configuration
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isUpdating}>
                  Cancel
                </Button>
                <Button onClick={saveSettings} disabled={isUpdating} className="bg-primary/90 hover:bg-primary/90 shadow-lg shadow-primary/20">
                  <Save className="w-4 h-4 mr-2" />
                  {isUpdating ? "Applying..." : "Save Configuration"}
                </Button>
              </div>
            )}
          </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Financial Settings */}
        <Card className="glass-card shadow-xl border-none">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" /> Economic Parameters
            </CardTitle>
            <CardDescription>Configure global transaction and trading fees</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label className="font-bold text-sm">Trading Fee Percentage (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={settings.tradingFeePercentage}
                disabled={!isEditing}
                onChange={(e) => setSettings({ ...settings, tradingFeePercentage: Number(e.target.value) })}
                className="font-mono bg-muted/50"
              />
              <p className="text-[10px] text-muted-foreground">Percentage deduction on all marketplace token executions.</p>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-sm">Fiat Withdrawal Fee (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={settings.withdrawalFeePercentage}
                disabled={!isEditing}
                onChange={(e) => setSettings({ ...settings, withdrawalFeePercentage: Number(e.target.value) })}
                className="font-mono bg-muted/50"
              />
              <p className="text-[10px] text-muted-foreground">Applies when users withdraw wallet balances to bank accounts.</p>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-sm">Platform Base Currency</Label>
              <Select
                disabled={!isEditing}
                value={settings.baseCurrency}
                onValueChange={(val) => setSettings({ ...settings, baseCurrency: val })}
              >
                <SelectTrigger className="font-mono bg-muted/50">
                  <SelectValue placeholder="Select currency..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                  <SelectItem value="USD">US Dollar ($)</SelectItem>
                  <SelectItem value="GBP">British Pound (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Security & Compliance Settings */}
        <Card className="glass-card shadow-xl border-none">
          <CardHeader className="bg-amber-500/5 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" /> Security & Compliance
            </CardTitle>
            <CardDescription>Platform access rules and emergency controls</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/50">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Trade KYC Lock</Label>
                <p className="text-xs text-muted-foreground">Require verified ID for trading tokens</p>
              </div>
              <Switch
                disabled={!isEditing}
                checked={settings.kycRequiredForTrade}
                onCheckedChange={(val) => setSettings({ ...settings, kycRequiredForTrade: val })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border/50">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">Deposit KYC Lock</Label>
                <p className="text-xs text-muted-foreground">Require verified ID for warehouse intake</p>
              </div>
              <Switch
                disabled={!isEditing}
                checked={settings.kycRequiredForDeposit}
                onCheckedChange={(val) => setSettings({ ...settings, kycRequiredForDeposit: val })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-xl border border-red-500/20">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold text-red-600">Maintenance Mode</Label>
                <p className="text-xs text-red-500/80">Suspend all platform access for non-admins</p>
              </div>
              <Switch
                disabled={!isEditing}
                checked={settings.maintenanceMode}
                onCheckedChange={(val) => setSettings({ ...settings, maintenanceMode: val })}
                className="data-[state=checked]:bg-red-600"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass-card shadow-xl border-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input value={profileData.firstName} onChange={(e) => setProfileData({...profileData, firstName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input value={profileData.lastName} onChange={(e) => setProfileData({...profileData, lastName: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email (Read-only)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input value={email} disabled className="pl-10 bg-muted/30" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} className="pl-10" />
                </div>
              </div>
              <Button onClick={handleUpdateProfile} disabled={isUpdatingUser} className="w-full bg-primary/90 hover:bg-primary !text-foreground font-bold">
                {isUpdatingUser ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-xl border-none">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-500" /> Security
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
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
               <Button onClick={handleChangePassword} disabled={isChangingPassword} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold">
                  {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Update Password
               </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
