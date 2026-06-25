import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../../lib/axiosConfig';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { updateCartItems } from '../../redux/userSlice';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  price: number;
  offerPrice: number;
  image: string[];
  category: string;
  inStock: boolean;
}

const ProductCard = ({ product }: { product: Product }) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.user.user);
  const [adding, setAdding] = useState(false);

  const discount = product.price > product.offerPrice
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0;

  const addToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to add items to cart'); return; }
    setAdding(true);
    try {
      const res = await axiosInstance.post('/api/cart/update', { productId: String(product.id) });
      dispatch(updateCartItems(res.data.cart.cartItems));
      toast.success('Added to cart!');
    } catch { toast.error('Failed to add to cart'); }
    finally { setAdding(false); }
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden flex flex-col hover:border-amber-500/30 transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
    >
      {/* Image */}
      <div className="relative bg-[#0d0d0d] aspect-square overflow-hidden">
        {product.image?.[0]
          ? <img src={product.image[0]} alt={product.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-5xl">📱</div>}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="text-[10px] font-black bg-amber-500 text-black px-2.5 py-1 rounded-full tracking-wide">
              -{discount}%
            </span>
          )}
          {!product.inStock && (
            <span className="text-[10px] font-bold bg-[#222] border border-[#333] text-gray-500 px-2.5 py-1 rounded-full">
              Sold Out
            </span>
          )}
        </div>

        {/* Quick Add overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={addToCart}
            disabled={!product.inStock || adding}
            className="w-full bg-amber-500/95 backdrop-blur-sm text-black text-xs font-bold py-3 hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding ? 'Adding…' : product.inStock ? '+ Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-gray-600 text-[10px] uppercase tracking-widest mb-1 font-medium">{product.category}</p>
        <h3 className="text-white text-sm font-semibold leading-snug line-clamp-2 flex-1 mb-3">{product.name}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-white font-black text-base">AED {product.offerPrice}</span>
          {discount > 0 && <span className="text-gray-600 line-through text-xs">AED {product.price}</span>}
        </div>
      </div>
    </Link>
  );
};

export const ProductCardSkeleton = () => (
  <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl overflow-hidden animate-pulse">
    <div className="aspect-square bg-[#181818]" />
    <div className="p-4 space-y-2">
      <div className="h-2.5 bg-[#1e1e1e] rounded w-1/3" />
      <div className="h-3.5 bg-[#1e1e1e] rounded w-4/5" />
      <div className="h-3.5 bg-[#1e1e1e] rounded w-3/5" />
      <div className="h-4 bg-[#1e1e1e] rounded w-1/2 mt-2" />
    </div>
  </div>
);

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get('/api/products/list')
      .then((res) => setProducts((res.data.products || []).slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 bg-[#080808]">
      <div className="container mx-auto px-6">
        <div className="flex items-end justify-between mb-14">
          <div>
            <p className="text-amber-400 text-[10px] font-bold tracking-[0.25em] uppercase mb-3">Handpicked for you</p>
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-none">
              Featured<br />
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">Products</span>
            </h2>
          </div>
          <Link to="/products" className="hidden md:inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors">
            View all
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : products.map((p) => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
