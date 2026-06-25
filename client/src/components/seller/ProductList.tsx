import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../store";
import { setProducts } from "../../redux/sellerSlice";
import axiosInstance from "../../lib/axiosConfig";
import toast from "react-hot-toast";

const ProductList = () => {
    const dispatch = useDispatch();
    const { products } = useSelector((state: RootState) => state.seller);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axiosInstance.get("/api/products/list");
                dispatch(setProducts(response.data.products || []));
            } catch {
                toast.error("Failed to load products");
            }
        };
        fetchProducts();
    }, [dispatch]);

    const toggleStock = async (id: number, currentStock: boolean) => {
        try {
            const response = await axiosInstance.put(`/api/products/${id}`, { inStock: !currentStock });
            // Refresh product list
            const updated = products.map((p: any) =>
                p.id === id ? { ...p, inStock: response.data.product.inStock } : p
            );
            dispatch(setProducts(updated));
        } catch {
            toast.error("Failed to update stock");
        }
    };

    return (
        <div className="flex-1 py-10 px-4 md:px-10">
            <h2 className="text-xl font-semibold mb-6">All Products ({products.length})</h2>

            {products.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <div className="text-5xl mb-3">📦</div>
                    <p>No products yet. Add your first product!</p>
                </div>
            ) : (
                <div className="rounded-md border border-gray-200 overflow-hidden max-w-4xl">
                    <table className="w-full table-auto">
                        <thead className="bg-gray-50 text-gray-700 text-sm text-left">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Product</th>
                                <th className="px-4 py-3 font-semibold">Category</th>
                                <th className="px-4 py-3 font-semibold hidden md:table-cell">MRP</th>
                                <th className="px-4 py-3 font-semibold hidden md:table-cell">Offer Price</th>
                                <th className="px-4 py-3 font-semibold">In Stock</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-600 divide-y divide-gray-100">
                            {products.map((product: any) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition">
                                    <td className="px-4 py-3 flex items-center gap-3">
                                        {product.image?.[0] ? (
                                            <img src={product.image[0]} alt={product.name} className="w-12 h-12 object-cover rounded border border-gray-200" />
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xl">🛒</div>
                                        )}
                                        <span className="font-medium text-gray-700 truncate max-w-[120px]">{product.name}</span>
                                    </td>
                                    <td className="px-4 py-3">{product.category}</td>
                                    <td className="px-4 py-3 hidden md:table-cell text-gray-400 line-through">₹{product.price}</td>
                                    <td className="px-4 py-3 hidden md:table-cell font-medium text-green-700">₹{product.offerPrice}</td>
                                    <td className="px-4 py-3">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={product.inStock}
                                                onChange={() => toggleStock(product.id, product.inStock)}
                                            />
                                            <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition-colors duration-200" />
                                            <span className="dot absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-5" />
                                        </label>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ProductList;
