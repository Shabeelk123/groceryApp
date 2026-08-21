import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../lib/axiosConfig';
import { useAppSelector, useAppDispatch } from '../hooks';
import { updateCartItems, removeWishlistItem } from '../redux/userSlice';
import { formatCurrency } from '../utils/commonUtils';
import toast from 'react-hot-toast';
import { Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';

interface WishlistProduct {
  id: number;
  name: string;
  price: number;
  offerPrice: number;
  image: string[];
  category: string;
  inStock: boolean;
}

interface WishlistItem {
  productId: number;
  product: WishlistProduct;
}

const Wishlist = () => {
  const user = useAppSelector((state) => state.user.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) { navigate('/login'); return; }
    axiosInstance.get('/api/wishlist')
      .then((res) => setItems(res.data.items || []))
      .catch(() => toast.error('Failed to load wishlist'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const remove = async (productId: number) => {
    setRemovingId(productId);
    try {
      await axiosInstance.delete(`/api/wishlist/${productId}`);
      dispatch(removeWishlistItem(productId));
      setItems(items.filter((i) => i.productId !== productId));
      toast.success('Removed from wishlist');
    } catch {
      toast.error('Failed to remove item');
    } finally {
      setRemovingId(null);
    }
  };

  const addToCart = async (productId: number) => {
    if (!user) return;
    setAddingId(productId);
    try {
      const res = await axiosInstance.post('/api/cart/update', { productId: String(productId) });
      dispatch(updateCartItems(res.data.cart.cartItems));
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center pt-24">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-amber-500 font-bold tracking-widest uppercase text-xs">Loading Wishlist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="flex items-center gap-4 mb-10">
          <Link to="/products" className="p-2 bg-[#111] border border-[#2a2a2a] rounded-full text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Heart className="w-7 h-7 text-amber-500" /> My Wishlist
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-24 bg-[#0a0a0a] border border-[#1e1e1e] rounded-3xl">
            <Heart className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 text-sm mb-6">Save items you love and find them here anytime.</p>
            <Link to="/products" className="inline-block bg-amber-500 text-black font-bold px-8 py-3 rounded-full hover:bg-amber-400 transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {items.map(({ product }) => (
              <div key={product.id} className="group bg-[#0f0f0f] border border-[#1e1e1e] rounded-3xl overflow-hidden hover:border-[#333] transition-all duration-300 flex flex-col relative">
                <button
                  onClick={() => remove(product.id)}
                  disabled={removingId === product.id}
                  className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-[#111]/80 backdrop-blur-md border border-[#2a2a2a] flex items-center justify-center text-gray-300 hover:text-red-400 hover:border-red-400/50 transition-colors shadow-xl disabled:opacity-50"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <Link to={`/product/${product.id}`} className="relative h-56 bg-[#111] overflow-hidden flex items-center justify-center p-6">
                  {product.image?.[0] ? (
                    <img src={product.image[0]} alt={product.name} className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <span className="text-5xl">📱</span>
                  )}
                </Link>

                <div className="p-4 flex-1 flex flex-col bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
                  <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-1.5">{product.category}</p>
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-bold text-gray-100 group-hover:text-amber-400 transition-colors mb-3 line-clamp-2 text-sm">{product.name}</h3>
                  </Link>
                  <div className="mt-auto flex items-center justify-between gap-2">
                    <span className="text-amber-400 font-extrabold text-base">{formatCurrency(product.offerPrice)}</span>
                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={!product.inStock || addingId === product.id}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                        product.inStock
                          ? 'bg-amber-500 text-black hover:bg-amber-400'
                          : 'bg-[#1a1a1a] text-gray-500 cursor-not-allowed border border-[#2a2a2a]'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {addingId === product.id ? '...' : product.inStock ? 'Add' : 'Out'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
