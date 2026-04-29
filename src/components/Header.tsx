import { useState } from "react";
import { Bell, ChevronDown, LogOut, Settings, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import useAuth from "@/hooks/useAuth";
import { useDispatch } from "react-redux";
import { setActiveRole, logout } from "@/services/authSlice"; // ✅ import from your slice
import { useNavigate } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { firstName, lastName, email, roles, activeRole } = useAuth(); // ✅ includes roles and activeRole
  const { toast } = useToast();

  const [notifications] = useState([
    {
      id: 1,
      message: "Trade execution successful: MAIZE/NGN",
      time: "5m ago",
      unread: true,
    },
    { id: 2, message: "New warehouse deposit: Kano Central", time: "1h ago", unread: true },
    {
      id: 3,
      message: "Price alert: SOYA up 8.4%",
      time: "2h ago",
      unread: false,
    },
  ]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleRoleSwitch = (role: string) => {
    dispatch(setActiveRole(role)); // ✅ set activeRole in store
    toast({
      title: "Role Switched",
      description: `Switched to ${role} view`,
    });
  };

  const handleLogout = () => {
    dispatch(logout()); // ✅ optional logout handler
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const displayName = `${firstName} ${lastName}`.trim();
  const initials =
    [firstName?.[0], lastName?.[0]].filter(Boolean).join("").toUpperCase() ||
    "U";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1">
          <Menu className="h-4 w-4" />
        </SidebarTrigger>
        <div className="flex flex-col">
          <h1 className="text-sm sm:text-lg font-bold">
            GrainTox
          </h1>
          <p className="text-[10px] text-muted-foreground hidden sm:block">
            Agricultural Digital Infrastructure
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* ✅ Only show Switch Role if user has multiple roles */}
        {roles.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden md:flex">
                Switch Role
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {roles.map((role) => (
                <DropdownMenuItem
                  key={role}
                  disabled={role === activeRole}
                  onClick={() => handleRoleSwitch(role)}
                >
                  {role === "Admin"
                    ? "Administrator"
                    : role === "Warehouse_Manager"
                    ? "Warehouse Manager"
                    : role}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-2">
              <h4 className="font-medium">Notifications</h4>
            </div>
            <DropdownMenuSeparator />
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start p-3"
              >
                <div className="flex w-full justify-between">
                  <span className="text-sm">{notification.message}</span>
                  {notification.unread && (
                    <div className="h-2 w-2 bg-primary rounded-full"></div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {notification.time}
                </span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuItem disabled>
              <User className="mr-2 h-4 w-4" />
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">
                  {displayName || "Unknown User"}
                </p>
                <p className="text-xs text-muted-foreground">{email}</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/config")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
