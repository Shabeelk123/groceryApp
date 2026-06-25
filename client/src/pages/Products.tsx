import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

const CATEGORIES = [
  'all',
  'iPhone Cases',
  'Samsung Cases',
  'Screen Protectors',
  'Watch Straps',
  'Wallets & Cards',
  'Chargers & Cables',
  'AirPod Cases',
];

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);

  useEffect(() => {
    axiosInstance.get('/api/products/list')
      .then((res) => setProducts(res.data.products || []))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = async (product: Product) => {
    if (!user) { toast.error('Please login to add items to cart'); return; }
    setAddingToCart(product.id);
    try {
      const response = await axiosInstance.post('/api/cart/update', { productId: String(product.id) });
      dispatch(updateCartItems(response.data.cart.cartItems));
      toast.success(`${product.name} added!`);
    } catch { toast.error('Failed to add to cart'); }
    finally { setAddingToCart(null); }
  };

  const filteredProducts = products
    .filter((p) =>
      (selectedCategory === 'all' || p.category === selectedCategory) &&
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.offerPrice - b.offerPrice;
      if (sortBy === 'price-desc') return b.offerPrice - a.offerPrice;
      return a.name.localeCompare(b.name);
    });

  // Always use the hardcoded CaseHub category list for the filter
  const categoryList = CATEGORIES;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-10">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="mb-10">
          <p className="text-amber-400 text-xs tracking-widest uppercase mb-1">CaseHub</p>
          <h1 className="text-4xl font-extrabold">All Products</h1>
          <p className="text-gray-500 mt-1">{filteredProducts.length} products found</p>
        </div>

        {/* Filters */}
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-xl p-5 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Search</label>
            <input
              type="text" placeholder="Search products..."
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] text-white placeholder-gray-600 px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-amber-500/60"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Category</label>
            <select
              value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-amber-500/60"
            >
              {categoryList.map((c) => (
                <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 uppercase tracking-wide">Sort By</label>
            <select
              value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-[#0f0f0f] border border-[#2a2a2a] text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-amber-500/60"
            >
              <option value="name">Name (A–Z)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => {
              const discount = product.price > product.offerPrice
                ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
                : 0;
              return (
                <div key={product.id} className="group bg-[#161616] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-amber-500/40 transition-all duration-300">
                  <Link to={`/product/${product.id}`}>
                    <div className="h-52 bg-[#111] overflow-hidden flex items-center justify-center">
                      {product.image?.[0]
                        ? <img src={product.image[0]} alt={product.name} className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500" />
                        : <span className="text-5xl">📱</span>}
                    </div>
                  </Link>
                  <div className="p-4">
                    {discount > 0 && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-semibold">{discount}% OFF</span>
                    )}
                    <h3 className="font-semibold mt-2 truncate text-sm">{product.name}</h3>
                    <p className="text-gray-500 text-xs mt-0.5 mb-3">{product.category}</p>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-amber-400 font-bold text-lg">₹{product.offerPrice}</span>
                      {discount > 0 && <span className="text-gray-600 line-through text-xs">₹{product.price}</span>}
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock || addingToCart === product.id}
                      className={`w-full py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${product.inStock
                          ? 'bg-amber-500 text-black hover:bg-amber-400 active:scale-95'
                          : 'bg-[#222] text-gray-600 cursor-not-allowed'
                        }`}
                    >
                      {addingToCart === product.id ? 'Adding...' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
