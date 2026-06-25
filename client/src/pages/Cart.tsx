import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../lib/axiosConfig';
import { useAppSelector, useAppDispatch } from '../hooks';
import { updateCartItems } from '../redux/userSlice';
import toast from 'react-hot-toast';

interface Product { id: number; name: string; offerPrice: number; price: number; image: string[]; inStock: boolean; category: string; }
interface CartProduct extends Product { quantity: number; }

const Cart = () => {
  const user = useAppSelector((state) => state.user.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const remove = (productId: number) => setCart(user!.cartItems.filter((id) => id !== String(productId)));
  const changeQty = (productId: number, delta: number) => {
    const items = [...user!.cartItems];
    if (delta > 0) { items.push(String(productId)); }
    else { const i = items.lastIndexOf(String(productId)); if (i !== -1) items.splice(i, 1); }
    setCart(items);
  };

  const subtotal = cartItems.reduce((s, i) => s + i.offerPrice * i.quantity, 0);
  const tax = subtotal * 0.02;
  const delivery = subtotal > 499 ? 0 : 49;
  const total = subtotal + tax + delivery;

  if (!user) return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-4">Login to view your cart</h2>
        <Link to="/login" className="bg-amber-500 text-black px-6 py-3 rounded-full font-bold hover:bg-amber-400 transition">Login</Link>
      </div>
    </div>
  );

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] text-gray-400 flex items-center justify-center">Loading cart...</div>;

  if (cartItems.length === 0) return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <Link to="/products" className="bg-amber-500 text-black px-6 py-3 rounded-full font-bold hover:bg-amber-400 transition">Start Shopping</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-10">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-extrabold mb-8">Your Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4">
                <Link to={`/product/${item.id}`}>
                  <div className="w-16 h-16 rounded-lg bg-[#111] overflow-hidden flex-shrink-0">
                    {item.image?.[0]
                      ? <img src={item.image[0]} alt={item.name} className="w-full h-full object-cover" />
                      : <span className="text-3xl flex items-center justify-center h-full">📱</span>}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                  <p className="text-gray-500 text-xs">{item.category}</p>
                  <p className="text-amber-400 font-bold mt-1">₹{item.offerPrice}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => changeQty(item.id, -1)} className="w-8 h-8 rounded-full bg-[#222] border border-[#333] hover:border-amber-500/50 transition text-white font-bold flex items-center justify-center">−</button>
                  <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                  <button onClick={() => changeQty(item.id, 1)}  className="w-8 h-8 rounded-full bg-[#222] border border-[#333] hover:border-amber-500/50 transition text-white font-bold flex items-center justify-center">+</button>
                </div>
                <p className="font-bold text-sm w-20 text-right flex-shrink-0">₹{(item.offerPrice * item.quantity).toFixed(2)}</p>
                <button onClick={() => remove(item.id)} className="text-gray-600 hover:text-red-400 transition ml-1 flex-shrink-0">✕</button>
              </div>
            ))}
            <Link to="/products" className="text-amber-400 hover:text-amber-300 text-sm inline-block mt-2 transition">← Continue Shopping</Link>
          </div>

          {/* Summary */}
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-6 h-fit sticky top-24">
            <h3 className="text-lg font-bold mb-5">Order Summary</h3>
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between text-gray-400"><span>Subtotal ({cartItems.reduce((s, i) => s + i.quantity, 0)} items)</span><span className="text-white">₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-400"><span>GST (2%)</span><span className="text-white">₹{tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-400">
                <span>Delivery</span>
                <span className={delivery === 0 ? 'text-green-400 font-semibold' : 'text-white'}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
              </div>
              {subtotal < 499 && <p className="text-xs text-gray-600">Add ₹{(499 - subtotal).toFixed(0)} more for free delivery</p>}
            </div>
            <div className="border-t border-[#2a2a2a] pt-4 mb-5">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-amber-400">₹{total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-amber-500 text-black py-3 rounded-xl font-bold hover:bg-amber-400 transition active:scale-95"
            >
              Proceed to Checkout →
            </button>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="bg-[#111] rounded-lg p-2 text-center">🔒 Secure</div>
              <div className="bg-[#111] rounded-lg p-2 text-center">🚀 Fast dispatch</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
