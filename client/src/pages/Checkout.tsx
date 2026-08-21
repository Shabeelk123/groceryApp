import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../lib/axiosConfig';
import { useAppSelector, useAppDispatch } from '../hooks';
import { updateCartItems } from '../redux/userSlice';
import { formatCurrency, EMIRATES, VAT_RATE, getShippingFee } from '../utils/commonUtils';
import toast from 'react-hot-toast';
import {
  MapPin, CreditCard, Banknote, ShieldCheck,
  CheckCircle2, Lock, ArrowLeft
} from 'lucide-react';

interface Product {
  id: number;
  name: string;
  offerPrice: number;
  image: string[];
}

interface CartProduct extends Product {
  quantity: number;
}

interface Address {
  id?: number;
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  emirate: string;
  poBox: string;
  country: string;
  phone: string;
}

const Checkout = () => {
  const user = useAppSelector((state) => state.user.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [savedAddress, setSavedAddress] = useState<Address | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'stripe'>('cod');

  const [addressForm, setAddressForm] = useState<Address>({
    firstName: '', lastName: '', street: '', city: '', emirate: EMIRATES[0], poBox: '', country: 'United Arab Emirates', phone: '',
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) { navigate('/login'); return; }
    const init = async () => {
      try {
        const [productsRes, addressRes] = await Promise.all([
          axiosInstance.get('/api/products/list'),
          axiosInstance.get('/api/address/list').catch(() => ({ data: { addresses: null } })),
        ]);
        setAllProducts(productsRes.data.products || []);
        if (addressRes.data.addresses) {
          setSavedAddress(addressRes.data.addresses);
        } else {
          setUseNewAddress(true);
        }
      } catch {
        toast.error('Failed to load checkout data');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [user, navigate]);

  const cartItems: CartProduct[] = (() => {
    if (!user?.cartItems || !allProducts.length) return [];
    const countMap: Record<string, number> = {};
    user.cartItems.forEach((id) => { countMap[id] = (countMap[id] || 0) + 1; });
    return Object.entries(countMap).reduce<CartProduct[]>((acc, [id, qty]) => {
      const product = allProducts.find((p) => p.id === Number(id));
      if (product) acc.push({ ...product, quantity: qty });
      return acc;
    }, []);
  })();

  const activeEmirate = (useNewAddress || !savedAddress) ? addressForm.emirate : savedAddress.emirate;
  const subtotal = cartItems.reduce((s, i) => s + i.offerPrice * i.quantity, 0);
  const tax = subtotal * VAT_RATE;
  const deliveryFee = getShippingFee(subtotal, activeEmirate);
  const total = subtotal + tax + deliveryFee;

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const placeOrder = async () => {
    if (!user) return;
    if (cartItems.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    if (paymentMethod === 'stripe') {
      toast.error('Credit Card payment is a UI preview. Please select Cash on Delivery.');
      setPaymentMethod('cod');
      return;
    }

    let addressId: number | undefined = savedAddress?.id;

    if (useNewAddress || !addressId) {
      const { firstName, lastName, street, city, emirate, country, phone } = addressForm;
      if (!firstName || !lastName || !street || !city || !emirate || !country || !phone) {
        toast.error('Please fill in all address fields');
        return;
      }
      try {
        const addrRes = await axiosInstance.post('/api/address/add', {
          userId: user.id,
          address: addressForm,
        });
        addressId = addrRes.data.addresses.id;
        setSavedAddress(addrRes.data.addresses);
      } catch {
        toast.error('Failed to save address');
        return;
      }
    }

    setPlacingOrder(true);
    try {
      const items = cartItems.map((item) => ({
        productId: item.id, quantity: item.quantity, price: item.offerPrice,
      }));

      await axiosInstance.post('/api/order/cod', {
        userId: user.id, addressId, items,
      });

      dispatch(updateCartItems([]));
      await axiosInstance.post('/api/cart/update', { cartItems: [] });

      toast.success('Order placed successfully! 🎉');
      navigate('/orders');
    } catch {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-amber-500 font-bold tracking-widest uppercase text-xs">Preparing Checkout</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <Link to="/products" className="text-amber-500 hover:underline">Return to Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-6xl">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link to="/cart" className="p-2 bg-[#111] border border-[#2a2a2a] rounded-full text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Column - Forms */}
          <div className="lg:w-3/5 space-y-8">
            
            {/* Step 1: Address */}
            <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-3xl p-6 md:p-8 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 border-b border-[#1e1e1e] pb-4">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">1</div>
                  Shipping Address
                </h2>
                {savedAddress && (
                  <button 
                    onClick={() => setUseNewAddress(!useNewAddress)}
                    className="text-xs font-bold text-amber-500 hover:text-amber-400 tracking-wide uppercase transition-colors"
                  >
                    {useNewAddress ? 'Use Saved Address' : 'Add New Address'}
                  </button>
                )}
              </div>

              {savedAddress && !useNewAddress ? (
                <div className="bg-[#111] border-2 border-amber-500/30 rounded-2xl p-5 relative group hover:border-amber-500/50 transition-colors">
                  <div className="absolute top-5 right-5 text-amber-500">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-gray-500 mt-1" />
                    <div>
                      <p className="font-bold text-gray-200 text-lg mb-1">{savedAddress.firstName} {savedAddress.lastName}</p>
                      <p className="text-gray-400 text-sm leading-relaxed mb-2">
                        {savedAddress.street}<br/>
                        {savedAddress.city}, {savedAddress.emirate}{savedAddress.poBox ? ` — PO Box ${savedAddress.poBox}` : ''}<br/>
                        {savedAddress.country}
                      </p>
                      <p className="text-gray-500 text-sm flex items-center gap-2">
                        <span className="w-4 h-4 bg-[#222] rounded flex items-center justify-center text-[10px]">📞</span> 
                        {savedAddress.phone}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['firstName', 'lastName', 'phone', 'street', 'city', 'emirate', 'poBox', 'country'].map((field) => (
                    <div key={field} className={field === 'street' ? 'md:col-span-2' : ''}>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        {field.replace(/([A-Z])/g, ' $1')}{field === 'poBox' && <span className="normal-case font-normal text-gray-600"> (optional)</span>}
                      </label>
                      {field === 'emirate' ? (
                        <select
                          name={field}
                          value={addressForm.emirate}
                          onChange={handleAddressChange}
                          className="w-full bg-[#111] border border-[#2a2a2a] text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-amber-500/50 focus:bg-[#151515] transition-all"
                        >
                          {EMIRATES.map((emirate) => (
                            <option key={emirate} value={emirate}>{emirate}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          name={field}
                          value={(addressForm as any)[field]}
                          onChange={handleAddressChange}
                          className="w-full bg-[#111] border border-[#2a2a2a] text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-amber-500/50 focus:bg-[#151515] transition-all"
                          placeholder={field === 'poBox' ? 'PO Box / Makani number' : `Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-3xl p-6 md:p-8">
              <div className="flex items-center justify-between mb-6 border-b border-[#1e1e1e] pb-4">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">2</div>
                  Payment Method
                </h2>
                <div className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                  <Lock className="w-3 h-3" /> Secure Server
                </div>
              </div>

              <div className="space-y-4">
                {/* Credit Card Option (Stripe Mock) */}
                <label className={`block cursor-pointer border-2 rounded-2xl transition-all duration-300 ${paymentMethod === 'stripe' ? 'border-amber-500 bg-amber-500/5' : 'border-[#2a2a2a] bg-[#111] hover:border-[#333]'}`}>
                  <div className="p-5 flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'stripe' ? 'border-amber-500' : 'border-gray-600'}`}>
                      {paymentMethod === 'stripe' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-200 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-gray-400" /> Credit / Debit Card
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-50">
                      <div className="w-8 h-5 bg-white/10 rounded"></div>
                      <div className="w-8 h-5 bg-white/10 rounded"></div>
                    </div>
                  </div>
                  
                  {/* Expanded Card Form Mock */}
                  <div className={`overflow-hidden transition-all duration-300 px-5 ${paymentMethod === 'stripe' ? 'max-h-64 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="border-t border-[#2a2a2a] pt-4 mt-2">
                      <div className="space-y-4">
                        <div className="relative">
                          <input type="text" placeholder="Card Number" className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 font-mono tracking-widest" disabled={paymentMethod !== 'stripe'} />
                          <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="MM / YY" className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 text-center tracking-widest" disabled={paymentMethod !== 'stripe'} />
                          <input type="text" placeholder="CVC" className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 text-center tracking-widest" disabled={paymentMethod !== 'stripe'} />
                        </div>
                      </div>
                      <p className="text-xs text-amber-500 mt-4 flex items-center gap-1"><Lock className="w-3 h-3" /> Note: This is a UI preview. Please select Cash on Delivery to test checkout.</p>
                    </div>
                  </div>
                  <input type="radio" className="hidden" checked={paymentMethod === 'stripe'} onChange={() => setPaymentMethod('stripe')} />
                </label>

                {/* COD Option */}
                <label className={`block cursor-pointer border-2 rounded-2xl transition-all duration-300 ${paymentMethod === 'cod' ? 'border-amber-500 bg-amber-500/5' : 'border-[#2a2a2a] bg-[#111] hover:border-[#333]'}`}>
                  <div className="p-5 flex items-center gap-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'cod' ? 'border-amber-500' : 'border-gray-600'}`}>
                      {paymentMethod === 'cod' && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                    </div>
                    <div>
                      <p className="font-bold text-gray-200 flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-gray-400" /> Cash on Delivery (COD)
                      </p>
                    </div>
                  </div>
                  <div className={`overflow-hidden transition-all duration-300 px-5 ${paymentMethod === 'cod' ? 'max-h-24 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-sm text-gray-400 border-t border-[#2a2a2a] pt-4 mt-2">Pay securely with cash or UPI when your order is delivered to your doorstep.</p>
                  </div>
                  <input type="radio" className="hidden" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                </label>
              </div>
            </div>

          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:w-2/5">
            <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-3xl p-6 lg:p-8 sticky top-28 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[50px] pointer-events-none"></div>
              
              <h3 className="text-xl font-extrabold mb-6">Order Summary</h3>

              {/* Items Scroll */}
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2 border-b border-[#1e1e1e] pb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-16 h-16 bg-[#111] rounded-xl overflow-hidden flex items-center justify-center border border-[#2a2a2a] flex-shrink-0">
                      {item.image?.[0] ? <img src={item.image[0]} className="w-full h-full object-contain p-1" alt="" /> : <span>📱</span>}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="font-bold text-gray-200 text-sm truncate">{item.name}</p>
                      <p className="text-gray-500 text-xs mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="flex items-center">
                      <p className="font-extrabold text-amber-400 text-sm">{formatCurrency(item.offerPrice * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
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
                  <span>Delivery {activeEmirate && `(${activeEmirate})`}</span>
                  <span className={deliveryFee === 0 ? 'text-green-400 font-bold' : 'text-white font-bold'}>
                    {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8">
                <span className="text-gray-300 font-bold uppercase tracking-wider text-sm">Total to Pay</span>
                <span className="text-3xl font-extrabold text-amber-400">{formatCurrency(total)}</span>
              </div>

              <button
                onClick={placeOrder}
                disabled={placingOrder || cartItems.length === 0 || (paymentMethod === 'stripe')}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-extrabold text-lg transition-all ${
                  paymentMethod === 'stripe' 
                    ? 'bg-[#222] text-gray-500 cursor-not-allowed border border-[#333]' 
                    : 'bg-amber-500 text-black hover:bg-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] active:scale-95'
                }`}
              >
                {placingOrder ? 'Processing...' : paymentMethod === 'stripe' ? 'Select COD to Place Order' : `Place Order (COD) 🚀`}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 font-medium">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                Your data is safe & secure
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Checkout;
