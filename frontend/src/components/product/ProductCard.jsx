// import { Link } from "react-router-dom";
// import { FiHeart, FiShoppingCart } from "react-icons/fi";
// import { useCart } from "@/context/useCart";

// const ProductCard = ({ product }) => {
//   const { addToCart } = useCart();

//   const handleAddToCart = () => {
//     addToCart(product);
//   };

//   return (
//     <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300">
//       {/* =================================
//           KHU VỰC HÌNH ẢNH
//       ================================== */}
//       <div className="relative">
//         {/* BADGE */}
//         {product.badge && (
//           <span
//             className="
//               absolute
//               top-4
//               left-4
//               z-20
//               bg-pink-600
//               text-white
//               text-xs
//               font-semibold
//               px-3
//               py-1.5
//               rounded-full
//               shadow-md
//             "
//           >
//             {product.badge}
//           </span>
//         )}

//         {/* NÚT YÊU THÍCH */}
//         <button
//           type="button"
//           className="
//             absolute
//             top-4
//             right-4
//             z-20
//             w-10
//             h-10
//             rounded-full
//             bg-white
//             shadow-md
//             flex
//             items-center
//             justify-center
//             text-gray-600
//             hover:text-pink-600
//             hover:bg-pink-50
//             transition
//             duration-300
//           "
//           aria-label={`Thêm ${product.name} vào yêu thích`}
//         >
//           <FiHeart size={19} />
//         </button>

//         {/* ẢNH */}
//         <Link to={`/products/${product.id}`}>
//           <img
//             src={product.image}
//             alt={product.name}
//             className="
//               w-full
//               h-72
//               object-cover
//               transition-transform
//               duration-500
//               group-hover:scale-105
//             "
//           />
//         </Link>
//       </div>

//       {/* =================================
//           THÔNG TIN SẢN PHẨM
//       ================================== */}
//       <div className="p-5">
//         {/* TÊN */}
//         <Link
//           to={`/products/${product.id}`}
//           className="
//             block
//             font-semibold
//             text-gray-800
//             text-lg
//             hover:text-pink-600
//             transition
//             duration-300
//           "
//         >
//           {product.name}
//         </Link>

//         {/* GIÁ */}
//         <div className="mt-3 flex items-center gap-2 flex-wrap">
//           <span className="text-xl font-bold text-pink-600">
//             {product.price?.toLocaleString("vi-VN")} ₫
//           </span>

//           {/* GIÁ CŨ */}
//           {product.oldPrice && (
//             <span className="text-sm text-gray-400 line-through">
//               {product.oldPrice.toLocaleString("vi-VN")} ₫
//             </span>
//           )}
//         </div>

//         {/* =================================
//             THÊM VÀO GIỎ
//         ================================== */}
//         <button
//           type="button"
//           onClick={handleAddToCart}
//           className="
//             mt-5
//             w-full
//             bg-pink-600
//             text-white
//             py-3
//             rounded-xl
//             flex
//             items-center
//             justify-center
//             gap-2
//             font-medium
//             hover:bg-pink-700
//             active:scale-95
//             transition
//             duration-300
//             shadow-md
//           "
//         >
//           <FiShoppingCart size={18} />
//           Thêm vào giỏ
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ProductCard;

import { Link, useNavigate } from "react-router-dom";
import { FiHeart, FiShoppingCart } from "react-icons/fi";
import { useCart } from "@/context/useCart";
import { useAuth } from "@/context/AuthContext";

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = () => {
    const result = addToCart(product);

    if (!result?.success) {
      window.alert(
        result?.message ||
          "Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng."
      );

      navigate("/login", {
        state: {
          from: `/products/${product.id}`,
        },
      });

      return;
    }

    window.alert(`Đã thêm "${product.name}" vào giỏ hàng.`);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition duration-300">
      <div className="relative">
        {product.badge && (
          <span className="absolute top-4 left-4 z-20 bg-pink-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
            {product.badge}
          </span>
        )}

        <button
          type="button"
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-pink-600 hover:bg-pink-50 transition"
          aria-label={`Thêm ${product.name} vào yêu thích`}
        >
          <FiHeart size={19} />
        </button>

        <Link to={`/products/${product.id}`}>
          <img
            src={product.image}
            srcSet={product.image}
            alt={product.name}
            className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      </div>

      <div className="p-5">
        <Link
          to={`/products/${product.id}`}
          className="block font-semibold text-gray-800 text-lg hover:text-pink-600 transition"
        >
          {product.name}
        </Link>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xl font-bold text-pink-600">
            {product.price?.toLocaleString("vi-VN")} ₫
          </span>

          {product.oldPrice && (
            <span className="text-sm text-gray-400 line-through">
              {product.oldPrice.toLocaleString("vi-VN")} ₫
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-5 w-full flex items-center justify-center gap-2 bg-pink-600 text-white py-3 rounded-xl font-semibold hover:bg-pink-700 transition"
        >
          <FiShoppingCart size={18} />
          {user ? "Thêm vào giỏ hàng" : "Đăng nhập để mua hàng"}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
