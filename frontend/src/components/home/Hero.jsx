import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

import Container from "@/components/common/Container";

import {
  readSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";

import defaultHeroImage from "@/assets/images/hero/hero-bouquet.jpg";

const Hero = () => {
  const [settings, setSettings] = useState(() => readSiteSettings());

  const [currentIndex, setCurrentIndex] = useState(0);

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

  const banners = settings.hero?.banners || [];

  useEffect(() => {
    if (banners.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setCurrentIndex((index) => (index >= banners.length - 1 ? 0 : index + 1));
    }, 5000);

    return () => window.clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    if (currentIndex >= banners.length && banners.length > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, banners.length]);

  const goPrevious = () => {
    if (!banners.length) {
      return;
    }

    setCurrentIndex((index) => (index <= 0 ? banners.length - 1 : index - 1));
  };

  const goNext = () => {
    if (!banners.length) {
      return;
    }

    setCurrentIndex((index) => (index >= banners.length - 1 ? 0 : index + 1));
  };

  const fallbackBanner = {
    id: "default-hero",
    image: defaultHeroImage,
    alt: "Flower Shop",
  };

  const displayBanners = banners.length > 0 ? banners : [fallbackBanner];

  const activeBanner = displayBanners[currentIndex] || displayBanners[0];

  return (
    <section className="bg-pink-50 py-5 md:py-7">
      <Container>
        <div className="mx-auto w-full max-w-7xl">
          <div className="relative mx-auto w-full overflow-hidden rounded-2xl bg-white shadow-lg">
            <div className="aspect-[16/6] min-h-[125px] w-full md:min-h-[185px] lg:min-h-[240px]">
              <img
                key={activeBanner.id}
                src={activeBanner.image}
                alt={activeBanner.alt || "Flower Shop"}
                className="h-full w-full object-cover"
              />
            </div>

            {displayBanners.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrevious}
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md transition hover:bg-white hover:text-pink-600 md:left-5"
                  aria-label="Banner trước"
                >
                  <FiChevronLeft size={22} />
                </button>

                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md transition hover:bg-white hover:text-pink-600 md:right-5"
                  aria-label="Banner tiếp theo"
                >
                  <FiChevronRight size={22} />
                </button>

                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
                  {displayBanners.map((banner, index) => (
                    <button
                      key={banner.id || index}
                      type="button"
                      onClick={() => setCurrentIndex(index)}
                      className={`h-2.5 rounded-full transition-all ${
                        index === currentIndex
                          ? "w-7 bg-pink-600"
                          : "w-2.5 bg-white/80"
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
