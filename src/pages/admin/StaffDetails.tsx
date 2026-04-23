import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit,
  Trash2,
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  CheckCircle2,
  Ban,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import {
  useGetUserByIdQuery,
  useDeleteUserMutation,
} from "@/services/api/userApiSlice";

const StaffDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const {
    data: staff,
    isLoading,
    error,
  } = useGetUserByIdQuery(id || "", { skip: !id });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to load staff details",
        variant: "destructive",
      });
      navigate("/staff");
    }
  }, [error, navigate, toast]);

  const handleEdit = () => navigate(`/staff/edit/${id}`);
  const handleBack = () => navigate("/staff");

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this staff member?")) {
      try {
        await deleteUser({ id }).unwrap();
        toast({
          title: "Success",
          description: "Staff member deleted successfully",
        });
        navigate("/staff");
      } catch (err) {
        console.error("Delete failed", err);
        toast({
          title: "Error",
          description: "Failed to delete staff member.",
          variant: "destructive",
        });
      }
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-6 animate-fade-in p-2">
      <Skeleton className="h-9 w-64" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );

  if (isLoading || !staff) {
    return renderSkeleton();
  }

  const role = staff.role?.[0] || "Unknown";
  
  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      Warehouse_Manager: "bg-blue-600",
      Admin: "bg-red-600",
      Agent: "bg-amber-600",
    };
    return (
      <Badge className={`${colors[role] || "bg-gray-600"} text-foreground`}>
        {role.replace("_", " ")}
      </Badge>
    );
  };

  const joinDate = staff.createdAt 
    ? new Date(staff.createdAt).toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }) 
    : "N/A";

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Staff
          </Button>
          <div className="flex items-center gap-5">
            <img 
              src={`https://api.dicebear.com/7.x/notionists/svg?seed=${staff.email}`} 
              alt="avatar" 
              className="h-20 w-20 rounded-full bg-primary/10 border-4 border-primary/20 shadow-lg object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {staff.title} {staff.firstName} {staff.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {roleBadge(role)}
                <Badge variant={staff.status === "Active" ? "default" : "secondary"}>
                  {staff.status}
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px] uppercase text-primary/90 bg-primary/10 border-primary/20">
                  ID: {staff.userId}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Shield className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="text-amber-600">
                <Ban className="h-4 w-4 mr-2" />
                Suspend Account
              </DropdownMenuItem>
              <Separator className="my-1" />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(staff._id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Staff Member
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Personnel Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Full Name</p>
              <p className="font-medium">{staff.title} {staff.firstName} {staff.lastName}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Gender</p>
                <p className="font-medium">{staff.gender || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Joining Date</p>
                <p className="font-medium">{joinDate}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Address</p>
              <p className="font-medium text-sm">{staff.address || "Not specified"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-500" />
              Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Email Address</p>
                <p className="text-sm font-medium">{staff.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Phone Number</p>
                <p className="text-sm font-medium">{staff.phone || "N/A"}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Emergency Contact</p>
              <p className="font-medium text-sm">{staff.emergencyContact || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-purple-500" />
              Employment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Primary Role</p>
              <div className="flex items-center gap-2 mt-1">
                {roleBadge(role)}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Employee ID / Staff ID</p>
              <p className="font-mono text-sm font-bold text-primary/90">{staff.userId}</p>
            </div>
            {role === "Warehouse_Manager" && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Assigned Facilities</p>
                <div className="flex flex-wrap gap-2">
                   {Array.isArray(staff.assignedWarehouse) && staff.assignedWarehouse.length > 0 ? (
                      staff.assignedWarehouse.map((w: string) => (
                        <Badge key={w} variant="outline" className="border-blue-500/30 text-blue-700 bg-blue-50/50">
                           {w}
                        </Badge>
                      ))
                   ) : (
                      staff.assignedWarehouse && typeof staff.assignedWarehouse === 'string' ? (
                        <Badge variant="outline" className="border-blue-500/30 text-blue-700 bg-blue-50/50">
                           {staff.assignedWarehouse}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">No facilities assigned</span>
                      )
                   )}
                </div>
              </div>
            )}
           {role === "Admin" && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Department</p>
                <p className="font-medium">{staff.department || "Administration"}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              System Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50">
                <span className="text-sm text-muted-foreground">Last Login</span>
                <span className="text-sm font-medium">
                  {staff.lastLogin ? new Date(staff.lastLogin).toLocaleString() : "Never"}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50">
                <span className="text-sm text-muted-foreground">Account Status</span>
                <Badge variant={staff.status === "Active" ? "default" : "secondary"}>
                  {staff.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/50">
                <span className="text-sm text-muted-foreground">KYC Verification</span>
                <Badge variant="outline" className={staff.kycStatus === "VERIFIED" ? "bg-primary/10 text-primary border-primary/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}>
                  <CheckCircle2 className="w-3 h-3 mr-1" /> {staff.kycStatus || "PENDING"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Access Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/20 rounded-lg border border-border/50">
               <p className="text-sm text-muted-foreground mb-3">This user has the following system roles:</p>
               <div className="flex flex-wrap gap-2">
                  {staff.role?.map((r: string) => (
                    <Badge key={r} variant="secondary" className="px-3 py-1">
                      {r.replace("_", " ")}
                    </Badge>
                  ))}
               </div>
               <Separator className="my-4" />
               <p className="text-xs text-muted-foreground italic">
                 Note: Permissions are inherited from the assigned roles. To modify access, please update the user's role in the edit profile section.
               </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffDetails;
