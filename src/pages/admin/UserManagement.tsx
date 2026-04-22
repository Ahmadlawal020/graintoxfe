import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
  Filter,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Shield,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUpRight,
  Ban,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useGetUsersQuery, useUpdateUserMutation, useUpdateKycStatusMutation } from "@/services/api/userApiSlice";

const UserManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: users = [], isLoading } = useGetUsersQuery(undefined);
  const [updateUser] = useUpdateUserMutation();
  const [updateKyc] = useUpdateKycStatusMutation();

  const handleApproveKyc = async (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    try {
      await updateKyc({ id: user._id, kycStatus: "VERIFIED" }).unwrap();
      toast({
        title: "KYC Approved",
        description: `User ${user.firstName} ${user.lastName} is now verified.`,
        className: "bg-emerald-600 text-white border-none shadow-lg shadow-emerald-500/20"
      });
    } catch (err: any) {
      toast({ title: "Action Failed", description: err.data?.message || "Could not approve KYC", variant: "destructive" });
    }
  };

  const handleToggleStatus = async (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    const newStatus = user.status === "Active" ? "Suspended" : "Active";
    try {
      await updateUser({ id: user._id, email: user.email, status: newStatus }).unwrap();
      toast({
        title: `User ${newStatus}`,
        description: `User account is now ${newStatus.toLowerCase()}.`,
        className: newStatus === "Active" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
      });
    } catch (err: any) {
      toast({ title: "Action Failed", description: err.data?.message || "Could not update status", variant: "destructive" });
    }
  };

  const filteredUsers = users.filter((user: any) => {
    const matchesSearch =
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const userRole = user.role?.[0] || "";
    const isPlatformUser = userRole === "User";

    const matchesRole = roleFilter === "all" || userRole === roleFilter;
    
    return matchesSearch && isPlatformUser && matchesRole;
  });

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

  const stats = {
    total: users.filter(u => u.role?.[0] === "User").length,
    active: users.filter((u) => u.status === "Active" && u.role?.[0] === "User").length,
    suspended: users.filter((u) => u.status === "Suspended" && u.role?.[0] === "User").length,
    pendingKyc: users.filter((u) => u.kycStatus === "PENDING" && u.role?.[0] === "User").length,
  };

  const kycBadge = (status: string) => {
    const styles: Record<string, string> = {
      VERIFIED: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      PENDING: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      UNDER_REVIEW: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return (
      <Badge variant="outline" className={styles[status] || ""}>
        {status}
      </Badge>
    );
  };

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      User: "bg-emerald-600",
      Warehouse_Manager: "bg-blue-600",
      Admin: "bg-red-600",
    };
    return (
      <Badge className={`${colors[role] || "bg-gray-600"} text-white text-[10px]`}>
        {role?.replace("_", " ") || "Unknown"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <header>
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground">
          Manage all platform users
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Users", value: stats.total, icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10", change: "+12% this month" },
          { title: "Active Users", value: stats.active, icon: UserCheck, color: "text-blue-500", bg: "bg-blue-500/10", change: `${Math.round((stats.active / (stats.total || 1)) * 100)}% of total` },
          { title: "Suspended", value: stats.suspended, icon: UserX, color: "text-red-500", bg: "bg-red-500/10", change: "Requires review" },
          { title: "Pending KYC", value: stats.pendingKyc, icon: Shield, color: "text-amber-500", bg: "bg-amber-500/10", change: "Awaiting verification" },
        ].map((stat, i) => (
          <Card key={i} className="glass-card overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Directory */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>User Directory</CardTitle>
              <CardDescription>
                View and manage all registered platform users
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background text-sm"
              aria-label="Filter by role"
            >
              <option value="all">All Users</option>
              <option value="User">Platform Users</option>
              <option value="Warehouse_Manager">Managers</option>
            </select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User & ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Platform Details</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>KYC & Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  // Determine dynamic details based on role
                  const role = user.role?.[0] || "";
                  let platformDetail = user.farmLocation ? `Farm: ${user.farmLocation}` : (user.investorTier ? `Tier: ${user.investorTier}` : "—");
                  
                  const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A";

                  return (
                  <TableRow key={user._id} className="cursor-pointer hover:bg-muted/50 transition" onClick={() => navigate(`/users/${user._id}`)}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img 
                          src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`} 
                          alt="avatar" 
                          className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-sm"
                        />
                        <div>
                          <div className="font-medium text-foreground">{user.title} {user.firstName} {user.lastName}</div>
                          <div className="flex items-center text-xs text-muted-foreground mt-0.5 space-x-2">
                            <span>{user.email}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                            <span className="font-mono text-[10px] uppercase text-emerald-600 bg-emerald-500/10 px-1 py-0.5 rounded">{user.userId}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{roleBadge(role)}</TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="text-muted-foreground">{platformDetail}</div>
                        {(user.walletBalance !== undefined && user.walletBalance !== null) && (
                           <div className="font-semibold text-emerald-600 text-xs">
                             Wallet: ₦{(user.walletBalance / 1e3).toFixed(1)}K
                           </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center text-muted-foreground text-xs">
                          <Phone className="mr-1.5 h-3 w-3" />
                          {user.phone || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        {kycBadge(user.kycStatus)}
                        <Badge variant={user.status === "Active" ? "default" : "secondary"} className="text-[10px] scale-90 origin-left">
                          {user.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                       <span className="text-xs text-muted-foreground">{joinedDate}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/users/${user._id}`); }}>
                            <Edit className="mr-2 h-4 w-4" /> View / Edit
                          </DropdownMenuItem>
                          {(user.kycStatus === "PENDING" || user.kycStatus === "UNDER_REVIEW") && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/kyc/${user._id}`); }}>
                              <Shield className="mr-2 h-4 w-4 text-blue-500" /> Verify Documents
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className={user.status === "Active" ? "text-destructive" : "text-emerald-500"} onClick={(e) => handleToggleStatus(e, user)}>
                            {user.status === "Active" ? <Ban className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />} 
                            {user.status === "Active" ? "Suspend" : "Activate"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
