import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldCheck, TrendingUp, Zap, BarChart3 } from "lucide-react";

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-44 pb-32 px-4 bg-gradient-to-b from-primary/10 via-background to-background">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
        <div className="text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary/80 text-[11px] font-black mb-8 uppercase tracking-[0.2em] animate-fade-in">
            <ShieldCheck className="w-4 h-4" /> The Future of African Agri-Finance
          </div>
          <h1 className="text-6xl lg:text-[84px] font-black leading-[0.95] mb-8 tracking-tighter">
            Transforming <br />
            <span className="text-primary">Grains</span> into <br />
            <span className="bg-gradient-to-r from-primary/80 via-blue-400 to-purple-500 bg-clip-text text-transparent">Digital Wealth</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            Join the elite ecosystem where agriculture meets high-tech finance. Secure storage, AI-driven insights, and instant liquidity for the modern farmer.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5">
            <Button
              size="lg"
              className="w-full sm:w-auto h-16 px-10 bg-primary hover:bg-primary/80 text-primary-foreground text-lg font-black rounded-2xl shadow-2xl shadow-primary/20 transition-all hover:scale-105"
              onClick={() => navigate("/signup")}
            >
              Launch App <Zap className="ml-2 w-5 h-5 fill-current" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-16 px-10 border-border bg-accent hover:bg-accent text-lg font-bold rounded-2xl backdrop-blur-md"
            >
              View Markets <BarChart3 className="ml-2 w-5 h-5 text-primary" />
            </Button>
          </div>

          {/* Trust Badge */}
          <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 opacity-40 grayscale group hover:grayscale-0 transition-all duration-500">
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Regulated By</span>
              <span className="text-lg font-black text-foreground">CBN • SEC</span>
            </div>
            <div className="w-[1px] h-10 bg-accent" />
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Security</span>
              <span className="text-lg font-black text-foreground">ISO 27001</span>
            </div>
          </div>
        </div>

        <div className="relative group">
          {/* Visual Decorative Elements */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700" />

          <div className="relative z-10 rounded-[3rem] border border-border bg-gradient-to-br from-white/10 to-transparent p-3 backdrop-blur-2xl shadow-[0_0_80px_rgba(16,185,129,0.1)] transition-transform duration-700 group-hover:scale-[1.02]">
            <div className="overflow-hidden rounded-[2.5rem]">
              <img
                src="graintox_hero_visual_1776806467275.png"
                alt="GrainTox Interface"
                className="w-full h-auto object-cover transform transition-transform duration-1000 group-hover:scale-110"
              />
            </div>

            {/* Overlay Stat Cards */}
            <div className="absolute -bottom-8 -right-8 p-6 bg-card rounded-[2rem] border border-primary/30 shadow-2xl backdrop-blur-xl animate-bounce-slow">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-primary/20 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-primary/80" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-primary uppercase tracking-widest">Yield Index</div>
                  <div className="text-2xl font-black">+38.4%</div>
                </div>
              </div>
              <div className="w-full h-1 bg-accent rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-primary" />
              </div>
            </div>

            <div className="absolute -top-6 -left-6 p-5 bg-card rounded-[2rem] border border-blue-500/30 shadow-2xl backdrop-blur-xl animate-bounce-slow delay-500">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                <span className="text-xs font-bold text-muted-foreground">Live Trading Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
