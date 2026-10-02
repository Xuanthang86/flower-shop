import { useEffect, useState } from "react";

import {
  readSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
  getSiteName,
} from "@/services/siteSettings";

const Footer = () => {
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

  const currentYear = new Date().getFullYear();

  const startYear = Math.max(
    1900,
    Number(settings?.footer?.copyrightStartYear) || currentYear
  );

  const copyrightYear =
    startYear < currentYear
      ? `${startYear} - ${currentYear}`
      : String(currentYear);

  const siteName = getSiteName(settings);

  const copyrightText = String(
    settings?.footer?.copyrightText || "All Rights Reserved."
  ).trim();

  return (
    <footer className="mt-8 bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-5 text-center">
        <p className="text-xs text-gray-300 md:text-sm">
          © {copyrightYear} {siteName}. {copyrightText}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
