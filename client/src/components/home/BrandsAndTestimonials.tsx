const BRANDS = [
  { name: 'Apple', letter: '' },
  { name: 'Samsung', letter: '' },
  { name: 'Spigen', letter: '' },
  { name: 'ESR', letter: '' },
  { name: 'Anker', letter: '' },
  { name: 'Nomad', letter: '' },
  { name: 'Casetify', letter: '' },
  { name: 'Belkin', letter: '' },
];

const TESTIMONIALS = [
  {
    name: 'Ahmed Al-Rashidi',
    location: 'Dubai, UAE',
    rating: 5,
    text: 'The iPhone 16 Pro case is stunning. Premium feel, MagSafe works flawlessly. Best case I\'ve ever owned.',
    avatar: 'AA',
    product: 'iPhone 16 Pro — Aramid Case',
  },
  {
    name: 'Sara M.',
    location: 'Abu Dhabi, UAE',
    rating: 5,
    text: 'My Apple Watch band from CaseHub is better quality than the original Apple band. Worth every dirham.',
    avatar: 'SM',
    product: 'Apple Watch Band — Leather',
  },
  {
    name: 'Khalid J.',
    location: 'Sharjah, UAE',
    rating: 5,
    text: 'Fast shipping, beautiful packaging. The screen protector installed perfectly. Zero bubbles, crystal clear.',
    avatar: 'KJ',
    product: 'Screen Protector — 9H Glass',
  },
  {
    name: 'Nour F.',
    location: 'Dubai, UAE',
    rating: 5,
    text: 'Ordered 3 cases and they all look and feel incredible. CaseHub is my only go-to for accessories now.',
    avatar: 'NF',
    product: 'Samsung S25 Ultra Case',
  },
];

const BrandsAndTestimonials = () => (
  <>
    {/* Brands */}
    <section className="py-16 bg-[#090909] border-y border-[#141414]">
      <div className="container mx-auto px-6">
        <p className="text-center text-gray-700 text-[10px] uppercase tracking-[0.3em] font-bold mb-10">
          Compatible with leading brands
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {BRANDS.map((b) => (
            <div key={b.name} className="text-gray-700 hover:text-gray-400 transition-colors duration-300">
              <span className="text-lg font-black tracking-tight">{b.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Testimonials */}
    <section className="py-24 bg-[#080808]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">Customer Reviews</p>
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-none">
            Loved by<br />
            <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">50,000+ Customers</span>
          </h2>
          <div className="flex items-center justify-center gap-1 mt-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-gray-400 text-sm ml-2">4.9 out of 5</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="group bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 hover:border-amber-500/20 transition-all duration-300 hover:bg-[#131210]">
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed mb-5">"{t.text}"</p>
              <div className="border-t border-[#1e1e1e] pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-black flex-shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{t.name}</p>
                    <p className="text-gray-600 text-[11px]">{t.location}</p>
                  </div>
                </div>
                <p className="text-gray-700 text-[10px] mt-2 truncate">✓ Verified: {t.product}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </>
);

export default BrandsAndTestimonials;
