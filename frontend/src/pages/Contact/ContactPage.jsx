import { useEffect, useState } from "react";

import {
  readSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";

const ContactPage = () => {
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

  const contact = settings.contact;

  return (
    <section className="min-h-screen bg-gray-50 py-10">
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-3xl font-bold text-gray-800">{contact.title}</h1>

          <p className="mt-3 leading-7 text-gray-600">{contact.description}</p>

          <div className="mt-7 grid gap-4 md:grid-cols-2">
            {contact.phone && (
              <div className="rounded-xl bg-pink-50 p-4">
                <p className="text-xs font-semibold uppercase text-pink-600">
                  Điện thoại
                </p>

                <p className="mt-1 font-semibold text-gray-800">
                  {contact.phone}
                </p>
              </div>
            )}

            {contact.email && (
              <div className="rounded-xl bg-pink-50 p-4">
                <p className="text-xs font-semibold uppercase text-pink-600">
                  Email
                </p>

                <p className="mt-1 font-semibold text-gray-800">
                  {contact.email}
                </p>
              </div>
            )}

            {contact.address && (
              <div className="rounded-xl bg-pink-50 p-4">
                <p className="text-xs font-semibold uppercase text-pink-600">
                  Địa chỉ
                </p>

                <p className="mt-1 font-semibold text-gray-800">
                  {contact.address}
                </p>
              </div>
            )}

            {contact.workingHours && (
              <div className="rounded-xl bg-pink-50 p-4">
                <p className="text-xs font-semibold uppercase text-pink-600">
                  Thời gian làm việc
                </p>

                <p className="mt-1 font-semibold text-gray-800">
                  {contact.workingHours}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
