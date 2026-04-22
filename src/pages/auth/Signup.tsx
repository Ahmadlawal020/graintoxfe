import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  Wheat,
  Mail,
  User,
  Calendar,
  Lock,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { 
  InputOTP, 
  InputOTPGroup, 
  InputOTPSlot, 
  InputOTPSeparator 
} from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";
import { 
  useCheckEmailMutation, 
  useRegisterUserMutation, 
  useVerifyOTPMutation 
} from "@/services/api/authApiSlice";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    password: "",
  });
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [checkEmail] = useCheckEmailMutation();
  const [registerUser] = useRegisterUserMutation();
  const [verifyOTP] = useVerifyOTPMutation();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setFormData((prev) => ({ ...prev, [id]: value }));
    },
    []
  );

  const handleEmailCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await checkEmail({ email: formData.email }).unwrap();
      if (result.registered) {
        toast({
          title: "Account exists",
          description: "This email is already registered. Navigating to login.",
        });
        navigate("/login");
      } else {
        setStep(2);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await registerUser(formData).unwrap();
      toast({
        title: "OTP Sent",
        description: "A verification code has been sent to your email.",
      });
      setStep(3);
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error?.data?.message || "Could not complete registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) return;
    setIsLoading(true);
    try {
      await verifyOTP({ email: formData.email, code: otpCode }).unwrap();
      toast({
        title: "Verified!",
        description: "Your email has been verified. Welcome to GrainTox!",
      });
      navigate("/user");
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error?.data?.message || "Invalid OTP code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Visual background decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/5 rounded-full blur-[100px]" />
      </div>

      <header className="p-6 flex items-center justify-between z-10 relative">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Wheat className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight">Grain<span className="text-emerald-500">toX</span></span>
        </div>
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : navigate("/login")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-all text-sm font-medium px-4 py-2 rounded-full hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4" /> {step === 1 ? "Back to Login" : "Back"}
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-[500px]">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-3 tracking-tight">
              {step === 1 && "Create your account"}
              {step === 2 && "Personal details"}
              {step === 3 && "Verify your email"}
            </h1>
            <p className="text-gray-400">
              {step === 1 && "Start your journey with GrainTox"}
              {step === 2 && "Tell us a bit more about yourself"}
              {step === 3 && `Enter the 6-digit code sent to ${formData.email}`}
            </p>
          </div>

          <div className="bg-[#1e2329]/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-10 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />
            
            {/* Step 1: Email Check */}
            {step === 1 && (
              <form onSubmit={handleEmailCheck} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-gray-400 font-medium ml-1">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="bg-[#0b0e11]/60 border-gray-800 h-14 pl-12 focus:ring-emerald-500 rounded-2xl text-lg transition-all focus:border-emerald-500/50"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <Button className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-emerald-500/10 transition-all active:scale-[0.98] border-none" disabled={isLoading}>
                  {isLoading ? "Checking..." : "Continue"}
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </form>
            )}

            {/* Step 2: Sign Up Details */}
            {step === 2 && (
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-gray-400 font-medium ml-1">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <Input
                        id="firstName"
                        placeholder="John"
                        className="bg-[#0b0e11]/60 border-gray-800 h-14 pl-12 focus:ring-emerald-500 rounded-2xl text-lg transition-all focus:border-emerald-500/50"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-400 font-medium ml-1">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        className="bg-[#0b0e11]/60 border-gray-800 h-14 pl-12 focus:ring-emerald-500 rounded-2xl text-lg transition-all focus:border-emerald-500/50"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-400 font-medium ml-1">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      className="bg-[#0b0e11]/60 border-gray-800 h-14 pl-12 focus:ring-emerald-500 rounded-2xl text-lg transition-all focus:border-emerald-500/50 [color-scheme:dark]"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-400 font-medium ml-1">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="bg-[#0b0e11]/60 border-gray-800 h-14 pl-12 focus:ring-emerald-500 rounded-2xl text-lg transition-all focus:border-emerald-500/50"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <Button className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-emerald-500/10 transition-all active:scale-[0.98] border-none" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            )}

            {/* Step 3: OTP Verification */}
            {step === 3 && (
              <div className="space-y-8 flex flex-col items-center">
                <div className="bg-emerald-500/10 p-4 rounded-full">
                  <ShieldCheck className="w-12 h-12 text-emerald-500" />
                </div>
                
                <div className="space-y-4 w-full flex flex-col items-center">
                  <InputOTP
                    maxLength={6}
                    value={otpCode}
                    onChange={(value) => setOtpCode(value)}
                    className="gap-2"
                  >
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot index={0} className="w-14 h-14 text-2xl border-gray-800 bg-[#0b0e11]/60 rounded-xl" />
                      <InputOTPSlot index={1} className="w-14 h-14 text-2xl border-gray-800 bg-[#0b0e11]/60 rounded-xl" />
                      <InputOTPSlot index={2} className="w-14 h-14 text-2xl border-gray-800 bg-[#0b0e11]/60 rounded-xl" />
                    </InputOTPGroup>
                    <InputOTPSeparator className="text-gray-700" />
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot index={3} className="w-14 h-14 text-2xl border-gray-800 bg-[#0b0e11]/60 rounded-xl" />
                      <InputOTPSlot index={4} className="w-14 h-14 text-2xl border-gray-800 bg-[#0b0e11]/60 rounded-xl" />
                      <InputOTPSlot index={5} className="w-14 h-14 text-2xl border-gray-800 bg-[#0b0e11]/60 rounded-xl" />
                    </InputOTPGroup>
                  </InputOTP>

                  <Button 
                    onClick={handleVerifyOTP} 
                    className="w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-emerald-500/10 transition-all active:scale-[0.98] border-none mt-4" 
                    disabled={isLoading || otpCode.length !== 6}
                  >
                    {isLoading ? "Verifying..." : "Verify & Login"}
                  </Button>
                  
                  <p className="text-sm text-gray-500">
                    Didn't receive the code? <button className="text-emerald-500 font-semibold hover:underline">Resend Code</button>
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-white/5 text-center">
              <p className="text-gray-400 font-medium">
                Already have an account? <button onClick={() => navigate("/login")} className="text-emerald-500 font-bold hover:text-emerald-400 transition-colors ml-1">Log In</button>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-8 text-center text-gray-600 text-xs z-10">
        <p>© 2024 GraintoX Limited. Empowering the future of African agriculture.</p>
      </footer>
    </div>
  );
};

export default Signup;
