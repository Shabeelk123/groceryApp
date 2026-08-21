import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../lib/axiosConfig';
import { useAppDispatch, useAppSelector } from '../hooks';
import { updateCartItems } from '../redux/userSlice';
import { formatCurrency, FREE_SHIPPING_THRESHOLD, DUBAI_SHIPPING_FEE, OTHER_EMIRATES_SHIPPING_FEE } from '../utils/commonUtils';
import toast from 'react-hot-toast';
import { 
  Star, Truck, ShieldCheck, ChevronRight, ChevronDown,
  Heart, Share2, Plus, Minus, ShoppingBag, MessageCircle, HelpCircle
} from 'lucide-react';

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

// Mock Data for UI features
const MOCK_COLORS = [
  { name: 'Midnight Black', hex: '#111111' },
  { name: 'Saddle Brown', hex: '#654321' },
  { name: 'Titanium Gray', hex: '#878681' },
];
const MOCK_SIZES = ['Standard', 'Pro', 'Max', 'Ultra'];
const MOCK_COMPATIBILITY = ['Apple iPhone 15 Series', 'Apple iPhone 14 Series', 'MagSafe Compatible'];
const MOCK_SPECS = [
  { label: 'Material', value: 'Premium Aramid Fiber & Vegan Leather' },
  { label: 'Weight', value: '32g (Ultra-light)' },
  { label: 'Drop Protection', value: 'Military Grade (10ft)' },
  { label: 'MagSafe', value: 'Built-in N52 Magnets' },
  { label: 'Warranty', value: '1 Year Limited Warranty' },
];
const MOCK_REVIEWS = [
  { id: 1, user: 'Alex D.', rating: 5, date: 'Oct 12, 2026', text: 'Absolutely love the quality. The texture feels premium and it snaps onto the MagSafe charger perfectly.' },
  { id: 2, user: 'Sarah M.', rating: 4, date: 'Sep 28, 2026', text: 'Great case, very slim. Only wish there were more color options available.' },
];
const MOCK_FAQ = [
  { q: 'Is this compatible with wireless charging?', a: 'Yes, fully compatible with all standard Qi wireless chargers and MagSafe accessories.' },
  { q: 'Does it have a raised lip for screen protection?', a: 'Yes, it features a 1.2mm raised bezel to protect both the screen and the camera lenses.' },
];

