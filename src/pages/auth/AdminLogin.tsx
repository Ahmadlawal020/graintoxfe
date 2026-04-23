import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Building2, 
  ArrowLeft,
  Wheat,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLoginUserMutation } from "@/services/api/authApiSlice";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/services/authSlice";

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Admin",
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [loginUser] = useLoginUserMutation();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setFormData((prev) => ({ ...prev, [id]: value }));
    },
    []
  );

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { email, password, role } = formData;

    try {
      const userData = await loginUser({ email, password, role }).unwrap();
      dispatch(
        setCredentials({
          accessToken: userData.accessToken,
          user: {
            id: userData.id,
            email: formData.email,
            roles: userData.roles,
          },
          activeRole: formData.role,
        })
      );

      toast({
        title: "Staff Access Authorized",
        description: `Welcome back to the command center.`,
      });

      const roleRoutes: Record<string, string> = {
        admin: "/",
        warehouse_manager: "/manager",
      };

      navigate(roleRoutes[role.toLowerCase()] || "/");
    } catch (error: any) {
      toast({
        title: "Authorization Failed",
        description: error?.data?.message || "Invalid credentials or insufficient permissions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-card text-foreground flex flex-col font-sans selection:bg-primary/30">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <header className="p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden backdrop-blur-md">
            <img src="/favicon.png" alt="GrainTox Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">Grain<span className="text-primary">toX</span> <span className="text-muted-foreground font-medium text-lg ml-2">HQ</span></span>
        </div>
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all text-sm font-medium px-4 py-2 rounded-full hover:bg-accent"
        >
          <ArrowLeft className="w-4 h-4" /> Back Home
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-3xl mb-6 border border-primary/20">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Staff Portal</h1>
            <p className="text-muted-foreground">Authorized personnel only</p>
          </div>

          <div className="bg-[#1e2329]/50 backdrop-blur-xl border border-gray-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-muted-foreground font-medium ml-1">Access Level</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="bg-card border-gray-700 h-14 focus:ring-primary rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e2329] border-gray-700 text-foreground rounded-xl">
                    <SelectItem value="Admin">Administrator</SelectItem>
                    <SelectItem value="Warehouse_Manager">Warehouse Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground font-medium ml-1">Work Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@graintox.com"
                    className="bg-card border-gray-700 h-14 focus:ring-primary text-lg rounded-2xl pl-12"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground font-medium ml-1">Security Key</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="bg-card border-gray-700 h-14 focus:ring-primary text-lg rounded-2xl pl-12"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                className="w-full h-14 bg-primary/90 hover:bg-primary text-foreground font-bold text-lg rounded-2xl shadow-xl shadow-primary/90/20 transition-all active:scale-[0.98]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-border border-t-white rounded-full animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  "Authorize Access"
                )}
              </Button>

              <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground font-medium">
                <ShieldCheck className="w-3 h-3 text-primary" /> 
                End-to-End Encrypted Session
              </div>
            </form>
          </div>

          <p className="mt-8 text-center text-muted-foreground text-sm">
            Lost access? <button className="text-primary hover:underline">Contact Infrastructure Support</button>
          </p>
        </div>
      </main>

      <footer className="p-6 text-center text-muted-foreground text-xs z-10">
        <p>© 2024 GraintoX Limited. Unauthorized access attempts are logged and monitored.</p>
      </footer>
    </div>
  );
};

export default AdminLogin;
