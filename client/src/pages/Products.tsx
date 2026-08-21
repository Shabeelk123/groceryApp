import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axiosInstance from '../lib/axiosConfig';
import { useAppDispatch, useAppSelector } from '../hooks';
import { updateCartItems } from '../redux/userSlice';
import { formatCurrency } from '../utils/commonUtils';
import { toggleWishlist } from '../utils/wishlistActions';
import toast from 'react-hot-toast';
import { 
  LayoutGrid, List as ListIcon, Filter, X, 
  Search, ChevronDown, Check, ShoppingBag, Heart 
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

const MOCK_FILTERS = {
  colors: ['Black', 'Brown', 'Clear', 'Blue', 'Red', 'Green'],
  brands: ['Apple', 'Samsung', 'Spigen', 'CaseMate', 'Nomad'],
  materials: ['Leather', 'Silicone', 'Aramid Fiber', 'Clear TPU', 'Hard PC'],
  collections: ['Classic', 'Rugged', 'Minimalist', 'Magsafe'],
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(
    CATEGORIES.find(c => c.toLowerCase().replace(' ', '-') === initialCategory) || 'all'
  );
  const [sortBy, setSortBy] = useState('name');
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  // New UI states
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<number>(1000);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const wishlist = useAppSelector((state) => state.user.wishlist);

  const handleToggleWishlist = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to save items'); return; }
    toggleWishlist(productId, wishlist.includes(productId), dispatch);
  };

  useEffect(() => {
    // Update selected category and search term when URL changes
    const catParam = searchParams.get('category');
    if (catParam) {
      const match = CATEGORIES.find(c => c.toLowerCase().replace(' ', '-') === catParam);
      if (match) setSelectedCategory(match);
    }
    const searchParam = searchParams.get('search');
    if (searchParam) setSearchTerm(searchParam);
  }, [searchParams]);

  useEffect(() => {
    axiosInstance.get('/api/products/list')
      .then((res) => setProducts(res.data.products || []))
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = async (product: Product, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!user) { toast.error('Please login to add items to cart'); return; }
    setAddingToCart(product.id);
    try {
      const response = await axiosInstance.post('/api/cart/update', { productId: String(product.id) });
      dispatch(updateCartItems(response.data.cart.cartItems));
      toast.success(`${product.name} added!`);
    } catch { toast.error('Failed to add to cart'); }
    finally { setAddingToCart(null); }
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    if (cat === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat.toLowerCase().replace(' ', '-'));
    }
    setSearchParams(searchParams);
  };

  const toggleArrayItem = (array: string[], setArray: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    if (array.includes(item)) setArray(array.filter(i => i !== item));
    else setArray([...array, item]);
  };

  const filteredProducts = products
    .filter((p) =>
      (selectedCategory === 'all' || p.category === selectedCategory) &&
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      p.offerPrice <= priceRange &&
      (!inStockOnly || p.inStock)
      // Note: Colors, Brands, Materials are UI placeholders as they aren't in the Product model yet
    )
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.offerPrice - b.offerPrice;
      if (sortBy === 'price-desc') return b.offerPrice - a.offerPrice;
      return a.name.localeCompare(b.name);
    });

  const FilterSection = ({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
      <div className="border-b border-[#1e1e1e] py-5">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="flex items-center justify-between w-full group"
        >
          <h3 className="text-sm font-bold tracking-wide text-gray-200 group-hover:text-amber-400 transition-colors uppercase">{title}</h3>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <div className={`mt-4 space-y-3 transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 !mt-0'}`}>
          {children}
        </div>
      </div>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between md:hidden p-5 border-b border-[#1e1e1e]">
        <span className="text-lg font-bold text-white">Filters</span>
        <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-[#1a1a1a] rounded-full text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 md:p-0 custom-scrollbar pr-2">
        {/* Categories */}
        <FilterSection title="Categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`block w-full text-left text-sm transition-colors py-1 ${selectedCategory === cat ? 'text-amber-400 font-semibold' : 'text-gray-400 hover:text-white'}`}
            >
              {cat === 'all' ? 'All Accessories' : cat}
            </button>
          ))}
        </FilterSection>

        {/* Price */}
        <FilterSection title="Price Range">
          <div className="space-y-4">
            <input
              type="range"
              min="0"
              max="1000"
              step="10"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-amber-500 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>{formatCurrency(0)}</span>
              <span className="text-amber-400 font-bold bg-[#1a1a1a] px-3 py-1 rounded-lg">Up to {formatCurrency(priceRange)}</span>
            </div>
          </div>
        </FilterSection>

        {/* Availability */}
        <FilterSection title="Availability">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${inStockOnly ? 'bg-amber-500 border-amber-500' : 'border-[#333] group-hover:border-amber-500/50 bg-[#111]'}`}>
              {inStockOnly && <Check className="w-3.5 h-3.5 text-black" />}
            </div>
            <span className={`text-sm ${inStockOnly ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>In Stock Only</span>
            <input type="checkbox" className="hidden" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} />
          </label>
        </FilterSection>

        {/* Brand (UI Mock) */}
        <FilterSection title="Brand" defaultOpen={false}>
          {MOCK_FILTERS.brands.map(brand => (
            <label key={brand} className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${selectedBrands.includes(brand) ? 'bg-amber-500 border-amber-500' : 'border-[#333] group-hover:border-amber-500/50 bg-[#111]'}`}>
                {selectedBrands.includes(brand) && <Check className="w-3.5 h-3.5 text-black" />}
              </div>
              <span className={`text-sm ${selectedBrands.includes(brand) ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>{brand}</span>
              <input type="checkbox" className="hidden" checked={selectedBrands.includes(brand)} onChange={() => toggleArrayItem(selectedBrands, setSelectedBrands, brand)} />
            </label>
          ))}
        </FilterSection>

        {/* Color (UI Mock) */}
        <FilterSection title="Color" defaultOpen={false}>
          <div className="flex flex-wrap gap-2">
            {MOCK_FILTERS.colors.map(color => {
              const bgMap: Record<string, string> = { 'Black': '#111', 'Brown': '#8b4513', 'Clear': '#f3f4f6', 'Blue': '#1e3a8a', 'Red': '#991b1b', 'Green': '#064e3b' };
              return (
                <button
                  key={color}
                  onClick={() => toggleArrayItem(selectedColors, setSelectedColors, color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColors.includes(color) ? 'border-amber-400 scale-110' : 'border-transparent hover:scale-110'}`}
                  style={{ backgroundColor: bgMap[color] }}
                  title={color}
                />
              )
            })}
          </div>
        </FilterSection>
        
        {/* Material & Collection omitted for brevity, but could follow same pattern */}
      </div>

      <div className="md:hidden p-5 border-t border-[#1e1e1e] bg-[#0a0a0a]">
        <button onClick={() => setIsMobileFiltersOpen(false)} className="w-full bg-amber-500 text-black font-bold py-3 rounded-xl">
          Show {filteredProducts.length} Results
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20">
      
      {/* Header Banner */}
      <div className="bg-[#0a0a0a] border-b border-[#1e1e1e] pt-8 pb-10 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="container mx-auto px-6 relative z-10">
          <p className="text-amber-500 text-xs tracking-[0.2em] font-bold uppercase mb-2">CaseHub Collection</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
            {selectedCategory === 'all' ? 'All Products' : selectedCategory}
          </h1>
          <p className="text-gray-400 text-sm max-w-xl">
            Discover our premium selection of mobile accessories designed to protect and enhance your devices with uncompromising style.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left Sidebar (Desktop) */}
          <aside className="hidden lg:block w-[260px] flex-shrink-0">
            <div className="sticky top-28 h-[calc(100vh-8rem)] overflow-y-auto pr-4 custom-scrollbar pb-10">
              <SidebarContent />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            
            {/* Top Toolbar */}
            <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-[72px] z-30 shadow-2xl backdrop-blur-xl">
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => setIsMobileFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex-1 sm:flex-none justify-center"
                >
                  <Filter className="w-4 h-4" /> Filters
                </button>

                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text" 
                    placeholder="Search collection..."
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#111] border border-[#2a2a2a] text-white placeholder-gray-500 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <p className="text-sm text-gray-400 hidden md:block">
                  Showing <span className="text-white font-semibold">{filteredProducts.length}</span> results
                </p>

                <div className="flex items-center gap-3">
                  <select
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#111] border border-[#2a2a2a] text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer"
                  >
                    <option value="name">Sort: A–Z</option>
                    <option value="price-asc">Sort: Price Low to High</option>
                    <option value="price-desc">Sort: Price High to Low</option>
                  </select>

                  <div className="hidden sm:flex items-center bg-[#111] border border-[#2a2a2a] rounded-xl p-1">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#222] text-amber-400 shadow-sm' : 'text-gray-500 hover:text-white'}`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#222] text-amber-400 shadow-sm' : 'text-gray-500 hover:text-white'}`}
                    >
                      <ListIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-2xl p-4 animate-pulse">
                    <div className="h-48 bg-[#1a1a1a] rounded-xl mb-4"></div>
                    <div className="h-4 bg-[#1a1a1a] rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-[#1a1a1a] rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-[#1a1a1a] rounded-lg w-full"></div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-3xl py-24 px-6 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6">
                  <Search className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  We couldn't find anything matching your current filters. Try adjusting your search or category selection.
                </p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setPriceRange(15000);
                    setInStockOnly(false);
                    searchParams.delete('category');
                    setSearchParams(searchParams);
                  }}
                  className="bg-[#1a1a1a] hover:bg-[#222] text-white px-6 py-3 rounded-xl text-sm font-semibold transition-colors border border-[#2a2a2a]"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                : "flex flex-col gap-4"
              }>
                {filteredProducts.map((product) => {
                  const discount = product.price > product.offerPrice
                    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
                    : 0;
                  
                  if (viewMode === 'list') {
                    // LIST VIEW CARD
                    return (
                      <div key={product.id} className="group bg-[#0f0f0f] border border-[#1e1e1e] rounded-2xl overflow-hidden hover:border-[#333] transition-all duration-300 flex flex-row">
                        <Link to={`/product/${product.id}`} className="w-40 sm:w-56 bg-[#111] flex-shrink-0 flex items-center justify-center p-4 relative overflow-hidden">
                          {product.image?.[0] ? (
                            <img src={product.image[0]} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
                          ) : (
                            <span className="text-5xl">📱</span>
                          )}
                          {discount > 0 && (
                            <span className="absolute top-3 left-3 bg-amber-500 text-black text-[10px] px-2 py-1 rounded-full font-bold shadow-lg">
                              -{discount}%
                            </span>
                          )}
                        </Link>
                        <div className="p-5 flex-1 flex flex-col justify-center">
                          <div className="flex justify-between items-start mb-1">
                            <p className="text-amber-500/80 text-[11px] font-bold tracking-wider uppercase">{product.category}</p>
                            <button onClick={(e) => handleToggleWishlist(e, product.id)} className={`transition-colors ${wishlist.includes(product.id) ? 'text-amber-400' : 'text-gray-500 hover:text-amber-400'}`}>
                              <Heart className={`w-5 h-5 ${wishlist.includes(product.id) ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                          <Link to={`/product/${product.id}`}>
                            <h3 className="font-bold text-lg text-gray-100 group-hover:text-amber-400 transition-colors mb-2 line-clamp-2">{product.name}</h3>
                          </Link>
                          <p className="text-gray-400 text-sm line-clamp-2 mb-4 max-w-xl">{product.description || 'Premium mobile accessory crafted for ultimate protection and style.'}</p>
                          <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-baseline gap-2.5">
                              <span className="text-amber-400 font-extrabold text-xl">{formatCurrency(product.offerPrice)}</span>
                              {discount > 0 && <span className="text-gray-500 line-through text-sm font-medium">{formatCurrency(product.price)}</span>}
                            </div>
                            <button
                              onClick={(e) => addToCart(product, e)}
                              disabled={!product.inStock || addingToCart === product.id}
                              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                                product.inStock
                                  ? 'bg-amber-500 text-black hover:bg-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95'
                                  : 'bg-[#1a1a1a] text-gray-500 cursor-not-allowed border border-[#2a2a2a]'
                              }`}
                            >
                              <ShoppingBag className="w-4 h-4" />
                              {addingToCart === product.id ? 'Adding...' : product.inStock ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // GRID VIEW CARD
                  return (
                    <div key={product.id} className="group bg-[#0f0f0f] border border-[#1e1e1e] rounded-3xl overflow-hidden hover:border-[#333] transition-all duration-300 flex flex-col relative">
                      <div className={`absolute top-4 right-4 z-10 flex flex-col gap-2 transition-all duration-300 ${wishlist.includes(product.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0'}`}>
                        <button onClick={(e) => handleToggleWishlist(e, product.id)} className={`w-9 h-9 rounded-full bg-[#111]/80 backdrop-blur-md border flex items-center justify-center transition-colors shadow-xl ${wishlist.includes(product.id) ? 'text-amber-400 border-amber-400/50' : 'text-gray-300 border-[#2a2a2a] hover:text-amber-400 hover:border-amber-400/50'}`}>
                          <Heart className={`w-4 h-4 ${wishlist.includes(product.id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      <Link to={`/product/${product.id}`} className="relative h-64 bg-[#111] overflow-hidden flex items-center justify-center p-8">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>
                        {product.image?.[0] ? (
                          <img src={product.image[0]} alt={product.name} className="h-full w-full object-contain relative z-10 group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]" />
                        ) : (
                          <span className="text-6xl relative z-10">📱</span>
                        )}
                        {discount > 0 && (
                          <span className="absolute top-4 left-4 bg-amber-500 text-black text-xs px-2.5 py-1 rounded-full font-bold shadow-lg z-10">
                            -{discount}%
                          </span>
                        )}
                      </Link>
                      <div className="p-5 flex-1 flex flex-col bg-gradient-to-b from-[#0f0f0f] to-[#0a0a0a]">
                        <p className="text-gray-500 text-[10px] font-bold tracking-widest uppercase mb-1.5">{product.category}</p>
                        <Link to={`/product/${product.id}`}>
                          <h3 className="font-bold text-gray-100 group-hover:text-amber-400 transition-colors mb-3 line-clamp-2 text-sm">{product.name}</h3>
                        </Link>
                        
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex flex-col">
                            {discount > 0 && <span className="text-gray-600 line-through text-[11px] font-medium leading-none mb-1">{formatCurrency(product.price)}</span>}
                            <span className="text-amber-400 font-extrabold text-lg leading-none">{formatCurrency(product.offerPrice)}</span>
                          </div>
                          <button
                            onClick={(e) => addToCart(product, e)}
                            disabled={!product.inStock || addingToCart === product.id}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                              product.inStock
                                ? 'bg-[#1a1a1a] text-white hover:bg-amber-500 hover:text-black hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:scale-110 active:scale-95 border border-[#2a2a2a] hover:border-amber-500'
                                : 'bg-[#111] text-gray-700 cursor-not-allowed border border-[#1e1e1e]'
                            }`}
                            aria-label="Add to cart"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isMobileFiltersOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsMobileFiltersOpen(false)}
      />

      {/* Mobile Sidebar Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 w-[85vw] max-w-[320px] bg-[#0a0a0a] border-r border-[#1e1e1e] z-50 transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:hidden ${
          isMobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent />
      </div>

    </div>
  );
};

export default Products;
