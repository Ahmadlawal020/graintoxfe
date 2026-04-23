import React from "react";
import { ArrowLeft, User, Mail, Phone, Wallet, Coins, TrendingUp, ArrowUpRight, PieChart as PieIcon, Shield, Calendar, Edit, Ban } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const InvestorDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const investor = {
    _id: id,
    name: "Grace Eze",
    email: "grace@graintox.ng",
    phone: "+234 807 123 4567",
    tier: "Platinum",
    kycStatus: "VERIFIED",
    status: "Active",
    joinDate: "Nov 20, 2025",
    lastLogin: "Apr 20, 2026",
    portfolioValue: 28400000,
    walletBalance: 5200000,
    totalTokens: 850,
    roi: 22.3,
    holdings: [
      { symbol: "GT-SOYA", name: "Soybeans", tokens: 320, value: 13440000, change: 10.5, color: "#10B981" },
      { symbol: "GT-MAIZE", name: "Maize", tokens: 280, value: 7000000, change: 5.2, color: "#3B82F6" },
      { symbol: "GT-RICE", name: "Rice", tokens: 150, value: 5700000, change: -2.1, color: "#F59E0B" },
      { symbol: "GT-BEAN", name: "Cowpea", tokens: 100, value: 3500000, change: 16.7, color: "#8B5CF6" },
    ],
    recentTrades: [
      { date: "Apr 19", type: "BUY", token: "GT-SOYA", qty: 30, total: 1260000 },
      { date: "Apr 17", type: "SELL", token: "GT-RICE", qty: 10, total: 380000 },
      { date: "Apr 15", type: "BUY", token: "GT-BEAN", qty: 15, total: 525000 },
      { date: "Apr 12", type: "BUY", token: "GT-MAIZE", qty: 50, total: 1250000 },
    ],
  };

  const tierColors: Record<string, string> = { Bronze: "bg-amber-700", Gold: "bg-amber-500", Platinum: "bg-gray-400" };
  const pieData = investor.holdings.map((h) => ({ name: h.symbol, value: h.value, color: h.color }));

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/investors")} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Investors
          </Button>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary/90">
              {investor.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{investor.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`${tierColors[investor.tier]} text-foreground`}>{investor.tier}</Badge>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">KYC: {investor.kycStatus}</Badge>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Edit className="h-4 w-4 mr-2" /> Edit</Button>
          <Button variant="destructive" size="sm"><Ban className="h-4 w-4 mr-2" /> Restrict</Button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Portfolio Value", value: `₦${(investor.portfolioValue / 1e6).toFixed(1)}M`, icon: PieIcon, color: "text-primary", bg: "bg-primary/10" },
          { title: "Wallet Balance", value: `₦${(investor.walletBalance / 1e6).toFixed(1)}M`, icon: Wallet, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Tokens Held", value: investor.totalTokens, icon: Coins, color: "text-purple-500", bg: "bg-purple-500/10" },
          { title: "ROI", value: `+${investor.roi}%`, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bg}`}><stat.icon className={`h-4 w-4 ${stat.color}`} /></div>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stat.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Allocation Chart */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Portfolio Allocation</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => [`₦${(v / 1e6).toFixed(1)}M`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {investor.holdings.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: h.color }} /><span className="font-mono text-xs">{h.symbol}</span></div>
                  <span className="font-medium">₦{(h.value / 1e6).toFixed(1)}M</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Holdings Table */}
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle>Holdings</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Token</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>P&L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investor.holdings.map((h) => (
                    <TableRow key={h.symbol}>
                      <TableCell className="font-mono text-sm font-medium">{h.symbol} <span className="text-muted-foreground text-xs ml-1">{h.name}</span></TableCell>
                      <TableCell>{h.tokens}</TableCell>
                      <TableCell className="font-semibold">₦{(h.value / 1e6).toFixed(1)}M</TableCell>
                      <TableCell><span className={`flex items-center text-sm font-medium ${h.change >= 0 ? "text-primary" : "text-red-500"}`}><ArrowUpRight className="w-3 h-3 mr-0.5" />{Math.abs(h.change)}%</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact + Recent Trades */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Contact Info</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Email", value: investor.email, icon: <Mail className="h-4 w-4" /> },
              { label: "Phone", value: investor.phone, icon: <Phone className="h-4 w-4" /> },
              { label: "Joined", value: investor.joinDate, icon: <Calendar className="h-4 w-4" /> },
              { label: "Last Login", value: investor.lastLogin, icon: <Shield className="h-4 w-4" /> },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">{item.icon} {item.label}</div>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Trades</CardTitle></CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Token</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investor.recentTrades.map((t, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm text-muted-foreground">{t.date}</TableCell>
                      <TableCell><Badge variant="outline" className={t.type === "BUY" ? "text-primary border-primary/20" : "text-red-500 border-red-500/20"}>{t.type}</Badge></TableCell>
                      <TableCell className="font-mono text-xs font-medium">{t.token}</TableCell>
                      <TableCell>{t.qty}</TableCell>
                      <TableCell className="font-semibold">₦{(t.total / 1e6).toFixed(2)}M</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvestorDetails;
