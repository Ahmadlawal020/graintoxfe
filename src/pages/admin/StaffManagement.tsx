import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
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
import { useGetUsersQuery, useUpdateUserMutation } from "@/services/api/userApiSlice";

const StaffManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const { data: users = [], isLoading } = useGetUsersQuery(undefined);
  const [updateUser] = useUpdateUserMutation();

  const handleToggleStatus = async (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    const newStatus = user.status === "Active" ? "Suspended" : "Active";
    try {
      await updateUser({ id: user._id, email: user.email, status: newStatus }).unwrap();
      toast({
        title: `Staff ${newStatus}`,
        description: `Staff account is now ${newStatus.toLowerCase()}.`,
        className: newStatus === "Active" ? "bg-primary/90 text-foreground" : "bg-red-600 text-foreground"
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
    const isInternalUser = ["Warehouse_Manager", "Admin"].includes(userRole);

    const matchesRole = roleFilter === "all" || userRole === roleFilter;
    
    return matchesSearch && isInternalUser && matchesRole;
  });

  const getInitials = (firstName: string, lastName: string) =>
    `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();

  const stats = {
    total: users.filter(u => ["Warehouse_Manager", "Admin"].includes(u.role?.[0])).length,
    active: users.filter((u) => u.status === "Active" && ["Warehouse_Manager", "Admin"].includes(u.role?.[0])).length,
    suspended: users.filter((u) => u.status === "Suspended" && ["Warehouse_Manager", "Admin"].includes(u.role?.[0])).length,
    admins: users.filter((u) => u.role?.[0] === "Admin").length,
  };

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      User: "bg-primary/90",
      Warehouse_Manager: "bg-blue-600",
      Investor: "bg-purple-600",
      Agent: "bg-amber-600",
      Admin: "bg-red-600",
    };
    return (
      <Badge className={`${colors[role] || "bg-gray-600"} text-foreground text-[10px]`}>
        {role?.replace("_", " ") || "Unknown"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Staff Management</h1>
        <p className="text-muted-foreground">
          Manage internal staff — admins, agents and warehouse managers
        </p>
      </header>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Staff", value: stats.total, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", change: "Internal workforce" },
          { title: "Active Staff", value: stats.active, icon: UserCheck, color: "text-primary", bg: "bg-primary/10", change: `${Math.round((stats.active / (stats.total || 1)) * 100)}% active` },
          { title: "Admins", value: stats.admins, icon: Shield, color: "text-red-500", bg: "bg-red-500/10", change: "System administrators" },
          { title: "Suspended", value: stats.suspended, icon: UserX, color: "text-amber-500", bg: "bg-amber-500/10", change: "Action required" },
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

      {/* Staff Directory */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Staff Directory</CardTitle>
              <CardDescription>
                View and manage all internal staff accounts
              </CardDescription>
            </div>
            <Button className="bg-primary/90 hover:bg-primary/90 text-foreground shadow-lg shadow-primary/90/20" onClick={() => navigate("/staff/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Staff
            </Button>
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
              <option value="all">All Roles</option>
              <option value="Admin">Admins</option>
              <option value="Warehouse_Manager">Warehouse Managers</option>
            </select>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff & ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Assigned Facility</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const role = user.role?.[0] || "";
                  const assignedWarehouses = Array.isArray(user.assignedWarehouse) ? user.assignedWarehouse : (user.assignedWarehouse ? [user.assignedWarehouse] : []);
                  
                  let assignment: React.ReactNode = "—";
                  if (role === "Warehouse_Manager") {
                    if (assignedWarehouses.length === 0) {
                      assignment = <span className="text-muted-foreground italic">Unassigned</span>;
                    } else if (assignedWarehouses.length === 1) {
                      assignment = <Badge variant="outline" className="text-[10px] border-primary/20 bg-primary/10/50 text-primary/90">{assignedWarehouses[0]}</Badge>;
                    } else {
                      assignment = (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-[10px] border-primary/40 bg-primary/10 text-primary/90 font-bold">{assignedWarehouses[0]}</Badge>
                          <Badge variant="secondary" className="text-[9px] h-4 py-0">+{assignedWarehouses.length - 1}</Badge>
                        </div>
                      );
                    }
                  }
                  
                  const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A";

                  return (
                  <TableRow key={user._id} className="cursor-pointer hover:bg-muted/50 transition" onClick={() => navigate(`/staff/${user._id}`)}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img 
                          src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`} 
                          alt="avatar" 
                          className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 shadow-sm"
                        />
                        <div>
                          <div className="font-medium text-foreground">{user.title} {user.firstName} {user.lastName}</div>
                          <div className="flex items-center text-xs text-muted-foreground mt-0.5 space-x-2">
                            <span>{user.email}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-400"></span>
                            <span className="font-mono text-[10px] uppercase text-primary/90 bg-primary/10 px-1 py-0.5 rounded">{user.userId}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{roleBadge(role)}</TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">{assignment}</div>
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
                      <Badge variant={user.status === "Active" ? "default" : "secondary"} className="text-[10px] scale-90 origin-left">
                        {user.status}
                      </Badge>
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
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/staff/${user._id}`); }}>
                            <Edit className="mr-2 h-4 w-4" /> View / Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className={user.status === "Active" ? "text-destructive" : "text-primary"} onClick={(e) => handleToggleStatus(e, user)}>
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

export default StaffManagement;
