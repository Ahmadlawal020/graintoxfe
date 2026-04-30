import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Search,
  Wheat,
  ArrowDownToLine,
  ArrowUpFromLine,
  Scale,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Filter,
  Plus,
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
import { useGetStorageOperationsQuery } from "@/services/api/storageApiSlice";
import { useGetPlatformUsersQuery } from "@/services/api/userApiSlice";
import { Skeleton } from "@/components/ui/skeleton";

const StorageOperations = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: operations = [], isLoading, isError } = useGetStorageOperationsQuery(undefined);
  const { data: users = [] } = useGetPlatformUsersQuery(undefined);

  const mappedOps = operations.map((op: any) => {
    const depositorData = users.find((u: any) => u._id === op.user);
    const investorName = depositorData ? `${depositorData.firstName} ${depositorData.lastName}` : (op.user ? `ID: ${op.user.substring(0,8)}` : "Unknown");
    return { ...op, investor: investorName };
  });

  const filteredOps = mappedOps.filter((op: any) => {
    const commodityName = op.commodity?.name || "";
    const warehouseName = op.warehouse?.name || "";
    const investorName = op.investor || "";
    const receiptNo = op.receiptNo || "";

    const matchesSearch =
      commodityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warehouseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      investorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receiptNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || op.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: mappedOps.length,
    deposits: mappedOps.filter((o: any) => o.type === "DEPOSIT").length,
    withdrawals: mappedOps.filter((o: any) => o.type === "WITHDRAWAL").length,
    pending: mappedOps.filter((o: any) => o.qcStatus === "PENDING").length,
  };

  const typeBadge = (type: string) => {
    const config: Record<string, { icon: React.ReactNode; class: string }> = {
      DEPOSIT: { icon: <ArrowDownToLine className="w-3 h-3 mr-1" />, class: "bg-primary/10 text-primary border-primary/20" },
      WITHDRAWAL: { icon: <ArrowUpFromLine className="w-3 h-3 mr-1" />, class: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
      TRANSFER: { icon: <Building2 className="w-3 h-3 mr-1" />, class: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    };
    const c = config[type] || config.DEPOSIT;
    return (
      <Badge variant="outline" className={`${c.class} flex items-center w-fit`}>
        {c.icon} {type}
      </Badge>
    );
  };

  const qcBadge = (status: string) => {
    const config: Record<string, { icon: React.ReactNode; class: string }> = {
      PASSED: { icon: <CheckCircle2 className="w-3 h-3 mr-1" />, class: "text-primary" },
      PENDING: { icon: <Clock className="w-3 h-3 mr-1" />, class: "text-amber-500" },
      FAILED: { icon: <AlertTriangle className="w-3 h-3 mr-1" />, class: "text-red-500" },
    };
    const c = config[status] || config.PENDING;
    return (
      <span className={`flex items-center text-sm font-medium ${c.class}`}>
        {c.icon} {status}
      </span>
    );
  };
  if (isLoading) {
    return (
      <div className="space-y-6 p-2">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full rounded-lg" />)}
        </div>
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-64 text-center">
        <p className="text-destructive font-bold text-xl">Failed to load storage records.</p>
        <p className="text-muted-foreground mt-2">Verify storage API connection.</p>
      </div>
    );
  }
  return (
    <div className="space-y-6 animate-fade-in p-4 md:p-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Storage Operations</h1>
          <p className="text-muted-foreground">
            Track grain deposits, withdrawals, and inter-warehouse transfers
          </p>
        </div>
        <Button className="bg-primary/90 hover:bg-primary/90 !text-white shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" />
          Log Operation
        </Button>
      </header>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Operations", value: stats.total, icon: ClipboardList, color: "text-primary", bg: "bg-primary/10" },
          { title: "Deposits", value: stats.deposits, icon: ArrowDownToLine, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Withdrawals", value: stats.withdrawals, icon: ArrowUpFromLine, color: "text-purple-500", bg: "bg-purple-500/10" },
          { title: "Pending QC", value: stats.pending, icon: Scale, color: "text-amber-500", bg: "bg-amber-500/10" },
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

      {/* Operations Log */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                Operations Log
              </CardTitle>
              <CardDescription>All warehouse operations with quality control status</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by commodity, warehouse, investor, or receipt..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border rounded-md bg-background text-sm"
              aria-label="Filter by type"
            >
              <option value="all">All Types</option>
              <option value="DEPOSIT">Deposits</option>
              <option value="WITHDRAWAL">Withdrawals</option>
              <option value="TRANSFER">Transfers</option>
            </select>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="hidden md:table-cell">Commodity</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead className="hidden lg:table-cell">Warehouse</TableHead>
                  <TableHead className="hidden xl:table-cell">Investor</TableHead>
                  <TableHead>QC Status</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOps.map((op: any) => (
                  <TableRow key={op._id} className="hover:bg-muted/50 transition cursor-pointer" onClick={() => navigate(`/storage/${op._id}`)}>
                    <TableCell className="font-mono text-[10px] sm:text-xs font-medium text-primary/90 truncate max-w-[80px] sm:max-w-none">
                      {op.receiptNo}
                    </TableCell>
                    <TableCell>
                      <div className="scale-90 sm:scale-100 origin-left">
                        {typeBadge(op.type)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Wheat className="h-4 w-4 text-primary" />
                        <span className="font-medium">{op.commodity?.name || "Unknown"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-xs sm:text-sm">
                      {op.quantity} <span className="text-[10px] font-normal text-muted-foreground">{op.unit}</span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate hidden lg:table-cell">{op.warehouse?.name || "N/A"}</TableCell>
                    <TableCell className="text-sm hidden xl:table-cell">{op.investor}</TableCell>
                    <TableCell>
                      <div className="scale-90 sm:scale-100 origin-left">
                        {qcBadge(op.qcStatus)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground hidden md:table-cell text-right">
                      {new Date(op.timestamp).toLocaleDateString("en-NG", {
                        day: "numeric", month: "short",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StorageOperations;
