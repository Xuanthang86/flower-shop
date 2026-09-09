import { useEffect, useState } from "react";
import {
  FiEdit2,
  FiInfo,
  FiMail,
  FiMapPin,
  FiPhone,
  FiPlus,
  FiTrash2,
  FiClock,
  FiX,
} from "react-icons/fi";

import {
  readSiteSettings,
  saveSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

const EMPTY_EXTRA = {
  label: "",
  value: "",
  type: "text",
  visible: true,
};

const ContactIcon = ({ type }) => {
  if (type === "phone") return <FiPhone />;
  if (type === "email") return <FiMail />;
  if (type === "address") return <FiMapPin />;
  if (type === "hours") return <FiClock />;
  return <FiInfo />;
};

const AdminContactManagementPage = () => {
  const [settings, setSettings] = useState(() => readSiteSettings());

  const [extraForm, setExtraForm] = useState(EMPTY_EXTRA);
  const [editingExtraId, setEditingExtraId] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    document.title = "Quản lý thông tin liên hệ | Flower Shop";

    let robots = document.querySelector('meta[name="robots"]');

    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }

    robots.content = "noindex,nofollow";
  }, []);

  useEffect(() => {
    const refresh = () => setSettings(readSiteSettings());

    window.addEventListener(SITE_SETTINGS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(SITE_SETTINGS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const contact = settings.contact || {};

  const extraItems = Array.isArray(contact.extraItems)
    ? contact.extraItems
    : [];

  const updateContact = (field, value) => {
    setSettings((current) => ({
      ...current,
      contact: {
        ...(current.contact || {}),
        [field]: value,
      },
    }));

    setMessage("");
    setError("");
  };

  const saveContact = () => {
    try {
      const saved = saveSiteSettings(settings);
      setSettings(saved);
      setMessage("Đã lưu thông tin liên hệ.");
      setError("");
    } catch (saveError) {
      setError(saveError.message || "Không thể lưu thông tin liên hệ.");
      setMessage("");
    }
  };

  const resetExtraForm = () => {
    setExtraForm(EMPTY_EXTRA);
    setEditingExtraId(null);
  };

  const saveExtra = () => {
    const label = extraForm.label.trim();
    const value = extraForm.value.trim();

    if (!label || !value) {
      setError("Vui lòng nhập tên và nội dung thông tin liên hệ.");
      setMessage("");
      return;
    }

    const nextItem = {
      id:
        editingExtraId ||
        `contact-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label,
      value,
      type: extraForm.type,
      visible: extraForm.visible !== false,
    };

    const nextItems = editingExtraId
      ? extraItems.map((item) =>
          String(item.id) === String(editingExtraId) ? nextItem : item
        )
      : [...extraItems, nextItem];

    try {
      const saved = saveSiteSettings({
        ...settings,
        contact: {
          ...(settings.contact || {}),
          extraItems: nextItems,
        },
      });

      setSettings(saved);
      resetExtraForm();

      setMessage(
        editingExtraId
          ? "Đã cập nhật thông tin liên hệ."
          : "Đã thêm thông tin liên hệ."
      );
      setError("");
    } catch (saveError) {
      setError(saveError.message || "Không thể lưu thông tin liên hệ.");
      setMessage("");
    }
  };

  const editExtra = (item) => {
    setEditingExtraId(item.id);

    setExtraForm({
      label: item.label || "",
      value: item.value || "",
      type: item.type || "text",
      visible: item.visible !== false,
    });

    setMessage("");
    setError("");
  };

  const deleteExtra = () => {
    if (!confirmDelete) return;

    try {
      const saved = saveSiteSettings({
        ...settings,
        contact: {
          ...(settings.contact || {}),
          extraItems: extraItems.filter(
            (item) => String(item.id) !== String(confirmDelete.id)
          ),
        },
      });

      setSettings(saved);
      setConfirmDelete(null);

      if (String(editingExtraId) === String(confirmDelete.id)) {
        resetExtraForm();
      }

      setMessage("Đã xóa thông tin liên hệ.");
      setError("");
    } catch (deleteError) {
      setConfirmDelete(null);
      setError(deleteError.message || "Không thể xóa thông tin liên hệ.");
      setMessage("");
    }
  };

  const toggleExtra = (item) => {
    try {
      const saved = saveSiteSettings({
        ...settings,
        contact: {
          ...(settings.contact || {}),
          extraItems: extraItems.map((current) =>
            String(current.id) === String(item.id)
              ? {
                  ...current,
                  visible: current.visible === false,
                }
              : current
          ),
        },
      });

      setSettings(saved);
    } catch (toggleError) {
      setError(toggleError.message || "Không thể cập nhật trạng thái.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto max-w-5xl px-4">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý thông tin liên hệ
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Quản lý toàn bộ nội dung hiển thị trên trang Liên hệ.
          </p>
        </header>

        {(message || error) && (
          <div
            className={`mb-5 rounded-xl border bg-white p-4 text-sm ${
              error
                ? "border-red-100 text-red-600"
                : "border-green-100 text-green-600"
            }`}
          >
            {error || message}
          </div>
        )}

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Thông tin liên hệ chính
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Tiêu đề
              </label>

              <input
                value={contact.title || ""}
                onChange={(event) => updateContact("title", event.target.value)}
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">Mô tả</label>

              <textarea
                rows={3}
                value={contact.description || ""}
                onChange={(event) =>
                  updateContact("description", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Điện thoại
              </label>

              <input
                value={contact.phone || ""}
                onChange={(event) => updateContact("phone", event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">Email</label>

              <input
                type="email"
                value={contact.email || ""}
                onChange={(event) => updateContact("email", event.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Địa chỉ
              </label>

              <input
                value={contact.address || ""}
                onChange={(event) =>
                  updateContact("address", event.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Thời gian làm việc
              </label>

              <input
                value={contact.workingHours || ""}
                onChange={(event) =>
                  updateContact("workingHours", event.target.value)
                }
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={saveContact}
              className="rounded-xl bg-pink-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-pink-700"
            >
              Lưu thông tin liên hệ
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Thông tin liên hệ bổ sung
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Có thể thêm, sửa, xóa và bật/tắt từng thông tin.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
            <div className="grid gap-4 md:grid-cols-4">
              <input
                value={extraForm.label}
                onChange={(event) =>
                  setExtraForm((current) => ({
                    ...current,
                    label: event.target.value,
                  }))
                }
                placeholder="Tên thông tin"
                className={inputClass}
              />

              <input
                value={extraForm.value}
                onChange={(event) =>
                  setExtraForm((current) => ({
                    ...current,
                    value: event.target.value,
                  }))
                }
                placeholder="Nội dung"
                className={inputClass}
              />

              <select
                value={extraForm.type}
                onChange={(event) =>
                  setExtraForm((current) => ({
                    ...current,
                    type: event.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="text">Văn bản</option>
                <option value="phone">Điện thoại</option>
                <option value="email">Email</option>
                <option value="address">Địa chỉ</option>
                <option value="hours">Giờ làm việc</option>
              </select>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={saveExtra}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-3 text-sm font-semibold text-white hover:bg-pink-700"
                >
                  {editingExtraId ? <FiEdit2 /> : <FiPlus />}
                  {editingExtraId ? "Cập nhật" : "Thêm"}
                </button>

                {editingExtraId && (
                  <button
                    type="button"
                    onClick={resetExtraForm}
                    className="rounded-xl border border-gray-200 p-3 text-gray-600 hover:bg-white"
                    aria-label="Hủy chỉnh sửa"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </div>

            <label className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={extraForm.visible !== false}
                onChange={(event) =>
                  setExtraForm((current) => ({
                    ...current,
                    visible: event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300 text-pink-600"
              />
              Hiển thị trên trang Liên hệ
            </label>
          </div>

          <div className="mt-5 space-y-3">
            {extraItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-500">
                Chưa có thông tin bổ sung.
              </div>
            ) : (
              extraItems.map((item) => (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                      <ContactIcon type={item.type} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {item.label}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">{item.value}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggleExtra(item)}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                        item.visible !== false
                          ? "border-green-100 text-green-600 hover:bg-green-50"
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {item.visible !== false ? "Đang hiện" : "Đang ẩn"}
                    </button>

                    <button
                      type="button"
                      onClick={() => editExtra(item)}
                      className="rounded-lg border border-gray-200 p-2 text-blue-600 hover:bg-blue-50"
                      aria-label={`Sửa ${item.label}`}
                    >
                      <FiEdit2 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmDelete(item)}
                      className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50"
                      aria-label={`Xóa ${item.label}`}
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
              <FiTrash2 />
            </div>

            <h2 className="mt-4 text-lg font-bold text-gray-900">
              Xóa thông tin?
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Bạn có chắc muốn xóa <strong>{confirmDelete.label}</strong>?
            </p>

            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-semibold"
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={deleteExtra}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminContactManagementPage;
