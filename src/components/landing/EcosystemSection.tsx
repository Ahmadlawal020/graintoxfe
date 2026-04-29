import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronRight, Database, Cpu, TrendingUp, Wallet } from "lucide-react";

export const EcosystemSection = () => {
  const features = [
    {
      title: "Digital Grain Storage",
      description: "Secure, certified warehouse storage that converts your agricultural produce into bankable digital assets.",
      icon: <Database className="w-8 h-8 text-primary/80" />,
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

  return (
    <section id="ecosystem" className="py-32 px-4 relative bg-primary/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter">Unified <span className="text-primary">Agri-Tech</span> Stack</h2>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
              We've built the world's most advanced agricultural value chain system, designed for institutional efficiency and smallholder inclusion.
            </p>
          </div>
          <Button variant="link" className="text-primary font-black p-0 h-auto hover:text-primary/80 text-lg group">
            Explore Documentation <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="group p-10 rounded-[2.5rem] bg-background border border-primary/10 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-500 hover:-translate-y-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="mb-8 p-5 bg-primary/5 rounded-[1.5rem] w-fit group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-500">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-black mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                {feature.description}
              </p>
              <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-widest cursor-pointer hover:gap-3 transition-all">
                  Learn More <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
