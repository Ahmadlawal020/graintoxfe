
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Building2, 
  Wheat, 
  TrendingUp, 
  ClipboardList, 
  ShieldCheck,
  Plus,
  Eye,
  Wallet,
  Coins,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // Sample data for GrainTox
  const storageTrends = [
    { month: "Jan", maize: 450, rice: 300, beans: 120 },
    { month: "Feb", maize: 520, rice: 350, beans: 150 },
    { month: "Mar", maize: 600, rice: 420, beans: 180 },
    { month: "Apr", maize: 580, rice: 400, beans: 200 },
    { month: "May", maize: 720, rice: 480, beans: 250 },
    { month: "Jun", maize: 850, rice: 550, beans: 300 },
  ];

  const cropDistribution = [
    { name: "Maize", value: 45, color: "#10B981" }, // Emerald 500
    { name: "Rice", value: 30, color: "#3B82F6" },  // Blue 500
    { name: "Soybeans", value: 15, color: "#F59E0B" }, // Amber 500
    { name: "Sorghum", value: 10, color: "#EF4444" }, // Red 500
  ];

  const tradingVolume = [
    { month: "Jan", buy: 125000, sell: 95000 },
    { month: "Feb", buy: 135000, sell: 98000 },
    { month: "Mar", buy: 145000, sell: 102000 },
    { month: "Apr", buy: 140000, sell: 100000 },
    { month: "May", buy: 155000, sell: 105000 },
    { month: "Jun", buy: 165000, sell: 108000 },
  ];

  const recentTransactions = [
    { id: 1, type: "deposit", message: "Investor Musa deposited 50 bags of Maize", time: "2 minutes ago", status: "success" },
    { id: 2, type: "trade", message: "New trade: 10 GT-MAIZE tokens @ ₦25,000", time: "15 minutes ago", status: "info" },
    { id: 3, type: "kyc", message: "Agent Sarah submitted KYC for verification", time: "1 hour ago", status: "warning" },
    { id: 4, type: "withdrawal", message: "Withdrawal request: ₦150,000 by User #402", time: "2 hours ago", status: "pending" },
  ];

  const pendingTasks = [
    { id: 1, title: "8 Pending KYCs", desc: "Awaiting document verification", priority: "High" },
    { id: 2, title: "3 Quality Checks", desc: "Warehouse #02 inbound audit", priority: "Medium" },
    { id: 3, title: "Wallet Rebalancing", desc: "Bank settlements due", priority: "Low" },
  ];

  return (
    <div className="space-y-6 animate-fade-in p-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Control Center</h1>
          <p className="text-muted-foreground">GrainTox Platform Overview & Real-time Operations</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="px-3 py-1 border-emerald-500/20 text-emerald-500 bg-emerald-500/5">
            System Live
          </Badge>
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg shadow-emerald-600/20">
            <Plus className="w-4 h-4 mr-2" />
            Quick Actions
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registered Users</CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24,502</div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-emerald-500 flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +12%
              </span>
              <span className="text-xs text-muted-foreground ml-2">from last month</span>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500/20 group-hover:bg-emerald-500 transition-all" />
        </Card>

        <Card className="glass-card overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Warehouses</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-blue-500 flex items-center bg-blue-500/10 px-1.5 py-0.5 rounded">
                6 States
              </span>
              <span className="text-xs text-muted-foreground ml-2">across Nigeria</span>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500/20 group-hover:bg-blue-500 transition-all" />
        </Card>

        <Card className="glass-card overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Asset Value (GTV)</CardTitle>
            <Coins className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦2.4B</div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-emerald-500 flex items-center bg-emerald-500/10 px-1.5 py-0.5 rounded">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +₦140M
              </span>
              <span className="text-xs text-muted-foreground ml-2">weekly growth</span>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-amber-500/20 group-hover:bg-amber-500 transition-all" />
        </Card>

        <Card className="glass-card overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Liquidity</CardTitle>
            <Wallet className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦450.2M</div>
            <div className="flex items-center mt-1">
              <span className="text-xs text-red-500 flex items-center bg-red-500/10 px-1.5 py-0.5 rounded">
                <ArrowDownRight className="w-3 h-3 mr-1" />
                -2.4%
              </span>
              <span className="text-xs text-muted-foreground ml-2">from peak</span>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-purple-500/20 group-hover:bg-purple-500 transition-all" />
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Volume Trends */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Storage Volume Trends (MT)
              <Badge variant="secondary">6 Months</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={storageTrends}>
                <defs>
                  <linearGradient id="colorMaize" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.1)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="maize" 
                  stroke="#10B981" 
                  fillOpacity={1} 
                  fill="url(#colorMaize)" 
                  name="Maize"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="rice" 
                  stroke="#3B82F6" 
                  fillOpacity={0} 
                  name="Rice"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Crop Portfolio Distribution */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Commodity Portfolio Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={cropDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {cropDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Operations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Operations */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-500" />
              Live Operations Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((op) => (
                <div key={op.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-transparent hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all">
                  <div className={`mt-1.5 p-1.5 rounded-full ${
                    op.status === 'success' ? 'bg-emerald-500/20 text-emerald-500' :
                    op.status === 'warning' ? 'bg-amber-500/20 text-amber-500' :
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    {op.type === 'deposit' ? <Wheat className="w-3.5 h-3.5" /> : 
                     op.type === 'trade' ? <Coins className="w-3.5 h-3.5" /> : 
                     <ShieldCheck className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{op.message}</p>
                    <p className="text-xs text-muted-foreground">{op.time}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] uppercase.tracking-wider ${
                    op.status === 'success' ? 'border-emerald-500/20 text-emerald-500' :
                    'border-muted text-muted-foreground'
                  }`}>
                    {op.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 border-emerald-500/20 hover:bg-emerald-500/5 hover:text-emerald-500">
              <Eye className="w-4 h-4 mr-2" />
              View All Logs
            </Button>
          </CardContent>
        </Card>

        {/* Priority Actions */}
        <Card className="card-hover border-emerald-500/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Critical Tasks Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-l-4 border-l-emerald-500">
                  <div>
                    <p className="font-semibold text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.desc}</p>
                  </div>
                  <Badge className={`${
                    task.priority === 'High' ? 'bg-red-500' :
                    task.priority === 'Medium' ? 'bg-amber-500' :
                    'bg-blue-500'
                  } text-white`}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20">
              <ClipboardList className="w-4 h-4 mr-2" />
              Enter Task Manager
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* System Shortcuts */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Management Interface Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" onClick={() => navigate("/users")} className="h-24 flex flex-col gap-2 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all">
              <Users className="w-6 h-6 text-emerald-500" />
              <span className="text-sm font-semibold">User Center</span>
            </Button>
            <Button variant="outline" onClick={() => navigate("/warehouses")} className="h-24 flex flex-col gap-2 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all">
              <Building2 className="w-6 h-6 text-emerald-500" />
              <span className="text-sm font-semibold">Warehouses</span>
            </Button>
            <Button variant="outline" onClick={() => navigate("/kyc")} className="h-24 flex flex-col gap-2 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all">
              <ShieldCheck className="w-6 h-6 text-emerald-500" />
              <span className="text-sm font-semibold">KYC Verification</span>
            </Button>
            <Button variant="outline" onClick={() => navigate("/settings")} className="h-24 flex flex-col gap-2 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all">
              <Wallet className="h-6 w-6 text-emerald-500" />
              <span className="text-sm font-semibold">Platform Financials</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
