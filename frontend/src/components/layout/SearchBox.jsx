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

    if (!value) return;

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

    if (location.pathname !== "/products") return;

    const params = new URLSearchParams(searchParams);
    params.delete("search");

    const query = params.toString();

    navigate(query ? `/products?${query}` : "/products");
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className={`w-full max-w-[340px] ${className}`}
    >
      <div className="flex h-10 w-full items-center overflow-hidden rounded-full border-2 border-pink-500 bg-white shadow-sm">
        <span className="ml-3 shrink-0 text-gray-400">
          <FiSearch size={16} />
        </span>

        <input
          type="text"
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
          className="min-w-0 flex-1 bg-transparent px-2.5 py-2 text-sm text-gray-700 outline-none placeholder:text-gray-400"
        />

        {keyword.trim() && (
          <button
            type="button"
            onClick={handleClear}
            className="mr-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Xóa từ khóa"
            title="Xóa từ khóa"
          >
            <FiX size={15} />
          </button>
        )}

        <button
          type="submit"
          disabled={!keyword.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center bg-pink-600 text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Tìm kiếm"
          title="Tìm kiếm"
        >
          <FiSearch size={16} />
        </button>
      </div>
    </form>
  );
};

export default SearchBox;
