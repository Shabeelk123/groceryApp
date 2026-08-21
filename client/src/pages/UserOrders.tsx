import { useEffect, useState } from 'react';
import axiosInstance from '../lib/axiosConfig';
import { useAppSelector } from '../hooks';
import { useNavigate, Link } from 'react-router-dom';
import { formatCurrency } from '../utils/commonUtils';
import toast from 'react-hot-toast';
import { 
  Package, ChevronDown, CheckCircle2, Clock, 
  Truck, FileText, ShoppingBag, MapPin, 
  CreditCard, RotateCcw, Box, ArrowRight
} from 'lucide-react';

interface OrderItem {
  id: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    image: string[];
  };
}

interface Address {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  country: string;
}

interface Order {
  id: number;
  amount: number;
  status: string;
  paymentType: string;
  isPaid: boolean;
  createdAt: string;
  items: OrderItem[];
  address: Address;
}

const UserOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const user = useAppSelector((state) => state.user.user);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!user) {
      navigate('/login');
      return;
    }
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get('/api/order/user');
        setOrders(response.data.orders || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, navigate]);

  const handleActionClick = (action: string) => {
    toast(`${action} will be available soon!`, {
      icon: '🚧',
      style: { background: '#111', color: '#fbbf24', border: '1px solid #2a2a2a' },
    });
  };

  const toggleOrderDetails = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusStep = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'delivered') return 4;
    if (s === 'shipped') return 3;
    if (s === 'processing') return 2;
    return 1; // Pending
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center pt-24 pb-20">
        <div className="container mx-auto px-6 max-w-4xl space-y-6">
          <div className="h-10 w-48 bg-[#111] rounded-lg animate-pulse mb-8"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-3xl h-48 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20">
      <div className="container mx-auto px-6 max-w-4xl">
        
        <div className="flex items-center gap-3 mb-10">
          <Package className="w-8 h-8 text-amber-500" />
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[50vh] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="w-32 h-32 bg-[#111] border border-[#2a2a2a] rounded-full flex items-center justify-center mb-8 relative">
              <Box className="w-12 h-12 text-gray-500" />
              <span className="absolute -bottom-2 -right-2 text-3xl">📦</span>
            </div>
            <h2 className="text-3xl font-extrabold mb-3">No orders yet</h2>
            <p className="text-gray-400 mb-8 max-w-sm">Looks like you haven't made your first purchase. Explore our premium collection!</p>
            <Link to="/products" className="inline-flex items-center gap-2 bg-amber-500 text-black px-8 py-4 rounded-xl font-bold hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              Start Shopping <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const statusStep = getStatusStep(order.status);
              
              return (
                <div key={order.id} className={`bg-[#0a0a0a] border rounded-3xl overflow-hidden transition-colors duration-300 ${isExpanded ? 'border-[#333] shadow-2xl' : 'border-[#1e1e1e] hover:border-[#2a2a2a]'}`}>
                  
                  {/* Order Card Header (Always Visible) */}
                  <div 
                    onClick={() => toggleOrderDetails(order.id)}
                    className="p-6 md:p-8 cursor-pointer flex flex-col md:flex-row gap-6 md:items-center justify-between group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-amber-500 font-bold uppercase tracking-wider text-xs">Order #{order.id}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                        <span className="text-gray-400 text-sm font-medium">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      
                      {/* Product Thumbnails Preview */}
                      <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 mt-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="relative group/img">
                            <div className="w-16 h-16 bg-[#111] rounded-xl border border-[#2a2a2a] overflow-hidden flex items-center justify-center flex-shrink-0">
                              {item.product.image?.[0] ? <img src={item.product.image[0]} className="w-full h-full object-contain p-1" alt="" /> : <span>📱</span>}
                            </div>
                            <span className="absolute -top-2 -right-2 w-5 h-5 bg-[#222] border border-[#333] rounded-full flex items-center justify-center text-[10px] font-bold text-gray-300">
                              {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center border-t border-[#1e1e1e] md:border-t-0 pt-4 md:pt-0 gap-4 md:gap-2">
                      <div className="text-left md:text-right">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Amount</p>
                        <p className="font-extrabold text-2xl text-white">{formatCurrency(order.amount)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${order.isPaid ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${order.isPaid ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                          {order.isPaid ? 'Paid' : 'Pending'}
                        </div>
                        <div className={`w-8 h-8 rounded-full border border-[#2a2a2a] bg-[#111] flex items-center justify-center text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-[#222] text-white border-[#444]' : 'group-hover:bg-[#222] group-hover:text-white'}`}>
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details Section */}
                  <div className={`overflow-hidden transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-6 md:p-8 pt-0 border-t border-[#1e1e1e] bg-[#0c0c0c]">
                      
                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 py-6 border-b border-[#1e1e1e]">
                        <button onClick={() => handleActionClick('Tracking information')} className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] text-white px-5 py-2.5 rounded-xl text-sm font-bold border border-[#2a2a2a] transition-colors">
                          <Truck className="w-4 h-4 text-amber-500" /> Track Order
                        </button>
                        <button onClick={() => handleActionClick('Invoice generation')} className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] text-white px-5 py-2.5 rounded-xl text-sm font-bold border border-[#2a2a2a] transition-colors">
                          <FileText className="w-4 h-4 text-gray-400" /> Download Invoice
                        </button>
                        <button onClick={() => handleActionClick('Reorder flow')} className="flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#222] text-white px-5 py-2.5 rounded-xl text-sm font-bold border border-[#2a2a2a] transition-colors">
                          <RotateCcw className="w-4 h-4 text-gray-400" /> Reorder Items
                        </button>
                      </div>

                      {/* Status Timeline */}
                      <div className="py-8 border-b border-[#1e1e1e]">
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-6">Delivery Status: <span className="text-amber-500">{order.status}</span></h3>
                        
                        <div className="relative">
                          {/* Progress Line Background */}
                          <div className="absolute top-5 left-6 right-6 h-1 bg-[#1a1a1a] rounded-full hidden sm:block"></div>
                          
                          {/* Active Progress Line */}
                          <div 
                            className="absolute top-5 left-6 h-1 bg-amber-500 rounded-full hidden sm:block transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                            style={{ width: `${((statusStep - 1) / 3) * 100}%`, maxWidth: 'calc(100% - 3rem)' }}
                          ></div>

                          <div className="flex flex-col sm:flex-row justify-between gap-6 sm:gap-0 relative z-10">
                            {[
                              { step: 1, label: 'Order Placed', icon: Clock },
                              { step: 2, label: 'Processing', icon: Box },
                              { step: 3, label: 'Shipped', icon: Truck },
                              { step: 4, label: 'Delivered', icon: CheckCircle2 },
                            ].map((s) => {
                              const isActive = statusStep >= s.step;
                              const isCurrent = statusStep === s.step;
                              const Icon = s.icon;
                              return (
                                <div key={s.step} className="flex sm:flex-col items-center gap-4 sm:gap-3 group">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 relative bg-[#0c0c0c] ${
                                    isActive 
                                      ? 'border-amber-500 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                                      : 'border-[#2a2a2a] text-gray-600'
                                  }`}>
                                    {isActive ? <Icon className="w-5 h-5" /> : <div className="w-2.5 h-2.5 rounded-full bg-[#2a2a2a]"></div>}
                                    {isCurrent && <span className="absolute -inset-2 border border-amber-500/30 rounded-full animate-ping"></span>}
                                  </div>
                                  <p className={`text-sm font-bold ${isActive ? 'text-gray-200' : 'text-gray-600'}`}>{s.label}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Info Grid (Address & Payment) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-b border-[#1e1e1e]">
                        <div>
                          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><MapPin className="w-4 h-4" /> Shipping Address</h3>
                          <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5">
                            <p className="font-bold text-gray-200 mb-1">{order.address.firstName} {order.address.lastName}</p>
                            <p className="text-gray-400 text-sm leading-relaxed">
                              {order.address.street}<br/>
                              {order.address.city}, {order.address.state}<br/>
                              {order.address.country}
                            </p>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Payment Details</h3>
                          <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5 h-[calc(100%-2rem)] flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-gray-400 text-sm">Method</span>
                              <span className="text-white font-bold">{order.paymentType}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-400 text-sm">Status</span>
                              <span className={`font-bold ${order.isPaid ? 'text-green-400' : 'text-yellow-400'}`}>{order.isPaid ? 'Successful' : 'Pending'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Products List Detailed */}
                      <div className="pt-8">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><ShoppingBag className="w-4 h-4" /> Ordered Items</h3>
                        <div className="space-y-4">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 bg-[#111] border border-[#1e1e1e] p-4 rounded-2xl">
                              <div className="w-16 h-16 bg-[#0a0a0a] rounded-xl border border-[#2a2a2a] flex items-center justify-center flex-shrink-0">
                                {item.product.image?.[0] ? <img src={item.product.image[0]} className="w-full h-full object-contain p-1" alt="" /> : <span>📱</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-200 text-sm truncate">{item.product.name}</p>
                                <p className="text-gray-500 text-xs mt-1">Qty: {item.quantity}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-extrabold text-amber-400 text-sm">{formatCurrency(item.price * item.quantity)}</p>
                                {item.quantity > 1 && <p className="text-gray-600 text-[10px]">{formatCurrency(item.price)} each</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
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

export default UserOrders;
