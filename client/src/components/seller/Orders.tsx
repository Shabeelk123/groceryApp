import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import { setOrders } from "../../redux/sellerSlice";
import axiosInstance from "../../lib/axiosConfig";
import { formatCurrency } from "../../utils/commonUtils";
import toast from "react-hot-toast";

const ORDER_STATUSES = ["Order Placed", "Packed", "Shipped", "Delivered", "Cancelled"];

const STATUS_COLORS: Record<string, string> = {
    "Order Placed": "bg-blue-100 text-blue-700",
    "Packed": "bg-purple-100 text-purple-700",
    "Shipped": "bg-amber-100 text-amber-700",
    "Delivered": "bg-green-100 text-green-700",
    "Cancelled": "bg-red-100 text-red-700",
};

const Orders = () => {
    const dispatch = useDispatch();
    const { orders } = useSelector((state: RootState) => state.seller);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axiosInstance.get("/api/order/seller");
                dispatch(setOrders(response.data.orders || []));
            } catch {
                toast.error("Failed to load orders");
            }
        };
        fetchOrders();
    }, [dispatch]);

    const updateStatus = async (orderId: number, status: string) => {
        setUpdatingId(orderId);
        try {
            await axiosInstance.patch(`/api/order/${orderId}/status`, { status });
            dispatch(setOrders(orders.map((o) => (o.id === orderId ? { ...o, status } : o))));
            toast.success("Order status updated");
        } catch {
            toast.error("Failed to update order status");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="py-10 px-4 md:px-10">
            <h2 className="text-xl font-semibold mb-6">Orders ({orders.length})</h2>

            {orders.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <div className="text-5xl mb-3">📋</div>
                    <p>No orders yet.</p>
                </div>
            ) : (
                <div className="space-y-4 max-w-4xl">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between">
                            {/* Items */}
                            <div className="flex gap-3 items-start min-w-0">
                                <div className="text-3xl flex-shrink-0">📦</div>
                                <div>
                                    {order.items.map((item, idx) => (
                                        <p key={idx} className="text-sm font-medium text-gray-700">
                                            {item.product.name}
                                            <span className="text-green-600 ml-1">×{item.quantity}</span>
                                        </p>
                                    ))}
                                </div>
                            </div>

                            {/* Address */}
                            <div className="text-sm text-gray-500 min-w-0">
                                <p className="font-medium text-gray-700">{order.address.firstName} {order.address.lastName}</p>
                                <p className="truncate">{order.address.street}, {order.address.city}, {order.address.emirate}</p>
                            </div>

                            {/* Amount */}
                            <p className="font-bold text-lg text-gray-800 flex-shrink-0">{formatCurrency(order.amount)}</p>

                            {/* Meta */}
                            <div className="text-sm text-gray-500 flex-shrink-0 space-y-1">
                                <p>📅 {new Date(order.createdAt).toLocaleDateString('en-AE')}</p>
                                <p>💳 {order.paymentType}</p>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                    order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {order.isPaid ? "Paid" : "COD Pending"}
                                </span>
                            </div>

                            {/* Status */}
                            <div className="flex-shrink-0">
                                <select
                                    value={order.status}
                                    disabled={updatingId === order.id}
                                    onChange={(e) => updateStatus(order.id, e.target.value)}
                                    className={`text-xs font-medium rounded-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700'}`}
                                >
                                    {ORDER_STATUSES.map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
