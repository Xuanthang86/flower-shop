import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiSearch, FiX } from "react-icons/fi";

const SearchBox = ({ className = "", autoFocus = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const urlSearch = new URLSearchParams(location.search).get("search") || "";
  const [value, setValue] = useState(urlSearch);

  useEffect(() => {
    setValue(urlSearch);
  }, [urlSearch]);

  const submit = (event) => {
    event?.preventDefault();
    const keyword = value.trim();
    navigate(keyword ? `/products?search=${encodeURIComponent(keyword)}` : "/products");
  };

  const clear = () => {
    setValue("");
    navigate("/products");
  };

  return (
    <form onSubmit={submit} className={`w-full ${className}`} role="search">
      <div className="flex items-center border border-gray-200 rounded-full bg-gray-50 focus-within:border-pink-400 focus-within:ring-2 focus-within:ring-pink-100 transition">
        <FiSearch className="ml-4 shrink-0 text-gray-400" size={18} />
        <input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Tìm hoa theo tên..."
          autoFocus={autoFocus}
          className="w-full min-w-0 bg-transparent px-3 py-2.5 outline-none text-sm"
          aria-label="Tìm kiếm sản phẩm"
        />
        {value && (
          <button type="button" onClick={clear} className="mr-1 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-pink-600 hover:bg-white" aria-label="Xóa tìm kiếm">
            <FiX size={16} />
          </button>
        )}
        <button type="submit" className="mr-1.5 w-9 h-9 rounded-full bg-pink-600 text-white flex items-center justify-center hover:bg-pink-700 transition" aria-label="Tìm kiếm">
          <FiSearch size={16} />
        </button>
      </div>
    </form>
  );
};

export default SearchBox;
