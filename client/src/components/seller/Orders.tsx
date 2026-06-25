import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import { setOrders } from "../../redux/sellerSlice";
import axiosInstance from "../../lib/axiosConfig";
import toast from "react-hot-toast";

const Orders = () => {
    const dispatch = useDispatch();
    const { orders } = useSelector((state: RootState) => state.seller);

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
                                <p className="truncate">{order.address.street}, {order.address.city}</p>
                            </div>

                            {/* Amount */}
                            <p className="font-bold text-lg text-gray-800 flex-shrink-0">₹{order.amount}</p>

                            {/* Meta */}
                            <div className="text-sm text-gray-500 flex-shrink-0 space-y-1">
                                <p>📅 {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                                <p>💳 {order.paymentType}</p>
                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                    order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {order.isPaid ? "Paid" : "COD Pending"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
