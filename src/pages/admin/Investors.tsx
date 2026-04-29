import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart as PieIcon,
  Search,
  Users,
  TrendingUp,
  ArrowUpRight,
  Wallet,
  Eye,
  MoreHorizontal,
  Coins,
  BarChart3,
  Shield,
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
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const Investors = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const investors = [
    { _id: "1", name: "Ibrahim Yusuf", email: "ibrahim@graintox.ng", phone: "+234 803 456 7890", portfolioValue: 12500000, tokens: 420, primaryToken: "GT-MAIZE", joinDate: "2026-01-15", kycStatus: "VERIFIED", roi: 15.8 },
    { _id: "2", name: "Grace Eze", email: "grace@graintox.ng", phone: "+234 807 123 4567", portfolioValue: 28400000, tokens: 850, primaryToken: "GT-SOYA", joinDate: "2025-11-20", kycStatus: "VERIFIED", roi: 22.3 },
    { _id: "3", name: "Chidi Nwosu", email: "chidi@graintox.ng", phone: "+234 805 678 9012", portfolioValue: 5200000, tokens: 180, primaryToken: "GT-RICE", joinDate: "2026-03-05", kycStatus: "PENDING", roi: 8.1 },
    { _id: "4", name: "Hauwa Abdulkadir", email: "hauwa@graintox.ng", phone: "+234 809 234 5678", portfolioValue: 18900000, tokens: 620, primaryToken: "GT-MAIZE", joinDate: "2025-12-10", kycStatus: "VERIFIED", roi: 18.4 },
    { _id: "5", name: "Emeka Obi", email: "emeka@graintox.ng", phone: "+234 810 345 6789", portfolioValue: 42100000, tokens: 1200, primaryToken: "GT-BEAN", joinDate: "2025-09-01", kycStatus: "VERIFIED", roi: 28.7 },
    { _id: "6", name: "Zainab Garba", email: "zainab@graintox.ng", phone: "+234 811 456 7890", portfolioValue: 3800000, tokens: 130, primaryToken: "GT-SORG", joinDate: "2026-04-01", kycStatus: "VERIFIED", roi: 5.2 },
  ];

  const filteredInvestors = investors.filter((inv) =>
    inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAUM = investors.reduce((acc, inv) => acc + inv.portfolioValue, 0);
  const totalTokens = investors.reduce((acc, inv) => acc + inv.tokens, 0);
  const avgROI = investors.reduce((acc, inv) => acc + inv.roi, 0) / investors.length;

  const portfolioDistribution = [
    { token: "GT-MAIZE", investors: 12, value: 45000000 },
    { token: "GT-RICE", investors: 8, value: 28000000 },
    { token: "GT-SOYA", investors: 6, value: 22000000 },
    { token: "GT-BEAN", investors: 5, value: 18000000 },
    { token: "GT-SORG", investors: 4, value: 12000000 },
    { token: "GT-MILT", investors: 3, value: 8000000 },
  ];


  return (
    <div className="space-y-6 animate-fade-in p-2">
      <header>
        <h1 className="text-3xl font-bold text-foreground">Investors</h1>
        <p className="text-muted-foreground">
          Manage investor accounts, portfolios, and performance metrics
        </p>
      </header>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Investors", value: investors.length, icon: Users, color: "text-primary", bg: "bg-primary/10", sub: `${investors.filter(i => i.kycStatus === "VERIFIED").length} verified` },
          { title: "Assets Under Mgmt", value: `₦${(totalAUM / 1e6).toFixed(0)}M`, icon: Wallet, color: "text-blue-500", bg: "bg-blue-500/10", sub: "Total portfolio value" },
          { title: "Tokens Held", value: totalTokens.toLocaleString(), icon: Coins, color: "text-purple-500", bg: "bg-purple-500/10", sub: "Across all investors" },
          { title: "Avg ROI", value: `${avgROI.toFixed(1)}%`, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10", sub: "Platform average return" },
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
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Portfolio Distribution Chart */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Investment by Token</CardTitle>
          <CardDescription>Distribution of investor capital across grain tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={portfolioDistribution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.1)" />
              <XAxis dataKey="token" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1e6).toFixed(0)}M`} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }} formatter={(v: number) => [`₦${(v / 1e6).toFixed(1)}M`, '']} />
              <Legend />
              <Bar dataKey="value" fill="#10B981" name="Portfolio Value" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Investor Directory */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle>Investor Directory</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search investors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investor</TableHead>
                  <TableHead>Portfolio Value</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Primary Token</TableHead>
                  <TableHead>ROI</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvestors.map((inv) => (
                  <TableRow key={inv._id} className="hover:bg-muted/50 transition cursor-pointer" onClick={() => navigate(`/investors/${inv._id}`)}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary/90">
                          {inv.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <div className="font-medium">{inv.name}</div>
                          <div className="text-xs text-muted-foreground">{inv.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">₦{(inv.portfolioValue / 1e6).toFixed(1)}M</TableCell>
                    <TableCell>{inv.tokens.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] border-primary/20 text-primary/90">{inv.primaryToken}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center text-primary font-medium text-sm">
                        <ArrowUpRight className="w-3 h-3 mr-0.5" />
                        {inv.roi}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={inv.kycStatus === "VERIFIED" ? "bg-primary/10 text-primary border-primary/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}>
                        {inv.kycStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/investors/${inv._id}`); }}>
                            <Eye className="mr-2 h-4 w-4" /> View Portfolio
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/kyc`); }}>
                            <Shield className="mr-2 h-4 w-4" /> KYC Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

export default Investors;
