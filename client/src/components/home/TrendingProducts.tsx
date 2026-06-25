import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../lib/axiosConfig';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { updateCartItems } from '../../redux/userSlice';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  price: number;
  offerPrice: number;
  image: string[];
  category: string;
  inStock: boolean;
}

const TrendingProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.user.user);
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    axiosInstance.get('/api/products/list')
      .then((res) => setProducts((res.data.products || []).slice(4, 9)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    if (!user) { toast.error('Please login'); return; }
    setAddingId(product.id);
    try {
      const res = await axiosInstance.post('/api/cart/update', { productId: String(product.id) });
      dispatch(updateCartItems(res.data.cart.cartItems));
      toast.success('Added!');
    } catch { toast.error('Failed'); }
    finally { setAddingId(null); }
  };

  if (loading || products.length === 0) return null;

  const featured = products[activeIndex];
  const discount = featured.price > featured.offerPrice
    ? Math.round(((featured.price - featured.offerPrice) / featured.price) * 100)
    : 0;

  return (
    <section className="py-24 bg-[#090909]">
      <div className="container mx-auto px-6">
        <div className="mb-14">
          <p className="text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">What's Hot Right Now</p>
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-none">
            Trending<br />
            <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">This Week</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Large feature panel */}
          <div className="lg:col-span-3 relative bg-[#111] border border-[#1e1e1e] rounded-3xl overflow-hidden group hover:border-amber-500/20 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="grid grid-cols-2 h-full min-h-[380px]">
              {/* Image */}
              <div className="bg-[#0d0d0d] flex items-center justify-center p-10">
                {featured.image?.[0]
                  ? <img src={featured.image[0]} alt={featured.name} className="max-h-56 object-contain group-hover:scale-105 transition-transform duration-500" />
                  : <span className="text-7xl">📱</span>}
              </div>
              {/* Info */}
              <div className="p-8 flex flex-col justify-between">
                <div>
                  {discount > 0 && (
                    <span className="inline-block text-[10px] font-black bg-amber-500 text-black px-2.5 py-1 rounded-full mb-4">
                      {discount}% OFF
                    </span>
                  )}
                  <p className="text-gray-600 text-xs uppercase tracking-widest mb-2">{featured.category}</p>
                  <h3 className="text-white text-xl font-black leading-tight mb-3">{featured.name}</h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-2xl font-black text-white">AED {featured.offerPrice}</span>
                    {discount > 0 && <span className="text-gray-600 line-through text-sm">AED {featured.price}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={(e) => addToCart(e, featured)}
                    disabled={!featured.inStock || addingId === featured.id}
                    className="bg-amber-500 text-black py-3 rounded-xl font-bold text-sm hover:bg-amber-400 transition-colors disabled:opacity-50 active:scale-95"
                  >
                    {addingId === featured.id ? 'Adding…' : featured.inStock ? 'Add to Cart' : 'Sold Out'}
                  </button>
                  <Link to={`/product/${featured.id}`} className="border border-[#2a2a2a] text-gray-400 text-center py-2.5 rounded-xl text-sm hover:border-gray-600 hover:text-white transition-colors">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* List panel */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {products.map((p, i) => {
              const isActive = i === activeIndex;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveIndex(i)}
                  className={`group text-left bg-[#111] border rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 ${isActive ? 'border-amber-500/40 bg-[#161410]' : 'border-[#1e1e1e] hover:border-[#2a2a2a]'}`}
                >
                  <div className="w-14 h-14 rounded-xl bg-[#0d0d0d] flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {p.image?.[0]
                      ? <img src={p.image[0]} alt={p.name} className="w-full h-full object-contain p-1" />
                      : <span className="text-2xl">📱</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-gray-600 text-xs mt-0.5">{p.category}</p>
                    <p className="text-amber-400 text-sm font-bold mt-1">AED {p.offerPrice}</p>
                  </div>
                  {isActive && (
                    <div className="w-1.5 h-10 bg-amber-500 rounded-full flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrendingProducts;
