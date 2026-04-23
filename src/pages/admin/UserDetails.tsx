import React from "react";
import { ArrowLeft, User, Mail, Phone, Shield, Edit, Ban, CheckCircle2, Calendar, Wallet, Coins } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetUserByIdQuery } from "@/services/api/userApiSlice";
import { Skeleton } from "@/components/ui/skeleton";

const UserDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading, isError } = useGetUserByIdQuery(id || "");

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      User: "bg-primary/90", Warehouse_Manager: "bg-blue-600",
      Admin: "bg-red-600",
    };
    return <Badge className={`${colors[role] || "bg-gray-600"} text-foreground`}>{role.replace("_", " ")}</Badge>;
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-destructive text-lg">User not found</p>
        <Button variant="outline" onClick={() => navigate("/users")} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Users
        </Button>
      </div>
    );
  }

  if (isLoading || !user) {
    return (
      <div className="space-y-6 p-2">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1,2].map(i => <Skeleton key={i} className="h-64 w-full rounded-lg" />)}
        </div>
      </div>
    );
  }

  const displayRole = user.role?.[0] || "Unknown";
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" }) : "N/A";
  const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("en-NG", { year: "numeric", month: "short", day: "numeric" }) : "Never";

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/users")} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Users
          </Button>
          <div className="flex items-center gap-5">
            <img 
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`} 
              alt="avatar" 
              className="h-20 w-20 rounded-full bg-primary/10 border-4 border-primary/20 shadow-lg object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold text-foreground">{user.title} {user.firstName} {user.lastName}</h1>
              <div className="flex items-center gap-2 mt-1">
                {roleBadge(displayRole)}
                <Badge variant={user.status === "Active" ? "default" : "secondary"}>{user.status}</Badge>
                <Badge variant="outline" className={user.kycStatus === "VERIFIED" ? "bg-primary/10 text-primary border-primary/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}>
                  KYC: {user.kycStatus || "PENDING"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/users/edit/${id}`)}>
            <Edit className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button variant="destructive" size="sm">
            <Ban className="h-4 w-4 mr-2" /> Suspend
          </Button>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Wallet Balance", value: `₦${((user.walletBalance || 0) / 1e3).toFixed(0)}K`, icon: Wallet, color: "text-primary", bg: "bg-primary/10" },
          { title: "Portfolio Value", value: `₦${((user.portfolioValue || 0) / 1e6).toFixed(1)}M`, icon: Wallet, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Tokens Held", value: user.tokensHeld || 0, icon: Coins, color: "text-purple-500", bg: "bg-purple-500/10" },
          { title: "Role", value: displayRole.replace("_", " "), icon: Shield, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon className={`h-4 w-4 ${stat.color}`} /></div>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stat.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Email", value: user.email, icon: <Mail className="h-4 w-4 text-muted-foreground" /> },
              { label: "Phone", value: user.phone || "N/A", icon: <Phone className="h-4 w-4 text-muted-foreground" /> },
              { label: "Gender", value: user.gender || "N/A", icon: <User className="h-4 w-4 text-muted-foreground" /> },
              { label: "Joined", value: joinDate, icon: <Calendar className="h-4 w-4 text-muted-foreground" /> },
              { label: "Last Login", value: lastLogin, icon: <Shield className="h-4 w-4 text-muted-foreground" /> },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">{item.icon} {item.label}</div>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Platform Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Platform Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          </CardContent>
        </Card>

        {/* Role-Specific details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Advanced Role Data</CardTitle>
          </CardHeader>
          <CardContent>
            {displayRole === "User" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Farm Location</p>
                    <p className="font-medium mt-1">{user.farmLocation || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Primary Crops</p>
                    <p className="font-medium mt-1">{user.cropTypes?.join(", ") || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Investor Tier</p>
                    <p className="font-medium mt-1 text-purple-600">{user.investorTier || "Bronze"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Portfolio Value</p>
                    <p className="font-medium mt-1">₦{((user.portfolioValue || 0) / 1e6).toFixed(1)}M</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Tokens Held</p>
                    <p className="font-medium mt-1">{user.tokensHeld?.toLocaleString() || 0} GTC</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Wallet Balance</p>
                    <p className="font-medium mt-1 text-primary/90">₦{((user.walletBalance || 0) / 1000).toLocaleString()}K</p>
                  </div>
                </div>
              </div>
            )}

            {displayRole === "Warehouse_Manager" && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/20 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Assigned Facility</p>
                  <div className="font-medium mt-1 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span> 
                    {user.assignedWarehouse || "Unassigned"}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employee ID</p>
                  <p className="font-medium mt-1 font-mono">{user.userId}</p>
                </div>
              </div>
            )}

            {["Admin"].includes(displayRole) && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Department / Role</p>
                  <p className="font-medium mt-1">{displayRole}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Staff ID</p>
                  <p className="font-medium mt-1 font-mono">{user.userId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="default" className="mt-1">{user.status}</Badge>
                </div>
              </div>
            )}

            <div className="p-3 rounded-lg bg-muted/20 flex justify-between">
              <span className="text-sm text-muted-foreground">KYC Status</span>
              <Badge variant="outline" className={user.kycStatus === "VERIFIED" ? "bg-primary/10 text-primary border-primary/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}>
                <CheckCircle2 className="w-3 h-3 mr-1" /> {user.kycStatus || "PENDING"}
              </Badge>
            </div>
            <div className="p-3 rounded-lg bg-muted/20 flex justify-between">
              <span className="text-sm text-muted-foreground">Account Status</span>
              <Badge variant={user.status === "Active" ? "default" : "secondary"}>{user.status}</Badge>
            </div>
            <div className="p-3 rounded-lg bg-muted/20 flex justify-between">
              <span className="text-sm text-muted-foreground">User ID</span>
              <span className="text-sm font-mono font-medium">{user.userId}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDetails;
