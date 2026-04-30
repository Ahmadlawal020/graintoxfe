import React, { useState } from "react";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Send,
  ArrowDownToLine,
  CreditCard,
  History,
  Loader2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Banknote,
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
  useGetFinancialSummaryQuery,
  useProcessWithdrawalMutation,
} from "../../services/api/financeApiSlice";
import { format } from "date-fns";

const WalletFinance = () => {
  const { data: transactions, isLoading: txLoading } = useGetAllTransactionsQuery(undefined);
  const { data: summary, isLoading: summaryLoading } = useGetFinancialSummaryQuery(undefined);
  const [processWithdrawal, { isLoading: isProcessing }] = useProcessWithdrawalMutation();

  const [notes, setNotes] = useState("");
  const [selectedTx, setSelectedTx] = useState<any>(null);

  const totalDeposits = summary?.totalDeposits || 0;

  const pendingWithdrawals = transactions?.filter((tx: any) => tx.type === "Withdrawal" && tx.status === "Pending") || [];

  const handleProcess = async (transactionId: string, status: "Completed" | "Failed") => {
    try {
      await processWithdrawal({
        transactionId,
        status,
        notes: notes || (status === "Completed" ? "Approved by Admin" : "Rejected by Admin")
      }).unwrap();
      toast.success(`Withdrawal ${status === "Completed" ? "approved" : "rejected"} successfully`);
      setSelectedTx(null);
      setNotes("");
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to process withdrawal");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in p-2 sm:p-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold text-foreground truncate">Financial Overview</h1>
          <p className="text-[10px] sm:text-sm text-muted-foreground truncate">
            Platform metrics & history.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none h-8 text-[10px] sm:text-xs">
            <Download className="mr-2 h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-4">
            <CardTitle className="text-[10px] sm:text-sm font-medium truncate">Total Deposits</CardTitle>
            <div className="p-1 sm:p-2 rounded-lg bg-primary/10 shrink-0">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-0">
            <div className="text-sm sm:text-2xl font-bold truncate">₦{totalDeposits.toLocaleString()}</div>
            <div className="text-[8px] sm:text-xs text-muted-foreground mt-0.5 truncate">Wallet top-ups</div>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-4">
            <CardTitle className="text-[10px] sm:text-sm font-medium truncate">Escrow</CardTitle>
            <div className="p-1 sm:p-2 rounded-lg bg-blue-500/10 shrink-0">
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-0">
            <div className="text-sm sm:text-2xl font-bold truncate">₦0.00</div>
            <div className="text-[8px] sm:text-xs text-muted-foreground mt-0.5 truncate">Held in escrow</div>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-4">
            <CardTitle className="text-[10px] sm:text-sm font-medium truncate">Total Tx</CardTitle>
            <div className="p-1 sm:p-2 rounded-lg bg-purple-500/10 shrink-0">
              <History className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-0">
            <div className="text-sm sm:text-2xl font-bold truncate">{transactions?.length || 0}</div>
            <div className="text-[8px] sm:text-xs text-muted-foreground mt-0.5 truncate">Total count</div>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-4">
            <CardTitle className="text-[10px] sm:text-sm font-medium truncate">Pending</CardTitle>
            <div className="p-1 sm:p-2 rounded-lg bg-amber-500/10 shrink-0">
              <ArrowDownToLine className="h-3 w-3 sm:h-4 sm:w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-0">
            <div className="text-sm sm:text-2xl font-bold truncate">
              {transactions?.filter((t: any) => t.status === "Pending").length || 0}
            </div>
            <div className="text-[8px] sm:text-xs text-muted-foreground mt-0.5 truncate">Awaiting resolution</div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Withdrawals Section */}
      {pendingWithdrawals.length > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/5 shadow-lg animate-in slide-in-from-top duration-500">
           <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-amber-600" />
                    <CardTitle className="text-amber-900">Pending Withdrawal Requests</CardTitle>
                 </div>
                 <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20">
                    {pendingWithdrawals.length} Attention Required
                 </Badge>
              </div>
              <CardDescription className="text-amber-700/70">Review and authorize currency payouts to users.</CardDescription>
           </CardHeader>
           <CardContent>
              <div className="space-y-4">
                 {pendingWithdrawals.map((tx: any) => (
                    <div key={tx._id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl bg-background border border-amber-500/20 shadow-sm hover:shadow-md transition-all gap-4">
                       <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                             <TrendingDown className="h-5 w-5 text-amber-600" />
                          </div>
                          <div className="min-w-0">
                             <p className="text-sm font-bold truncate">{tx.user?.firstName} {tx.user?.lastName}</p>
                             <p className="text-[10px] text-muted-foreground truncate">{tx.user?.email}</p>
                          </div>
                          <div className="hidden sm:block h-8 w-[1px] bg-border mx-2" />
                          <div>
                             <p className="text-sm font-black text-amber-600">₦{tx.amount?.toLocaleString()}</p>
                             <p className="text-[10px] text-muted-foreground font-medium">{format(new Date(tx.createdAt), "MMM dd, HH:mm")}</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full md:w-auto">
                          <Dialog>
                             <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9 border-amber-500/20 hover:bg-amber-50 text-amber-700 font-bold">
                                   View Bank Info
                                </Button>
                             </DialogTrigger>
                             <DialogContent className="sm:max-w-[425px] border-none shadow-2xl glass-card">
                                <DialogHeader>
                                   <DialogTitle className="flex items-center gap-2">
                                      <Building2 className="h-5 w-5 text-primary" />
                                      Recipient Bank Details
                                   </DialogTitle>
                                   <DialogDescription>Verify the following information before authorizing payment.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                   <div className="p-4 bg-muted/30 rounded-xl space-y-3">
                                      <div className="flex justify-between">
                                         <span className="text-xs text-muted-foreground font-black uppercase">Bank Name</span>
                                         <span className="text-sm font-bold text-right">{tx.metadata?.bankDetails?.bankName || "N/A"}</span>
                                      </div>
                                      <div className="flex justify-between">
                                         <span className="text-xs text-muted-foreground font-black uppercase">Account Number</span>
                                         <span className="text-sm font-mono font-black text-primary text-right">{tx.metadata?.bankDetails?.accountNumber || "N/A"}</span>
                                      </div>
                                      <div className="flex justify-between">
                                         <span className="text-xs text-muted-foreground font-black uppercase">Account Name</span>
                                         <span className="text-sm font-bold text-right">{tx.metadata?.bankDetails?.accountName || "N/A"}</span>
                                      </div>
                                   </div>
                                   <div className="space-y-2">
                                      <Label className="text-xs font-black uppercase">Admin Notes (Optional)</Label>
                                      <Input 
                                         placeholder="Internal reference or reason..." 
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
                       </div>
                    </div>
                 ))}
              </div>
           </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Global Transaction History</CardTitle>
          <CardDescription>Comprehensive list of all financial activities on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="hidden lg:table-cell">Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell text-right">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : transactions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No transactions recorded.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions?.map((tx: any) => (
                    <TableRow key={tx._id} className="hover:bg-muted/50 transition">
                      <TableCell>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-xs sm:text-sm truncate max-w-[100px] sm:max-w-none">
                            {tx.user?.firstName} {tx.user?.lastName}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[100px] sm:max-w-none">
                            {tx.user?.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline" className="text-[10px] py-0">{tx.type.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-primary text-xs sm:text-sm">
                        ₦{tx.amount?.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-[10px] font-mono text-muted-foreground hidden lg:table-cell">
                        {tx.reference}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`text-[9px] sm:text-[10px] px-1.5 py-0 h-4 sm:h-5 ${
                            tx.status === "Completed" ? "bg-primary/90 !text-white" :
                            tx.status === "Pending" ? "bg-amber-500 !text-white" :
                            "bg-red-600 !text-white"
                          }`}
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[10px] sm:text-sm text-muted-foreground hidden md:table-cell text-right">
                        {format(new Date(tx.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletFinance;
