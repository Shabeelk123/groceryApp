import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../lib/axiosConfig';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    setIsLoading(true);
    try {
      await axiosInstance.post('/api/users/reset-password', { token, newPassword });
      toast.success('Password reset! Please sign in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
        <div className="relative w-full max-w-sm">
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-8 text-center">
            <p className="text-gray-300 text-sm mb-6">This reset link is missing a token. Please request a new one.</p>
            <Link to="/forgot-password" className="text-amber-400 hover:text-amber-300 font-semibold text-sm transition">
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4">
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-8">
          <div className="text-center mb-8">
            <Link to="/" className="text-2xl font-extrabold">
              <span className="text-amber-400">Case</span>Hub
            </Link>
            <h1 className="text-xl font-bold mt-4 mb-1">Set a new password</h1>
            <p className="text-gray-500 text-sm">Choose a strong password for your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1.5">New Password</label>
              <input
                type="password" required minLength={6}
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] text-white px-4 py-2.5 rounded-lg text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/60"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1.5">Confirm Password</label>
              <input
                type="password" required minLength={6}
                value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#0f0f0f] border border-[#2a2a2a] text-white px-4 py-2.5 rounded-lg text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/60"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit" disabled={isLoading}
              className="w-full bg-amber-500 text-black py-3 rounded-xl font-bold hover:bg-amber-400 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
