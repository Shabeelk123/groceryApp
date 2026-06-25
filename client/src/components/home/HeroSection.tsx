import { Link } from 'react-router-dom';

const HeroSection = () => (
  <section className="relative min-h-screen flex items-center overflow-hidden bg-[#080808]">
    {/* Ambient light blobs */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full bg-amber-500/8 blur-[120px]" />
      <div className="absolute bottom-[-5%] right-[10%] w-[400px] h-[400px] rounded-full bg-amber-600/6 blur-[100px]" />
      <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full bg-yellow-400/5 blur-[80px]" />
    </div>

    {/* Noise texture overlay */}
    <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWx0ZXI9InVybCgjYSkiIG9wYWNpdHk9IjEiLz48L3N2Zz4=')]" />

    <div className="relative container mx-auto px-6 pt-24 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      {/* Left: Copy */}
      <div>
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-amber-400 text-xs font-semibold tracking-[0.15em] uppercase">Premium Mobile Accessories · Dubai</span>
        </div>

        <h1 className="text-[clamp(2.8rem,6vw,5.5rem)] font-black leading-[1.02] tracking-tight text-white mb-6">
          Protect.<br />
          <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
            Express.
          </span><br />
          Elevate.
        </h1>

        <p className="text-gray-400 text-lg leading-relaxed max-w-md mb-10">
          Cases, bands, chargers, and accessories engineered for people who refuse to compromise on quality or style.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link
            to="/products"
            className="group relative inline-flex items-center gap-2 bg-amber-500 text-black px-8 py-4 rounded-full font-bold text-sm tracking-wide hover:bg-amber-400 transition-all duration-300 shadow-[0_0_40px_rgba(201,168,76,0.3)] hover:shadow-[0_0_60px_rgba(201,168,76,0.5)]"
          >
            Shop Collection
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link
            to="/collections/iPhone%20Cases"
            className="inline-flex items-center gap-2 border border-white/10 text-white/80 px-8 py-4 rounded-full font-medium text-sm hover:border-white/30 hover:text-white hover:bg-white/5 transition-all duration-300"
          >
            iPhone Cases
          </Link>
        </div>

        {/* Social proof */}
        <div className="flex items-center gap-8 mt-12 pt-10 border-t border-white/5">
          {[
            { value: '50K+', label: 'Happy Customers' },
            { value: '4.9★', label: 'Average Rating' },
            { value: '200+', label: 'Products' },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-xl font-black text-white">{s.value}</p>
              <p className="text-gray-600 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Visual stack */}
      <div className="relative hidden lg:flex items-center justify-center">
        <div className="relative w-[440px] h-[520px]">
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/20 to-transparent blur-2xl" />

          {/* Main card */}
          <div className="absolute inset-4 rounded-3xl bg-gradient-to-br from-[#1c1a14] via-[#141210] to-[#0e0c0a] border border-amber-500/15 backdrop-blur-sm overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
            <div className="h-full flex flex-col items-center justify-center p-10 text-center">
              <div className="text-8xl mb-6">📱</div>
              <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-2">New Arrival</p>
              <h3 className="text-white text-xl font-bold mb-1">iPhone 16 Pro Case</h3>
              <p className="text-gray-500 text-sm mb-6">Aramid Fiber · Magnetic</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">AED 149</span>
                <span className="text-gray-600 line-through text-sm">AED 199</span>
              </div>
            </div>
          </div>

          {/* Floating badge: discount */}
          <div className="absolute -top-3 -right-3 bg-amber-500 text-black text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
            25% OFF
          </div>

          {/* Floating badge: free ship */}
          <div className="absolute -bottom-3 -left-3 bg-[#1a1a1a] border border-[#2a2a2a] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-xl backdrop-blur-sm">
            🚀 Free Shipping
          </div>
        </div>
      </div>
    </div>

    {/* Scroll indicator */}
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-600">
      <span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
      <div className="w-px h-10 bg-gradient-to-b from-gray-600 to-transparent" />
    </div>
  </section>
);

export default HeroSection;
