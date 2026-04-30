import React, { useState } from "react";
import {
  TrendingDown,
  History,
  Loader2,
  CheckCircle2,
  XCircle,
  Banknote,
  Building2,
  Filter,
  Search,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogTrigger
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  useGetAllTransactionsQuery,
  useProcessWithdrawalMutation,
} from "../../services/api/financeApiSlice";
import { format } from "date-fns";

const Withdrawals = () => {
  const { data: transactions, isLoading: txLoading } = useGetAllTransactionsQuery(undefined);
  const [processWithdrawal, { isLoading: isProcessing }] = useProcessWithdrawalMutation();

  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Pending");

  const withdrawals = transactions?.filter((tx: any) => tx.type === "Withdrawal") || [];
  
  const stats = {
    pendingCount: withdrawals.filter(w => w.status === "Pending").length,
    pendingAmount: withdrawals.filter(w => w.status === "Pending").reduce((acc, w) => acc + w.amount, 0),
    completedCount: withdrawals.filter(w => w.status === "Completed").length,
    completedAmount: withdrawals.filter(w => w.status === "Completed").reduce((acc, w) => acc + w.amount, 0),
  };

  const filteredWithdrawals = withdrawals.filter((tx: any) => {
    const matchesSearch = 
      tx.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || tx.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleProcess = async (transactionId: string, status: "Completed" | "Failed") => {
    try {
      await processWithdrawal({
        transactionId,
        status,
        notes: notes || (status === "Completed" ? "Approved by Admin" : "Rejected by Admin")
      }).unwrap();
      toast.success(`Withdrawal ${status === "Completed" ? "approved" : "rejected"} successfully`);
      setNotes("");
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to process withdrawal");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-2 sm:p-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold text-foreground truncate">Withdrawal Management</h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground truncate">
            Review and authorize currency payouts to users.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
         <Card className="glass-card border-none shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
               <Clock className="h-12 w-12 text-amber-500" />
            </div>
            <CardHeader className="p-3 sm:p-6 pb-0 sm:pb-1">
               <CardDescription className="text-xs font-semibold text-amber-600/70">Pending Requests</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-1 sm:pt-2">
               <div className="text-xl sm:text-3xl font-bold text-amber-600">₦{stats.pendingAmount.toLocaleString()}</div>
               <p className="text-[10px] sm:text-sm text-muted-foreground mt-1">{stats.pendingCount} transactions pending</p>
            </CardContent>
         </Card>

         <Card className="glass-card border-none shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
               <CheckCircle className="h-12 w-12 text-primary" />
            </div>
            <CardHeader className="p-3 sm:p-6 pb-0 sm:pb-1">
               <CardDescription className="text-xs font-semibold text-primary/70">Paid Out</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-1 sm:pt-2">
               <div className="text-xl sm:text-3xl font-bold text-primary">₦{stats.completedAmount.toLocaleString()}</div>
               <p className="text-[10px] sm:text-sm text-muted-foreground mt-1">{stats.completedCount} successful payouts</p>
            </CardContent>
         </Card>

         <Card className="glass-card border-none shadow-sm overflow-hidden relative group hidden sm:block">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
               <Banknote className="h-12 w-12 text-blue-500" />
            </div>
            <CardHeader className="p-3 sm:p-6 pb-0 sm:pb-1">
               <CardDescription className="text-xs font-semibold text-blue-600/70">Total Volume</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-1 sm:pt-2">
               <div className="text-xl sm:text-3xl font-bold text-blue-600">₦{(stats.completedAmount + stats.pendingAmount).toLocaleString()}</div>
               <p className="text-[10px] sm:text-sm text-muted-foreground mt-1">Gross payout volume</p>
            </CardContent>
         </Card>

         <Card className="glass-card border-none shadow-sm overflow-hidden relative group hidden sm:block">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
               <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <CardHeader className="p-3 sm:p-6 pb-0 sm:pb-1">
               <CardDescription className="text-xs font-semibold text-red-600/70">Average Payout</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-1 sm:pt-2">
               <div className="text-xl sm:text-3xl font-bold text-red-600">
                  ₦{stats.completedCount > 0 ? Math.round(stats.completedAmount / stats.completedCount).toLocaleString() : "0"}
               </div>
               <p className="text-[10px] sm:text-sm text-muted-foreground mt-1">Per unique transaction</p>
            </CardContent>
         </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card border-none shadow-sm overflow-hidden">
        <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row gap-3">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search user or ref..." 
                className="pl-10 h-10 bg-muted/20 border-none font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex gap-1 sm:gap-2 overflow-x-auto no-scrollbar pb-1">
              {["Pending", "Completed", "Failed", "All"].map((s) => (
                 <Button 
                   key={s}
                   variant={statusFilter === s ? "default" : "outline"}
                   size="sm"
                   onClick={() => setStatusFilter(s)}
                   className={`h-9 px-3 sm:px-6 font-black uppercase tracking-tighter text-[10px] sm:text-xs shrink-0 ${
                      statusFilter === s ? "shadow-lg shadow-primary/20" : ""
                   }`}
                 >
                    {s}
                 </Button>
              ))}
           </div>
        </CardContent>
      </Card>

      {/* Withdrawal List */}
      <Card className="border-none shadow-xl glass-card overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Banknote className="h-5 w-5 text-primary" />
            Payout Ledger
          </CardTitle>
          <CardDescription className="text-xs">Audit log of all requested currency disbursements.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 pt-0">
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-md border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bank Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredWithdrawals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No withdrawal requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredWithdrawals.map((tx: any) => (
                    <TableRow key={tx._id} className="hover:bg-muted/50 transition">
                      <TableCell>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-sm truncate">
                            {tx.user?.firstName} {tx.user?.lastName}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate">
                            {tx.user?.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                         <span className="text-sm font-black text-primary">₦{tx.amount?.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>
                         <div className="text-[10px] leading-tight">
                            <p className="font-bold">{tx.metadata?.bankDetails?.bankName}</p>
                            <p className="font-mono opacity-70">{tx.metadata?.bankDetails?.accountNumber}</p>
                         </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`text-[10px] px-2 py-0.5 h-auto ${
                            tx.status === "Completed" ? "bg-primary/90 !text-white" :
                            tx.status === "Pending" ? "bg-amber-500 !text-white" :
                            "bg-red-600 !text-white"
                          }`}
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(tx.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                         {tx.status === "Pending" ? (
                            <Dialog>
                               <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-8 font-bold text-[10px] uppercase tracking-wider">
                                     Process
                                  </Button>
                               </DialogTrigger>
                               <DialogContent className="sm:max-w-[425px] border-none shadow-2xl glass-card">
                                  <DialogHeader>
                                     <DialogTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-primary" />
                                        Process Payout
                                     </DialogTitle>
                                     <DialogDescription>Authorize the bank transfer for this user.</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                     <div className="p-4 bg-muted/30 rounded-xl space-y-3 border border-border/50">
                                        <div className="flex justify-between">
                                           <span className="text-xs text-muted-foreground font-black uppercase">Recipient</span>
                                           <span className="text-sm font-bold">{tx.user?.firstName} {tx.user?.lastName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                           <span className="text-xs text-muted-foreground font-black uppercase">User Balance</span>
                                           <span className="text-sm font-bold text-primary">₦{tx.user?.walletBalance?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                           <span className="text-xs text-muted-foreground font-black uppercase">Amount</span>
                                           <span className="text-sm font-black text-amber-600">₦{tx.amount?.toLocaleString()}</span>
                                        </div>
                                        <div className="h-[1px] bg-border/50 w-full" />
                                        <div className="flex justify-between">
                                           <span className="text-xs text-muted-foreground font-black uppercase">Bank</span>
                                           <span className="text-sm font-bold">{tx.metadata?.bankDetails?.bankName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                           <span className="text-xs text-muted-foreground font-black uppercase">Account #</span>
                                           <span className="text-sm font-mono font-black text-primary">{tx.metadata?.bankDetails?.accountNumber}</span>
                                        </div>
                                     </div>
                                     <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase">Payment Reference/Notes</Label>
                                        <Input 
                                           placeholder="e.g. Paid via Transfer" 
                                           value={notes}
                                           onChange={(e) => setNotes(e.target.value)}
                                           className="h-10 bg-muted/30 border-none font-medium"
                                        />
                                     </div>
                                  </div>
                                  <DialogFooter className="flex flex-row gap-2 sm:gap-0">
                                     <Button 
                                        variant="destructive" 
                                        className="flex-1 font-bold"
                                        disabled={isProcessing}
                                        onClick={() => handleProcess(tx._id, "Failed")}
                                     >
                                        <XCircle className="h-4 w-4 mr-2" /> Reject
                                     </Button>
                                     <Button 
                                        className="flex-1 font-bold"
                                        disabled={isProcessing}
                                        onClick={() => handleProcess(tx._id, "Completed")}
                                     >
                                        <CheckCircle2 className="h-4 w-4 mr-2" /> Approve & Paid
                                     </Button>
                                  </DialogFooter>
                               </DialogContent>
                            </Dialog>
                         ) : (
                            <Button variant="ghost" size="sm" className="h-8 text-[10px] opacity-50 cursor-default" disabled>
                               Processed
                            </Button>
                         )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3 p-3 sm:p-0">
             {txLoading ? (
                <div className="flex justify-center py-10">
                   <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
             ) : filteredWithdrawals.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm border rounded-lg border-dashed">
                   No payout requests found.
                </div>
             ) : (
                filteredWithdrawals.map((tx: any) => (
                   <div key={tx._id} className="p-4 rounded-xl bg-card border border-border/50 shadow-sm space-y-4">
                      <div className="flex justify-between items-start">
                         <div className="min-w-0">
                            <p className="font-black text-sm truncate">{tx.user?.firstName} {tx.user?.lastName}</p>
                            <p className="text-[10px] text-muted-foreground truncate">{tx.user?.email}</p>
                         </div>
                         <Badge 
                           className={`text-[9px] px-2 py-0.5 h-auto ${
                             tx.status === "Completed" ? "bg-primary/90 !text-white" :
                             tx.status === "Pending" ? "bg-amber-500 !text-white" :
                             "bg-red-600 !text-white"
                           }`}
                         >
                           {tx.status}
                         </Badge>
                      </div>

                      <div className="flex items-center justify-between py-2 border-y border-dashed border-border/50">
                         <div>
                            <p className="text-[10px] text-muted-foreground font-black uppercase">Amount</p>
                            <p className="text-lg font-black text-primary">₦{tx.amount?.toLocaleString()}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] text-muted-foreground font-black uppercase">Bank</p>
                            <p className="text-[11px] font-bold">{tx.metadata?.bankDetails?.bankName}</p>
                            <p className="text-[10px] font-mono opacity-60">{tx.metadata?.bankDetails?.accountNumber}</p>
                         </div>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                         <p className="text-[10px] text-muted-foreground">
                            {format(new Date(tx.createdAt), "MMM dd, yyyy")}
                         </p>
                         {tx.status === "Pending" ? (
                            <Dialog>
                               <DialogTrigger asChild>
                                  <Button size="sm" className="h-8 px-6 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                                     Process
                                  </Button>
                               </DialogTrigger>
                               <DialogContent className="w-[95%] max-w-[425px] rounded-2xl border-none shadow-2xl glass-card mx-auto">
                                  <DialogHeader>
                                     <DialogTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-primary" />
                                        Process Payout
                                     </DialogTitle>
                                     <DialogDescription>Authorize the bank transfer for this user.</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                     <div className="p-4 bg-muted/30 rounded-xl space-y-3 border border-border/50">
                                        <div className="flex justify-between">
                                           <span className="text-[10px] text-muted-foreground font-black uppercase">Recipient</span>
                                           <span className="text-sm font-bold">{tx.user?.firstName} {tx.user?.lastName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                           <span className="text-[10px] text-muted-foreground font-black uppercase">Current Balance</span>
                                           <span className="text-sm font-bold text-primary">₦{tx.user?.walletBalance?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                           <span className="text-[10px] text-muted-foreground font-black uppercase">Amount</span>
                                           <span className="text-sm font-black text-amber-600">₦{tx.amount?.toLocaleString()}</span>
                                        </div>
                                        <div className="h-[1px] bg-border/50 w-full" />
                                        <div className="flex justify-between">
                                           <span className="text-[10px] text-muted-foreground font-black uppercase">Bank</span>
                                           <span className="text-sm font-bold">{tx.metadata?.bankDetails?.bankName}</span>
                                        </div>
                                        <div className="flex justify-between">
                                           <span className="text-[10px] text-muted-foreground font-black uppercase">Account #</span>
                                           <span className="text-sm font-mono font-black text-primary">{tx.metadata?.bankDetails?.accountNumber}</span>
                                        </div>
                                     </div>
                                     <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase">Notes</Label>
                                        <Input 
                                           placeholder="Internal ref..." 
                                           value={notes}
                                           onChange={(e) => setNotes(e.target.value)}
                                           className="h-10 bg-muted/30 border-none font-medium"
                                        />
                                     </div>
                                  </div>
                                  <DialogFooter className="flex flex-row gap-2">
                                     <Button 
                                        variant="destructive" 
                                        className="flex-1 font-bold text-xs h-10"
                                        disabled={isProcessing}
                                        onClick={() => handleProcess(tx._id, "Failed")}
                                     >
                                        Reject
                                     </Button>
                                     <Button 
                                        className="flex-1 font-bold text-xs h-10"
                                        disabled={isProcessing}
                                        onClick={() => handleProcess(tx._id, "Completed")}
                                     >
                                        Approve
                                     </Button>
                                  </DialogFooter>
                               </DialogContent>
                            </Dialog>
                         ) : (
                            <Badge variant="secondary" className="text-[9px] uppercase font-bold tracking-widest opacity-50">Processed</Badge>
                         )}
                      </div>
                   </div>
                ))
             )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Withdrawals;
