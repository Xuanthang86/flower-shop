import { NavLink } from "react-router-dom";

const NavItem = ({ to, children, cartCount }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative font-medium px-4 py-2 text-sm transition-colors duration-200 hover:text-pink-600 ${
          isActive
            ? "text-pink-600 font-semibold border-b-2 border-pink-600"
            : "text-gray-700"
        }`
      }
      aria-label={to === "/cart" ? "Giỏ hàng" : undefined}
    >
      {children}

      {/* BADGE SỐ LƯỢNG */}
      {to === "/cart" && cartCount > 0 && (
        <span
          className="
            absolute
            -top-1
            right-0
            min-w-[19px]
            h-[19px]
            px-1
            rounded-full
            bg-pink-600
            text-white
            text-[10px]
            font-bold
            flex
            items-center
            justify-center
            shadow-sm
          "
        >
          {cartCount}
        </span>
      )}
    </NavLink>
  );
};

export default NavItem;
