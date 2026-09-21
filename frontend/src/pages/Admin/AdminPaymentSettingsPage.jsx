import { useEffect, useState } from "react";

import { FiCreditCard, FiImage, FiSave } from "react-icons/fi";

import { useNotification } from "@/context/NotificationProvider";

import {
  readPaymentSettings,
  savePaymentSettings,
  resolvePaymentBank,
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

    window.addEventListener("flower-shop-payment-settings-updated", refresh);

    window.addEventListener("flower-shop-site-settings-updated", refresh);

    window.addEventListener("storage", refresh);

    return () => {
      window.removeEventListener(
        "flower-shop-payment-settings-updated",
        refresh
      );

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
      /*
       * QR thanh toán phải giữ nguyên file gốc.
       *
       * Không resize.
       * Không convert WebP.
       * Không nén lossy.
       */
      const url = await uploadImageFile(file, {
        folder: "flower-shop/payment",

        preserveOriginal: true,
      });

      updateBankTransfer("qrCodeUrl", url);

      notifySuccess(
        "Đã tải QR ngân hàng lên Cloudinary và giữ nguyên dữ liệu gốc."
      );
    } catch (error) {
      notifyError(error?.message || "Không thể tải mã QR lên Cloudinary.");
    } finally {
      setUploadingQr(false);
    }
  };

  const handleSave = async () => {
    const accountNumber = String(bankTransfer.accountNumber || "")
      .trim()
      .replace(/\s+/g, "");

    const accountName = String(bankTransfer.accountName || "").trim();

    const bankName = String(bankTransfer.bankName || "").trim();

    const bankCode = String(bankTransfer.bankCode || "").trim();

    const prefix = String(bankTransfer.transferContentPrefix || "").trim();

    if (!bankName) {
      notifyError("Vui lòng nhập tên ngân hàng.");

      return;
    }

    if (!accountNumber) {
      notifyError("Vui lòng nhập số tài khoản nhận tiền.");

      return;
    }

    if (accountNumber.length < 6 || accountNumber.length > 19) {
      notifyError("Số tài khoản phải có từ 6 đến 19 ký tự để tạo VietQR.");

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
      /*
       * Không sử dụng bankCode nhập tay trực tiếp nữa.
       *
       * resolvePaymentBank sẽ kiểm tra:
       * - BIN
       * - code
       * - shortName
       * - tên ngân hàng
       *
       * và trả về BIN chuẩn của VietQR.
       */
      const resolvedBank = await resolvePaymentBank({
        bankCode,
        bankName,
      });

      if (!resolvedBank) {
        notifyError(
          "Không xác định được ngân hàng từ VietQR. Vui lòng nhập đúng BIN 6 số hoặc tên/mã ngân hàng được VietQR hỗ trợ."
        );

        return;
      }

      if (!resolvedBank.transferSupported) {
        notifyError("Ngân hàng này hiện không hỗ trợ chuyển khoản VietQR.");

        return;
      }

      const saved = await savePaymentSettings({
        ...settings,

        bankTransfer: {
          ...bankTransfer,

          enabled: bankTransfer.enabled !== false,

          bankName,

          /*
           * QUAN TRỌNG:
           * lưu BIN 6 số chuẩn VietQR thay cho giá trị nhập tự do.
           */
          bankCode: resolvedBank.bin,

          accountNumber,

          accountName,

          qrCodeUrl: String(bankTransfer.qrCodeUrl || "").trim(),

          transferContentPrefix: prefix,

          instructions: String(bankTransfer.instructions || "").trim(),
        },
      });

      setSettings(saved);

      notifySuccess(
        `Đã lưu cấu hình thanh toán. BIN VietQR: ${resolvedBank.bin}.`
      );
    } catch (error) {
      notifyError(error?.message || "Không thể đồng bộ cấu hình thanh toán.");
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
                  placeholder="Ví dụ: 970436"
                  className={inputClass}
                />

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Có thể nhập BIN 6 số, mã ngân hàng hoặc tên ngân hàng. Hệ
                  thống sẽ tự đối chiếu với danh sách VietQR và lưu BIN chuẩn
                  trước khi tạo QR Checkout.
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
                  Hệ thống sẽ nối mã đơn hàng vào sau tiền tố này.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  QR ngân hàng thực tế
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

                  {uploadingQr
                    ? "Đang tải QR..."
                    : "Tải QR ngân hàng lên Cloudinary"}

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleQrUpload}
                    disabled={uploadingQr}
                    className="hidden"
                  />
                </label>

                {bankTransfer.qrCodeUrl && (
                  <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="mb-3 text-sm font-semibold text-gray-700">
                      QR đã cấu hình
                    </p>

                    <div className="flex justify-center">
                      <img
                        src={bankTransfer.qrCodeUrl}
                        alt="QR ngân hàng"
                        className="max-h-72 w-auto rounded-lg bg-white object-contain shadow-sm"
                      />
                    </div>

                    <p className="mt-3 text-xs leading-5 text-gray-500">
                      QR này được giữ nguyên file gốc khi upload, không chuyển
                      sang WebP.
                    </p>
                  </div>
                )}
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
            <h2 className="font-bold text-blue-900">Cơ chế thanh toán</h2>

            <p className="mt-2 text-sm leading-6 text-blue-800">
              QR động được tạo theo số tiền và mã đơn hàng của từng lần thanh
              toán. QR ngân hàng thực tế đã tải lên được giữ nguyên để làm QR dự
              phòng. Hệ thống vẫn sử dụng mã đơn hàng và số tiền để đối soát
              giao dịch ngân hàng.
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
