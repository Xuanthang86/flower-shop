/*
============================================================
FLOWER SHOP — GLOBAL SEARCH BOX
============================================================

QUY TẮC:
- Đây là thanh tìm kiếm duy nhất của website.
- Header sử dụng component này.
- ProductsPage không tạo search riêng.
- Không có từ khóa → không chuyển trang.
- Có từ khóa → /products?search=...
- Xóa từ khóa không làm mất category.
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

    /*
    ----------------------------------------------------------
    KHÔNG CÓ TỪ KHÓA
    ----------------------------------------------------------

    Không được tự động chuyển sang Products.
    ----------------------------------------------------------
    */

    if (!value) {
      return;
    }

    const params = new URLSearchParams();

    params.set("search", value);

    const category = searchParams.get("category");

    if (category) {
      params.set("category", category);
    }

    navigate(`/products?${params.toString()}`);
  };

  const handleClear = () => {
    setKeyword("");

    /*
    ----------------------------------------------------------
    Nếu đang ở Products:
    giữ category nhưng xóa search.
    ----------------------------------------------------------
    */

    if (location.pathname === "/products") {
      const params = new URLSearchParams(searchParams);

      params.delete("search");

      const query = params.toString();

      navigate(query ? `/products?${query}` : "/products");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`w-full ${className}`}
    >
      <div className="flex w-full items-center overflow-hidden rounded-full border-2 border-pink-500 bg-white">
        <FiSearch
          size={18}
          className="ml-4 shrink-0 text-gray-400"
          aria-hidden="true"
        />

        <input
          type="text"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm hoa theo tên..."
          aria-label="Tìm kiếm sản phẩm"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-700 outline-none"
        />

        {keyword && (
          <button
            type="button"
            onClick={handleClear}
            className="flex h-9 w-9 shrink-0 items-center justify-center text-gray-400 transition hover:text-gray-700"
            aria-label="Xóa từ khóa"
          >
            <FiX size={17} />
          </button>
        )}

        <button
          type="submit"
          className="flex shrink-0 items-center justify-center bg-pink-600 px-5 py-2.5 text-white transition hover:bg-pink-700"
          aria-label="Tìm kiếm"
        >
          <FiSearch size={18} />
        </button>
      </div>
    </form>
  );
};

export default SearchBox;
