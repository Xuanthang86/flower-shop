import { useEffect, useState } from "react";

import {
  readSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
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

  return (
    <footer className="mt-8 bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-5 text-center">
        <p className="text-xs text-gray-300 md:text-sm">
          {settings.footer.copyright}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
