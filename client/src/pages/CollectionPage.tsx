import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../lib/axiosConfig';
import { useAppDispatch, useAppSelector } from '../hooks';
import { updateCartItems } from '../redux/userSlice';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  price: number;
  offerPrice: number;
  image: string[];
  category: string;
  model?: string;
  description: string;
  inStock: boolean;
}

const CATEGORY_META: Record<string, { emoji: string; headline: string; sub: string }> = {
  'iPhone Cases':      { emoji: '📱', headline: 'IPHONE CASES',        sub: 'Engineered for drop protection. Designed for style.' },
  'Samsung Cases':     { emoji: '🛡️', headline: 'SAMSUNG CASES',       sub: 'Perfect fit for every Samsung model.' },
  'Screen Protectors': { emoji: '🔲', headline: 'SCREEN PROTECTORS',   sub: '9H tempered glass — crystal clear, scratch proof.' },
  'Watch Straps':      { emoji: '⌚', headline: 'WATCH STRAPS',         sub: 'Genuine leather & sport bands for Apple Watch.' },
  'Wallets & Cards':   { emoji: '👜', headline: 'WALLETS & CARDS',      sub: 'Slim MagSafe card holders & minimalist wallets.' },
  'Chargers & Cables': { emoji: '⚡', headline: 'CHARGERS & CABLES',    sub: 'Fast-charge cables & adapters for every device.' },
  'AirPod Cases':      { emoji: '🎧', headline: 'AIRPOD CASES',         sub: 'Protective cases for AirPods 1, 2, 3 & Pro.' },
  'Ring Holders':      { emoji: '💍', headline: 'RING HOLDERS',          sub: 'Magnetic ring grips & kickstands.' },
};

