import { Link } from "react-router-dom";

const Logo = ({ settings, onClick, showMobileText = false }) => {
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
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-pink-100 bg-white shadow-sm">
            <img
              src={image}
              alt={alt}
              className="h-11 w-11 object-contain rounded-full"
            />
          </div>

          <div
            className={
              showMobileText ? "block min-w-0" : "hidden min-w-0 sm:block"
            }
          >
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
          {/* <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-50 text-lg sm:h-12 sm:w-12">
            🌸
          </div> */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 via-rose-50 to-fuchsia-100 text-xl shadow-sm ring-1 ring-pink-100">
            🌸
          </div>

          <div
            className={
              showMobileText ? "block min-w-0" : "hidden min-w-0 sm:block"
            }
          >
            <div className="flex items-center gap-1.5">
              <span className="bg-gradient-to-r from-pink-600 via-rose-500 to-fuchsia-500 bg-clip-text text-lg font-extrabold leading-tight tracking-tight text-transparent">
                {siteName}
              </span>
            </div>

            {tagline && (
              <div className="mt-1 flex items-center gap-2">
                <span className="h-px w-5 bg-pink-300" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-pink-500">
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
