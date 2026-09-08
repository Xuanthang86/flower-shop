import { Link } from "react-router-dom";

const Logo = ({ settings, onClick }) => {
  const image = settings?.branding?.logoImage || settings?.branding?.logo || "";

  const alt = settings?.branding?.logoAlt || "Flower Shop";

  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label="Flower Shop"
      className="flex min-w-0 shrink-0 items-center"
    >
      {image ? (
        <img
          src={image}
          alt={alt}
          className="block h-10 w-auto max-w-[190px] object-contain sm:h-11 sm:max-w-[220px]"
        />
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-50 text-lg">
            🌸
          </div>

          <div className="hidden sm:block">
            <div className="text-lg font-bold leading-tight text-gray-900">
              Flower Shop
            </div>

            <div className="mt-0.5 text-[10px] text-gray-500">
              Fresh Flower Everyday
            </div>
          </div>
        </div>
      )}
    </Link>
  );
};

export default Logo;