const Accordion = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#1e1e1e] py-4">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full group">
        <h3 className="text-lg font-bold text-gray-200 group-hover:text-amber-400 transition-colors">{title}</h3>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
      </button>
      <div className={`mt-4 text-gray-400 text-sm leading-relaxed overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 !mt-0'}`}>
        {children}
      </div>
    </div>
  );
};

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  
  // UI States
  const [selectedColor, setSelectedColor] = useState(MOCK_COLORS[0].name);
  const [selectedSize, setSelectedSize] = useState(MOCK_SIZES[1]);
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: '50% 50%', transform: 'scale(1)' });
  const [showStickyBar, setShowStickyBar] = useState(false);
  const addToCartRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    // Fetch main product and related products
    Promise.all([
      axiosInstance.get(`/api/products/${id}`),
      axiosInstance.get('/api/products/list')
    ])
      .then(([resProduct, resList]) => {
        setProduct(resProduct.data.product);
        const allProds = resList.data.products || [];
        setRelatedProducts(allProds.filter((p: Product) => p.id !== Number(id)).slice(0, 4));
      })
      .catch(() => { toast.error('Product not found'); navigate('/products'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  // Sticky Bar Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (addToCartRef.current) {
        const rect = addToCartRef.current.getBoundingClientRect();
        // Show sticky bar when the main add to cart button scrolls out of view upwards
        setShowStickyBar(rect.bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(2)' });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transformOrigin: '50% 50%', transform: 'scale(1)' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-amber-500 font-bold tracking-widest uppercase text-xs">Loading Premium Experience</p>
        </div>
      </div>
    );
  }
  if (!product) return null;

  const discount = product.price > product.offerPrice
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-10">
      <div className="container mx-auto px-6 max-w-7xl">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 font-semibold uppercase tracking-wider mb-8">
          <Link to="/" className="hover:text-amber-400 transition-colors">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/products" className="hover:text-amber-400 transition-colors">Shop</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to={`/products?category=${product.category.toLowerCase().replace(' ', '-')}`} className="hover:text-amber-400 transition-colors">{product.category}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-300 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Top Section: Gallery & Main Info */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 relative">
          
          {/* LEFT: Sticky Gallery */}
          <div className="lg:w-1/2 relative">
            <div className="sticky top-28 flex flex-col gap-4">
              {/* Main Image with Zoom */}
              <div 
                className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-3xl overflow-hidden relative group cursor-zoom-in h-[400px] sm:h-[500px] md:h-[600px] flex items-center justify-center"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                {discount > 0 && (
                  <span className="absolute top-6 left-6 z-20 bg-amber-500 text-black text-sm px-3 py-1.5 rounded-full font-bold shadow-lg">
                    {discount}% OFF
                  </span>
                )}
                <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
                  <button className="w-10 h-10 rounded-full bg-[#111]/80 backdrop-blur-md border border-[#2a2a2a] flex items-center justify-center text-gray-300 hover:text-amber-400 hover:border-amber-400/50 transition-colors shadow-xl">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-[#111]/80 backdrop-blur-md border border-[#2a2a2a] flex items-center justify-center text-gray-300 hover:text-amber-400 hover:border-amber-400/50 transition-colors shadow-xl">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
                {product.image?.[activeImage] ? (
                  <img 
                    src={product.image[activeImage]} 
                    alt={product.name} 
                    className="w-full h-full object-contain p-8 transition-transform duration-200 ease-out z-10"
                    style={zoomStyle}
                  />
                ) : (
                  <span className="text-9xl z-10">📱</span>
                )}
              </div>

              {/* Thumbnails */}
              {product.image?.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                  {product.image.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                        activeImage === i ? 'border-amber-500 scale-105 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'border-[#1e1e1e] hover:border-amber-500/50 opacity-70 hover:opacity-100 bg-[#0f0f0f]'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover p-2" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Product Details */}
          <div className="lg:w-1/2 flex flex-col">
            <div className="mb-6">
              <p className="text-amber-500 text-xs font-bold tracking-widest uppercase mb-3">{product.category}</p>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 text-gray-600" />
                  <span className="text-white text-sm font-semibold ml-1">4.8</span>
                  <span className="text-gray-500 text-sm underline cursor-pointer hover:text-amber-400 transition-colors ml-2">(124 reviews)</span>
                </div>
              </div>

              <div className="flex items-end gap-4 mb-8">
                <span className="text-5xl font-extrabold text-amber-400">{formatCurrency(product.offerPrice)}</span>
                {discount > 0 && <span className="text-2xl text-gray-600 line-through mb-1 font-semibold">{formatCurrency(product.price)}</span>}
              </div>
            </div>

            {/* Colors (UI Mock) */}
            <div className="mb-8 border-t border-[#1e1e1e] pt-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Color</h3>
                <span className="text-sm text-gray-400">{selectedColor}</span>
              </div>
              <div className="flex gap-3">
                {MOCK_COLORS.map(color => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-10 h-10 rounded-full border-2 transition-all duration-300 relative ${
                      selectedColor === color.name ? 'border-amber-400 scale-110' : 'border-transparent hover:scale-110 ring-1 ring-[#333]'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    {selectedColor === color.name && (
                      <span className="absolute inset-0 border-2 border-[#050505] rounded-full"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sizes (UI Mock) */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Model / Size</h3>
                <button className="text-xs text-amber-500 hover:text-amber-400 underline transition-colors">Size Guide</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {MOCK_SIZES.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 rounded-xl text-sm font-bold transition-all duration-300 border ${
                      selectedSize === size 
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                        : 'bg-[#111] border-[#2a2a2a] text-gray-400 hover:border-gray-500 hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Compatibility (UI Mock) */}
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3">Compatibility</h3>
              <div className="flex flex-wrap gap-2">
                {MOCK_COMPATIBILITY.map(c => (
                  <span key={c} className="bg-[#111] border border-[#2a2a2a] text-gray-400 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Add to Cart Actions */}
            <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-3xl p-6 mb-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-[50px]"></div>
              
              <div className="flex items-center justify-between mb-6">
                <span className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl ${product.inStock ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  <span className={`w-2 h-2 rounded-full ${product.inStock ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                  {product.inStock ? 'In Stock & Ready to Ship' : 'Currently Out of Stock'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 relative z-10">
                <div className="flex items-center justify-between bg-[#111] border border-[#2a2a2a] rounded-xl p-1 sm:w-32 flex-shrink-0">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-lg hover:bg-[#222] text-gray-400 hover:text-white flex items-center justify-center transition-colors"><Minus className="w-4 h-4" /></button>
                  <span className="font-extrabold text-lg w-8 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-lg hover:bg-[#222] text-gray-400 hover:text-white flex items-center justify-center transition-colors"><Plus className="w-4 h-4" /></button>
                </div>
                
                <button
                  ref={addToCartRef}
                  onClick={addToCart}
                  disabled={!product.inStock || adding}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl text-lg font-extrabold transition-all duration-300 ${
                    product.inStock 
                      ? 'bg-amber-500 text-black hover:bg-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] active:scale-95' 
                      : 'bg-[#222] text-gray-600 cursor-not-allowed border border-[#333]'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  {adding ? 'Adding...' : product.inStock ? `Add to Cart — ${formatCurrency(product.offerPrice * quantity)}` : 'Out of Stock'}
                </button>
              </div>
            </div>

            {/* Quick Badges */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="flex items-center gap-3 bg-[#0a0a0a] border border-[#1e1e1e] p-4 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-200">Free Shipping</h4>
                  <p className="text-xs text-gray-500">Orders over {formatCurrency(FREE_SHIPPING_THRESHOLD)} within the UAE</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#0a0a0a] border border-[#1e1e1e] p-4 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-200">1 Year Warranty</h4>
                  <p className="text-xs text-gray-500">Official CaseHub Guarantee</p>
                </div>
              </div>
            </div>

            {/* Accordions */}
            <div className="border-t border-[#1e1e1e]">
              <Accordion title="Description" defaultOpen={true}>
                {product.description || 'Elevate your device experience with our premium accessories. Crafted from top-tier materials, this product offers unparalleled protection without compromising on sleek aesthetics. Designed precisely for your device, it ensures perfect fit and functionality.'}
              </Accordion>
              
              <Accordion title="Specifications">
                <ul className="space-y-3">
                  {MOCK_SPECS.map(spec => (
                    <li key={spec.label} className="flex justify-between border-b border-[#1e1e1e] pb-2 last:border-0">
                      <span className="text-gray-500">{spec.label}</span>
                      <span className="text-gray-200 font-medium">{spec.value}</span>
                    </li>
                  ))}
                </ul>
              </Accordion>
              
              <Accordion title="Shipping & Returns">
                <p className="mb-2"><strong>Dubai:</strong> 1-2 business days, {formatCurrency(DUBAI_SHIPPING_FEE)} flat rate.</p>
                <p className="mb-2"><strong>Other Emirates:</strong> 2-4 business days, {formatCurrency(OTHER_EMIRATES_SHIPPING_FEE)} flat rate.</p>
                <p className="mb-2">Free shipping on orders over {formatCurrency(FREE_SHIPPING_THRESHOLD)}, UAE-wide.</p>
                <p><strong>Returns:</strong> We accept returns within 7 days of delivery. Items must be unused and in original packaging. <Link to="#" className="text-amber-500 hover:underline">Read full policy</Link>.</p>
              </Accordion>
            </div>
          </div>
        </div>

        {/* BELOW THE FOLD */}
        
        {/* Frequently Bought Together */}
        <div className="mt-24 pt-12 border-t border-[#1e1e1e]">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold">Frequently Bought Together</h2>
          </div>
          <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-3xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 flex flex-col sm:flex-row items-center gap-6 w-full">
                {/* Main item */}
                <div className="relative group w-full sm:w-1/3">
                  <div className="bg-[#111] rounded-2xl p-4 h-48 flex items-center justify-center border-2 border-amber-500 mb-3 relative">
                    <span className="absolute top-2 left-2 bg-amber-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full">This Item</span>
                    {product.image?.[0] ? <img src={product.image[0]} className="h-full object-contain" alt="" /> : <span className="text-4xl">📱</span>}
                  </div>
                  <h4 className="text-sm font-bold truncate text-center">{product.name}</h4>
                  <p className="text-amber-500 font-bold text-center">{formatCurrency(product.offerPrice)}</p>
                </div>
                
                <span className="text-3xl text-gray-600 font-light">+</span>
                
                {/* Accessory item */}
                {relatedProducts[0] && (
                  <Link to={`/product/${relatedProducts[0].id}`} className="relative group w-full sm:w-1/3 block hover:opacity-80 transition-opacity">
                    <div className="bg-[#111] rounded-2xl p-4 h-48 flex items-center justify-center border border-[#2a2a2a] group-hover:border-[#444] mb-3">
                      {relatedProducts[0].image?.[0] ? <img src={relatedProducts[0].image[0]} className="h-full object-contain" alt="" /> : <span className="text-4xl">🔌</span>}
                    </div>
                    <h4 className="text-sm font-bold truncate text-center text-gray-300">{relatedProducts[0].name}</h4>
                    <p className="text-amber-500 font-bold text-center">{formatCurrency(relatedProducts[0].offerPrice)}</p>
                  </Link>
                )}
              </div>
              
              {/* Bundle Total */}
              {relatedProducts[0] && (
                <div className="w-full md:w-auto bg-[#111] border border-[#2a2a2a] p-6 rounded-2xl flex flex-col justify-center items-center md:items-start">
                  <p className="text-gray-400 text-sm mb-1">Bundle Total:</p>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-3xl font-extrabold text-amber-400">{formatCurrency(product.offerPrice + relatedProducts[0].offerPrice)}</span>
                    <span className="text-sm text-gray-500 line-through">{formatCurrency(product.price + relatedProducts[0].price)}</span>
                  </div>
                  <button className="w-full bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-8 rounded-xl transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    Add Both to Cart
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-20">
          <h2 className="text-2xl md:text-3xl font-extrabold mb-8 flex items-center gap-3">
            You May Also Like <span className="h-px flex-1 bg-gradient-to-r from-[#1e1e1e] to-transparent ml-4"></span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(rp => {
              const rpDiscount = rp.price > rp.offerPrice ? Math.round(((rp.price - rp.offerPrice) / rp.price) * 100) : 0;
              return (
                <div key={rp.id} className="group bg-[#0a0a0a] border border-[#1e1e1e] rounded-3xl overflow-hidden hover:border-[#333] transition-all duration-300 flex flex-col relative">
                  <Link to={`/product/${rp.id}`} className="relative h-56 bg-[#111] overflow-hidden flex items-center justify-center p-6">
                    {rp.image?.[0] ? <img src={rp.image[0]} className="h-full object-contain group-hover:scale-110 transition-transform duration-700" alt="" /> : <span className="text-5xl">📱</span>}
                    {rpDiscount > 0 && <span className="absolute top-4 left-4 bg-amber-500 text-black text-[10px] px-2 py-1 rounded-full font-bold">-{rpDiscount}%</span>}
                  </Link>
                  <div className="p-5 flex flex-col gap-2">
                    <p className="text-gray-500 text-[10px] font-bold uppercase">{rp.category}</p>
                    <Link to={`/product/${rp.id}`}><h3 className="font-bold text-gray-100 group-hover:text-amber-400 transition-colors text-sm truncate">{rp.name}</h3></Link>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-amber-400 font-extrabold">{formatCurrency(rp.offerPrice)}</span>
                      {rpDiscount > 0 && <span className="text-gray-600 line-through text-xs">{formatCurrency(rp.price)}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Reviews & Questions Area */}
        <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 border-t border-[#1e1e1e] pt-16">
          
          {/* Reviews */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold flex items-center gap-3"><MessageCircle className="w-6 h-6 text-amber-500" /> Customer Reviews</h2>
              <button className="text-sm text-amber-500 hover:text-amber-400 font-bold underline">Write a Review</button>
            </div>
            
            <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-3xl p-6 flex items-center gap-6 mb-8">
              <div className="text-center">
                <span className="text-5xl font-extrabold text-amber-400 block mb-1">4.8</span>
                <div className="flex text-amber-400 justify-center mb-1">
                  <Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/>
                </div>
                <span className="text-xs text-gray-500">Based on 124 reviews</span>
              </div>
              <div className="flex-1 space-y-2">
                {[5,4,3,2,1].map(star => (
                  <div key={star} className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="w-3">{star}</span>
                    <Star className="w-3 h-3 text-gray-600" />
                    <div className="flex-1 h-2 bg-[#111] rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: star === 5 ? '80%' : star === 4 ? '15%' : '5%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {MOCK_REVIEWS.map(rev => (
                <div key={rev.id} className="border-b border-[#1e1e1e] pb-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="font-bold text-gray-200 block mb-1">{rev.user}</span>
                      <div className="flex text-amber-400 gap-0.5">
                        {[...Array(5)].map((_,i) => <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-gray-700'}`} />)}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{rev.date}</span>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">{rev.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Q&A */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold flex items-center gap-3"><HelpCircle className="w-6 h-6 text-amber-500" /> Questions & Answers</h2>
              <button className="text-sm text-amber-500 hover:text-amber-400 font-bold underline">Ask a Question</button>
            </div>
            
            <div className="space-y-4">
              {MOCK_FAQ.map((faq, i) => (
                <div key={i} className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-2xl p-5">
                  <p className="font-bold text-gray-200 mb-3 flex gap-3">
                    <span className="text-amber-500">Q.</span> {faq.q}
                  </p>
                  <p className="text-sm text-gray-400 leading-relaxed flex gap-3">
                    <span className="text-gray-600 font-bold">A.</span> {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* STICKY BOTTOM ADD TO CART BAR */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-[#1e1e1e] p-4 transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${showStickyBar ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between gap-6">
          <div className="hidden md:flex items-center gap-4 flex-1">
            <div className="w-12 h-12 bg-[#111] rounded-xl overflow-hidden flex items-center justify-center border border-[#2a2a2a]">
               {product.image?.[0] ? <img src={product.image[0]} className="h-full object-contain p-1" alt="" /> : <span>📱</span>}
            </div>
            <div>
              <h4 className="font-bold text-sm truncate max-w-xs">{product.name}</h4>
              <p className="text-amber-400 font-bold text-xs">{formatCurrency(product.offerPrice)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center bg-[#111] border border-[#2a2a2a] rounded-lg p-1">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded text-gray-400 hover:text-white flex items-center justify-center transition-colors"><Minus className="w-3 h-3" /></button>
              <span className="font-bold text-sm w-6 text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 rounded text-gray-400 hover:text-white flex items-center justify-center transition-colors"><Plus className="w-3 h-3" /></button>
            </div>
            <button
              onClick={addToCart}
              disabled={!product.inStock || adding}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                product.inStock ? 'bg-amber-500 text-black hover:bg-amber-400 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-[#222] text-gray-600'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              {adding ? 'Adding...' : product.inStock ? `Add to Cart` : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default ProductDetail;
