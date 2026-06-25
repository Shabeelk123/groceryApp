import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../hooks';
import { setUser } from '../redux/userSlice';
import toast from 'react-hot-toast';
import axiosInstance from '../lib/axiosConfig';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (formData.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setIsLoading(true);
    try {
      const res = await axiosInstance.post('/api/users/register', {
        name: formData.name, email: formData.email, password: formData.password,
      });
      dispatch(setUser(res.data.user));
      toast.success('Account created!');
      navigate('/');
    } catch (error: any) {
      toast.error(error?.response?.data?.error || 'Registration failed');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-4 py-10">
      <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm">
        <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-8">

          <div className="text-center mb-8">
            <Link to="/" className="text-2xl font-extrabold">
              <span className="text-amber-400">Case</span>Hub
            </Link>
            <h1 className="text-xl font-bold mt-4 mb-1">Create your account</h1>
            <p className="text-gray-500 text-sm">Join CaseHub and shop premium accessories</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: 'Full Name',        name: 'name',            type: 'text',     placeholder: 'John Doe' },
              { label: 'Email',            name: 'email',           type: 'email',    placeholder: 'you@example.com' },
              { label: 'Password',         name: 'password',        type: 'password', placeholder: 'Min 6 characters' },
              { label: 'Confirm Password', name: 'confirmPassword', type: 'password', placeholder: 'Repeat password' },
            ].map((field) => (
              <div key={field.name}>
                <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1.5">{field.label}</label>
                <input
                  id={field.name} name={field.name} type={field.type} required
                  value={(formData as any)[field.name]} onChange={handleChange}
                  placeholder={field.placeholder}
                  className="w-full bg-[#0f0f0f] border border-[#2a2a2a] text-white px-4 py-2.5 rounded-lg text-sm placeholder-gray-600 focus:outline-none focus:border-amber-500/60"
                />
              </div>
            ))}
            <button
              type="submit" disabled={isLoading}
              className="w-full bg-amber-500 text-black py-3 rounded-xl font-bold hover:bg-amber-400 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-400 hover:text-amber-300 font-semibold transition">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
