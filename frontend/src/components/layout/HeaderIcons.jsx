import { FiShoppingCart } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import UserMenu from "./UserMenu";

const HeaderIcons = () => {
  const { cartCount = 0 } = useCart();
  const { user } = useAuth();
  const showCart = user?.role !== "admin";

  return (
    <div className="flex items-center gap-3">
      {showCart && (
        <Link
          to="/cart"
          className="relative w-10 h-10 flex items-center justify-center text-gray-700 hover:text-pink-600 transition"
          title="Giỏ hàng"
          aria-label="Giỏ hàng"
        >
          <FiShoppingCart size={22} />
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 min-w-4 h-4 px-1 rounded-full bg-pink-600 text-white text-[10px] font-bold flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Link>
      )}
      <UserMenu />
    </div>
  );
};

export default HeaderIcons;
