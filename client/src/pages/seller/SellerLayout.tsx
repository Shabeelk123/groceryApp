import { NavLink, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setShowSellerLogin } from "../../redux/sellerSlice";
import axiosInstance from "../../lib/axiosConfig";
import toast from "react-hot-toast";

const SellerLayout = () => {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try { await axiosInstance.post("/api/sellers/logout"); } catch {}
    dispatch(setShowSellerLogin(true));
    toast.success("Logged out");
  };

  const links = [
    { name: "Add Product",   path: "/seller",             icon: "+" },
    { name: "Product List",  path: "/seller/productlist", icon: "☰" },
    { name: "Orders",        path: "/seller/orders",      icon: "📦" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between">
        <span className="font-extrabold text-lg">
          <span className="text-amber-500">Case</span>Hub
          <span className="text-xs text-gray-400 font-normal ml-2">Admin</span>
        </span>
        <button
          onClick={handleLogout}
          className="text-sm border border-gray-200 rounded-full px-4 py-1 text-gray-600 hover:border-amber-400 hover:text-amber-600 transition"
        >
          Logout
        </button>
      </header>

      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <aside className="w-16 md:w-52 bg-white border-r border-gray-100 flex flex-col pt-4">
          {links.map((item) => (
            <NavLink
              key={item.name} to={item.path}
              end={item.path === "/seller"}
              className={({ isActive }) =>
                `flex items-center gap-3 py-3 px-4 text-sm transition-colors ${
                  isActive
                    ? "border-r-4 border-amber-500 bg-amber-50 text-amber-700 font-semibold"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`
              }
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="hidden md:block">{item.name}</span>
            </NavLink>
          ))}
        </aside>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 text-gray-800">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
