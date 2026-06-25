import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../lib/axiosConfig';
import { useAppSelector, useAppDispatch } from '../hooks';
import { updateCartItems } from '../redux/userSlice';
import toast from 'react-hot-toast';

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
  state: string;
  zipCode: string;
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

  const [addressForm, setAddressForm] = useState<Address>({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
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

  // Build cart items
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

  const subtotal = cartItems.reduce((s, i) => s + i.offerPrice * i.quantity, 0);
  const tax = subtotal * 0.02;
  const deliveryFee = subtotal > 500 ? 0 : 49;
  const total = subtotal + tax + deliveryFee;

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
  };

  const placeOrder = async () => {
    if (!user) return;
    if (cartItems.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    let addressId: number | undefined = savedAddress?.id;

    // If new address, save it first
    if (useNewAddress || !addressId) {
      const { firstName, lastName, street, city, state, zipCode, country, phone } = addressForm;
      if (!firstName || !lastName || !street || !city || !state || !zipCode || !country || !phone) {
        toast.error('Please fill in all address fields');
        return;
      }
      try {
        const addrRes = await axiosInstance.post('/api/address/add', {
          userId: user.id,
          address: { ...addressForm, zipCode: Number(zipCode) },
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
        productId: item.id,
        quantity: item.quantity,
        price: item.offerPrice,
      }));

      await axiosInstance.post('/api/order/cod', {
        userId: user.id,
        addressId,
        items,
      });

      // Clear cart
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading checkout...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6 max-w-5xl">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Address */}
          <div className="lg:col-span-2 space-y-6">
            {savedAddress && !useNewAddress ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Delivery Address</h2>
                  <button
                    onClick={() => setUseNewAddress(true)}
                    className="text-sm text-green-600 hover:underline"
                  >
                    + Use a different address
                  </button>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-medium">{savedAddress.firstName} {savedAddress.lastName}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    {savedAddress.street}, {savedAddress.city}, {savedAddress.state} – {savedAddress.zipCode}
                  </p>
                  <p className="text-gray-600 text-sm">{savedAddress.country}</p>
                  <p className="text-gray-600 text-sm">📞 {savedAddress.phone}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Delivery Address</h2>
                  {savedAddress && (
                    <button
                      onClick={() => setUseNewAddress(false)}
                      className="text-sm text-gray-500 hover:underline"
                    >
                      Use saved address
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['firstName', 'lastName', 'phone', 'street', 'city', 'state', 'zipCode', 'country'].map((field) => (
                    <div key={field} className={field === 'street' ? 'sm:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {field.replace(/([A-Z])/g, ' $1')}
                      </label>
                      <input
                        type={field === 'zipCode' ? 'number' : 'text'}
                        name={field}
                        value={(addressForm as any)[field]}
                        onChange={handleAddressChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              <div className="flex items-center gap-3 p-4 border-2 border-green-500 rounded-lg bg-green-50">
                <div className="w-5 h-5 rounded-full border-2 border-green-600 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
                </div>
                <div>
                  <p className="font-medium">Cash on Delivery</p>
                  <p className="text-sm text-gray-500">Pay when your order arrives</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h3 className="text-xl font-semibold mb-4">Order Summary</h3>

              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    {item.image?.[0] && (
                      <img src={item.image[0]} alt={item.name} className="w-10 h-10 object-cover rounded" />
                    )}
                    <div className="flex-1 truncate">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-gray-500">x{item.quantity}</p>
                    </div>
                    <p className="font-medium">₹{(item.offerPrice * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (2%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span className={deliveryFee === 0 ? 'text-green-600' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-3 mt-3">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={placingOrder || cartItems.length === 0}
                className="w-full mt-6 bg-green-600 text-white py-3 rounded-md hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placingOrder ? 'Placing Order...' : 'Place Order (COD)'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
