const ITEMS = [
  '✦ Free Shipping on AED 200+',
  '✦ Same-Day Dispatch',
  '✦ Military-Grade Protection',
  '✦ MagSafe Compatible',
  '✦ 7-Day Easy Returns',
  '✦ Lifetime Warranty',
  '✦ 50,000+ Customers',
  '✦ Authentic Products',
];

const MarqueeBar = () => (
  <div className="relative bg-amber-500 overflow-hidden py-3 select-none">
    <div className="flex animate-[marquee_28s_linear_infinite] whitespace-nowrap">
      {[...ITEMS, ...ITEMS].map((item, i) => (
        <span key={i} className="text-black text-xs font-bold tracking-[0.12em] uppercase px-8">
          {item}
        </span>
      ))}
    </div>
    {/* Fade edges */}
    <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-amber-500 to-transparent pointer-events-none" />
    <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-amber-500 to-transparent pointer-events-none" />
  </div>
);

export default MarqueeBar;
