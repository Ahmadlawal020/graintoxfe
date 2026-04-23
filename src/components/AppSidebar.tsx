import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  Wheat,
  ClipboardList,
  Coins,
  Wallet,
  PieChart,
  Settings,
  ShieldCheck,
  Activity,
  MessageSquare,
  FileText,
  TrendingUp,
  User,
  LogOut,
} from "lucide-react";

import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import useAuth from "@/hooks/useAuth";
import { useDispatch } from "react-redux";
import { logout } from "@/services/authSlice";
import { apiSlice } from "@/services/api/apiSlice";

const adminMenuItems = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Staff Management", url: "/staff", icon: UserCheck },
  { title: "User Management", url: "/users", icon: Users },
  { title: "KYC Management", url: "/kyc", icon: ShieldCheck },
  { title: "Warehouses", url: "/warehouses", icon: Building2 },
  { title: "Crop Management", url: "/crops", icon: Wheat },
  { title: "Storage Ops", url: "/storage", icon: ClipboardList },
  { title: "Token & Trading", url: "/trading", icon: Coins },
  { title: "Wallet & Finance", url: "/finance", icon: Wallet },
  { title: "System Settings", url: "/settings", icon: Settings },
];

const managerMenuItems = [
  { title: "Dashboard", url: "/manager", icon: LayoutDashboard },
  { title: "My Warehouse", url: "/manager/warehouse", icon: Building2 },
  { title: "Stock Management", url: "/manager/stock", icon: ClipboardList },
  { title: "Quality Control", url: "/manager/qc", icon: ShieldCheck },
  { title: "Inventory Reports", url: "/manager/reports", icon: FileText },
];

const userMenuItems = [
  { title: "Dashboard", url: "/user", icon: LayoutDashboard },
  { title: "Marketplace", url: "/user/market", icon: Coins },
  { title: "My Portfolio", url: "/user/portfolio", icon: PieChart },
  { title: "My Storage", url: "/user/storage", icon: Building2 },
  { title: "Wallet", url: "/user/wallet", icon: Wallet },
  { title: "Settings", url: "/user/settings", icon: Settings },
];


export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { activeRole, isAdmin, isUser, isManager } = useAuth();
  const collapsed = state === "collapsed";

  const handleLogout = () => {
    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
    navigate("/login");
  };

  const getMenuItems = () => {
    if (isManager) return managerMenuItems;
    if (isUser) return userMenuItems;
    if (isAdmin) return adminMenuItems;
    return [];
  };

  const getDashboardTitle = () => {
    if (isManager) return "Manager Portal";
    if (isUser) return "User Portal";
    if (isAdmin) return "Admin Control Center";
    return "User Portal";
  };

  const menuItems = getMenuItems();
  const dashboardTitle = getDashboardTitle();

  const isActive = (path: string) => {
    const basePaths = {
      admin: "/",
      manager: "/manager",
      user: "/user",
    };


    const roleKey = isAdmin ? 'admin' : isManager ? 'manager' : isUser ? 'user' : 'admin';
    const basePath = basePaths[roleKey as keyof typeof basePaths] || "/";

    if (path === basePath) {
      return location.pathname === basePath;
    }
    return location.pathname.startsWith(path) && path !== basePath;
  };

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"
        } transition-all duration-300 border-r border-sidebar-border bg-sidebar-background`}
      collapsible="icon"
    >
      <SidebarContent className="bg-sidebar-background text-sidebar-foreground h-full">
        <div className="p-3 sm:p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-accent backdrop-blur-md border border-primary/20">
              <img
                src="/favicon.png"
                alt="GrainTox Logo"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-primary truncate">
                  GrainTox
                </h2>
                <p className="text-xs text-sidebar-foreground/70 truncate">
                  {dashboardTitle}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <SidebarGroup className="px-3 py-2">
            <SidebarGroupLabel className="text-sidebar-foreground/70 px-3 py-2">
              {!collapsed && "Main Menu"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={
                          item.url === "/" ||
                          item.url === "/manager" ||
                          item.url === "/user"
                        }
                        className={({ isActive: navIsActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm w-full ${navIsActive || isActive(item.url)
                            ? "bg-primary/90 text-foreground shadow-lg shadow-primary/90/20"
                            : "hover:bg-sidebar-accent text-sidebar-foreground hover:shadow-sm"
                          }`
                        }
                      >
                        <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive(item.url) ? "text-foreground" : "text-primary"}`} />
                        {!collapsed && (
                          <span className="font-medium truncate">
                            {item.title}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border bg-sidebar-background">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              {!collapsed && <span className="font-medium">Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
