import { Link } from 'react-router-dom';

const COLLECTIONS = [
  {
    title: 'iPhone 16 Pro',
    subtitle: 'Protection Redefined',
    desc: 'Ultra-slim MagSafe cases with titanium-grade protection.',
    slug: 'iPhone Cases',
    accent: '#c9a84c',
    bg: 'from-amber-950/60 via-[#0e0d0b] to-[#0e0d0b]',
    tag: 'New Season',
  },
  {
    title: 'Samsung S25',
    subtitle: 'Premium Series',
    desc: 'Precision-fit cases in genuine leather and aramid fiber.',
    slug: 'Samsung Cases',
    accent: '#6366f1',
    bg: 'from-indigo-950/60 via-[#0a0a10] to-[#0a0a10]',
    tag: 'Just Landed',
  },
  {
    title: 'Apple Watch',
    subtitle: 'Band Collection',
    desc: 'Leather, sport, and Milanese bands for every occasion.',
    slug: 'Apple Watch Bands',
    accent: '#22c55e',
    bg: 'from-green-950/60 via-[#080e0a] to-[#080e0a]',
    tag: 'Bestseller',
  },
];

const CollectionsSection = () => (
  <section className="py-24 bg-[#080808]">
    <div className="container mx-auto px-6">
      <div className="mb-14">
        <p className="text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">Curated Drops</p>
        <h2 className="text-4xl lg:text-5xl font-black text-white leading-none">
          Shop the<br />
          <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">Collections</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLLECTIONS.map((col) => (
          <Link
            key={col.slug}
            to={`/collections/${encodeURIComponent(col.slug)}`}
            className={`group relative bg-gradient-to-br ${col.bg} border border-[#1e1e1e] rounded-3xl p-8 overflow-hidden hover:border-[#2a2a2a] transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl`}
          >
            {/* Glow */}
            <div
              className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
              style={{ background: col.accent }}
            />
            <div className="absolute top-0 left-0 right-0 h-px opacity-30" style={{ background: `linear-gradient(90deg, transparent, ${col.accent}, transparent)` }} />

            <div className="relative">
              <span
                className="inline-block text-[9px] font-black tracking-widest uppercase border px-3 py-1 rounded-full mb-6"
                style={{ color: col.accent, borderColor: `${col.accent}40`, background: `${col.accent}10` }}
              >
                {col.tag}
              </span>

              <div className="text-6xl mb-5">📱</div>

              <h3 className="text-white text-2xl font-black mb-1">{col.title}</h3>
              <p className="font-medium mb-3" style={{ color: col.accent }}>{col.subtitle}</p>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">{col.desc}</p>

              <div className="flex items-center gap-2 font-bold text-sm" style={{ color: col.accent }}>
                Shop Now
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default CollectionsSection;
