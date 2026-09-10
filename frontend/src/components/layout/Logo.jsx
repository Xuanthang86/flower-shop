import { Link } from "react-router-dom";

const Logo = ({ settings, onClick }) => {
  const branding = settings?.branding || {};

  const image = branding.logoImage || branding.logo || "";
  const siteName = branding.siteName || "Flower Shop";
  const tagline = branding.tagline || "Fresh Flower Everyday";
  const alt = branding.logoAlt || siteName;

  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label={siteName}
      className="flex min-w-0 shrink-0 items-center"
    >
      {image ? (
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-pink-100 bg-white shadow-sm">
            <img
              src={image}
              alt={alt}
              className="h-11 w-11 object-contain rounded-full"
            />
          </div>

          <div className="hidden min-w-0 sm:block">
            <div className="truncate text-lg font-bold leading-tight text-gray-900">
              {siteName}
            </div>

            {tagline && (
              <div className="mt-0.5 truncate text-[10px] text-gray-500">
                {tagline}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-lg sm:h-12 sm:w-12">
            🌸
          </div>

          <div className="hidden sm:block">
            <div className="text-lg font-bold leading-tight text-gray-900">
              {siteName}
            </div>

            {tagline && (
              <div className="mt-0.5 text-[10px] text-gray-500">{tagline}</div>
            )}
          </div>
        </div>
      )}
    </Link>
  );
};

export default Logo;
