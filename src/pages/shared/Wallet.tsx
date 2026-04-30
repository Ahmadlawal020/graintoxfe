import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { selectCurrentUser } from "../../services/authSlice";
import { useGetUserByIdQuery } from "../../services/api/userApiSlice";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { 
  useInitializeDepositMutation, 
  useInstantDepositMutation, 
  useGetUserTransactionsQuery, 
  useVerifyDepositMutation,
  useRequestWithdrawalMutation 
} from "../../services/api/financeApiSlice";
import { PaystackButton } from "react-paystack";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { Badge } from "../../components/ui/badge";
import { Wallet as WalletIcon, ArrowUpCircle, ArrowDownCircle, History, Loader2, Building2, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";

const Wallet = () => {
  const user = useSelector(selectCurrentUser);
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: userData, isLoading: userLoading } = useGetUserByIdQuery(user?.id || "");
  const { data: transactions, isLoading: txLoading, refetch: txRefetch } = useGetUserTransactionsQuery(undefined);
  const [instantDeposit] = useInstantDepositMutation();
  const [verifyDeposit] = useVerifyDepositMutation();
  const [requestWithdrawal] = useRequestWithdrawalMutation();

  const [amount, setAmount] = useState<string>("");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNumber: "",
    accountName: ""
  });
  const [loading, setLoading] = useState(false);
  const [verifyingRef, setVerifyingRef] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  // Sync bank details when userData loads
  useEffect(() => {
    if (userData?.bankAccount) {
      setBankDetails({
        bankName: userData.bankAccount.bankName || "",
        accountNumber: userData.bankAccount.accountNumber || "",
        accountName: userData.bankAccount.accountName || ""
      });
    }
  }, [userData]);

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

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(withdrawAmount);
    
    if (!withdrawAmount || parsed <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parsed > (userData?.walletBalance || 0)) {
      toast.error("Insufficient balance");
      return;
    }

    if (!bankDetails.bankName || !bankDetails.accountNumber || !bankDetails.accountName) {
      toast.error("Please fill in all bank details");
      return;
    }

    setLoading(true);
    try {
      await requestWithdrawal({
        amount: parsed,
        ...bankDetails
      }).unwrap();
      toast.success("Withdrawal request submitted! Pending admin approval.");
      setWithdrawAmount("");
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to submit withdrawal request");
    } finally {
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-primary/5 border-primary/20 shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription className="text-primary/70 font-medium">Available Balance</CardDescription>
              <CardTitle className="text-4xl font-bold flex items-center gap-2">
                ₦{userData?.walletBalance?.toLocaleString() || "0.00"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <WalletIcon className="w-4 h-4 text-primary/60" />
                <span>Personal Wallet</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
             <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                   <Building2 className="w-4 h-4 text-primary" />
                   Saved Bank Details
                </CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                {userData?.bankAccount?.accountNumber ? (
                  <div className="space-y-2">
                    <div className="p-3 bg-muted/30 rounded-lg">
                       <p className="text-[10px] text-muted-foreground uppercase font-black">Bank</p>
                       <p className="text-sm font-bold">{userData.bankAccount.bankName}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                       <p className="text-[10px] text-muted-foreground uppercase font-black">Account</p>
                       <p className="text-sm font-bold">{userData.bankAccount.accountNumber}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No bank account saved. Fill the withdrawal form to save.</p>
                )}
             </CardContent>
          </Card>
        </div>

        {/* Finance Actions Tabs */}
        <Card className="lg:col-span-2 shadow-xl border-none glass-card">
          <Tabs defaultValue="deposit" className="w-full">
            <div className="px-6 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/50 pb-4">
               <div>
                  <CardTitle className="text-xl">Financial Actions</CardTitle>
                  <CardDescription>Deposit funds or request a withdrawal.</CardDescription>
               </div>
               <TabsList className="bg-muted/50 p-1">
                 <TabsTrigger value="deposit" className="flex items-center gap-2">
                    <ArrowUpCircle className="w-4 h-4" /> Deposit
                 </TabsTrigger>
                 <TabsTrigger value="withdraw" className="flex items-center gap-2">
                    <ArrowDownCircle className="w-4 h-4" /> Withdraw
                 </TabsTrigger>
               </TabsList>
            </div>

            <TabsContent value="deposit" className="p-6 mt-0">
               <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
                      <Input
                        type="number"
                        placeholder="Enter amount (min ₦100)"
                        className="pl-8 h-12 bg-muted/30 border-none font-bold"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={loading}
                        min="100"
                      />
                    </div>
                    {isValidAmount ? (
                      <PaystackButton {...paystackProps} />
                    ) : (
                      <Button disabled className="h-12 px-8">
                        Paystack Deposit
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-4 py-2">
                    <div className="h-[1px] flex-1 bg-border"></div>
                    <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Sandbox Mode</span>
                    <div className="h-[1px] flex-1 bg-border"></div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full h-12 border-dashed border-primary/40 hover:bg-primary/5 text-primary font-bold"
                    onClick={handleInstantDeposit}
                    disabled={loading || !amount}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    <ArrowUpCircle className="w-4 h-4 mr-2" />
                    Instant Demo Deposit
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground italic text-center">
                  Payments are secure and processed instantly via Paystack.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="withdraw" className="p-6 mt-0">
               <form onSubmit={handleRequestWithdrawal} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-2 sm:col-span-2">
                        <Label className="text-xs font-black uppercase text-muted-foreground">Withdrawal Amount</Label>
                        <div className="relative">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₦</span>
                           <Input
                             type="number"
                             placeholder="0.00"
                             className="pl-8 h-12 bg-muted/30 border-none font-bold text-lg"
                             value={withdrawAmount}
                             onChange={(e) => setWithdrawAmount(e.target.value)}
                             disabled={loading}
                           />
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium">Max: ₦{userData?.walletBalance?.toLocaleString()}</p>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-muted-foreground">Bank Name</Label>
                        <Input
                          placeholder="e.g. Zenith Bank"
                          className="h-12 bg-muted/30 border-none font-bold"
                          value={bankDetails.bankName}
                          onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                          disabled={loading}
                        />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-muted-foreground">Account Number</Label>
                        <Input
                          placeholder="10 Digits"
                          className="h-12 bg-muted/30 border-none font-bold"
                          value={bankDetails.accountNumber}
                          onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                          disabled={loading}
                        />
                     </div>
                     <div className="space-y-2 sm:col-span-2">
                        <Label className="text-xs font-black uppercase text-muted-foreground">Account Name</Label>
                        <Input
                          placeholder="Beneficiary Name"
                          className="h-12 bg-muted/30 border-none font-bold"
                          value={bankDetails.accountName}
                          onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                          disabled={loading}
                        />
                     </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 font-black uppercase tracking-widest"
                    disabled={loading || !withdrawAmount || parseFloat(withdrawAmount) > (userData?.walletBalance || 0)}
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowDownCircle className="w-4 h-4 mr-2" />}
                    Request Payout
                  </Button>
               </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Recent Transactions
              </CardTitle>
              <CardDescription>A history of your deposits, trades, and withdrawals.</CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="sm:hidden h-8 w-8 text-muted-foreground"
              onClick={() => txRefetch()}
              disabled={txLoading}
            >
              <RefreshCw className={`w-4 h-4 ${txLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
             <Button 
                variant="outline" 
                size="sm" 
                className="hidden sm:flex h-8 text-[10px] font-black uppercase tracking-widest px-3 mr-2"
                onClick={() => txRefetch()}
                disabled={txLoading}
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-2 ${txLoading ? "animate-spin" : ""}`} />
                Refresh
             </Button>
             <div className="flex gap-2">
               {["all", "Deposit", "Withdrawal", "Trade"].map((f) => (
                  <Button 
                    key={f}
                    variant={filter === f ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(f)}
                    className="h-8 text-[10px] font-black uppercase tracking-widest px-4 shrink-0"
                  >
                     {f === "all" ? "All Activity" : f === "Trade" ? "Trades" : f === "Deposit" ? "Deposits" : "Withdrawals"}
                  </Button>
               ))}
             </div>
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
                ) : transactions?.filter((t: any) => {
                    if (filter === "all") return true;
                    if (filter === "Trade") return t.type.includes("Trade");
                    if (filter === "Deposit") return t.type === "Wallet_Topup" || t.type === "Deposit";
                    return t.type === filter;
                  }).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                      No {filter} records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions?.filter((t: any) => {
                    if (filter === "all") return true;
                    if (filter === "Trade") return t.type.includes("Trade");
                    if (filter === "Deposit") return t.type === "Wallet_Topup" || t.type === "Deposit";
                    return t.type === filter;
                  }).map((tx: any) => (
                    <TableRow key={tx._id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap">
                        {format(new Date(tx.createdAt), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="font-medium">{tx.description || tx.type}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{tx.type.replace("_", " ")}</Badge>
                      </TableCell>
                      <TableCell className={
                        tx.type === "Wallet_Topup" || tx.type === "Deposit" || tx.type === "Trade_Sell" 
                          ? "text-green-600 font-bold" 
                          : "text-red-600 font-bold"
                      }>
                        {tx.type === "Wallet_Topup" || tx.type === "Deposit" || tx.type === "Trade_Sell" ? "+" : "-"}
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
            ) : transactions?.filter((t: any) => {
                if (filter === "all") return true;
                if (filter === "Trade") return t.type.includes("Trade");
                if (filter === "Deposit") return t.type === "Wallet_Topup" || t.type === "Deposit";
                return t.type === filter;
              }).length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm border rounded-lg border-dashed">
                No {filter} records found.
              </div>
            ) : (
              transactions?.filter((t: any) => {
                if (filter === "all") return true;
                if (filter === "Trade") return t.type.includes("Trade");
                if (filter === "Deposit") return t.type === "Wallet_Topup" || t.type === "Deposit";
                return t.type === filter;
              }).map((tx: any) => (
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
                    <p className={`text-lg font-bold ${
                      tx.type === "Wallet_Topup" || tx.type === "Deposit" || tx.type === "Trade_Sell" 
                        ? "text-green-600" 
                        : "text-red-600"
                    }`}>
                      {tx.type === "Wallet_Topup" || tx.type === "Deposit" || tx.type === "Trade_Sell" ? "+" : "-"}
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
