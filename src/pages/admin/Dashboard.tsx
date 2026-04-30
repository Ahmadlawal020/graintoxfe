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
import { useGetAdminStatsQuery } from "@/services/api/dashboardApiSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const { data, isLoading, error } = useGetAdminStatsQuery(undefined, {
    pollingInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-red-500">Error loading dashboard data</h2>
        <p className="text-muted-foreground">Please check your connection and try again.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
      </div>
    );
  }

  const { stats, storageTrends, portfolioDistribution, recentOperations, pendingTasks } = data;

  const statsCards = [
    {
      title: "Total Registered Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      trend: stats.userGrowth >= 0 ? `+${stats.userGrowth}%` : `${stats.userGrowth}%`,
      trendLabel: "from last month",
      color: "text-primary",
      borderColor: "bg-primary",
      trendColor: "text-primary"
    },
    {
      title: "Active Warehouses",
      value: stats.activeWarehouses,
      icon: Building2,
      trend: `${stats.statesCount} States`,
      trendLabel: "across Nigeria",
      color: "text-blue-500",
      borderColor: "bg-blue-500",
      trendColor: "text-blue-500"
    },
    {
      title: "Total Asset Value (GTV)",
      value: `₦${(stats.gtv / 1000000000).toFixed(1)}B`,
      icon: Coins,
      trend: "+₦140M",
      trendLabel: "weekly growth",
      color: "text-amber-500",
      borderColor: "bg-amber-500",
      trendColor: "text-primary"
    },
    {
      title: "Platform Liquidity",
      value: `₦${(stats.liquidity / 1000000).toFixed(1)}M`,
      icon: Wallet,
      trend: "-2.4%",
      trendLabel: "from peak",
      color: "text-purple-500",
      borderColor: "bg-purple-500",
      trendColor: "text-red-500"
    }
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
          <Badge variant="outline" className="px-3 py-1 border-primary/20 text-primary bg-primary/5">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            System Live
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="bg-primary/90 hover:bg-primary/90 !text-white border-0 shadow-lg shadow-primary/90/20">
                <Plus className="w-4 h-4 mr-2" />
                Quick Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 glass-card border-primary/10">
              <DropdownMenuLabel>Create New</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/users/create")} className="cursor-pointer">
                <Users className="mr-2 h-4 w-4 text-primary" />
                <span>New Platform User</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/staff/create")} className="cursor-pointer">
                <Users className="mr-2 h-4 w-4 text-blue-500" />
                <span>New Staff Member</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/warehouses/create")} className="cursor-pointer">
                <Building2 className="mr-2 h-4 w-4 text-amber-500" />
                <span>New Warehouse</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/crops/create")} className="cursor-pointer">
                <Wheat className="mr-2 h-4 w-4 text-emerald-500" />
                <span>New Crop Type</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, idx) => (
          <Card key={idx} className="glass-card overflow-hidden group relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="flex items-center mt-1">
                <span className={`text-xs ${card.trendColor} flex items-center bg-muted/20 px-1.5 py-0.5 rounded`}>
                  {card.trend.includes('+') ? <ArrowUpRight className="w-3 h-3 mr-1" /> : (card.trend.includes('-') ? <ArrowDownRight className="w-3 h-3 mr-1" /> : null)}
                  {card.trend}
                </span>
                <span className="text-xs text-muted-foreground ml-2">{card.trendLabel}</span>
              </div>
            </CardContent>
            <div className={`absolute bottom-0 left-0 w-full h-1 ${card.borderColor}/20 group-hover:${card.borderColor} transition-all`} />
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Storage Volume Trends */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Storage Volume Trends (kg)
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
                  data={portfolioDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {portfolioDistribution.map((entry: any, index: number) => (
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
              <Activity className="w-5 h-5 text-primary" />
              Live Operations Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOperations.map((op: any) => (
                <div key={op.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/20 border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer" onClick={() => navigate(`/storage/${op.id}`)}>
                  <div className={`mt-1.5 p-1.5 rounded-full ${
                    op.status === 'success' ? 'bg-primary/20 text-primary' :
                    op.status === 'error' ? 'bg-red-500/20 text-red-500' :
                    'bg-amber-500/20 text-amber-500'
                  }`}>
                    {op.type === 'deposit' ? <Wheat className="w-3.5 h-3.5" /> : 
                     op.type === 'trade' ? <Coins className="w-3.5 h-3.5" /> : 
                     <ShieldCheck className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{op.message}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{new Date(op.time).toLocaleString()}</p>
                  </div>
                  <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${
                    op.status === 'success' ? 'border-primary/20 text-primary' :
                    'border-muted text-muted-foreground'
                  }`}>
                    {op.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button variant="outline" onClick={() => navigate("/storage")} className="w-full mt-4 border-primary/20 hover:bg-primary/5 hover:text-primary">
              <Eye className="w-4 h-4 mr-2" />
              View All Logs
            </Button>
          </CardContent>
        </Card>

        {/* Priority Actions */}
        <Card className="card-hover border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Critical Tasks Queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTasks.map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-l-4 border-l-primary cursor-pointer hover:bg-muted/30 transition-all" onClick={() => navigate(task.id === 1 ? "/kyc" : "/storage")}>
                  <div>
                    <p className="font-semibold text-sm">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.desc}</p>
                  </div>
                  <Badge className={`${
                    task.priority === 'High' ? 'bg-red-500' :
                    task.priority === 'Medium' ? 'bg-amber-500' :
                    'bg-blue-500'
                  } !text-white`}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
            <Button onClick={() => navigate("/kyc")} className="w-full mt-4 bg-primary/90 hover:bg-primary/90 !text-white shadow-lg shadow-primary/90/20">
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
            <Button variant="outline" onClick={() => navigate("/users")} className="h-24 flex flex-col gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all">
              <Users className="w-6 h-6 text-primary" />
              <span className="text-sm font-semibold">User Center</span>
            </Button>
            <Button variant="outline" onClick={() => navigate("/warehouses")} className="h-24 flex flex-col gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all">
              <Building2 className="w-6 h-6 text-primary" />
              <span className="text-sm font-semibold">Warehouses</span>
            </Button>
            <Button variant="outline" onClick={() => navigate("/kyc")} className="h-24 flex flex-col gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all">
              <ShieldCheck className="w-6 h-6 text-primary" />
              <span className="text-sm font-semibold">KYC Verification</span>
            </Button>
            <Button variant="outline" onClick={() => navigate("/settings")} className="h-24 flex flex-col gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all">
              <Wallet className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold">Platform Financials</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
