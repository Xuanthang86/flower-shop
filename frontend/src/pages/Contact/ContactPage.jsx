import { useEffect, useState } from "react";

import { FiClock, FiMail, FiMapPin, FiPhone } from "react-icons/fi";

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

  const contact = settings.contact || {};

  const items = [
    {
      label: "Điện thoại",
      value: contact.phone,
      icon: FiPhone,
    },
    {
      label: "Email",
      value: contact.email,
      icon: FiMail,
    },
    {
      label: "Địa chỉ",
      value: contact.address,
      icon: FiMapPin,
    },
    {
      label: "Thời gian làm việc",
      value: contact.workingHours,
      icon: FiClock,
    },
  ].filter((item) => item.value);

  return (
    <section className="min-h-screen bg-gray-50 py-10 md:py-14">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mb-8 text-center">
          <span className="inline-flex rounded-full bg-pink-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-pink-600">
            Flower Shop
          </span>

          <h1 className="mt-3 text-3xl font-bold text-gray-900 md:text-4xl">
            {contact.title || "Liên hệ"}
          </h1>

          <p className="mx-auto mt-3 max-w-2xl leading-7 text-gray-500">
            {contact.description ||
              "Flower Shop luôn sẵn sàng tư vấn và hỗ trợ bạn lựa chọn những bó hoa phù hợp."}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-7">
          {items.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {items.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-start gap-4 rounded-xl border border-gray-100 bg-gray-50 p-5 transition hover:border-pink-100 hover:bg-white hover:shadow-sm"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-pink-600 shadow-sm">
                    <Icon size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {label}
                    </p>

                    <p className="mt-1 break-words font-semibold leading-6 text-gray-800">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-gray-500">
              Thông tin liên hệ đang được cập nhật.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
