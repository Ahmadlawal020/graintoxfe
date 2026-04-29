export const ImpactSection = () => {
  const objectives = [
    { label: "Post-Harvest Losses", value: "-40%", detail: "Target reduction" },
    { label: "Farmer Income", value: "+35%", detail: "Projected increase" },
    { label: "Food Security", value: "High", detail: "Supply chain strength" },
    { label: "Youth Jobs", value: "Active", detail: "Rural employment" },
  ];

  return (
    <section id="impact" className="py-24 bg-primary text-primary-foreground relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-20">
          {objectives.map((obj, i) => (
            <div key={i} className="relative group text-center lg:text-left">
              <div className="text-5xl lg:text-6xl font-black mb-3">{obj.value}</div>
              <div className="text-[11px] font-black text-primary-foreground/80 mb-2 uppercase tracking-[0.2em]">{obj.label}</div>
              <p className="text-xs text-primary-foreground/70 font-bold tracking-wide">{obj.detail}</p>
              {i < 3 && <div className="hidden lg:block absolute top-1/2 -right-10 w-px h-16 bg-primary-foreground/20 -translate-y-1/2" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
