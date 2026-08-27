import { useEffect, useRef, useState } from "react";
import { FiBox, FiHeart, FiKey, FiLogOut, FiPackage, FiSettings, FiUser, FiChevronDown } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const UserMenu = () => {
  const { user, logout, isAdmin, isManager, isProductManager, roleLabels } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  if (!user) {
    return <Link to="/login" className="flex items-center justify-center w-10 h-10 text-gray-700 hover:text-pink-600 transition" title="Đăng nhập" aria-label="Đăng nhập"><FiUser size={22} /></Link>;
  }

  const displayName = user.name || user.email || "Tài khoản";
  const roleLabel = roleLabels?.[user.role] || "Tài khoản";
  const close = () => setOpen(false);
  const handleLogout = () => { close(); logout(); navigate("/", { replace: true }); };

  return (
    <div ref={menuRef} className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} className="flex items-center gap-2 text-gray-700 hover:text-pink-600 transition" aria-haspopup="menu" aria-expanded={open} title="Tài khoản">
        <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-semibold overflow-hidden">
          {user.avatar ? <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" /> : displayName.charAt(0).toUpperCase()}
        </div>
        <div className="hidden lg:block text-left max-w-[150px]"><p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p><p className="text-xs text-gray-500 truncate">{roleLabel}</p></div>
        <FiChevronDown size={16} className={open ? "rotate-180 transition" : "transition"} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-3 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] overflow-hidden" role="menu">
          <div className="px-4 py-4 bg-pink-50 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-pink-600 text-white flex items-center justify-center text-lg font-bold overflow-hidden">{user.avatar ? <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" /> : displayName.charAt(0).toUpperCase()}</div>
            <div className="min-w-0"><p className="font-semibold text-gray-800 truncate">{displayName}</p><p className="text-sm text-gray-500 truncate">{user.email}</p><span className="inline-flex mt-1 px-2.5 py-1 rounded-full bg-pink-600 text-white text-xs font-medium">{roleLabel}</span></div>
          </div>
          <div className="py-2">
            <Link to="/profile" state={{ tab: "info" }} onClick={close} className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"><FiUser size={18} />Thông tin tài khoản</Link>
            <Link to="/profile" state={{ tab: "password" }} onClick={close} className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"><FiKey size={18} />Đổi mật khẩu</Link>
            {user.role === "customer" && <><Link to="/orders" onClick={close} className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"><FiPackage size={18} />Đơn hàng của tôi</Link><Link to="/wishlist" onClick={close} className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"><FiHeart size={18} />Sản phẩm yêu thích</Link></>}
            {(isAdmin || isManager) && <Link to="/admin/orders" onClick={close} className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"><FiPackage size={18} />Quản lý đơn hàng</Link>}
            {(isAdmin || isProductManager) && <Link to="/admin" onClick={close} className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"><FiBox size={18} />Quản lý sản phẩm</Link>}
            {isAdmin && <Link to="/admin/users" onClick={close} className="flex items-center gap-3 px-4 py-3 hover:bg-pink-50"><FiSettings size={18} />Quản lý tài khoản</Link>}
          </div>
          <div className="border-t border-gray-100"><button type="button" onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50"><FiLogOut size={18} />Đăng xuất</button></div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
