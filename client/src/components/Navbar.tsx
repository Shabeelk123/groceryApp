import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setUser } from "../redux/userSlice";
import axiosInstance from "../lib/axiosConfig";
import { formatCurrency } from "../utils/commonUtils";
import toast from "react-hot-toast";
import { 
  Search, Heart, ShoppingBag, User, 
  Menu, X, ChevronDown, LogOut 
} from "lucide-react";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.user);
  const wishlist = useAppSelector((state) => state.user.wishlist);
  const cartCount = user?.cartItems?.length ?? 0;
  const wishlistCount = wishlist.length;
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: number; name: string; offerPrice: number; image: string[] }[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const debounce = setTimeout(() => {
      axiosInstance.get('/api/products/list', { params: { search: searchQuery.trim(), limit: 5, page: 1 } })
        .then((res) => setSearchResults(res.data.products || []))
        .catch(() => setSearchResults([]))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const runSearch = (query: string) => {
    if (!query.trim()) return;
    navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    setShowSearch(false);
    setIsDrawerOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Close drawer when window resizes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsDrawerOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);

  const logout = async () => {
    try { 
      await axiosInstance.post('/api/users/logout'); 
    } catch { 
      /* ignore */ 
    }
    dispatch(setUser(null));
    setIsProfileDropdownOpen(false);
    setIsDrawerOpen(false);
    navigate('/');
    toast.success('Logged out successfully', {
      style: { background: '#333', color: '#fff' },
      iconTheme: { primary: '#fbbf24', secondary: '#333' }
    });
  };

  const navLinkStyle = ({ isActive }: { isActive: boolean }) => 
    `relative text-sm font-medium transition-all duration-300 group-hover:text-amber-400 ${
      isActive ? 'text-amber-400' : 'text-gray-300 hover:text-white'
    }`;

  const mobileNavLinkStyle = ({ isActive }: { isActive: boolean }) =>
    `flex items-center text-lg font-medium p-3 rounded-xl transition-all duration-300 ${
      isActive ? 'bg-amber-500/10 text-amber-400' : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-white'
    }`;

  return (
    <>
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 border-b ${
          isScrolled 
            ? 'bg-[#0a0a0a]/80 backdrop-blur-lg border-[#1e1e1e] shadow-xl py-3' 
            : 'bg-transparent border-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          
          {/* Logo */}
          <NavLink to="/" className="relative z-50 text-2xl font-extrabold tracking-tighter group flex items-center">
            <span className="text-amber-400 transition-transform duration-300 group-hover:scale-110 origin-right inline-block">Case</span>
            <span className="text-white transition-opacity duration-300 group-hover:opacity-90 inline-block">Hub</span>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            <NavLink to="/" className={navLinkStyle} end>
              <span className="relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-amber-400 after:transition-all after:duration-300 hover:after:w-full">Home</span>
            </NavLink>

            {/* Category Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-white transition-all duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-amber-400 after:transition-all after:duration-300 group-hover:after:w-full">
                Categories 
                <ChevronDown className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180 text-amber-400/70" />
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 z-50">
                <div className="bg-[#0f0f0f]/95 backdrop-blur-xl border border-[#2a2a2a] rounded-2xl shadow-2xl p-2 w-56 flex flex-col gap-1 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-b before:from-amber-500/5 before:to-transparent before:pointer-events-none">
                  {['Cases', 'Screen Protectors', 'Chargers', 'Audio'].map((cat) => (
                    <NavLink 
                      key={cat}
                      to={`/products?category=${cat.toLowerCase().replace(' ', '-')}`} 
                      className="text-sm font-medium text-gray-300 hover:text-amber-400 hover:bg-[#1a1a1a] px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between group/item"
                    >
                      {cat}
                      <span className="opacity-0 -translate-x-2 transition-all duration-300 group-hover/item:opacity-100 group-hover/item:translate-x-0 text-amber-400 text-lg leading-none">&rsaquo;</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            </div>

            <NavLink to="/products" className={navLinkStyle}>
              <span className="relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-amber-400 after:transition-all after:duration-300 hover:after:w-full">All Products</span>
            </NavLink>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-5">
            
            {/* Desktop Only Icons */}
            <div className="hidden md:flex items-center gap-4 border-r border-[#2a2a2a] pr-5 mr-1">
              <div className="relative">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="text-gray-300 hover:text-amber-400 transition-colors hover:scale-110 active:scale-95 duration-200"
                  aria-label="Search"
                >
                  <Search className="w-[20px] h-[20px]" />
                </button>
                {showSearch && (
                  <div className="absolute top-full right-0 mt-4 w-80 bg-[#0f0f0f]/95 backdrop-blur-xl border border-[#2a2a2a] rounded-2xl shadow-2xl p-3 z-50">
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') runSearch(searchQuery); }}
                      placeholder="Search products..."
                      className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                    />
                    {searching && <p className="text-xs text-gray-500 px-2 pt-3">Searching...</p>}
                    {!searching && searchQuery.trim().length >= 2 && searchResults.length === 0 && (
                      <p className="text-xs text-gray-500 px-2 pt-3">No products found</p>
                    )}
                    {searchResults.length > 0 && (
                      <div className="mt-2 space-y-1 max-h-80 overflow-y-auto">
                        {searchResults.map((p) => (
                          <NavLink
                            key={p.id}
                            to={`/product/${p.id}`}
                            onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#1a1a1a] transition-colors"
                          >
                            <div className="w-10 h-10 bg-[#111] rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                              {p.image?.[0] ? <img src={p.image[0]} alt="" className="w-full h-full object-contain p-1" /> : <span className="text-lg">📱</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-200 truncate">{p.name}</p>
                              <p className="text-xs text-amber-400 font-bold">{formatCurrency(p.offerPrice)}</p>
                            </div>
                          </NavLink>
                        ))}
                        <button
                          onClick={() => runSearch(searchQuery)}
                          className="w-full text-center text-xs font-bold text-amber-500 hover:text-amber-400 py-2"
                        >
                          See all results
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <NavLink to="/wishlist" className="relative text-gray-300 hover:text-amber-400 transition-colors hover:scale-110 active:scale-95 duration-200" aria-label="Wishlist">
                <Heart className="w-[20px] h-[20px]" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-[#0a0a0a] text-[10px] font-extrabold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 border-2 border-[#0a0a0a]">
                    {wishlistCount}
                  </span>
                )}
              </NavLink>
            </div>

            {/* Cart - Always Visible */}
            <NavLink to="/cart" className="relative text-gray-300 hover:text-amber-400 transition-colors hover:scale-110 active:scale-95 duration-200 flex items-center group">
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-amber-500 text-[#0a0a0a] text-[11px] font-extrabold min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1 border-2 border-[#0a0a0a] shadow-[0_0_10px_rgba(245,158,11,0.5)] transform group-hover:scale-110 transition-transform">
                  {cartCount}
                </span>
              )}
            </NavLink>

            {/* User Profile / Auth (Desktop) */}
            <div className="hidden md:block relative">
              {!user ? (
                <div className="flex items-center gap-3">
                  <NavLink to="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200">Login</NavLink>
                  <NavLink 
                    to="/register" 
                    className="text-sm bg-gradient-to-r from-amber-500 to-amber-400 text-black px-5 py-2 rounded-full font-bold hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    Sign Up
                  </NavLink>
                </div>
              ) : (
                <div 
                  className="relative"
                  onMouseEnter={() => setIsProfileDropdownOpen(true)}
                  onMouseLeave={() => setIsProfileDropdownOpen(false)}
                >
                  <button className="w-9 h-9 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-gray-300 hover:border-amber-500/50 hover:text-amber-400 transition-all duration-300 hover:shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    <User className="w-[18px] h-[18px]" />
                  </button>
                  
                  {/* Profile Dropdown */}
                  <div className={`absolute top-full right-0 pt-3 transition-all duration-300 transform origin-top-right ${isProfileDropdownOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                    <div className="bg-[#0f0f0f]/95 backdrop-blur-xl border border-[#2a2a2a] rounded-2xl shadow-2xl w-48 overflow-hidden">
                      <div className="px-4 py-3 border-b border-[#1e1e1e] bg-[#111]">
                        <p className="text-xs text-gray-400">Signed in as</p>
                        <p className="text-sm font-semibold text-white truncate">{user.name || 'User'}</p>
                      </div>
                      <div className="p-2 flex flex-col gap-1">
                        <NavLink to="/orders" className="flex items-center gap-2 text-sm text-gray-300 hover:text-amber-400 hover:bg-[#1a1a1a] px-3 py-2 rounded-lg transition-all duration-200">
                          <ShoppingBag className="w-4 h-4" /> My Orders
                        </NavLink>
                        <NavLink to="/profile" className="flex items-center gap-2 text-sm text-gray-300 hover:text-amber-400 hover:bg-[#1a1a1a] px-3 py-2 rounded-lg transition-all duration-200">
                          <User className="w-4 h-4" /> Profile
                        </NavLink>
                        <button 
                          onClick={logout}
                          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-2 rounded-lg transition-all duration-200 w-full text-left mt-1"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Burger Toggle */}
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden text-gray-300 hover:text-amber-400 transition-colors p-1"
              aria-label="Open menu"
            >
              <Menu className="w-7 h-7" />
            </button>
            
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden transition-opacity duration-400 ${
          isDrawerOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`} 
        onClick={() => setIsDrawerOpen(false)} 
      />

      {/* Mobile Drawer */}
      <div 
        className={`fixed top-0 right-0 h-[100dvh] w-[85vw] max-w-[320px] bg-[#0a0a0a] border-l border-[#1e1e1e] z-[60] transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] md:hidden flex flex-col ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-6 flex items-center justify-between border-b border-[#1e1e1e] bg-[#0f0f0f]">
          <span className="text-xl font-extrabold tracking-tighter">
            <span className="text-amber-400">Case</span><span className="text-white">Hub</span>
          </span>
          <button 
            onClick={() => setIsDrawerOpen(false)} 
            className="text-gray-400 hover:text-amber-400 bg-[#1a1a1a] p-2 rounded-full transition-all duration-300 hover:rotate-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-6">
          
          {/* Search Bar Mobile */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') runSearch(searchQuery); }}
              placeholder="Search products..."
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
            {searchResults.length > 0 && (
              <div className="mt-2 bg-[#111] border border-[#2a2a2a] rounded-xl p-2 space-y-1 max-h-64 overflow-y-auto">
                {searchResults.map((p) => (
                  <NavLink
                    key={p.id}
                    to={`/product/${p.id}`}
                    onClick={() => { setIsDrawerOpen(false); setSearchQuery(''); setSearchResults([]); }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#1a1a1a] transition-colors"
                  >
                    <div className="w-9 h-9 bg-[#0a0a0a] rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                      {p.image?.[0] ? <img src={p.image[0]} alt="" className="w-full h-full object-contain p-1" /> : <span className="text-sm">📱</span>}
                    </div>
                    <p className="text-sm text-gray-200 truncate">{p.name}</p>
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-2">
            <NavLink to="/" className={mobileNavLinkStyle} end onClick={() => setIsDrawerOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/products" className={mobileNavLinkStyle} onClick={() => setIsDrawerOpen(false)}>
              All Products
            </NavLink>
            <NavLink to="/wishlist" className={mobileNavLinkStyle} onClick={() => setIsDrawerOpen(false)}>
              Wishlist {wishlistCount > 0 && <span className="text-amber-400 ml-1">({wishlistCount})</span>}
            </NavLink>
            
            <div className="h-px w-full bg-[#1e1e1e] my-2"></div>
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 mt-2">Categories</p>
            {['Cases', 'Screen Protectors', 'Chargers', 'Audio'].map((cat) => (
              <NavLink 
                key={cat}
                to={`/products?category=${cat.toLowerCase().replace(' ', '-')}`} 
                className="flex items-center text-sm font-medium text-gray-400 hover:text-white hover:bg-[#111] p-3 rounded-xl transition-all"
                onClick={() => setIsDrawerOpen(false)}
              >
                {cat}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Drawer Footer / Auth */}
        <div className="p-6 border-t border-[#1e1e1e] bg-[#0f0f0f]">
          {!user ? (
            <div className="flex flex-col gap-3">
              <NavLink 
                to="/login" 
                className="w-full py-3 rounded-xl font-semibold text-white bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] text-center transition-colors"
                onClick={() => setIsDrawerOpen(false)}
              >
                Login
              </NavLink>
              <NavLink 
                to="/register" 
                className="w-full py-3 rounded-xl font-bold text-black bg-amber-500 hover:bg-amber-400 text-center transition-colors shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                onClick={() => setIsDrawerOpen(false)}
              >
                Create Account
              </NavLink>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{user.name || 'User'}</p>
                  <p className="text-xs text-gray-400">{user.email || 'Welcome back!'}</p>
                </div>
              </div>
              <NavLink 
                to="/orders" 
                className="flex items-center justify-between text-sm text-gray-300 hover:text-white bg-[#111] p-3 rounded-xl border border-[#1e1e1e]"
                onClick={() => setIsDrawerOpen(false)}
              >
                <span>My Orders</span>
                <span className="text-amber-500">&rsaquo;</span>
              </NavLink>
              <button 
                onClick={logout}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors mt-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
