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
} from "lucide-react";
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
} from "../../services/api/financeApiSlice";
import { format } from "date-fns";

const WalletFinance = () => {
  const { data: transactions, isLoading: txLoading } = useGetAllTransactionsQuery(undefined);
  const { data: summary, isLoading: summaryLoading } = useGetFinancialSummaryQuery(undefined);

  const totalDeposits = summary?.totalDeposits || 0;

  return (
    <div className="space-y-6 animate-fade-in p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financial Overview</h1>
          <p className="text-muted-foreground">
            Platform-wide financial metrics and transaction history.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{totalDeposits.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              Cumulative wallet top-ups
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trades (Escrow)</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <CreditCard className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦0.00</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              Currently held in escrow
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10">
              <History className="h-4 w-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions?.length || 0}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              All-time transaction count
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10">
              <ArrowDownToLine className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions?.filter((t: any) => t.status === "Pending").length || 0}
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              Transactions awaiting resolution
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Global Transaction History</CardTitle>
          <CardDescription>Comprehensive list of all financial activities on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
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
                        <div className="flex flex-col">
                          <span className="font-medium">{tx.user?.firstName} {tx.user?.lastName}</span>
                          <span className="text-xs text-muted-foreground">{tx.user?.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{tx.type.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-primary">₦{tx.amount?.toLocaleString()}</TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{tx.reference}</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            tx.status === "Completed" ? "bg-primary/90 text-foreground" :
                            tx.status === "Pending" ? "bg-amber-500 text-foreground" :
                            "bg-red-600 text-foreground"
                          }
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(tx.createdAt), "MMM dd, yyyy HH:mm")}
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
