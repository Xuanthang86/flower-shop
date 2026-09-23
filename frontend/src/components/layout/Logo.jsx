import { Link } from "react-router-dom";

const Logo = ({ settings, onClick }) => {
  const branding = settings?.branding || {};

  const image = branding.logoImage || branding.logo || "";
  const siteName = branding.siteName || "HTH Flower Shop";
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
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-pink-100 bg-white shadow-sm sm:h-14 sm:w-14">
            <img
              src={image}
              alt={alt}
              className="h-10 w-10 rounded-full object-contain sm:h-11 sm:w-11"
            />
          </div>

          <div className="block min-w-0">
            <div className="truncate text-sm font-bold leading-tight text-gray-900 sm:text-lg">
              {siteName}
            </div>

            {tagline && (
              <div className="mt-0.5 truncate text-[8px] text-gray-500 sm:text-[10px]">
                {tagline}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 via-rose-50 to-fuchsia-100 text-lg shadow-sm ring-1 ring-pink-100 sm:h-12 sm:w-12 sm:text-xl">
            🌸
          </div>

          <div className="block min-w-0">
            <div className="flex items-center gap-1">
              <span className="truncate bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-500 bg-clip-text text-sm font-extrabold leading-tight tracking-tight text-transparent sm:text-lg">
                {siteName}
              </span>
            </div>

            {tagline && (
              <div className="mt-0.5 flex items-center gap-1.5 sm:mt-1 sm:gap-2">
                <span className="h-px w-4 bg-pink-300 sm:w-5" />

                <span className="truncate text-[7px] font-semibold uppercase tracking-[0.12em] text-pink-500 sm:text-[10px] sm:tracking-[0.16em]">
                  {tagline}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </Link>
  );
};

export default Logo;
