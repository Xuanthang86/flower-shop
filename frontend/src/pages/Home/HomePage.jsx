import { useEffect } from "react";

import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";

import {
  getSeoTitle,
  getSiteName,
  readSiteSettings,
} from "@/services/siteSettings";

const HomePage = () => {
  useEffect(() => {
    const settings = readSiteSettings();

    document.title = getSeoTitle(
      settings,
      "homeTitle",
      `${getSiteName(settings)} | Hoa tươi cho những khoảnh khắc đáng nhớ`
    );

    let description = document.querySelector('meta[name="description"]');

    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }

    description.content =
      settings.seo?.defaultDescription ||
      `${getSiteName(settings)} cung cấp hoa tươi cho những dịp đặc biệt.`;

    let canonical = document.querySelector('link[rel="canonical"]');

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }

    canonical.href = window.location.origin;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero />

      <Categories />

      <FeaturedProducts />
    </div>
  );
};

export default HomePage;
