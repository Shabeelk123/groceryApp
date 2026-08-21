import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../lib/axiosConfig';
import { useAppSelector, useAppDispatch } from '../hooks';
import { updateCartItems } from '../redux/userSlice';
import { formatCurrency, VAT_RATE, FREE_SHIPPING_THRESHOLD, getShippingFee } from '../utils/commonUtils';
import toast from 'react-hot-toast';
import { 
  Trash2, Plus, Minus, Tag, ShieldCheck, 
  Truck, ArrowRight, ShoppingBag, X
} from 'lucide-react';

interface Product { 
  id: number; 
  name: string; 
  offerPrice: number; 
  price: number; 
  image: string[]; 
  inStock: boolean; 
  category: string; 
}
interface CartProduct extends Product { quantity: number; }

const Cart = () => {
  const user = useAppSelector((state) => state.user.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) { setLoading(false); return; }
    axiosInstance.get('/api/products/list')
      .then((res) => setAllProducts(res.data.products || []))
      .catch(() => toast.error('Failed to load cart'))
      .finally(() => setLoading(false));
  }, [user]);

  const cartItems: CartProduct[] = (() => {
    if (!user?.cartItems || !allProducts.length) return [];
    const countMap: Record<string, number> = {};
    user.cartItems.forEach((id) => { countMap[id] = (countMap[id] || 0) + 1; });
    return Object.entries(countMap).reduce<CartProduct[]>((acc, [id, qty]) => {
      const p = allProducts.find((p) => p.id === Number(id));
      if (p) acc.push({ ...p, quantity: qty });
      return acc;
    }, []);
  })();

  const setCart = async (newItems: string[]) => {
    dispatch(updateCartItems(newItems));
    try { await axiosInstance.post('/api/cart/update', { cartItems: newItems }); } catch {}
  };

  const remove = (productId: number) => {
    setCart(user!.cartItems.filter((id) => id !== String(productId)));
    toast.success('Item removed');
  };

  const changeQty = (productId: number, delta: number) => {
    const items = [...user!.cartItems];
    if (delta > 0) { 
      items.push(String(productId)); 
    } else { 
      const i = items.lastIndexOf(String(productId)); 
      if (i !== -1) items.splice(i, 1); 
    }
    setCart(items);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setTimeout(() => {
      setIsApplyingCoupon(false);
      toast.error('Invalid or expired coupon code');
    }, 1000);
  };

  const subtotal = cartItems.reduce((s, i) => s + i.offerPrice * i.quantity, 0);
  const tax = subtotal * VAT_RATE;
  // Actual delivery fee depends on the emirate chosen at checkout — this is a Dubai-rate estimate
  const delivery = getShippingFee(subtotal, 'Dubai');
  const total = subtotal + tax + delivery;

  if (!user) return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center pt-16">
      <div className="text-center bg-[#0a0a0a] border border-[#1e1e1e] p-12 rounded-3xl shadow-2xl max-w-md w-full mx-4">
        <div className="w-24 h-24 bg-[#111] rounded-full border border-[#2a2a2a] flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight mb-4">Login to view cart</h2>
        <p className="text-gray-400 mb-8 text-sm">Please sign in to access your saved items and secure checkout.</p>
        <Link to="/login" className="block w-full bg-amber-500 text-black px-6 py-4 rounded-xl font-bold hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all">
          Sign In
        </Link>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );

  if (cartItems.length === 0) return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center pt-16">
      <div className="text-center max-w-lg w-full mx-4 py-16">
        <div className="w-32 h-32 bg-[#0f0f0f] rounded-full border border-[#1e1e1e] flex items-center justify-center mx-auto mb-8 relative">
          <ShoppingBag className="w-12 h-12 text-gray-600" />
          <span className="absolute -top-2 -right-2 bg-amber-500 text-black font-extrabold w-10 h-10 rounded-full flex items-center justify-center border-4 border-[#050505]">0</span>
        </div>
        <h2 className="text-4xl font-extrabold tracking-tight mb-4">Your cart is empty</h2>
        <p className="text-gray-400 mb-10 text-sm">Looks like you haven't added anything to your cart yet. Discover our premium accessories.</p>
        <Link to="/products" className="inline-flex items-center gap-2 bg-amber-500 text-black px-8 py-4 rounded-xl font-bold hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all">
          Start Shopping <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-20">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">Shopping Cart</h1>
            <p className="text-gray-400 font-medium">{cartItems.reduce((acc, curr) => acc + curr.quantity, 0)} items in your cart</p>
          </div>
          <Link to="/products" className="hidden md:inline-flex text-amber-500 hover:text-amber-400 text-sm font-bold tracking-wide uppercase items-center gap-2 transition-colors">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left: Cart Items */}
          <div className="lg:w-2/3 space-y-5">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-3xl p-5 flex flex-col sm:flex-row items-center gap-6 group hover:border-[#333] transition-colors relative overflow-hidden">
                
                {/* Product Image */}
                <Link to={`/product/${item.id}`} className="w-full sm:w-32 h-32 bg-[#111] rounded-2xl overflow-hidden flex-shrink-0 border border-[#2a2a2a] group-hover:border-[#444] transition-colors flex items-center justify-center p-2">
                  {item.image?.[0]
                    ? <img src={item.image[0]} alt={item.name} className="w-full h-full object-contain hover:scale-110 transition-transform duration-500" />
                    : <span className="text-4xl">📱</span>}
                </Link>
                
                {/* Product Details */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-amber-500/80 text-[10px] font-bold tracking-widest uppercase">{item.category}</p>
                    <button 
                      onClick={() => remove(item.id)} 
                      className="text-gray-500 hover:text-red-400 bg-[#111] hover:bg-red-400/10 w-8 h-8 rounded-full flex items-center justify-center transition-all sm:hidden"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <Link to={`/product/${item.id}`}>
                    <h3 className="font-bold text-lg text-gray-200 group-hover:text-white transition-colors truncate mb-2">{item.name}</h3>
                  </Link>
                  
                  <div className="flex items-baseline gap-2 mb-4">
                    <p className="text-xl font-extrabold text-amber-400">{formatCurrency(item.offerPrice)}</p>
                    {item.price > item.offerPrice && <p className="text-sm text-gray-600 line-through font-medium">{formatCurrency(item.price)}</p>}
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Quantity Selector */}
                    <div className="flex items-center bg-[#111] border border-[#2a2a2a] rounded-xl p-1">
                      <button 
                        onClick={() => changeQty(item.id, -1)} 
                        className="w-8 h-8 rounded-lg hover:bg-[#222] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => changeQty(item.id, 1)}  
                        className="w-8 h-8 rounded-lg hover:bg-[#222] text-gray-400 hover:text-white flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="font-bold text-lg sm:hidden">{formatCurrency(item.offerPrice * item.quantity)}</p>
                  </div>
                </div>

                {/* Desktop Total & Remove */}
                <div className="hidden sm:flex flex-col items-end justify-between h-32 py-2">
                  <button 
                    onClick={() => remove(item.id)} 
                    className="text-gray-500 hover:text-red-400 w-8 h-8 rounded-full hover:bg-red-400/10 flex items-center justify-center transition-all"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total</p>
                    <p className="font-extrabold text-xl text-white">{formatCurrency(item.offerPrice * item.quantity)}</p>
                  </div>
                </div>
              </div>
            ))}

            <Link to="/products" className="md:hidden flex text-amber-500 hover:text-amber-400 text-sm font-bold tracking-wide uppercase items-center justify-center gap-2 transition-colors mt-8 bg-[#111] py-4 rounded-2xl border border-[#2a2a2a]">
              Continue Shopping
            </Link>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-3xl p-6 lg:p-8 sticky top-28 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[50px] pointer-events-none"></div>
              
              <h3 className="text-xl font-extrabold mb-6 flex items-center gap-2">Order Summary</h3>
              
              {/* Promo Code UI */}
              <form onSubmit={handleApplyCoupon} className="mb-6 relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Promo Code" 
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl py-3 pl-11 pr-24 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 uppercase"
                />
                <button 
                  type="submit"
                  disabled={!couponCode || isApplyingCoupon}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#222] hover:bg-[#333] text-gray-300 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                >
                  {isApplyingCoupon ? '...' : 'Apply'}
                </button>
              </form>

              <div className="space-y-4 text-sm mb-6 border-b border-[#1e1e1e] pb-6">
                <div className="flex justify-between text-gray-400 font-medium">
                  <span>Subtotal</span>
                  <span className="text-white font-bold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-400 font-medium">
                  <span>VAT (5%)</span>
                  <span className="text-white font-bold">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-gray-400 font-medium">
                  <span>Delivery (Dubai est.)</span>
                  <span className={delivery === 0 ? 'text-green-400 font-bold' : 'text-white font-bold'}>
                    {delivery === 0 ? 'FREE' : formatCurrency(delivery)}
                  </span>
                </div>
                {subtotal < FREE_SHIPPING_THRESHOLD && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-2">
                    <Truck className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-400">Add <span className="font-bold">{formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)}</span> more to your order for free delivery!</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-gray-300 font-bold uppercase tracking-wider text-sm">Total</span>
                <span className="text-3xl font-extrabold text-amber-400">{formatCurrency(total)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full flex items-center justify-center gap-2 bg-amber-500 text-black py-4 rounded-xl font-extrabold text-lg hover:bg-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all active:scale-95"
              >
                Secure Checkout <ArrowRight className="w-5 h-5" />
              </button>
              
              <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-gray-500 font-medium">
                <div className="flex flex-col items-center justify-center gap-1.5 bg-[#111] border border-[#1e1e1e] rounded-xl p-3">
                  <ShieldCheck className="w-5 h-5 text-gray-400" />
                  <span>Secure Pay</span>
                </div>
                <div className="flex flex-col items-center justify-center gap-1.5 bg-[#111] border border-[#1e1e1e] rounded-xl p-3">
                  <Truck className="w-5 h-5 text-gray-400" />
                  <span>Fast Dispatch</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
