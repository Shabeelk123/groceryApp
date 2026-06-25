import { Link } from 'react-router-dom';

const CATEGORIES = [
  {
    name: 'iPhone Cases',
    slug: 'iPhone Cases',
    label: 'MOST POPULAR',
    description: 'MagSafe · Aramid · Leather',
    icon: '📱',
    accent: 'from-blue-500/20 to-blue-600/5',
    border: 'group-hover:border-blue-500/40',
  },
  {
    name: 'MagSafe',
    slug: 'MagSafe Accessories',
    label: 'NEW',
    description: 'Wallets · Mounts · Pads',
    icon: '🧲',
    accent: 'from-purple-500/20 to-purple-600/5',
    border: 'group-hover:border-purple-500/40',
  },
  {
    name: 'Watch Bands',
    slug: 'Apple Watch Bands',
    label: 'TRENDING',
    description: 'Sport · Leather · Milanese',
    icon: '⌚',
    accent: 'from-amber-500/20 to-amber-600/5',
    border: 'group-hover:border-amber-500/40',
  },
  {
    name: 'Earbuds',
    slug: 'Earbuds',
    label: null,
    description: 'Noise Cancelling · TWS',
    icon: '🎧',
    accent: 'from-green-500/20 to-green-600/5',
    border: 'group-hover:border-green-500/40',
  },
  {
    name: 'Chargers',
    slug: 'Chargers',
    label: null,
    description: '65W GaN · MagSafe · Wireless',
    icon: '⚡',
    accent: 'from-yellow-500/20 to-yellow-600/5',
    border: 'group-hover:border-yellow-500/40',
  },
  {
    name: 'Power Banks',
    slug: 'Power Banks',
    label: null,
    description: '20,000mAh · MagSafe · Slim',
    icon: '🔋',
    accent: 'from-red-500/20 to-red-600/5',
    border: 'group-hover:border-red-500/40',
  },
  {
    name: 'Screen Guards',
    slug: 'Screen Protectors',
    label: null,
    description: '9H Glass · Anti-Glare',
    icon: '🔲',
    accent: 'from-cyan-500/20 to-cyan-600/5',
    border: 'group-hover:border-cyan-500/40',
  },
  {
    name: 'Cables',
    slug: 'Cables',
    label: null,
    description: 'USB-C · Lightning · Braided',
    icon: '🔌',
    accent: 'from-orange-500/20 to-orange-600/5',
    border: 'group-hover:border-orange-500/40',
  },
];

const CategoriesSection = () => (
  <section className="py-24 bg-[#090909]">
    <div className="container mx-auto px-6">
      {/* Header */}
      <div className="flex items-end justify-between mb-14">
        <div>
          <p className="text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">Browse by Category</p>
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-none">
            Shop by<br />
            <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">Category</span>
          </h2>
        </div>
        <Link
          to="/products"
          className="hidden md:inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
        >
          View all
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            to={`/collections/${encodeURIComponent(cat.slug)}`}
            className={`group relative bg-[#111] border border-[#1e1e1e] rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 ${cat.border}`}
          >
            {/* Gradient bg on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${cat.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            <div className="relative">
              {cat.label && (
                <span className="inline-block text-[9px] font-black tracking-widest uppercase bg-amber-500/15 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full mb-3">
                  {cat.label}
                </span>
              )}
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300 origin-left">
                {cat.icon}
              </div>
              <h3 className="text-white font-bold text-sm mb-1 leading-tight">{cat.name}</h3>
              <p className="text-gray-600 text-[11px] leading-relaxed">{cat.description}</p>

              <div className="mt-4 flex items-center gap-1 text-gray-600 group-hover:text-gray-400 transition-colors">
                <span className="text-[11px] font-medium">Explore</span>
                <svg className="w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
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

export default CategoriesSection;
