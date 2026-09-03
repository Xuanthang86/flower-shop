// /*
// ============================================================
// FLOWER SHOP — GLOBAL SEARCH BOX
// ============================================================

// Mục đích:
// - Chỉ có MỘT thanh tìm kiếm dùng toàn website.
// - Header desktop sử dụng component này.
// - Header mobile sử dụng component này.
// - ProductsPage KHÔNG tạo thêm search riêng.
// - Từ khóa được lưu trên URL:
//       /products?search=hoa
// - Có category:
//       /products?category=hoa-sinh-nhat&search=hoa
// - Không có từ khóa:
//       Không tự động chuyển trang.
// - Nút X chỉ xuất hiện một lần.
// - Enter hoặc kính lúp mới thực hiện tìm kiếm.

// ============================================================
// */

// import { useEffect, useState } from "react";

// import { FiSearch, FiX } from "react-icons/fi";

// import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

// const SearchBox = ({ className = "" }) => {
//   const navigate = useNavigate();

//   const location = useLocation();

//   const [searchParams] = useSearchParams();

//   const urlKeyword = searchParams.get("search") || "";

//   const [keyword, setKeyword] = useState(urlKeyword);

//   /*
//   ==========================================================
//   ĐỒNG BỘ URL → INPUT
//   ==========================================================
//   */

//   useEffect(() => {
//     setKeyword(urlKeyword);
//   }, [urlKeyword, location.pathname]);

//   /*
//   ==========================================================
//   SEARCH
//   ==========================================================
//   */

//   const handleSubmit = (event) => {
//     event.preventDefault();

//     const value = keyword.trim();

//     /*
//     Không có từ khóa:
//     không chuyển trang.
//     */

//     if (!value) {
//       return;
//     }

//     const params = new URLSearchParams();

//     params.set("search", value);

//     /*
//     Giữ category nếu đang
//     tìm kiếm trong một danh mục.
//     */

//     const category = searchParams.get("category");

//     if (category) {
//       params.set("category", category);
//     }

//     navigate(`/products?${params.toString()}`);
//   };

//   /*
//   ==========================================================
//   CLEAR
//   ==========================================================
//   */

//   const handleClear = () => {
//     setKeyword("");

//     /*
//     Nếu đang ở Products:
//     xóa search nhưng giữ category.
//     */

//     if (location.pathname === "/products") {
//       const params = new URLSearchParams(searchParams);

//       params.delete("search");

//       const query = params.toString();

//       navigate(query ? `/products?${query}` : "/products");

//       return;
//     }

//     /*
//     Nếu đang ở trang khác:
//     chỉ xóa input.
//     Không tự động chuyển trang.
//     */
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       role="search"
//       className={`w-full ${className}`}
//     >
//       <div className="flex w-full items-center overflow-hidden rounded-full border-2 border-pink-500 bg-white shadow-sm">
//         {/* ICON SEARCH */}
//         <span className="ml-4 shrink-0 text-gray-400" aria-hidden="true">
//           <FiSearch size={18} />
//         </span>

//         {/* INPUT */}
//         <input
//           type="text"
//           value={keyword}
//           onChange={(event) => setKeyword(event.target.value)}
//           onKeyDown={(event) => {
//             if (event.key === "Escape") {
//               handleClear();
//             }
//           }}
//           placeholder="Tìm kiếm sản phẩm..."
//           aria-label="Tìm kiếm sản phẩm"
//           autoComplete="off"
//           className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400"
//         />

//         {/* CLEAR — CHỈ MỘT NÚT */}
//         {keyword.length > 0 && (
//           <button
//             type="button"
//             onClick={handleClear}
//             className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
//             aria-label="Xóa từ khóa"
//             title="Xóa từ khóa"
//           >
//             <FiX size={17} />
//           </button>
//         )}

//         {/* SEARCH BUTTON */}
//         <button
//           type="submit"
//           disabled={!keyword.trim()}
//           className="flex h-11 w-12 shrink-0 items-center justify-center bg-pink-600 text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50"
//           aria-label="Tìm kiếm"
//           title="Tìm kiếm"
//         >
//           <FiSearch size={18} />
//         </button>
//       </div>
//     </form>
//   );
// };

// export default SearchBox;

/*
============================================================
FLOWER SHOP — GLOBAL SEARCH
============================================================

QUY TẮC:

1. Chỉ có một SearchBox dùng toàn website.
2. Header desktop dùng component này.
3. Header mobile dùng component này.
4. ProductsPage không tạo search thứ hai.
5. Có từ khóa:
      /products?search=hoa
6. Có category:
      /products?category=hoa-sinh-nhat&search=hoa
7. Không có từ khóa:
      Không điều hướng.
8. Chỉ Enter hoặc nút kính lúp mới submit.
9. Chỉ có một nút X.
============================================================
*/

import { useEffect, useState } from "react";

import { FiSearch, FiX } from "react-icons/fi";

import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const SearchBox = ({ className = "" }) => {
  const navigate = useNavigate();

  const location = useLocation();

  const [searchParams] = useSearchParams();

  const urlKeyword = searchParams.get("search") || "";

  const [keyword, setKeyword] = useState(urlKeyword);

  useEffect(() => {
    setKeyword(urlKeyword);
  }, [urlKeyword, location.pathname]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const value = keyword.trim();

    if (!value) {
      return;
    }

    const params = new URLSearchParams();

    params.set("search", value);

    const category = searchParams.get("category");

    if (category) {
      params.set("category", category);
    }

    navigate(
      {
        pathname: "/products",
        search: `?${params.toString()}`,
      },
      {
        replace: false,
      }
    );
  };

  const handleClear = () => {
    setKeyword("");

    if (location.pathname !== "/products") {
      return;
    }

    const params = new URLSearchParams(searchParams);

    params.delete("search");

    const query = params.toString();

    navigate(query ? `/products?${query}` : "/products", {
      replace: false,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`w-full ${className}`}
    >
      <div className="flex w-full items-center overflow-hidden rounded-full border-2 border-pink-500 bg-white shadow-sm">
        <span className="ml-4 shrink-0 text-gray-400" aria-hidden="true">
          <FiSearch size={18} />
        </span>

        <input
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              handleClear();
            }
          }}
          placeholder="Tìm kiếm sản phẩm..."
          aria-label="Tìm kiếm sản phẩm"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-700 outline-none placeholder:text-gray-400"
        />

        {keyword.trim() && (
          <button
            type="button"
            onClick={handleClear}
            className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Xóa từ khóa"
            title="Xóa từ khóa"
          >
            <FiX size={17} />
          </button>
        )}

        <button
          type="submit"
          disabled={!keyword.trim()}
          className="flex h-11 w-12 shrink-0 items-center justify-center bg-pink-600 text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Tìm kiếm"
          title="Tìm kiếm"
        >
          <FiSearch size={18} />
        </button>
      </div>
    </form>
  );
};

export default SearchBox;
