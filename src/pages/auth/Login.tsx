import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Building2, 
  ArrowLeft,
  Wheat,
  Mail,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLoginUserMutation } from "@/services/api/authApiSlice";
import { useDispatch } from "react-redux";
import { setCredentials } from "@/services/authSlice";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "User",
    rememberMe: false,
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
        title: "Welcome Back",
        description: `Successfully signed in to your GrainTox account.`,
      });

      navigate("/user");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error?.data?.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-card text-foreground flex flex-col font-sans selection:bg-primary/30">
      {/* Visual background decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px]" />
      </div>

      <header className="p-6 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden backdrop-blur-md">
            <img src="/favicon.png" alt="GrainTox Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">Grain<span className="text-primary">toX</span></span>
        </div>
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-all text-sm font-medium px-4 py-2 rounded-full hover:bg-accent"
        >
          <ArrowLeft className="w-4 h-4" /> Back Home
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-[450px]">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-3 tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground">Enter your details to access your account</p>
          </div>

          <div className="bg-white/70 backdrop-blur-xl border border-primary/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden relative group">
            {/* Top decorative line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-muted-foreground font-medium ml-1">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="bg-card/60 border-gray-800 h-14 pl-12 focus:ring-primary rounded-2xl text-lg transition-all focus:border-primary/50"
                    value={formData.email}
                    onChange={handleInputChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <Label className="text-muted-foreground font-medium">Password</Label>
                  <button 
                    type="button" 
                    onClick={() => navigate("/forgot-password")}
                    className="text-primary text-sm font-semibold hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="bg-card/60 border-gray-800 h-14 pl-12 pr-12 focus:ring-primary rounded-2xl text-lg transition-all focus:border-primary/50"
                    value={formData.password}
                    onChange={handleInputChange}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 px-1">
                <Checkbox id="remember" className="border-gray-700 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                <label htmlFor="remember" className="text-sm text-muted-foreground font-medium cursor-pointer">Remember me for 30 days</label>
              </div>

              <Button className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg rounded-2xl shadow-xl shadow-primary/10 transition-all active:scale-[0.98] border-none" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-border border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  "Log In"
                )}
              </Button>
            </form>

            <div className="mt-8 pt-8 border-t border-border text-center">
              <p className="text-muted-foreground font-medium">
                New to GraintoX? <button type="button" onClick={() => navigate("/signup")} className="text-primary font-bold hover:text-primary/80 transition-colors ml-1">Create an account</button>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-muted-foreground text-xs z-10">
        <p>© 2024 GraintoX Limited. Empowering the future of African agriculture.</p>
      </footer>
    </div>
  );
};


export default Login;

