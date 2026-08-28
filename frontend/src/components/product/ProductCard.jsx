import { Link } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiShield } from "react-icons/fi";
import { useCart } from "@/context/useCart";
import { useAuth } from "@/context/AuthContext";

const STAFF_ROLES = new Set(["admin", "manager", "product_manager"]);

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const isStaff = STAFF_ROLES.has(user?.role);

  const handleAddToCart = () => {
    if (isStaff) {
      window.alert("Tài khoản quản trị không có quyền mua hàng. Vui lòng sử dụng tài khoản khách hàng.");
      return;
    }
    const result = addToCart(product);
    if (!result?.success) window.alert(result?.message || "Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng.");
    else window.alert(`Đã thêm "${product.name}" vào giỏ hàng.`);
  };

  return <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300"><div className="relative">{product.badge && <span className="absolute top-4 left-4 z-20 bg-pink-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full">{product.badge}</span>}{!isStaff && <button type="button" className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-pink-600" aria-label={`Thêm ${product.name} vào yêu thích`}><FiHeart size={19} /></button>}<Link to={`/products/${product.id}`}><img src={product.image} alt={product.name} className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-105" /></Link></div><div className="p-5"><Link to={`/products/${product.id}`} className="block font-semibold text-gray-800 text-lg hover:text-pink-600">{product.name}</Link><div className="mt-3 flex items-center gap-2 flex-wrap"><span className="text-xl font-bold text-pink-600">{Number(product.price || 0).toLocaleString("vi-VN")} ₫</span>{product.oldPrice && <span className="text-sm text-gray-400 line-through">{Number(product.oldPrice).toLocaleString("vi-VN")} ₫</span>}</div>{isStaff ? <Link to={`/products/${product.id}`} className="mt-5 w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:text-pink-600"><FiShield />Chỉ xem chi tiết</Link> : <button type="button" onClick={handleAddToCart} className="mt-5 w-full flex items-center justify-center gap-2 bg-pink-600 text-white py-3 rounded-xl font-semibold hover:bg-pink-700"><FiShoppingCart />{user ? "Thêm vào giỏ hàng" : "Đăng nhập để mua hàng"}</button>}</div></div>;
};

export default ProductCard;
