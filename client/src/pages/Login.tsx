import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks';
import { setUser } from '../redux/userSlice';
import toast from 'react-hot-toast';
import axiosInstance from '../lib/axiosConfig';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/api/users/login', formData);
      dispatch(setUser(res.data.user));
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Login failed');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      {/* Glow blobs */}
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-8">

          <div className="text-center mb-8">
            <Link to="/" className="text-2xl font-extrabold">
              <span className="text-amber-400">Case</span>Hub
            </Link>
            <h1 className="text-xl font-bold mt-4 mb-1">Welcome back</h1>
            <p className="text-gray-500 text-sm">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1.5">Email</label>
              <input
                id="email" name="email" type="email" required
                value={formData.email} onChange={handleChange}
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] text-white px-4 py-2.5 rounded-lg text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/60"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1.5">Password</label>
              <input
                id="password" name="password" type="password" required
                value={formData.password} onChange={handleChange}
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] text-white px-4 py-2.5 rounded-lg text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/60"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit" disabled={isLoading}
              className="w-full bg-amber-500 text-black py-3 rounded-xl font-bold hover:bg-amber-400 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-amber-400 hover:text-amber-300 font-semibold transition">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
