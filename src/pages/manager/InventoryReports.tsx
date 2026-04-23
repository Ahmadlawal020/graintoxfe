import React from "react";
import { FileText, Download, Calendar, BarChart3, TrendingUp, Package } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

import { useGetWarehousesQuery } from "@/services/api/warehouseApiSlice";
import { useGetStorageOperationsQuery } from "@/services/api/storageApiSlice";
import { useGetUserByIdQuery } from "@/services/api/userApiSlice";
import useAuth from "@/hooks/useAuth";

const InventoryReports = () => {
  const { id } = useAuth();
  const { data: userProfile } = useGetUserByIdQuery(id, { skip: !id });
  const { data: allWarehouseData } = useGetWarehousesQuery(undefined);
  const { data: allOps = [], isLoading } = useGetStorageOperationsQuery(undefined);

  const allWarehouses = Array.isArray(allWarehouseData) ? allWarehouseData : [];
  
  const myWarehouses = React.useMemo(() => {
    const assigned = Array.isArray(userProfile?.assignedWarehouse) 
      ? userProfile.assignedWarehouse 
      : (userProfile?.assignedWarehouse ? [userProfile.assignedWarehouse] : []);
      
    return allWarehouses.filter((wh: any) => {
      const matchProfile = assigned.includes(wh.name) || assigned.includes(wh._id);
      const matchManagerId = wh.managerId === id || wh.managerId?._id === id;
      return matchProfile || matchManagerId;
    });
  }, [allWarehouses, userProfile, id]);

  const filteredOps = React.useMemo(() => {
    const warehouseIds = myWarehouses.map((wh: any) => wh._id);
    return allOps.filter((op: any) => warehouseIds.includes(op.warehouse?._id || op.warehouse));
  }, [allOps, myWarehouses]);

  const monthlyData = React.useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const aggregated: Record<string, { month: string; deposits: number; withdrawals: number; net: number }> = {};
    const monthOrder: string[] = [];
    
    // Initialize current and previous 3 months
    const currentMonth = new Date().getMonth();
    for (let i = 3; i >= 0; i--) {
      const mIdx = (currentMonth - i + 12) % 12;
      monthOrder.push(months[mIdx]);
      aggregated[months[mIdx]] = { month: months[mIdx], deposits: 0, withdrawals: 0, net: 0 };
    }

    filteredOps.forEach((op: any) => {
      const date = new Date(op.timestamp);
      const monthName = months[date.getMonth()];
      // Only aggregate if the month is within the last 4 months
      if (aggregated[monthName]) {
        if (op.type === "DEPOSIT") {
          aggregated[monthName].deposits += op.quantity;
        } else if (op.type === "WITHDRAWAL") {
          aggregated[monthName].withdrawals += op.quantity;
        }
        aggregated[monthName].net = aggregated[monthName].deposits - aggregated[monthName].withdrawals;
      }
    });

    return monthOrder.map(m => aggregated[m]);
  }, [filteredOps]);

  const netInflow = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].net : 0;
  const currentMonthName = monthlyData.length > 0 ? monthlyData[monthlyData.length - 1].month : "Current";

  const reports = [
    { id: 1, title: "Weekly Stock Summary", period: "Latest Complete Week", type: "Stock", generated: "Auto", status: "Ready" },
    { id: 2, title: "Monthly QC Report", period: `${currentMonthName} ${new Date().getFullYear()}`, type: "Quality", generated: "Auto", status: "Ready" },
    { id: 3, title: "Temperature Log Export", period: "Last 30 Days", type: "Environment", generated: "Manual", status: "Ready" },
    { id: 4, title: "Deposit/Withdrawal Register", period: "All Time", type: "Operations", generated: "Auto", status: "Generating" },
  ];

  return (
    <div className="space-y-6 animate-fade-in p-2">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Reports</h1>
          <p className="text-muted-foreground">Generate and download warehouse operational reports</p>
        </div>
        <Button className="bg-primary/90 hover:bg-primary/90 text-foreground shadow-lg shadow-primary/90/20" size="sm">
          <FileText className="mr-2 h-4 w-4" /> Generate Custom Report
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { title: `Net Inflow (${currentMonthName})`, value: `${netInflow} MT`, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
          { title: "Reports Generated", value: "12", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
          { title: "Last Export", value: `${currentMonthName} 20`, icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/10" },
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

      {/* Chart */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Monthly Movement Summary</CardTitle>
          <CardDescription>Deposits vs withdrawals over the last 4 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.1)" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }} />
              <Legend />
              <Bar dataKey="deposits" fill="#10B981" name="Deposits (MT)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="withdrawals" fill="#3B82F6" name="Withdrawals (MT)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>Download or regenerate warehouse reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-transparent hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{report.title}</p>
                    <p className="text-xs text-muted-foreground">{report.period} · {report.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[10px]">{report.generated}</Badge>
                  {report.status === "Ready" ? (
                    <Button variant="outline" size="sm">
                      <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      Generating...
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryReports;
