// import { useEffect, useState } from "react";

import {
  FiClock,
  FiInfo,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSettings,
} from "react-icons/fi";

import { Link } from "react-router-dom";

import {
  readSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";

import { ROLES, useAuth } from "@/context/AuthContext";

const ContactPage = () => {
  const [settings, setSettings] = useState(() => readSiteSettings());

  const { user } = useAuth();

  useEffect(() => {
    document.title = "Liên hệ | Flower Shop";

    let description = document.querySelector('meta[name="description"]');

    if (!description) {
      description = document.createElement("meta");
      description.name = "description";
      document.head.appendChild(description);
    }

    description.content =
      "Liên hệ Flower Shop để được tư vấn hoa tươi, đặt hoa và hỗ trợ giao hoa.";

    let canonical = document.querySelector('link[rel="canonical"]');

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }

    canonical.href = `${window.location.origin}/contact`;

    const refresh = () => setSettings(readSiteSettings());

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
      href: contact.phone ? `tel:${contact.phone.replace(/\s+/g, "")}` : "",
    },
    {
      label: "Email",
      value: contact.email,
      icon: FiMail,
      href: contact.email ? `mailto:${contact.email}` : "",
    },
    {
      label: "Địa chỉ",
      value: contact.address,
      icon: FiMapPin,
      href: "",
    },
    {
      label: "Thời gian làm việc",
      value: contact.workingHours,
      icon: FiClock,
      href: "",
    },
    ...(Array.isArray(contact.extraItems)
      ? contact.extraItems
          .filter((item) => item && item.visible !== false && item.value)
          .map((item) => ({
            label: item.label,
            value: item.value,
            icon:
              item.type === "phone"
                ? FiPhone
                : item.type === "email"
                  ? FiMail
                  : item.type === "address"
                    ? FiMapPin
                    : item.type === "hours"
                      ? FiClock
                      : FiInfo,
            href:
              item.type === "phone"
                ? `tel:${String(item.value).replace(/\s+/g, "")}`
                : item.type === "email"
                  ? `mailto:${item.value}`
                  : "",
          }))
      : []),
  ].filter((item) => item.value);

  const isAdmin = user?.role === ROLES.ADMIN;

  const contactStyle = contact.style || {};

  const columns =
    Number(contactStyle.columns) >= 1 && Number(contactStyle.columns) <= 4
      ? Number(contactStyle.columns)
      : 2;

  const gridClass =
    columns === 1
      ? "md:grid-cols-1"
      : columns === 3
        ? "md:grid-cols-3"
        : columns === 4
          ? "md:grid-cols-4"
          : "md:grid-cols-2";

  return (
    <main className="min-h-screen bg-gray-50 py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <header className="mb-8 text-center">
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

          {isAdmin && (
            <Link
              to="/admin/contact"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-pink-200 bg-white px-4 py-2.5 text-sm font-semibold text-pink-600 shadow-sm hover:bg-pink-50"
            >
              <FiSettings />
              Quản lý thông tin liên hệ
            </Link>
          )}
        </header>

        <section
          aria-labelledby="contact-information"
          className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-7"
          style={{
            borderRadius: `${Number(contactStyle.sectionRadius || 16)}px`,
          }}
        >
          <h2 id="contact-information" className="sr-only">
            Thông tin liên hệ Flower Shop
          </h2>

          {items.length > 0 ? (
            <div className={`grid gap-4 ${gridClass}`}>
              {items.map(({ label, value, icon: Icon, href }) => (
                <div
                  key={`${label}-${value}`}
                  className="flex items-start gap-4 border border-gray-100 bg-gray-50 p-5 transition hover:border-pink-100 hover:bg-white hover:shadow-sm"
                  style={{
                    borderRadius: `${Number(contactStyle.cardRadius || 12)}px`,
                  }}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-pink-600 shadow-sm">
                    <Icon size={19} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      {label}
                    </p>

                    {href ? (
                      <a
                        href={href}
                        className="mt-1 block break-words font-semibold leading-6 text-gray-800 hover:text-pink-600"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="mt-1 break-words font-semibold leading-6 text-gray-800">
                        {value}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-gray-500">
              Thông tin liên hệ đang được cập nhật.
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default ContactPage;
