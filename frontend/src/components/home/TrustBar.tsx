import { ShieldCheck, Truck, RotateCcw, BadgeCheck } from 'lucide-react';

export function TrustBar() {
  const values = [
    { icon: BadgeCheck, text: "100% Original" },
    { icon: ShieldCheck, text: "Verified Authentic" },
    { icon: Truck, text: "Cash on Delivery" },
    { icon: RotateCcw, text: "7-Day Returns" }
  ];

  return (
    <section className="border-y border-subtle-border bg-main-bg">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12 flex flex-col sm:flex-row justify-between items-center gap-10 divide-y sm:divide-x sm:divide-y-0 divide-subtle-border text-[10px] font-black uppercase tracking-[0.4em] text-muted-text">
        {values.map((item, idx) => (
          <div key={idx} className="flex items-center justify-center gap-4 w-full sm:w-1/4 pt-10 sm:pt-0 group">
            <div className="p-2 bg-offset-bg border border-subtle-border shadow-sm group-hover:shadow-brutalist group-hover:border-primary transition-all duration-300">
              <item.icon className="text-primary group-hover:scale-110 transition-all duration-300" size={24} strokeWidth={2.5} />
            </div>
            <span className="group-hover:text-main-text transition-colors italic">{item.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