const SORT_OPTIONS = [
  { value: 'name',       label: 'Name (A–Z)' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

const CollectionPage = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('name');
  const [selectedModel, setSelectedModel] = useState<string>('all');
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const decodedCategory = decodeURIComponent(category || '');
  const meta = CATEGORY_META[decodedCategory] || {
    emoji: '🛒',
    headline: decodedCategory.toUpperCase(),
    sub: 'Premium mobile accessories.',
  };

  useEffect(() => {
    setLoading(true);
    setSelectedModel('all');
    axiosInstance.get('/api/products/list')
      .then((res) => {
        const all: Product[] = res.data.products || [];
        setProducts(all.filter((p) => p.category === decodedCategory));
      })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, [decodedCategory]);

  // Build list of unique models from available products
  const availableModels = [...new Set(products.map((p) => p.model).filter(Boolean))] as string[];
  const hasModels = availableModels.length > 0;

  const filtered = products.filter((p) =>
    selectedModel === 'all' || p.model === selectedModel
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc')  return a.offerPrice - b.offerPrice;
    if (sortBy === 'price-desc') return b.offerPrice - a.offerPrice;
    return a.name.localeCompare(b.name);
  });

  const addToCart = async (product: Product) => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return; }
    setAddingToCart(product.id);
    try {
      const res = await axiosInstance.post('/api/cart/update', { productId: String(product.id) });
      dispatch(updateCartItems(res.data.cart.cartItems));
      toast.success(`${product.name} added!`);
    } catch { toast.error('Failed to add to cart'); }
    finally { setAddingToCart(null); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* ── Hero Banner ── */}
      <section className="relative bg-black py-16 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-6">
          <Link to="/" className="hover:text-amber-400 transition">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-amber-400 transition">Collections</Link>
          <span>/</span>
          <span className="text-gray-300">{decodedCategory}</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-[0.12em] text-white mb-4">
          {meta.headline}
        </h1>
        <p className="text-gray-400 text-lg max-w-lg mx-auto">{meta.sub}</p>
        <p className="text-amber-400 font-semibold mt-3 text-sm">{sorted.length} Products</p>
      </section>

      {/* ── Toolbar ── */}
      <div className="border-b border-[#1e1e1e] bg-[#0d0d0d]">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <div className="hidden md:flex items-center gap-6 text-xs text-gray-500 overflow-x-auto">
            {Object.keys(CATEGORY_META).map((cat) => (
              <Link
                key={cat}
                to={`/collections/${encodeURIComponent(cat)}`}
                className={`whitespace-nowrap transition hover:text-white ${cat === decodedCategory ? 'text-amber-400 font-semibold' : ''}`}
              >
                {cat}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-gray-500">Sort by</span>
            <select
              value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#161616] border border-[#2a2a2a] text-white text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-amber-500/60"
            >
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Main layout: sidebar + grid ── */}
      <div className="container mx-auto px-6 py-10 flex gap-8">

        {/* Sidebar — only shown when models exist */}
        {hasModels && (
          <aside className="hidden md:block w-52 flex-shrink-0">
            <div className="bg-[#111] border border-[#1e1e1e] rounded-xl p-5 sticky top-24">
              <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-4">Model</p>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedModel('all')}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition ${
                    selectedModel === 'all' ? 'text-amber-400 font-semibold bg-amber-500/10' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All Models
                  <span className="float-right text-xs text-gray-600">{products.length}</span>
                </button>
                {availableModels.map((model) => {
                  const count = products.filter((p) => p.model === model).length;
                  return (
                    <button
                      key={model}
                      onClick={() => setSelectedModel(model)}
                      className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition ${
                        selectedModel === model ? 'text-amber-400 font-semibold bg-amber-500/10' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {model}
                      <span className="float-right text-xs text-gray-600">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

        {/* Product Grid */}
        <div className="flex-1 min-w-0">
          {/* Mobile model filter (pill buttons) */}
          {hasModels && (
            <div className="md:hidden flex gap-2 overflow-x-auto pb-3 mb-5">
              <button
                onClick={() => setSelectedModel('all')}
                className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition ${
                  selectedModel === 'all' ? 'bg-amber-500 text-black border-amber-500 font-bold' : 'border-[#2a2a2a] text-gray-400 hover:border-amber-500/50'
                }`}
              >
                All
              </button>
              {availableModels.map((model) => (
                <button
                  key={model}
                  onClick={() => setSelectedModel(model)}
                  className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition ${
                    selectedModel === model ? 'bg-amber-500 text-black border-amber-500 font-bold' : 'border-[#2a2a2a] text-gray-400 hover:border-amber-500/50'
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-32 text-gray-500">Loading...</div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-32">
              <p className="text-6xl mb-4">{meta.emoji}</p>
              <h2 className="text-2xl font-bold mb-2">
                {selectedModel !== 'all' ? `No cases for ${selectedModel} yet` : 'No products yet'}
              </h2>
              <p className="text-gray-500 mb-6">Check back soon — we're adding new accessories regularly.</p>
              <button onClick={() => setSelectedModel('all')} className="bg-amber-500 text-black px-6 py-2.5 rounded-full font-bold hover:bg-amber-400 transition text-sm mr-3">
                Show All
              </button>
              <Link to="/products" className="border border-[#2a2a2a] text-gray-400 px-6 py-2.5 rounded-full text-sm hover:border-amber-500/50 transition">
                Browse All Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {sorted.map((product) => {
                const discount = product.price > product.offerPrice
                  ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
                  : 0;
                const isHovered = hoveredId === product.id;
                return (
                  <div
                    key={product.id}
                    className="group bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden hover:border-amber-500/30 transition-all duration-300"
                    onMouseEnter={() => setHoveredId(product.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    <Link to={`/product/${product.id}`} className="block relative overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
                      {product.image?.[0] ? (
                        <img src={product.image[0]} alt={product.name} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-6xl">{meta.emoji}</div>
                      )}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {discount > 0 && (
                          <span className="bg-amber-500 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full">-{discount}%</span>
                        )}
                        {!product.inStock && (
                          <span className="bg-[#1a1a1a]/90 text-gray-400 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[#333]">Sold Out</span>
                        )}
                      </div>
                      {product.inStock && (
                        <button
                          onClick={(e) => { e.preventDefault(); addToCart(product); }}
                          disabled={addingToCart === product.id}
                          className={`absolute bottom-3 right-3 w-10 h-10 rounded-full bg-amber-500 text-black font-bold text-lg flex items-center justify-center shadow-lg transition-all duration-200 hover:bg-amber-400 active:scale-90 ${
                            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                          }`}
                        >
                          {addingToCart === product.id ? '…' : '+'}
                        </button>
                      )}
                    </Link>
                    <div className="p-4">
                      {product.model && (
                        <p className="text-[10px] text-amber-400/70 font-semibold uppercase tracking-wide mb-1">{product.model}</p>
                      )}
                      <h3 className="text-sm font-semibold leading-tight mb-1 line-clamp-2">{product.name}</h3>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-amber-400 font-bold">₹{product.offerPrice.toLocaleString('en-IN')}</span>
                        {discount > 0 && (
                          <span className="text-gray-600 line-through text-xs">₹{product.price.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionPage;
