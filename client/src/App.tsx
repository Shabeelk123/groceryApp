import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import SellerLogin from './components/seller/SellerLogin';
import SellerLayout from './pages/seller/SellerLayout';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import AddProduct from './components/seller/AddProduct';
import ProductList from './components/seller/ProductList';
import Orders from './components/seller/Orders';


const App = () => {
    const { showSellerLogin } = useSelector((state: RootState) => state.seller);
  return (
    <div className="min-h-screen bg-white text-gray-700">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/seller" element={showSellerLogin ? <SellerLogin /> : <SellerLayout />}>
            <Route index element={<AddProduct />} />
            <Route path="productlist" element={<ProductList />} />
            <Route path="orders" element={<Orders />} />
        </Route>
      </Routes>
      <Toaster position="top-right" />
    </div>
  )
}

export default App