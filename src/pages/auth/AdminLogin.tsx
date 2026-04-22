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
    <div className="min-h-screen bg-[#0b0e11] text-white flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <header className="p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20 border border-emerald-500/20">
            <Wheat className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">Grain<span className="text-emerald-500">toX</span> <span className="text-gray-600 font-medium text-lg ml-2">HQ</span></span>
        </div>
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-all text-sm font-medium px-4 py-2 rounded-full hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" /> Back Home
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-4 bg-emerald-500/10 rounded-3xl mb-6 border border-emerald-500/20">
              <Lock className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Staff Portal</h1>
            <p className="text-gray-400">Authorized personnel only</p>
          </div>

          <div className="bg-[#1e2329]/50 backdrop-blur-xl border border-gray-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-gray-400 font-medium ml-1">Access Level</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="bg-[#0b0e11] border-gray-700 h-14 focus:ring-emerald-500 rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e2329] border-gray-700 text-white rounded-xl">
                    <SelectItem value="Admin">Administrator</SelectItem>
                    <SelectItem value="Warehouse_Manager">Warehouse Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400 font-medium ml-1">Work Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@graintox.com"
                    className="bg-[#0b0e11] border-gray-700 h-14 focus:ring-emerald-500 text-lg rounded-2xl pl-12"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-400 font-medium ml-1">Security Key</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="bg-[#0b0e11] border-gray-700 h-14 focus:ring-emerald-500 text-lg rounded-2xl pl-12"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button 
                className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-emerald-900/20 transition-all active:scale-[0.98]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  "Authorize Access"
                )}
              </Button>

              <div className="flex items-center gap-2 justify-center text-xs text-gray-600 font-medium">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> 
                End-to-End Encrypted Session
              </div>
            </form>
          </div>

          <p className="mt-8 text-center text-gray-600 text-sm">
            Lost access? <button className="text-emerald-500 hover:underline">Contact Infrastructure Support</button>
          </p>
        </div>
      </main>

      <footer className="p-6 text-center text-gray-700 text-xs z-10">
        <p>© 2024 GraintoX Limited. Unauthorized access attempts are logged and monitored.</p>
      </footer>
    </div>
  );
};

export default AdminLogin;
