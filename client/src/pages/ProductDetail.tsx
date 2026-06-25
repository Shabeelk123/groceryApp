import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  description: string;
  inStock: boolean;
}

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    axiosInstance.get(`/api/products/${id}`)
      .then((res) => setProduct(res.data.product))
      .catch(() => { toast.error('Product not found'); navigate('/products'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const addToCart = async () => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return; }
    if (!product) return;
    setAdding(true);
    try {
      let cartItems = user.cartItems;
      for (let i = 0; i < quantity; i++) {
        const res = await axiosInstance.post('/api/cart/update', { productId: String(product.id) });
        cartItems = res.data.cart.cartItems;
      }
      dispatch(updateCartItems(cartItems));
      toast.success(`${quantity}× ${product.name} added to cart!`);
    } catch { toast.error('Failed to add to cart'); }
    finally { setAdding(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }
  if (!product) return null;

  const discount = product.price > product.offerPrice
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-10">
      <div className="container mx-auto px-6 max-w-5xl">

        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white text-sm mb-8 inline-flex items-center gap-1 transition">
          ← Back
        </button>

        <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">

            {/* Images */}
            <div className="bg-[#111] p-8 flex flex-col items-center justify-center">
              <div className="w-full h-72 flex items-center justify-center rounded-xl overflow-hidden mb-4">
                {product.image?.[activeImage]
                  ? <img src={product.image[activeImage]} alt={product.name} className="h-full w-full object-contain" />
                  : <span className="text-8xl">📱</span>}
              </div>
              {product.image?.length > 1 && (
                <div className="flex gap-2 mt-2">
                  {product.image.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition ${activeImage === i ? 'border-amber-500' : 'border-[#2a2a2a] hover:border-amber-500/40'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-8">
              <p className="text-amber-400 text-xs tracking-widest uppercase mb-2">{product.category}</p>
              <h1 className="text-3xl font-extrabold mb-3">{product.name}</h1>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">{product.description}</p>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-3xl font-bold text-amber-400">₹{product.offerPrice}</span>
                {discount > 0 && (
                  <>
                    <span className="text-gray-500 line-through">₹{product.price}</span>
                    <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full font-semibold">{discount}% OFF</span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-600 mb-6">Inclusive of all taxes</p>

              {/* Stock status */}
              <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-6 ${product.inStock ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-green-400' : 'bg-red-400'}`} />
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Quantity</p>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded-full bg-[#0f0f0f] border border-[#2a2a2a] text-white hover:border-amber-500/50 transition text-lg font-bold flex items-center justify-center">−</button>
                  <span className="w-10 text-center font-bold text-lg">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 rounded-full bg-[#0f0f0f] border border-[#2a2a2a] text-white hover:border-amber-500/50 transition text-lg font-bold flex items-center justify-center">+</button>
                </div>
              </div>

              {/* Add to cart */}
              <button
                onClick={addToCart}
                disabled={!product.inStock || adding}
                className={`w-full py-3.5 rounded-xl text-base font-bold transition-all duration-200 active:scale-95 ${
                  product.inStock ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-[#222] text-gray-600 cursor-not-allowed'
                }`}
              >
                {adding ? 'Adding...' : product.inStock ? `Add ${quantity} to Cart — ₹${(product.offerPrice * quantity).toFixed(2)}` : 'Out of Stock'}
              </button>

              {/* Badges */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { icon: '🚀', text: 'Fast Dispatch' },
                  { icon: '🔒', text: 'Secure Pay' },
                  { icon: '↩️', text: '7-Day Return' },
                ].map((b) => (
                  <div key={b.text} className="bg-[#111] border border-[#2a2a2a] rounded-lg p-3 text-center">
                    <div className="text-xl mb-1">{b.icon}</div>
                    <p className="text-[10px] text-gray-400">{b.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
