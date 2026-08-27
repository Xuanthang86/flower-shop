import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-pink-600 flex items-center justify-center text-white text-2xl">
        🌸
      </div>

      <div>
        <h1 className="font-bold text-2xl">Flower Shop</h1>

        <p className="text-xs text-gray-500">Fresh Flower Everyday</p>
      </div>
    </Link>
  );
};

export default Logo;
