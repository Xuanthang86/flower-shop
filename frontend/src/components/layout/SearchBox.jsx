import { FiSearch } from "react-icons/fi";

const SearchBox = () => {
  return (
    <div className="flex-1 max-w-xl mx-4">
      <div className="flex items-center border-2 border-pink-500 rounded-full overflow-hidden bg-white">
        <input
          type="text"
          placeholder="Tìm hoa theo tên..."
          className="w-full px-4 py-2 outline-none text-sm text-gray-700"
        />
        <button
          type="button"
          className="bg-pink-600 hover:bg-pink-700 text-white px-5 py-2.5 transition flex items-center justify-center shrink-0"
        >
          <FiSearch size={18} />
        </button>
      </div>
    </div>
  );
};

export default SearchBox;
