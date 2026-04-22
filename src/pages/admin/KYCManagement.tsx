import React, { useState } from "react";
import {
  ShieldCheck,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  User,
  AlertTriangle,
  Filter,
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

import { useGetKycSubmissionsQuery } from "@/services/api/userApiSlice";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

const KYCManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const { data: users = [], isLoading, isError, error } = useGetKycSubmissionsQuery(undefined);
  
  // Handle 404 as "No submissions yet" rather than a hard error
  const isNoSubmissions = isError && (error as any)?.status === 404;

  const filteredApplications = users.filter((app: any) => {
    const fullName = `${app.title || ''} ${app.firstName || ''} ${app.lastName || ''}`.trim();
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const appKycStatus = app.kycStatus || "PENDING";
    const matchesStatus = statusFilter === "all" || appKycStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getRiskLevel = (status: string) => {
    if (status === "VERIFIED") return "Low";
    if (status === "REJECTED") return "High";
    return "Medium";
  };

  const getStatusCount = (status: string) => users.filter((u: any) => (u.kycStatus || "PENDING") === status).length;

  const stats = {
    total: users.length,
    pending: getStatusCount("PENDING"),
    underReview: getStatusCount("UNDER_REVIEW"),
    verified: getStatusCount("VERIFIED"),
    rejected: getStatusCount("REJECTED"),
  };

  if (isLoading) {
    return <div className="p-4 space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 w-full" /></div>;
  }

  const statusBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; class: string; label: string }> = {
      PENDING: { icon: <Clock className="w-3 h-3 mr-1" />, class: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "Pending" },
      UNDER_REVIEW: { icon: <Eye className="w-3 h-3 mr-1" />, class: "bg-blue-500/10 text-blue-500 border-blue-500/20", label: "Under Review" },
      VERIFIED: { icon: <CheckCircle2 className="w-3 h-3 mr-1" />, class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "Verified" },
      REJECTED: { icon: <XCircle className="w-3 h-3 mr-1" />, class: "bg-red-500/10 text-red-500 border-red-500/20", label: "Rejected" },
    };
    const c = config[status] || config.PENDING;
    return (
      <Badge variant="outline" className={`${c.class} flex items-center w-fit`}>
        {c.icon} {c.label}
      </Badge>
    );
  };

  const riskBadge = (level: string) => {
    const colors: Record<string, string> = {
      Low: "bg-emerald-600",
      Medium: "bg-amber-500",
      High: "bg-red-500",
    };
    return <Badge className={`${colors[level]} text-white text-[10px]`}>{level} Risk</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <header>
        <h1 className="text-3xl font-bold text-foreground">KYC Management</h1>
        <p className="text-muted-foreground">
          Review and process identity verification applications
        </p>
      </header>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Applications", value: stats.total, icon: FileText, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { title: "Pending Review", value: stats.pending + stats.underReview, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { title: "Verified", value: stats.verified, icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                KYC Applications
              </CardTitle>
              <CardDescription>
                Review submitted documents and approve/reject verifications
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter & Search */}
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background text-sm"
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isNoSubmissions ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText className="h-8 w-8 opacity-20" />
                        <p>No KYC applications found yet.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app: any) => {
                    const role = app.role?.[0] || "Unknown";
                    const kycStatus = app.kycStatus || "PENDING";
                    return (
                    <TableRow key={app._id} className="cursor-pointer hover:bg-muted/50 transition" onClick={() => navigate(`/kyc/${app._id}`)}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <img 
                            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${app.email}`} 
                            alt="avatar" 
                            className="h-10 w-10 rounded-full border border-emerald-500/20 bg-emerald-500/10" 
                          />
                          <div>
                            <div className="font-medium text-foreground">{app.title} {app.firstName} {app.lastName}</div>
                            <div className="text-xs text-muted-foreground">{app.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">
                          {role.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{app.kycDocType || "National ID"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(app.kycSubmittedAt || app.createdAt || Date.now()).toLocaleDateString("en-NG", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{riskBadge(getRiskLevel(kycStatus))}</TableCell>
                      <TableCell>{statusBadge(kycStatus)}</TableCell>
                      <TableCell className="text-right">
                        <Button onClick={(e) => { e.stopPropagation(); navigate(`/kyc/${app._id}`); }} variant="default" size="sm" className="h-8 shadow-sm">
                          Review Details
                        </Button>
                      </TableCell>
                    </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCManagement;
