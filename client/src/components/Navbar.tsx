import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setUser } from "../redux/userSlice";
import axiosInstance from "../lib/axiosConfig";
import toast from "react-hot-toast";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.user);
  const cartCount = user?.cartItems?.length ?? 0;
  const [open, setOpen] = React.useState(false);

  const logout = async () => {
    try { await axiosInstance.post('/api/users/logout'); } catch { /* ignore */ }
    dispatch(setUser(null));
    navigate('/');
    toast.success('Logged out');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm transition-colors duration-200 ${isActive ? 'text-amber-400 font-semibold' : 'text-gray-300 hover:text-white'}`;

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/95 backdrop-blur border-b border-[#1e1e1e]">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <NavLink to="/" className="text-xl font-extrabold text-amber-400 tracking-tight">
          Case<span className="text-white">Hub</span>
        </NavLink>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7">
          <NavLink to="/"        className={linkClass} end>Home</NavLink>
          <NavLink to="/products" className={linkClass}>Products</NavLink>
          {user && <NavLink to="/orders" className={linkClass}>My Orders</NavLink>}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {/* Cart */}
          <NavLink to="/cart" className="relative text-gray-300 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-amber-500 text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </NavLink>

          {/* Auth */}
          {!user ? (
            <div className="hidden md:flex gap-3">
              <NavLink to="/login" className="text-sm text-gray-300 hover:text-white transition">Login</NavLink>
              <NavLink
                to="/register"
                className="text-sm bg-amber-500 text-black px-4 py-1.5 rounded-full font-semibold hover:bg-amber-400 transition"
              >
                Sign Up
              </NavLink>
            </div>
          ) : (
            <button
              onClick={logout}
              className="hidden md:block text-sm border border-[#2a2a2a] text-gray-300 px-4 py-1.5 rounded-full hover:border-amber-500/50 hover:text-white transition"
            >
              Logout
            </button>
          )}

          {/* Mobile burger */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-gray-300 hover:text-white"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#111] border-t border-[#1e1e1e] px-6 py-4 flex flex-col gap-4 text-sm">
          <NavLink to="/"         className={linkClass} end onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/products" className={linkClass}    onClick={() => setOpen(false)}>Products</NavLink>
          {user && <NavLink to="/orders" className={linkClass} onClick={() => setOpen(false)}>My Orders</NavLink>}
          {!user ? (
            <>
              <NavLink to="/login"    className={linkClass} onClick={() => setOpen(false)}>Login</NavLink>
              <NavLink to="/register" className={linkClass} onClick={() => setOpen(false)}>Sign Up</NavLink>
            </>
          ) : (
            <button onClick={() => { logout(); setOpen(false); }} className="text-left text-red-400 hover:text-red-300">
              Logout
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
