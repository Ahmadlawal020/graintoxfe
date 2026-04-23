import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { selectCurrentUser } from "../../services/authSlice";
import { useGetUserByIdQuery } from "../../services/api/userApiSlice";
import {
  useInitializeDepositMutation,
  useInstantDepositMutation,
  useGetUserTransactionsQuery,
  useVerifyDepositMutation
} from "../../services/api/financeApiSlice";
import { usePaystackPayment } from "react-paystack";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Wallet as WalletIcon, ArrowUpCircle, History, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const Wallet = () => {
  const user = useSelector(selectCurrentUser);
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: userData, isLoading: userLoading } = useGetUserByIdQuery(user?.id || "");
  const { data: transactions, isLoading: txLoading } = useGetUserTransactionsQuery(undefined);
  const [initializeDeposit] = useInitializeDepositMutation();
  const [instantDeposit] = useInstantDepositMutation();
  const [verifyDeposit] = useVerifyDepositMutation();

  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Generate a unique reference once per deposit session or stable enough
  const [txRef, setTxRef] = useState((new Date()).getTime().toString());

  // Check for reference in URL (handle redirect)
  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (reference) {
      handleAutoVerify(reference);
    }
  }, [searchParams]);

  const handleAutoVerify = async (reference: string) => {
    setLoading(true);
    try {
      await verifyDeposit(reference).unwrap();
      toast.success("Deposit verified successfully!");
      // Clear search params to avoid re-verification on refresh
      setSearchParams({});
    } catch (error: any) {
      console.error("Auto-verification failed:", error);
      toast.error(error.data?.message || "Verification failed");
      setSearchParams({});
    } finally {
      setLoading(false);
    }
  };

  // Paystack config
  const config = {
    reference: txRef,
    email: user?.email || "",
    amount: parseFloat(amount) * 100, // Amount in kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_placeholder",
  };

  const onSuccess = async (reference: any) => {
    setLoading(true);
    try {
      await verifyDeposit(reference.reference).unwrap();
      toast.success("Deposit successful!");
      setAmount("");
      setTxRef((new Date()).getTime().toString()); // Refresh reference for next time
    } catch (error: any) {
      toast.error(error.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const onClose = () => {
    toast.info("Transaction cancelled");
    setLoading(false);
  };

  const initializePayment = usePaystackPayment(config);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Generate a fresh reference for this specific attempt
    const newRef = (new Date()).getTime().toString();
    setTxRef(newRef);

    setLoading(true);
    try {
      // 1. Initialize on the backend with this reference
      const response = await initializeDeposit({
        amount: parseFloat(amount),
        reference: newRef
      }).unwrap();

      console.log("[Wallet] Backend initialized:", response);

      // 2. Open Paystack popup using the hook
      // Pass the config directly to initializePayment to ensure it uses the fresh reference
      const paymentConfig = {
        ...config,
        reference: newRef,
        onSuccess: (response: any) => onSuccess(response),
        onClose: () => onClose(),
      };

      initializePayment(paymentConfig);

    } catch (error: any) {
      console.error("Deposit error:", error);
      toast.error(error.data?.message || "Failed to initialize deposit");
      setLoading(false);
    }
  };

  const handleInstantDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      console.log("[Wallet] Initiating instant deposit for amount:", amount);
      const result = await instantDeposit({ amount: parseFloat(amount) }).unwrap();
      console.log("[Wallet] Instant deposit result:", result);
      toast.success("Instant deposit successful!");
      setAmount("");
    } catch (error: any) {
      console.error("[Wallet] Instant deposit error:", error);
      toast.error(error.data?.message || "Failed to process instant deposit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance & Wallet</h1>
          <p className="text-muted-foreground">Manage your funds and track your trading history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary/70">Available Balance</CardDescription>
            <CardTitle className="text-4xl font-bold flex items-center gap-2">
              ₦{userData?.walletBalance?.toLocaleString() || "0.00"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <WalletIcon className="w-4 h-4" />
              <span>Personal Wallet</span>
            </div>
          </CardContent>
        </Card>

        {/* Deposit Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5 text-green-500" />
              Top Up Wallet
            </CardTitle>
            <CardDescription>Add money to your account using Paystack.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <form onSubmit={handleDeposit} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    className="pl-8 h-11 sm:h-10"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" disabled={loading || !amount} className="h-11 sm:h-10">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Paystack Deposit
                </Button>
              </form>
              <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-border"></div>
                <span className="text-xs text-muted-foreground uppercase font-medium">Or for testing</span>
                <div className="h-[1px] flex-1 bg-border"></div>
              </div>
              <Button
                variant="outline"
                className="w-full border-dashed border-primary/40 hover:bg-primary/5 text-primary"
                onClick={handleInstantDeposit}
                disabled={loading || !amount}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                <ArrowUpCircle className="w-4 h-4 mr-2" />
                Instant Deposit (No Payment Required)
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Secure payments powered by Paystack. Minimum deposit: ₦100.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Recent Transactions
            </CardTitle>
            <CardDescription>A history of your deposits and trades.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : transactions?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions?.map((tx: any) => (
                    <TableRow key={tx._id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {format(new Date(tx.createdAt), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="font-medium">{tx.description || tx.type}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{tx.type.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell className={tx.type.includes("Deposit") || tx.type.includes("Topup") ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                        {tx.type.includes("Deposit") || tx.type.includes("Topup") ? "+" : "-"}
                        ₦{tx.amount?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            tx.status === "Completed" ? "bg-green-100 text-green-700 hover:bg-green-100" :
                              tx.status === "Pending" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" :
                                "bg-red-100 text-red-700 hover:bg-red-100"
                          }
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile List View */}
          <div className="block md:hidden space-y-4">
            {txLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : transactions?.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm border rounded-lg border-dashed">
                No transactions found.
              </div>
            ) : (
              transactions?.map((tx: any) => (
                <div key={tx._id} className="p-4 border rounded-xl space-y-3 bg-card/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-sm">{tx.description || tx.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(tx.createdAt), "MMM dd, HH:mm")}
                      </p>
                    </div>
                    <Badge
                      className={
                        tx.status === "Completed" ? "bg-green-100 text-green-700 hover:bg-green-100" :
                          tx.status === "Pending" ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" :
                            "bg-red-100 text-red-700 hover:bg-red-100"
                      }
                    >
                      {tx.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-dashed">
                    <Badge variant="secondary" className="text-[10px] uppercase tracking-wider h-5">
                      {tx.type.replace("_", " ")}
                    </Badge>
                    <p className={`text-lg font-bold ${tx.type.includes("Deposit") || tx.type.includes("Topup") ? "text-green-600" : "text-red-600"}`}>
                      {tx.type.includes("Deposit") || tx.type.includes("Topup") ? "+" : "-"}
                      ₦{tx.amount?.toLocaleString()}
                    </p>
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

export default Wallet;
