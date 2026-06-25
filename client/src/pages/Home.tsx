import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../lib/axiosConfig';
import BeforeAfterSlider from '../components/BeforeAfterSlider';

const CATEGORIES = [
  { name: 'iPhone Cases', emoji: '📱', desc: 'Slim, tough & stylish iPhone protection' },
  { name: 'Samsung Cases', emoji: '🛡️', desc: 'Perfect fit for every Samsung model' },
  { name: 'Screen Protectors', emoji: '🔲', desc: 'Crystal-clear tempered glass shields' },
  { name: 'Watch Straps', emoji: '⌚', desc: 'Leather & sport Apple Watch bands' },
  { name: 'Chargers & Cables', emoji: '⚡', desc: 'Fast-charge cables & adapters' },
  { name: 'AirPod Cases', emoji: '🎧', desc: 'Protective AirPods accessories' },
];

const Home = () => {
  const [liveCategories, setLiveCategories] = useState<string[]>([]);

  useEffect(() => {
    axiosInstance.get('/api/products/list')
      .then((res) => {
        const cats: string[] = [...new Set((res.data.products || []).map((p: any) => p.category))];
        setLiveCategories(cats);
      })
      .catch(() => { });
  }, []);

  // Show live categories if available, else fallback to default list
  const displayCats = liveCategories.length > 0
    ? CATEGORIES.filter((c) => liveCategories.includes(c.name))
    : CATEGORIES;
  const showCats = displayCats.length > 0 ? displayCats : CATEGORIES;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-4xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-amber-600/10 rounded-full blur-4xl pointer-events-none" />

        <div className="relative container mx-auto px-6 py-28 text-center">
          <p className="text-amber-400 text-sm font-semibold tracking-[0.2em] uppercase mb-4">
            Premium Mobile Accessories
          </p>
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Protect in Style.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300">
              Express Yourself.
            </span>
          </h1>
          <p className="text-gray-400 text-xl mb-10 max-w-xl mx-auto">
            Premium cases, screen guards, and accessories crafted for every device — built tough, designed beautifully.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-block bg-gradient-to-r from-amber-500 to-yellow-400 text-black px-8 py-3.5 rounded-full font-bold hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/30"
            >
              Shop Collection →
            </Link>
            <Link
              to="/products"
              className="inline-block border border-white/20 text-white px-8 py-3.5 rounded-full font-medium hover:bg-white/5 transition"
            >
              Browse All
            </Link>
          </div>
        </div>
      </section>

      {/* ── Ticker bar ── */}
      <div className="bg-amber-500 text-black py-2.5 overflow-hidden">
        <div className="flex gap-16 animate-none whitespace-nowrap text-sm font-semibold tracking-wide px-6">
          {['Free Shipping on orders above ₹499', 'Same-Day Dispatch', 'Premium Materials', 'Easy 7-Day Returns', 'Secure Checkout'].map((t, i) => (
            <span key={i}>✦ {t}</span>
          ))}
        </div>
      </div>

      {/* ── Categories ── */}
      <section className="py-20 bg-[#0d0d0d]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-2">Browse</p>
            <h2 className="text-4xl font-bold">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {showCats.map((cat) => (
              <Link
                key={cat.name}
                to={`/collections/${encodeURIComponent(cat.name)}`}
                className="group bg-[#161616] border border-[#2a2a2a] rounded-xl p-6 text-center hover:border-amber-500/50 hover:bg-[#1e1a10] transition-all duration-300"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{cat.emoji}</div>
                <h3 className="text-sm font-bold text-white mb-1">{cat.name}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Before / After Slider ── */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-2">Protection Matters</p>
            <h2 className="text-4xl font-bold">See the Difference</h2>
            <p className="text-gray-500 mt-2 text-sm">Drag the handle to compare protected vs unprotected</p>
          </div>
          <div className="max-w-lg mx-auto">
            <BeforeAfterSlider
              beforeSrc="/before.webp"
              afterSrc="/after.webp"
              beforeLabel="Without Case"
              afterLabel="With CaseHub"
              linkTo="/collections/iPhone%20Cases"
              linkLabel="Shop iPhone Cases"
            />
          </div>
        </div>
      </section>

      {/* ── Why CaseHub ── */}
      <section className="py-20 bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-2">Our Promise</p>
            <h2 className="text-4xl font-bold">Why Choose CaseHub?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🛡️', title: 'Military-Grade Protection', desc: 'Every case is drop-tested and engineered to absorb shocks and keep your device pristine.' },
              { icon: '✨', title: 'Premium Materials', desc: 'Genuine leather, aramid fiber, tempered glass — we use only materials that last and look exceptional.' },
              { icon: '🚀', title: 'Fast Delivery', desc: 'Same-day dispatch on orders placed before 3 PM. Free shipping across India above ₹499.' },
            ].map((item) => (
              <div key={item.title} className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-8 hover:border-amber-500/30 transition-colors duration-300">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-5 text-2xl">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Materials highlight ── */}
      <section className="py-20 bg-[#0d0d0d] border-t border-[#1e1e1e]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-amber-400 text-xs font-semibold tracking-widest uppercase mb-2">Craftsmanship</p>
            <h2 className="text-4xl font-bold">Materials We Use</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { material: 'Genuine Leather', detail: 'Rich, natural, ages beautifully' },
              { material: 'Aramid Fiber', detail: 'Aerospace-grade, ultra-lightweight' },
              { material: 'Tempered Glass', detail: '9H hardness, anti-fingerprint' },
              { material: 'Vegan Leather', detail: 'Eco-friendly, premium look' },
            ].map((m) => (
              <div key={m.material} className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5 text-center hover:border-amber-500/40 transition-colors duration-300">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-400 mx-auto mb-3" />
                <p className="font-bold text-sm">{m.material}</p>
                <p className="text-gray-500 text-xs mt-1">{m.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-yellow-500">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-black mb-3">
            Find the Perfect Case Today
          </h2>
          <p className="text-black/70 text-lg mb-8">
            Premium protection for iPhone, Samsung & more — shipped fast across India.
          </p>
          <Link
            to="/register"
            className="inline-block bg-black text-white px-10 py-3.5 rounded-full font-bold hover:bg-gray-900 transition shadow-xl"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#080808] border-t border-[#1e1e1e] py-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-2xl font-extrabold text-amber-400 mb-1">CaseHub</p>
              <p className="text-gray-500 text-sm">Premium mobile accessories delivered fast across India.</p>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <Link to="/products" className="hover:text-white transition">Products</Link>
              <Link to="/cart" className="hover:text-white transition">Cart</Link>
              <Link to="/orders" className="hover:text-white transition">My Orders</Link>
            </div>
          </div>
          <p className="text-center text-gray-700 text-xs mt-8">
            © {new Date().getFullYear()} CaseHub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};


export default Home;
