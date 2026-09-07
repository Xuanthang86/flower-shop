import { useEffect, useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import Container from "@/components/common/Container";

import {
  readSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";

import defaultHeroImage from "@/assets/images/hero/hero-bouquet.jpg";

const DEFAULT_DURATION = 7000;

const normalizeDuration = (value) => {
  const duration = Number(value);

  if (!Number.isFinite(duration)) {
    return DEFAULT_DURATION;
  }

  if (duration < 3000) {
    return 3000;
  }

  if (duration > 15000) {
    return 15000;
  }

  return duration;
};

const getBannerImage = (banner) => {
  return banner?.image || banner?.desktopImage || banner?.imageUrl || "";
};

const getBannerMobileImage = (banner) => {
  return (
    banner?.mobileImage || banner?.mobileImageUrl || getBannerImage(banner)
  );
};

const Hero = () => {
  const [settings, setSettings] = useState(() => readSiteSettings());

  const [currentIndex, setCurrentIndex] = useState(0);

  const banners = useMemo(() => {
    const source = Array.isArray(settings?.hero?.banners)
      ? settings.hero.banners
      : [];

    return source
      .filter((banner) => getBannerImage(banner))
      .slice()
      .sort((a, b) => {
        const priorityA = Number(a?.priority ?? a?.sortOrder ?? 0);

        const priorityB = Number(b?.priority ?? b?.sortOrder ?? 0);

        return priorityB - priorityA;
      });
  }, [settings]);

  useEffect(() => {
    const refresh = () => {
      setSettings(readSiteSettings());
      setCurrentIndex(0);
    };

    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, refresh);

    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, refresh);

      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) {
      return undefined;
    }

    const activeBanner = banners[currentIndex];

    const duration = normalizeDuration(activeBanner?.duration);

    const timer = window.setTimeout(() => {
      setCurrentIndex((index) => (index >= banners.length - 1 ? 0 : index + 1));
    }, duration);

    return () => {
      window.clearTimeout(timer);
    };
  }, [banners, currentIndex]);

  useEffect(() => {
    if (banners.length > 0 && currentIndex >= banners.length) {
      setCurrentIndex(0);
    }
  }, [banners.length, currentIndex]);

  const fallbackBanner = {
    id: "default-hero",
    image: defaultHeroImage,
    alt: "Flower Shop",
    duration: DEFAULT_DURATION,
  };

  const displayBanners = banners.length > 0 ? banners : [fallbackBanner];

  const activeBanner = displayBanners[currentIndex] || displayBanners[0];

  const desktopImage = getBannerImage(activeBanner);
  const mobileImage = getBannerMobileImage(activeBanner);

  const goPrevious = () => {
    if (displayBanners.length <= 1) {
      return;
    }

    setCurrentIndex((index) =>
      index <= 0 ? displayBanners.length - 1 : index - 1
    );
  };

  const goNext = () => {
    if (displayBanners.length <= 1) {
      return;
    }

    setCurrentIndex((index) =>
      index >= displayBanners.length - 1 ? 0 : index + 1
    );
  };

  return (
    <section className="bg-pink-50 py-4 md:py-5">
      <Container>
        <div className="mx-auto w-full max-w-[1280px]">
          <div className="relative overflow-hidden rounded-xl bg-gray-100">
            <picture>
              {mobileImage && (
                <source media="(max-width: 767px)" srcSet={mobileImage} />
              )}

              <img
                key={activeBanner.id}
                src={desktopImage}
                alt={activeBanner.alt || "Flower Shop"}
                className="block h-[145px] w-full object-cover sm:h-[185px] md:h-[245px] lg:h-[300px]"
                onError={(event) => {
                  if (event.currentTarget.src !== defaultHeroImage) {
                    event.currentTarget.src = defaultHeroImage;
                  }
                }}
              />
            </picture>

            {displayBanners.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrevious}
                  className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-700 shadow-sm transition hover:bg-white hover:text-pink-600 md:left-4 md:h-10 md:w-10"
                  aria-label="Banner trước"
                >
                  <FiChevronLeft size={20} />
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-700 shadow-sm transition hover:bg-white hover:text-pink-600 md:right-4 md:h-10 md:w-10"
                  aria-label="Banner tiếp theo"
                >
                  <FiChevronRight size={20} />
                </button>

                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
                  {displayBanners.map((banner, index) => (
                    <button
                      key={banner.id || `banner-${index}`}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentIndex
                          ? "w-6 bg-pink-600"
                          : "w-1.5 bg-white/85"
                      }`}
                      aria-label={`Chuyển tới banner ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
