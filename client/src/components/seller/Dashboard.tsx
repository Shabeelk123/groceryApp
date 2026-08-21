import { useEffect, useState } from "react";
import axiosInstance from "../../lib/axiosConfig";
import { formatCurrency } from "../../utils/commonUtils";
import toast from "react-hot-toast";

interface Order {
  id: number;
  amount: number;
  status: string;
  createdAt: string;
}

interface Product {
  id: number;
  inStock: boolean;
}

const isToday = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
};

const Dashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axiosInstance.get("/api/order/seller"),
      axiosInstance.get("/api/products/list"),
    ])
      .then(([ordersRes, productsRes]) => {
        setOrders(ordersRes.data.orders || []);
        setProducts(productsRes.data.products || []);
      })
      .catch(() => toast.error("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  const ordersToday = orders.filter((o) => isToday(o.createdAt));
  const revenueToday = ordersToday.reduce((s, o) => s + o.amount, 0);
  const totalRevenue = orders.reduce((s, o) => s + o.amount, 0);
  const pendingOrders = orders.filter((o) => o.status === "Order Placed" || o.status === "Packed").length;
  const outOfStockCount = products.filter((p) => !p.inStock).length;

  const stats = [
    { label: "Orders Today", value: ordersToday.length, icon: "📦" },
    { label: "Revenue Today", value: formatCurrency(revenueToday), icon: "💰" },
    { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: "📈" },
    { label: "Pending Orders", value: pendingOrders, icon: "⏳" },
    { label: "Total Products", value: products.length, icon: "🛍️" },
    { label: "Out of Stock", value: outOfStockCount, icon: "⚠️" },
  ];

  if (loading) {
    return <div className="py-10 px-4 md:px-10 text-gray-500 text-sm">Loading dashboard…</div>;
  }

  return (
    <div className="py-10 px-4 md:px-10">
      <p className="text-xs text-amber-500 uppercase tracking-widest mb-1">Seller Dashboard</p>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="text-2xl font-extrabold text-gray-800">{s.value}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
