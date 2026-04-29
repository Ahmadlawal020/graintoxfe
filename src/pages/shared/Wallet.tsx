import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { selectCurrentUser } from "../../services/authSlice";
import { useGetUserByIdQuery } from "../../services/api/userApiSlice";
import {
  useInstantDepositMutation,
  useGetUserTransactionsQuery,
  useVerifyDepositMutation
} from "../../services/api/financeApiSlice";
import { PaystackButton } from "react-paystack";
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
  const [instantDeposit] = useInstantDepositMutation();
  const [verifyDeposit] = useVerifyDepositMutation();

  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [verifyingRef, setVerifyingRef] = useState<string | null>(null);

  // Check for reference in URL (handle redirect from Paystack)
  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (reference) {
      handleAutoVerify(reference);
    }
  }, [searchParams]);

  const handleAutoVerify = async (reference: string) => {
    if (verifyingRef === reference) return;
    setVerifyingRef(reference);
    setLoading(true);
    try {
      console.log("[Wallet] Auto-verifying redirect reference:", reference);
      await verifyDeposit(reference).unwrap();
      toast.success("Deposit verified successfully!");
      setSearchParams({});
    } catch (error: any) {
      console.error("[Wallet] Auto-verification failed:", error);
      toast.error(error.data?.message || "Verification failed");
      setSearchParams({});
    } finally {
      setLoading(false);
      setVerifyingRef(null);
    }
  };

  // Generate a fresh reference for every potential transaction
  const generateRef = () => `GT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  const parsedAmount = parseFloat(amount) || 0;
  const amountInKobo = Math.round(parsedAmount * 100);
  const isValidAmount = parsedAmount >= 100;

  // PaystackButton componentProps — always fresh on each render
  const paystackProps = {
    email: user?.email || "",
    amount: amountInKobo,
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "",
    reference: generateRef(),
    metadata: {
      custom_fields: [
        {
          display_name: "User ID",
          variable_name: "user_id",
          value: user?.id || "",
        }
      ],
      userId: user?.id || "",
      type: "Wallet_Topup",
    },
    text: loading ? "Processing..." : "Paystack Deposit",
    className: "paystack-deposit-btn inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 sm:h-10 px-4 py-2",
    onSuccess: async (reference: any) => {
      const ref = reference.reference || reference.trxref || reference;
      console.log("[Wallet] Paystack onSuccess. Reference:", ref);
      setLoading(true);
      try {
        await verifyDeposit(ref).unwrap();
        toast.success("Deposit successful!");
        setAmount("");
      } catch (error: any) {
        console.error("[Wallet] Verification after payment failed:", error);
        toast.error(error.data?.message || "Verification failed. Your payment was received — contact support if balance doesn't update.");
      } finally {
        setLoading(false);
      }
    },
    onClose: () => {
      console.log("[Wallet] Paystack popup closed");
      toast.info("Payment cancelled");
    },
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
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                  <Input
                    type="number"
                    placeholder="Enter amount (min ₦100)"
                    className="pl-8 h-11 sm:h-10"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading}
                    min="100"
                  />
                </div>
                {isValidAmount ? (
                  <PaystackButton {...paystackProps} />
                ) : (
                  <Button disabled className="h-11 sm:h-10">
                    Paystack Deposit
                  </Button>
                )}
              </div>
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
