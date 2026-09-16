import { useEffect, useState } from "react";

import { FiCreditCard, FiImage, FiSave } from "react-icons/fi";

import { useNotification } from "@/context/NotificationProvider";

import {
  DEFAULT_PAYMENT_SETTINGS,
  readPaymentSettings,
  savePaymentSettings,
} from "@/services/paymentSettings";

import { uploadImageFile } from "@/services/media";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

const AdminPaymentSettingsPage = () => {
  const { notifySuccess, notifyError } = useNotification();

  const [settings, setSettings] = useState(() => readPaymentSettings());

  const [uploadingQr, setUploadingQr] = useState(false);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Cấu hình thanh toán | Flower Shop";

    let robots = document.querySelector('meta[name="robots"]');

    if (!robots) {
      robots = document.createElement("meta");

      robots.name = "robots";

      document.head.appendChild(robots);
    }

    robots.content = "noindex,nofollow";

    return () => {
      robots.content = "index,follow";
    };
  }, []);

  useEffect(() => {
    const refresh = () => {
      setSettings(readPaymentSettings());
    };

    window.addEventListener("flower-shop-site-settings-updated", refresh);

    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener("flower-shop-site-settings-updated", refresh);

      window.removeEventListener("storage", refresh);
    };
  }, []);

  const bankTransfer = settings.bankTransfer || {};

  const updateBankTransfer = (field, value) => {
    setSettings((current) => ({
      ...current,

      bankTransfer: {
        ...(current.bankTransfer || {}),
        [field]: value,
      },
    }));
  };

  const handleQrUpload = async (event) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setUploadingQr(true);

    try {
      const url = await uploadImageFile(file, {
        folder: "flower-shop/payment",
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.9,
      });

      updateBankTransfer("qrCodeUrl", url);

      notifySuccess("Đã tải mã QR lên Cloudinary.");
    } catch (error) {
      notifyError(error?.message || "Không thể tải mã QR lên Cloudinary.");
    } finally {
      setUploadingQr(false);
    }
  };

  const handleSave = () => {
    const accountNumber = String(bankTransfer.accountNumber || "").trim();

    const accountName = String(bankTransfer.accountName || "").trim();

    const bankName = String(bankTransfer.bankName || "").trim();

    const bankCode = String(bankTransfer.bankCode || "").trim();

    const prefix = String(bankTransfer.transferContentPrefix || "").trim();

    if (!bankName) {
      notifyError("Vui lòng nhập tên ngân hàng.");

      return;
    }

    if (!bankCode) {
      notifyError("Vui lòng nhập mã ngân hàng/BIN để hệ thống tạo QR động.");

      return;
    }

    if (!accountNumber) {
      notifyError("Vui lòng nhập số tài khoản nhận tiền.");

      return;
    }

    if (!accountName) {
      notifyError("Vui lòng nhập tên chủ tài khoản.");

      return;
    }

    if (!prefix) {
      notifyError("Vui lòng nhập tiền tố nội dung chuyển khoản.");

      return;
    }

    setSaving(true);

    try {
      const saved = savePaymentSettings({
        ...settings,

        bankTransfer: {
          ...bankTransfer,

          enabled: bankTransfer.enabled !== false,

          bankName,

          bankCode,

          accountNumber,

          accountName,

          qrCodeUrl: String(bankTransfer.qrCodeUrl || "").trim(),

          transferContentPrefix: prefix,

          instructions: String(bankTransfer.instructions || "").trim(),
        },
      });

      setSettings(saved);

      notifySuccess("Đã lưu cấu hình thanh toán chuyển khoản.");
    } catch (error) {
      notifyError(error?.message || "Không thể lưu cấu hình thanh toán.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-5xl px-4">
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 text-pink-600">
              <FiCreditCard size={24} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Cấu hình thanh toán
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Quản lý tài khoản nhận chuyển khoản và mã QR.
              </p>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Thanh toán chuyển khoản
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Các thông tin này sẽ được hiển thị tại Checkout.
                </p>
              </div>

              <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={bankTransfer.enabled !== false}
                  onChange={(event) =>
                    updateBankTransfer("enabled", event.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                Cho phép chuyển khoản
              </label>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Tên ngân hàng *
                </label>

                <input
                  type="text"
                  value={bankTransfer.bankName || ""}
                  onChange={(event) =>
                    updateBankTransfer("bankName", event.target.value)
                  }
                  placeholder="Ví dụ: Vietcombank"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Mã ngân hàng / BIN *
                </label>

                <input
                  type="text"
                  value={bankTransfer.bankCode || ""}
                  onChange={(event) =>
                    updateBankTransfer("bankCode", event.target.value)
                  }
                  placeholder="Ví dụ: VCB hoặc 970436"
                  className={inputClass}
                />

                <p className="mt-2 text-xs text-gray-500">
                  Dùng mã được VietQR hỗ trợ để tạo QR động.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Số tài khoản *
                </label>

                <input
                  type="text"
                  value={bankTransfer.accountNumber || ""}
                  onChange={(event) =>
                    updateBankTransfer("accountNumber", event.target.value)
                  }
                  placeholder="Nhập số tài khoản nhận tiền"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Chủ tài khoản *
                </label>

                <input
                  type="text"
                  value={bankTransfer.accountName || ""}
                  onChange={(event) =>
                    updateBankTransfer("accountName", event.target.value)
                  }
                  placeholder="NGUYEN VAN A"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Tiền tố nội dung chuyển khoản *
                </label>

                <input
                  type="text"
                  value={bankTransfer.transferContentPrefix || ""}
                  onChange={(event) =>
                    updateBankTransfer(
                      "transferContentPrefix",
                      event.target.value.toUpperCase()
                    )
                  }
                  placeholder="FLOWERSHOP"
                  className={inputClass}
                />

                <p className="mt-2 text-xs text-gray-500">
                  Hệ thống luôn nối thêm mã đơn hàng phía sau.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  QR tĩnh dự phòng
                </label>

                <input
                  type="url"
                  value={bankTransfer.qrCodeUrl || ""}
                  onChange={(event) =>
                    updateBankTransfer("qrCodeUrl", event.target.value)
                  }
                  placeholder="https://..."
                  className={inputClass}
                />

                <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-pink-50">
                  <FiImage />

                  {uploadingQr ? "Đang tải QR..." : "Tải ảnh QR lên Cloudinary"}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrUpload}
                    disabled={uploadingQr}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold">
                Hướng dẫn thanh toán
              </label>

              <textarea
                rows={4}
                value={bankTransfer.instructions || ""}
                onChange={(event) =>
                  updateBankTransfer("instructions", event.target.value)
                }
                placeholder="Nhập hướng dẫn chuyển khoản..."
                className={`${inputClass} resize-none`}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <h2 className="font-bold text-blue-900">
              Cơ chế xác nhận thanh toán
            </h2>

            <p className="mt-2 text-sm leading-6 text-blue-800">
              Mã QR động sẽ được tạo theo từng giao dịch với đúng số tiền và nội
              dung chuyển khoản chứa mã đơn hàng. Nút Đặt hàng tại Checkout chỉ
              được bật sau khi backend xác minh giao dịch chuyển khoản thành
              công.
            </p>
          </section>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || uploadingQr}
              className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-6 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              <FiSave />

              {saving ? "Đang lưu..." : "Lưu cấu hình"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminPaymentSettingsPage;
