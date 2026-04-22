import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  ChevronRight, 
  Database, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Smartphone, 
  Cpu, 
  Globe,
  Wallet,
  Building2,
  Wheat,
  BarChart3,
  LineChart,
  Zap,
  Lock,
  Globe2
} from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Digital Grain Storage",
      description: "Secure, certified warehouse storage that converts your agricultural produce into bankable digital assets.",
      icon: <Database className="w-8 h-8 text-emerald-400" />,
      color: "emerald"
    },
    {
      title: "AI-Powered Insights",
      description: "Real-time data on yields, diseases, and market trends to empower data-driven farming decisions.",
      icon: <Cpu className="w-8 h-8 text-blue-400" />,
      color: "blue"
    },
    {
      title: "Smart Market Access",
      description: "Direct connection to markets with real-time price alerts and automated trading capabilities.",
      icon: <TrendingUp className="w-8 h-8 text-purple-400" />,
      color: "purple"
    },
    {
      title: "Access to Finance",
      description: "Linking farmers with investors and seed capital for sustainable growth and inclusive finance.",
      icon: <Wallet className="w-8 h-8 text-orange-400" />,
      color: "orange"
    },
  ];

  const partners = [
    "Startup Kano", "AUA Technology", "BlueSapphire Hub", "Sapphital Abuja", 
    "Federal Ministry of Youth Development", "Digital Transformation Center", 
    "NBS", "NITDA", "AFAN", "BOA", "BOI", "DroneForge Africa"
  ];

  const objectives = [
    { label: "Post-Harvest Losses", value: "-40%", detail: "Target reduction" },
    { label: "Farmer Income", value: "+35%", detail: "Projected increase" },
    { label: "Food Security", value: "High", detail: "Supply chain strength" },
    { label: "Youth Jobs", value: "Active", detail: "Rural employment" },
  ];

  return (
    <div className="min-h-screen bg-[#040608] text-white selection:bg-emerald-500/30 overflow-x-hidden font-sans">
      {/* Decorative Blur Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#040608]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                <Wheat className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tighter">Grain<span className="text-emerald-500">toX</span></span>
            </div>
            <div className="hidden lg:flex items-center gap-8 text-[13px] font-bold uppercase tracking-widest text-gray-400">
              <a href="#about" className="hover:text-emerald-400 transition-colors">About</a>
              <a href="#ecosystem" className="hover:text-emerald-400 transition-colors">Ecosystem</a>
              <a href="#market" className="hover:text-emerald-400 transition-colors">Market</a>
              <a href="#impact" className="hover:text-emerald-400 transition-colors">Impact</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="text-gray-300 hover:text-white hover:bg-white/5 font-bold px-6 h-11"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
            <Button 
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-8 h-11 rounded-full shadow-xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
              onClick={() => navigate("/signup")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-44 pb-32 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-black mb-8 uppercase tracking-[0.2em] animate-fade-in">
              <ShieldCheck className="w-4 h-4" /> The Future of African Agri-Finance
            </div>
            <h1 className="text-6xl lg:text-[84px] font-black leading-[0.95] mb-8 tracking-tighter">
              Transforming <br />
              <span className="text-emerald-500">Grains</span> into <br />
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">Digital Wealth</span>
            </h1>
            <p className="text-xl text-gray-400 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Join the elite ecosystem where agriculture meets high-tech finance. Secure storage, AI-driven insights, and instant liquidity for the modern farmer.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
              <Button 
                size="lg" 
                className="w-full sm:w-auto h-16 px-10 bg-emerald-500 hover:bg-emerald-400 text-black text-lg font-black rounded-2xl shadow-2xl shadow-emerald-500/20 transition-all hover:scale-105"
                onClick={() => navigate("/signup")}
              >
                Launch App <Zap className="ml-2 w-5 h-5 fill-current" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto h-16 px-10 border-white/10 bg-white/5 hover:bg-white/10 text-lg font-bold rounded-2xl backdrop-blur-md"
              >
                View Markets <BarChart3 className="ml-2 w-5 h-5 text-emerald-500" />
              </Button>
            </div>
            
            {/* Trust Badge */}
            <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 opacity-40 grayscale group hover:grayscale-0 transition-all duration-500">
               <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Regulated By</span>
                  <span className="text-lg font-black text-white">CBN • SEC</span>
               </div>
               <div className="w-[1px] h-10 bg-white/10" />
               <div className="flex flex-col">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Security</span>
                  <span className="text-lg font-black text-white">ISO 27001</span>
               </div>
            </div>
          </div>

          <div className="relative group">
            {/* Visual Decorative Elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700" />
            
            <div className="relative z-10 rounded-[3rem] border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-3 backdrop-blur-2xl shadow-[0_0_80px_rgba(16,185,129,0.1)] transition-transform duration-700 group-hover:scale-[1.02]">
              <div className="overflow-hidden rounded-[2.5rem]">
                <img 
                  src="graintox_hero_visual_1776806467275.png" 
                  alt="GrainTox Interface" 
                  className="w-full h-auto object-cover transform transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
              
              {/* Overlay Stat Cards */}
              <div className="absolute -bottom-8 -right-8 p-6 bg-[#0b0e11] rounded-[2rem] border border-emerald-500/30 shadow-2xl backdrop-blur-xl animate-bounce-slow">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-emerald-500/20 rounded-2xl">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Yield Index</div>
                    <div className="text-2xl font-black">+38.4%</div>
                  </div>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-emerald-500" />
                </div>
              </div>

              <div className="absolute -top-6 -left-6 p-5 bg-[#0b0e11] rounded-[2rem] border border-blue-500/30 shadow-2xl backdrop-blur-xl animate-bounce-slow delay-500">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                  <span className="text-xs font-bold text-gray-300">Live Trading Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Impact Section */}
      <section id="impact" className="py-24 bg-white/[0.02] border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20">
            {objectives.map((obj, i) => (
              <div key={i} className="relative group text-center lg:text-left">
                <div className="text-5xl lg:text-6xl font-black text-white mb-3 group-hover:text-emerald-500 transition-colors duration-500">{obj.value}</div>
                <div className="text-[11px] font-black text-emerald-500 mb-2 uppercase tracking-[0.2em]">{obj.label}</div>
                <p className="text-xs text-gray-500 font-bold tracking-wide">{obj.detail}</p>
                {i < 3 && <div className="hidden lg:block absolute top-1/2 -right-10 w-px h-16 bg-white/10 -translate-y-1/2" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section id="ecosystem" className="py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">Unified <span className="text-emerald-500">Agri-Tech</span> Stack</h2>
              <p className="text-lg text-gray-400 font-medium leading-relaxed">
                We've built the world's most advanced agricultural value chain system, designed for institutional efficiency and smallholder inclusion.
              </p>
            </div>
            <Button variant="link" className="text-emerald-500 font-black p-0 h-auto hover:text-emerald-400 text-lg group">
              Explore Documentation <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="group p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="mb-8 p-5 bg-white/5 rounded-[1.5rem] w-fit group-hover:bg-emerald-500/10 group-hover:scale-110 transition-all duration-500">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                  {feature.description}
                </p>
                <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                   <div className="flex items-center gap-2 text-xs font-black text-emerald-500 uppercase tracking-widest cursor-pointer hover:gap-3 transition-all">
                      Learn More <ChevronRight className="w-4 h-4" />
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Section */}
      <section id="about" className="py-32 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-24 items-center">
          <div className="flex-1 relative order-2 md:order-1">
             <div className="grid grid-cols-2 gap-6 relative z-10">
                <div className="space-y-6 pt-12">
                   <div className="p-8 rounded-[2.5rem] bg-emerald-500 text-black flex flex-col justify-between h-56 shadow-2xl shadow-emerald-500/20">
                      <Zap className="w-10 h-10 fill-current" />
                      <div>
                        <div className="text-4xl font-black tracking-tighter">40%</div>
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-80">Waste Reduction</div>
                      </div>
                   </div>
                   <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex flex-col justify-between h-56 backdrop-blur-xl">
                      <Users className="w-10 h-10 text-purple-400" />
                      <div>
                        <div className="text-4xl font-black tracking-tighter">10k+</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Verified Farmers</div>
                      </div>
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex flex-col justify-between h-56 backdrop-blur-xl">
                      <Globe2 className="w-10 h-10 text-blue-400" />
                      <div>
                        <div className="text-4xl font-black tracking-tighter">NG</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Strategic Hub</div>
                      </div>
                   </div>
                   <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 flex flex-col justify-between h-56 backdrop-blur-xl">
                      <Smartphone className="w-10 h-10 text-orange-400" />
                      <div>
                        <div className="text-4xl font-black tracking-tighter">Mobile</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">Wallet Support</div>
                      </div>
                   </div>
                </div>
             </div>
             {/* Background glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px] -z-10" />
          </div>

          <div className="flex-1 order-1 md:order-2">
            <h2 className="text-4xl md:text-6xl font-black mb-8 leading-[0.95] tracking-tighter">Empowering Africa's <br /> <span className="text-emerald-500">Smallholder Heroes</span></h2>
            <div className="space-y-8 text-gray-400 text-lg font-medium leading-relaxed">
              <p>
                The backbone of our economy deserves elite-tier infrastructure. We bridge the gap between rural production and urban capital with cutting-edge digital twins for every harvest.
              </p>
              <div className="grid gap-6 mt-12">
                {[
                  "Eliminate middle-man exploitation",
                  "Direct institutional investment access",
                  "Blockchain-verified warehouse receipts",
                  "Global market price transparency"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-125 transition-transform">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                    </div>
                    <span className="text-base text-gray-200 font-bold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Scrolling Bar (Simplified) */}
      <section className="py-24 px-4 border-t border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-4">Ecosystem Backbone</h3>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-16 gap-y-10 opacity-30 group hover:opacity-80 transition-opacity duration-700">
            {partners.slice(0, 8).map((p, i) => (
              <span key={i} className="text-xl font-black tracking-tighter hover:text-emerald-500 transition-colors cursor-default whitespace-nowrap">{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 relative">
        <div className="max-w-6xl mx-auto rounded-[4rem] bg-gradient-to-br from-emerald-600 to-emerald-900 p-16 md:p-24 relative overflow-hidden shadow-[0_40px_100px_rgba(16,185,129,0.2)]">
          {/* Decorative patterns */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 text-center">
            <h2 className="text-5xl md:text-7xl font-black text-black mb-8 tracking-tighter leading-[0.95]">Join the New Era of <br /> Agriculture.</h2>
            <p className="text-emerald-950/70 text-xl md:text-2xl mb-12 max-w-2xl mx-auto font-bold leading-relaxed">
              Scale your impact, secure your future, and trade with the speed of light on the GraintoX exchange.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button 
                size="lg" 
                className="bg-black text-white hover:bg-gray-900 w-full sm:w-auto px-12 h-20 text-xl font-black rounded-3xl shadow-2xl transition-all hover:scale-105 active:scale-95"
                onClick={() => navigate("/signup")}
              >
                Create Account
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-black/20 text-black hover:bg-black/5 w-full sm:w-auto px-12 h-20 text-xl font-black rounded-3xl transition-all"
              >
                Contact Ops
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-4 bg-[#040608] border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Wheat className="text-white w-6 h-6" />
                </div>
                <span className="text-2xl font-black tracking-tighter">Grain<span className="text-emerald-500">toX</span></span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed font-medium mb-10">
                Enabling institutional-grade growth and food security through hyper-modern digital infrastructure for African agriculture.
              </p>
              <div className="text-[10px] text-gray-700 font-black tracking-[0.2em] uppercase">RC NO: 9458667</div>
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-white">Platform</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-bold">
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Digital Warehouse</a></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Marketplace</a></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">AI Insights</a></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Digital Wallets</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-white">Resources</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-bold">
                <li><a href="#" className="hover:text-emerald-500 transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Market Reports</a></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Audit Logs</a></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Whitepaper</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-white">Support</h4>
              <ul className="space-y-4 text-sm text-gray-500 font-bold">
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-emerald-500 transition-colors">Status Page</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-gray-600 text-xs font-medium uppercase tracking-widest">
              © 2024 GraintoX Limited. Built with Excellence.
            </div>
            <div className="flex items-center gap-10">
              <a href="#" className="text-gray-600 hover:text-white text-xs font-bold transition-colors">Privacy</a>
              <a href="#" className="text-gray-600 hover:text-white text-xs font-bold transition-colors">Terms</a>
              <div className="w-[1px] h-4 bg-white/10" />
              {/* Requested Admin Login Link */}
              <button 
                onClick={() => navigate("/admin/login")}
                className="text-emerald-500 hover:text-emerald-400 text-xs font-black uppercase tracking-widest transition-all hover:scale-105 active:opacity-70 flex items-center gap-2"
              >
                <Lock className="w-3 h-3" /> Admin Login
              </button>
            </div>
          </div>
        </div>
      </footer>
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out forwards;
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
