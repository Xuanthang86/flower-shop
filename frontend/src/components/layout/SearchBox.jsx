/*
============================================================
FLOWER SHOP — HEADER SEARCH
============================================================

Cập nhật:
- Search duy nhất trên Header.
- Enter để tìm kiếm.
- Click icon để tìm kiếm.
- Chuyển tới /products?search=...
- Nếu đang ở ProductsPage vẫn giữ từ khóa.
- Không còn cần một search riêng ở ProductsPage.
============================================================
*/

import { useEffect, useState } from "react";

import { FiSearch, FiX } from "react-icons/fi";

import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

const SearchBox = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const [searchParams] = useSearchParams();

  const [keyword, setKeyword] = useState(
    () => searchParams.get("search") || ""
  );

  useEffect(() => {
    setKeyword(searchParams.get("search") || "");
  }, [searchParams, location.pathname]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const value = keyword.trim();

    if (!value) {
      navigate("/products");

      return;
    }

    navigate(`/products?search=${encodeURIComponent(value)}`);
  };

  const handleClear = () => {
    setKeyword("");

    if (location.pathname === "/products") {
      navigate("/products");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-1 max-w-xl mx-4"
      role="search"
    >
      <div className="flex items-center border-2 border-pink-500 rounded-full overflow-hidden bg-white">
        <input
          type="search"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm hoa theo tên..."
          aria-label="Tìm kiếm sản phẩm"
          className="w-full px-4 py-2.5 outline-none text-sm text-gray-700"
        />

        {keyword && (
          <button
            type="button"
            onClick={handleClear}
            className="px-2 text-gray-400 hover:text-gray-700"
            aria-label="Xóa tìm kiếm"
          >
            <FiX size={16} />
          </button>
        )}

        <button
          type="submit"
          className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 transition flex items-center justify-center shrink-0"
          aria-label="Tìm kiếm"
        >
          <FiSearch size={18} />
        </button>
      </div>
    </form>
  );
};

export default SearchBox;
