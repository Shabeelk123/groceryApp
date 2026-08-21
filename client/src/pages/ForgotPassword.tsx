import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosInstance from '../lib/axiosConfig';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axiosInstance.post('/api/users/forgot-password', { email });
      setSubmitted(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="text-xl font-bold mt-4 mb-1">Reset your password</h1>
            <p className="text-gray-500 text-sm">We'll send you a link to reset it</p>
          </div>

          {submitted ? (
            <div className="text-center py-4">
              <p className="text-gray-300 text-sm mb-6">
                If an account exists for <span className="text-white font-semibold">{email}</span>, a reset link has been sent.
              </p>
              <Link to="/login" className="text-amber-400 hover:text-amber-300 font-semibold text-sm transition">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1.5">Email</label>
                <input
                  type="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0f0f0f] border border-[#2a2a2a] text-white px-4 py-2.5 rounded-lg text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/60"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit" disabled={isLoading}
                className="w-full bg-amber-500 text-black py-3 rounded-xl font-bold hover:bg-amber-400 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          )}

          {!submitted && (
            <p className="text-center text-sm text-gray-500 mt-6">
              Remembered your password?{' '}
              <Link to="/login" className="text-amber-400 hover:text-amber-300 font-semibold transition">
                Sign in
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
