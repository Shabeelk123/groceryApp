import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const SellerLogin = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-col gap-5 mx-auto mt-20 items-center w-[400px]">
      <h1 className="text-2xl font-bold">Seller Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
        <input
          type="text"
          name="username"
          placeholder="Username"
          className="border border-gray-300 rounded-md p-2 w-full"
          value={formData.username}
          onChange={handleChange}
        />
        <div className="relative w-full">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            className="border border-gray-300 rounded-md p-2 w-full"
            value={formData.password}
            onChange={handleChange}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white p-2 rounded-md"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default SellerLogin;
