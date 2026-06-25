import { Link } from 'react-router-dom';
import BeforeAfterSlider from '../BeforeAfterSlider';

const WHY = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.955 11.955 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    ),
    title: 'Military-Grade Protection',
    desc: 'Drop-tested to MIL-STD-810G standards.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
      </svg>
    ),
    title: 'Premium Materials Only',
    desc: 'Genuine leather, aramid fiber, tempered glass.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
      </svg>
    ),
    title: 'Same-Day Dispatch',
    desc: 'Order before 3 PM — ships today within UAE.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    title: '7-Day Easy Returns',
    desc: 'Not satisfied? Free returns, no questions asked.',
  },
];

const INSTAGRAM_PLACEHOLDERS = [
  { id: 1, emoji: '📱', label: '@casehub · iPhone case' },
  { id: 2, emoji: '⌚', label: '@casehub · Watch band' },
  { id: 3, emoji: '🎧', label: '@casehub · AirPods case' },
  { id: 4, emoji: '⚡', label: '@casehub · Charger setup' },
  { id: 5, emoji: '🔲', label: '@casehub · Screen protector' },
  { id: 6, emoji: '🔋', label: '@casehub · Power bank' },
];

const BottomSections = () => (
  <>
    {/* Why CaseHub */}
    <section className="py-24 bg-[#090909]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">Our Promise</p>
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-none mb-8">
              Why Choose<br />
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">CaseHub?</span>
            </h2>
            <div className="space-y-5">
              {WHY.map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-amber-400 flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm mb-0.5">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Before/After */}
          <div>
            <p className="text-gray-500 text-xs uppercase tracking-widest mb-4">See the difference · drag to compare</p>
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
      </div>
    </section>

    {/* Instagram Feed */}
    <section className="py-24 bg-[#080808]">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">Follow the Community</p>
          <h2 className="text-4xl font-black text-white mb-2">
            @casehub on <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">Instagram</span>
          </h2>
          <p className="text-gray-600 text-sm">Tag us with #CaseHub to be featured</p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {INSTAGRAM_PLACEHOLDERS.map((post) => (
            <div key={post.id} className="group relative aspect-square bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden cursor-pointer">
              <div className="w-full h-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-300">
                {post.emoji}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                <p className="text-white text-[10px] font-medium leading-tight">{post.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA Banner */}
    <section className="py-24 bg-[#090909]">
      <div className="container mx-auto px-6">
        <div className="relative bg-gradient-to-r from-[#1a1508] via-[#201a08] to-[#1a1508] border border-amber-500/15 rounded-3xl p-12 text-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,168,76,0.12)_0%,_transparent_70%)]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
          <div className="relative">
            <p className="text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-4">Limited Time</p>
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">
              Get 20% Off Your<br />First Order
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-md mx-auto">
              Join 50,000+ customers across the UAE who trust CaseHub for premium protection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-amber-500 text-black px-10 py-4 rounded-full font-black text-sm hover:bg-amber-400 transition-all shadow-[0_0_40px_rgba(201,168,76,0.3)] hover:shadow-[0_0_60px_rgba(201,168,76,0.5)]"
              >
                Create Free Account
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 border border-white/10 text-white px-10 py-4 rounded-full font-bold text-sm hover:border-white/20 hover:bg-white/5 transition-all"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-[#050505] border-t border-[#111]">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <p className="text-2xl font-black mb-1">
              <span className="text-amber-400">Case</span>
              <span className="text-white">Hub</span>
            </p>
            <p className="text-gray-600 text-xs uppercase tracking-widest mb-4">Dubai · UAE</p>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              Premium mobile accessories for people who demand the best. Engineered for protection, designed for style.
            </p>
            <div className="flex gap-3 mt-6">
              {['Instagram', 'TikTok', 'X', 'WhatsApp'].map((social) => (
                <div key={social} className="w-9 h-9 rounded-full bg-[#111] border border-[#1e1e1e] flex items-center justify-center cursor-pointer hover:border-amber-500/30 hover:bg-[#1a1a1a] transition-all">
                  <span className="text-gray-600 hover:text-gray-400 text-[10px] font-bold">{social[0]}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-white text-xs font-bold uppercase tracking-widest mb-5">Shop</p>
            <ul className="space-y-3">
              {['iPhone Cases', 'Samsung Cases', 'Watch Bands', 'Chargers', 'Power Banks', 'Screen Protectors'].map((l) => (
                <li key={l}>
                  <Link to={`/collections/${encodeURIComponent(l)}`} className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
                    {l}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-white text-xs font-bold uppercase tracking-widest mb-5">Help</p>
            <ul className="space-y-3">
              {[
                { label: 'All Products', to: '/products' },
                { label: 'My Cart', to: '/cart' },
                { label: 'My Orders', to: '/orders' },
                { label: 'Login', to: '/login' },
                { label: 'Register', to: '/register' },
              ].map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#111] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-700 text-xs">
            © {new Date().getFullYear()} CaseHub. All rights reserved. Dubai, UAE.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map((l) => (
              <span key={l} className="text-gray-700 hover:text-gray-500 text-xs cursor-pointer transition-colors">{l}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  </>
);

export default BottomSections;
