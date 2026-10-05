import api from "@/services/api";
import { useState } from "react";
import { FiMail, FiSave } from "react-icons/fi";

import { readSiteSettings, saveSiteSettings } from "@/services/siteSettings";

import { useNotification } from "@/context/NotificationProvider";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

const AdminOrderEmailSettingsPage = () => {
  const { notifySuccess, notifyError } = useNotification();

  const [settings, setSettings] = useState(() => readSiteSettings());

  const notifications = settings.notifications || {};

  const columns = notifications.productColumns || {};

  const updateNotification = (field, value) => {
    setSettings((current) => ({
      ...current,

      notifications: {
        ...(current.notifications || {}),

        [field]: value,
      },
    }));
  };

  const updateColumn = (field, value) => {
    setSettings((current) => ({
      ...current,

      notifications: {
        ...(current.notifications || {}),

        productColumns: {
          ...(current.notifications?.productColumns || {}),

          [field]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    try {
      const response = await api.get("/data/snapshot", {
        params: {
          _: Date.now(),
        },
      });

      const snapshot = response?.data?.snapshot || {};

      const nextSettings = {
        ...(snapshot.settings || {}),
        notifications: {
          ...(snapshot.settings?.notifications || {}),
          ...(settings.notifications || {}),
        },
      };

      const saveResponse = await api.put("/data/snapshot", {
        products: Array.isArray(snapshot.products) ? snapshot.products : [],

        categories: Array.isArray(snapshot.categories)
          ? snapshot.categories
          : [],

        settings: nextSettings,
      });

      if (saveResponse?.data?.success !== true) {
        throw new Error(
          saveResponse?.data?.message ||
            "Không thể lưu cấu hình email vào backend."
        );
      }

      saveSiteSettings({
        ...settings,
        notifications: nextSettings.notifications,
      });

      notifySuccess("Đã lưu cấu hình email thông báo đơn hàng.");
    } catch (error) {
      console.error("Không thể lưu cấu hình email:", error);

      notifyError(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể lưu cấu hình email."
      );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
              <FiMail size={24} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Cấu hình email đơn hàng
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Quản lý nội dung email thông báo đơn hàng và trạng thái thanh
                toán.
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Email nhận thông báo
            </h2>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold">
                Email nhận thông báo
              </label>

              <input
                type="email"
                value={notifications.orderEmail || ""}
                onChange={(event) =>
                  updateNotification("orderEmail", event.target.value)
                }
                placeholder="admin@example.com"
                className={inputClass}
              />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Email đơn hàng mới
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Tiêu đề email
                </label>

                <input
                  value={notifications.newOrderSubject || ""}
                  onChange={(event) =>
                    updateNotification("newOrderSubject", event.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Tiêu đề trong email
                </label>

                <input
                  value={notifications.newOrderTitle || ""}
                  onChange={(event) =>
                    updateNotification("newOrderTitle", event.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Email cập nhật trạng thái
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Tiêu đề email
                </label>

                <input
                  value={notifications.statusSubject || ""}
                  onChange={(event) =>
                    updateNotification("statusSubject", event.target.value)
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Tiêu đề trong email
                </label>

                <input
                  value={notifications.statusTitle || ""}
                  onChange={(event) =>
                    updateNotification("statusTitle", event.target.value)
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Nhãn thông tin người gửi / người nhận
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {[
                ["senderNameLabel", "Tên người gửi"],
                ["senderPhoneLabel", "Số điện thoại người gửi"],
                ["senderEmailLabel", "Email người gửi"],
                ["recipientNameLabel", "Tên người nhận"],
                ["recipientPhoneLabel", "Số điện thoại người nhận"],
                ["recipientEmailLabel", "Email người nhận"],
                ["orderTimeLabel", "Thời gian đặt"],
                ["addressLabel", "Địa chỉ giao hàng"],
                ["deliveryDateLabel", "Ngày giao"],
                ["deliveryTimeLabel", "Khung giờ"],
                ["paymentMethodLabel", "Hình thức thanh toán"],
                ["paid50Label", "Đã thanh toán trước 50%"],
                ["paid100Label", "Đã thanh toán 100%"],
                ["remainingLabel", "Còn lại khi nhận hoa"],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className="mb-2 block text-sm font-semibold">
                    {label}
                  </label>

                  <input
                    value={notifications[field] || ""}
                    onChange={(event) =>
                      updateNotification(field, event.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Cột sản phẩm trong email
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {[
                ["nameWidth", "Độ rộng Sản phẩm"],
                ["quantityWidth", "Độ rộng SL"],
                ["unitPriceWidth", "Độ rộng Đơn giá"],
                ["subtotalWidth", "Độ rộng Thành tiền"],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className="mb-2 block text-sm font-semibold">
                    {label}
                  </label>

                  <input
                    value={columns[field] || ""}
                    onChange={(event) =>
                      updateColumn(field, event.target.value)
                    }
                    placeholder="40%"
                    className={inputClass}
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-4">
              {[
                ["nameAlign", "Sản phẩm"],
                ["quantityAlign", "SL"],
                ["unitPriceAlign", "Đơn giá"],
                ["subtotalAlign", "Thành tiền"],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className="mb-2 block text-sm font-semibold">
                    Căn {label}
                  </label>

                  <select
                    value={columns[field] || "left"}
                    onChange={(event) =>
                      updateColumn(field, event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="left">Trái</option>

                    <option value="center">Giữa</option>

                    <option value="right">Phải</option>
                  </select>
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700"
            >
              <FiSave />
              Lưu cấu hình email
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminOrderEmailSettingsPage;
