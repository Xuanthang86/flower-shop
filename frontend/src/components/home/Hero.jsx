/*
============================================================
FLOWER SHOP — HERO
============================================================

- Nội dung lấy từ siteSettings.
- Banner có thể thay đổi bởi Admin.
- Banner tự fit khung.
- Không hard-code nội dung Hero.
============================================================
*/

import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import Container from "@/components/common/Container";

import {
  readSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";

import defaultHeroImage from "@/assets/images/hero/hero-bouquet.jpg";

const Hero = () => {
  const [settings, setSettings] = useState(() => readSiteSettings());

  useEffect(() => {
    const refresh = () => {
      setSettings(readSiteSettings());
    };

    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, refresh);

    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, refresh);

      window.removeEventListener("storage", refresh);
    };
  }, []);

  const hero = settings.hero;

  const bannerImage = hero.bannerImage || defaultHeroImage;

  return (
    <section className="bg-pink-50">
      <Container>
        <div className="grid grid-cols-1 items-center gap-6 py-6 md:py-7 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
          <div className="text-center lg:text-left">
            <p className="font-semibold uppercase tracking-[0.18em] text-pink-600">
              {hero.eyebrow}
            </p>

            <h1 className="mt-2 text-3xl font-bold leading-tight text-gray-900 md:text-4xl lg:text-5xl">
              {hero.titleBefore}{" "}
              <span className="text-pink-600">{hero.titleHighlight}</span>
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-gray-600 lg:mx-0">
              {hero.description}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Link
                to={hero.primaryButtonLink || "/products"}
                className="rounded-lg bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700"
              >
                {hero.primaryButtonText}
              </Link>

              <Link
                to={hero.secondaryButtonLink || "/products"}
                className="rounded-lg border border-pink-600 px-5 py-2.5 text-sm font-semibold text-pink-600 transition hover:bg-pink-100"
              >
                {hero.secondaryButtonText}
              </Link>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative aspect-[16/8] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-lg">
              <img
                src={bannerImage}
                alt={hero.titleHighlight}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;
