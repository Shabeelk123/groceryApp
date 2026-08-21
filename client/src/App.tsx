import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UserOrders from './pages/UserOrders';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import NotFound from './pages/NotFound';
import CollectionPage from './pages/CollectionPage';
import SellerLogin from './components/seller/SellerLogin';
import SellerLayout from './pages/seller/SellerLayout';
import Dashboard from './components/seller/Dashboard';
import AddProduct from './components/seller/AddProduct';
import ProductList from './components/seller/ProductList';
import Orders from './components/seller/Orders';
import { useAppDispatch } from './hooks';
import { setUser, setWishlist } from './redux/userSlice';
import axiosInstance from './lib/axiosConfig';
import type { RootState } from './store';

const App = () => {
  const dispatch = useAppDispatch();
  const { showSellerLogin } = useSelector((state: RootState) => state.seller);

  // Restore user session on every page load / refresh
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axiosInstance.get('/api/users/is-auth');
        if (response.data?.user) {
          dispatch(setUser(response.data.user));
          try {
            const wishlistRes = await axiosInstance.get('/api/wishlist');
            dispatch(setWishlist((wishlistRes.data.items || []).map((i: { productId: number }) => i.productId)));
          } catch {
            // Non-critical — wishlist state just won't be pre-populated this session
          }
        }
      } catch {
        // No valid session — user stays logged out, 401 interceptor handles cleanup
      }
    };
    checkAuth();
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/collections/:category" element={<CollectionPage />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected routes — require login */}
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><UserOrders /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

        {/* Seller routes */}
        <Route path="/seller" element={showSellerLogin ? <SellerLogin /> : <SellerLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="add" element={<AddProduct />} />
          <Route path="edit/:id" element={<AddProduct />} />
          <Route path="productlist" element={<ProductList />} />
          <Route path="orders" element={<Orders />} />
        </Route>

        {/* 404 catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" />
    </div>
  );
};

export default App;