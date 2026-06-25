import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import axiosInstance from "../../lib/axiosConfig";
import { setShowSellerLogin } from "../../redux/sellerSlice";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { checkSellerAuth } from "../../utils/commonUtils";

const SellerLogin = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const data = await checkSellerAuth();
      if (data?.success) {
        dispatch(setShowSellerLogin(false));
      }
    };
    checkAuth();
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axiosInstance.post("/api/sellers/login", formData);
      dispatch(setShowSellerLogin(false));
      toast.success("Welcome, Admin!");
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Login failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl p-8 shadow-md">
        <div className="text-center mb-6">
          <div className="text-2xl font-extrabold mb-2">
            <span className="text-amber-500">Case</span>Hub
          </div>
          <h1 className="text-xl font-bold text-gray-800">Seller Login</h1>
          <p className="text-sm text-gray-500 mt-1">Access your admin dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            placeholder="Admin Email"
            className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm text-gray-800 placeholder-gray-400 w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="bg-amber-500 text-black py-2 rounded-md hover:bg-amber-400 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SellerLogin;
