import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../../lib/axiosConfig";
import toast from "react-hot-toast";

const CATEGORY_MODELS: Record<string, string[]> = {
  "iPhone Cases": [
    "iPhone 17 Pro Max",
    "iPhone 17 Pro",
    "iPhone 17 Plus",
    "iPhone 17",
    "iPhone 16 Pro Max",
    "iPhone 16 Pro",
    "iPhone 16 Plus",
    "iPhone 16",
    "iPhone 15 Pro Max",
    "iPhone 15 Pro",
    "iPhone 15 Plus",
    "iPhone 15",
    "iPhone 14 Pro Max",
    "iPhone 14 Pro",
    "iPhone 14 Plus",
    "iPhone 14",
  ],
  "Samsung Cases": [
    "Samsung S26 Ultra",
    "Samsung S26+",
    "Samsung S26",
    "Samsung S25 Ultra",
    "Samsung S25+",
    "Samsung S25",
    "Samsung S24 Ultra",
    "Samsung S24+",
    "Samsung S24",
    "Samsung S23 Ultra",
    "Samsung S23+",
    "Samsung S23",
    "Samsung A55",
    "Samsung A35",
    "Samsung A15",
  ],
  "AirPod Cases": [
    "AirPods Pro 2",
    "AirPods Pro 1",
    "AirPods 4",
    "AirPods 3",
    "AirPods 2",
  ],
  "Watch Straps": [
    "Apple Watch Ultra 2",
    "Apple Watch Series 10",
    "Apple Watch Series 9",
    "Apple Watch Series 8",
    "Apple Watch SE",
  ],
};

const CATEGORIES = Object.keys(CATEGORY_MODELS).concat([
  "Screen Protectors",
  "Ring Holders",
  "Wallets & Cards",
  "Chargers & Cables",
  "Other Accessories",
]);

const emptyForm = { name: "", description: "", category: "", model: "", price: "", offerPrice: "", inStock: "true" };

const AddProduct = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState(emptyForm);
  const [files, setFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);

  useEffect(() => {
    if (!isEditMode) return;
    axiosInstance.get(`/api/products/${id}`)
      .then((res) => {
        const p = res.data.product;
        if (!p) { toast.error("Product not found"); navigate("/seller/productlist"); return; }
        setFormData({
          name: p.name, description: p.description, category: p.category,
          model: p.model || "", price: String(p.price), offerPrice: String(p.offerPrice),
          inStock: String(p.inStock),
        });
        setExistingImages(p.image || []);
      })
      .catch(() => toast.error("Failed to load product"))
      .finally(() => setFetching(false));
  }, [id, isEditMode, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const updated = { ...formData, [e.target.name]: e.target.value };
    // Reset model when category changes
    if (e.target.name === "category") updated.model = "";
    setFormData(updated);
  };

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const updated = [...files];
    updated[index] = e.target.files?.[0] || null;
    setFiles(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, description, category, price, offerPrice } = formData;
    if (!name || !description || !category || !price || !offerPrice) {
      toast.error("Please fill all required fields"); return;
    }
    const selectedFiles = files.filter(Boolean) as File[];
    if (!isEditMode && selectedFiles.length === 0) { toast.error("Add at least one product image"); return; }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("productData", JSON.stringify({
        name, description, category,
        model: formData.model || null,
        price: Number(price),
        offerPrice: Number(offerPrice),
        inStock: formData.inStock === "true",
      }));
      selectedFiles.forEach((f) => data.append("images", f));

      if (isEditMode) {
        await axiosInstance.patch(`/api/products/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Product updated!");
        navigate("/seller/productlist");
      } else {
        await axiosInstance.post("/api/products/add", data, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Product added!");
        setFormData(emptyForm);
        setFiles([null, null, null, null]);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.error || `Failed to ${isEditMode ? "update" : "add"} product`);
    } finally { setLoading(false); }
  };

  const modelOptions = CATEGORY_MODELS[formData.category] || [];

  if (fetching) {
    return <div className="py-10 px-4 md:px-10 text-gray-500 text-sm">Loading product…</div>;
  }

  return (
    <div className="py-10 px-4 md:px-10 max-w-2xl">
      <p className="text-xs text-amber-500 uppercase tracking-widest mb-1">Seller Dashboard</p>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? "Edit Product" : "Add New Product"}</h2>
        {isEditMode && (
          <Link to="/seller/productlist" className="text-sm text-gray-500 hover:text-gray-800">← Back to list</Link>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Images */}
        <div>
          <p className="text-sm font-medium mb-2 text-gray-700">
            Product Images <span className="text-gray-400">(up to 4{isEditMode ? " — leave blank to keep existing" : ""})</span>
          </p>
          {isEditMode && existingImages.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-3">
              {existingImages.map((url, i) => (
                <div key={i} className="w-24 h-24 border border-gray-200 rounded-xl overflow-hidden">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {files.map((file, index) => (
              <label key={index} htmlFor={`image-${index}`} className="cursor-pointer">
                <input accept="image/*" type="file" id={`image-${index}`} hidden onChange={(e) => handleImageChange(index, e)} />
                <div className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden flex items-center justify-center hover:border-amber-400 transition bg-gray-50">
                  {file
                    ? <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    : <span className="text-3xl text-gray-300">+</span>}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="e.g. Leather MagSafe Case — Midnight Black" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={3} required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Describe material, features, compatibility..." />
        </div>

        {/* Category + Model */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
            <select name="category" value={formData.category} onChange={handleChange} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Compatible Model
              {modelOptions.length === 0 && <span className="text-gray-400 ml-1">(optional)</span>}
            </label>
            {modelOptions.length > 0 ? (
              <select name="model" value={formData.model} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
                <option value="">Select model</option>
                {modelOptions.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            ) : (
              <input type="text" name="model" value={formData.model} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder="e.g. 42mm / 44mm" />
            )}
          </div>
        </div>

        {/* Stock + Prices */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">In Stock</label>
            <select name="inStock" value={formData.inStock} onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400">
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">MRP (AED) *</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} min={0} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Offer Price (AED) *</label>
            <input type="number" name="offerPrice" value={formData.offerPrice} onChange={handleChange} min={0} required
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="0" />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="bg-amber-500 text-black px-8 py-2.5 rounded-full font-bold hover:bg-amber-400 transition disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? (isEditMode ? "Saving..." : "Adding...") : (isEditMode ? "Save Changes" : "Add Product")}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
