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
import { useToast } from "@/components/ui/use-toast";

const AdminSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: settingsData, isLoading, isError } = useGetSettingsQuery(undefined);
  const [updateSettings, { isLoading: isUpdating }] = useUpdateSettingsMutation();

  const [settings, setSettings] = useState({
    tradingFeePercentage: 2.5,
    withdrawalFeePercentage: 1.0,
    baseCurrency: "NGN",
    kycRequiredForTrade: true,
    kycRequiredForDeposit: false,
    maintenanceMode: false,
  });

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
  }, [settingsData]);

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

  if (isLoading) return <div className="p-8 text-center animate-pulse">Loading Platform Configurations...</div>;
  if (isError) return <div className="p-8 text-center text-red-500 font-bold">Failed to load platform settings. DB might be unreachable.</div>;

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SettingsIcon className="w-8 h-8 text-primary" /> Platform Configuration
          </h1>
          <p className="text-muted-foreground mt-1">Manage global parameters, fees, and operational status.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700">
              <Edit2 className="w-4 h-4 mr-2" /> Modify Configuration
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isUpdating}>
                Cancel
              </Button>
              <Button onClick={saveSettings} disabled={isUpdating} className="w-full md:w-auto bg-primary/90 hover:bg-primary/90 shadow-lg shadow-primary/20">
                <Save className="w-4 h-4 mr-2" />
                {isUpdating ? "Applying..." : "Save Configuration"}
              </Button>
            </>
          )}
        </div>
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
    </div>
  );
};

export default AdminSettings;
