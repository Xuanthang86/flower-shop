import { useEffect, useRef, useState } from "react";

import { FiCreditCard, FiImage, FiSave } from "react-icons/fi";

import { useNotification } from "@/context/NotificationProvider";

import {
  readPaymentSettings,
  fetchPaymentSettings,
  savePaymentSettings,
  resolvePaymentBank,
} from "@/services/paymentSettings";

import { uploadImageFile } from "@/services/media";

import { readSiteSettings, getPageTitle } from "@/services/siteSettings";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100";

const AdminPaymentSettingsPage = () => {
  const { notifySuccess, notifyError } = useNotification();

  /*
   * Chỉ dùng readPaymentSettings() làm fallback ban đầu.
   * Sau khi component mount, fetchPaymentSettings() sẽ lấy
   * cấu hình mới nhất trực tiếp từ backend.
   */
  const [settings, setSettings] = useState(() => readPaymentSettings());

  const [uploadingQr, setUploadingQr] = useState(false);

  const [saving, setSaving] = useState(false);

  /*
   * Ghi nhận chính xác những trường Admin đã thay đổi.
   *
   * Mục đích:
   * Nếu một Admin khác vừa cập nhật cấu hình trên trình duyệt khác,
   * khi Admin hiện tại bấm Lưu sẽ không lấy dữ liệu cũ trong form
   * để ghi đè những trường mà Admin hiện tại không chỉnh sửa.
   */
  const [dirtyBankFields, setDirtyBankFields] = useState({});

  const dirtyBankFieldsRef = useRef({});

  /*
   * Cập nhật title trang.
   */
  useEffect(() => {
    const updateTitle = () => {
      const siteSettings = readSiteSettings();

      document.title = getPageTitle(siteSettings, "Cấu hình thanh toán");
    };

    updateTitle();

    window.addEventListener("flower-shop-site-settings-updated", updateTitle);

    window.addEventListener("storage", updateTitle);

    return () => {
      window.removeEventListener(
        "flower-shop-site-settings-updated",
        updateTitle
      );

      window.removeEventListener("storage", updateTitle);
    };
  }, []);

  /*
   * QUAN TRỌNG:
   * Khi mở trang, luôn lấy payment settings mới nhất từ backend.
   *
   * Không sử dụng localStorage làm nguồn dữ liệu chính.
   *
   * Điều này xử lý trường hợp:
   *
   * Browser A:
   *   cập nhật số tài khoản/chủ tài khoản
   *
   * Browser B:
   *   mở lại Cấu hình thanh toán
   *
   * Browser B phải nhận dữ liệu mới nhất từ backend.
   */
  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      /*
       * Nếu Admin đang chỉnh sửa bất kỳ trường nào,
       * tuyệt đối không được tự động lấy dữ liệu backend
       * rồi ghi đè form hiện tại.
       */
      if (Object.keys(dirtyBankFieldsRef.current).length > 0) {
        return;
      }

      try {
        const latest = await fetchPaymentSettings();

        if (cancelled) {
          return;
        }

        /*
         * Chỉ cập nhật form khi Admin không có thay đổi
         * chưa lưu.
         */
        if (Object.keys(dirtyBankFieldsRef.current).length === 0) {
          setSettings(latest);
        }
      } catch (error) {
        console.error("Không thể tải cấu hình thanh toán mới nhất:", error);

        /*
         * Chỉ fallback localStorage khi form không có
         * thay đổi chưa lưu.
         */
        if (
          !cancelled &&
          Object.keys(dirtyBankFieldsRef.current).length === 0
        ) {
          setSettings(readPaymentSettings());
        }
      }
    };

    /*
     * Lần đầu mở trang:
     * lấy dữ liệu mới nhất từ backend.
     */
    refresh();

    const handlePaymentSettingsUpdated = () => {
      /*
       * Nếu chính trang Admin đang chỉnh sửa:
       * KHÔNG reload dữ liệu.
       *
       * Điều này ngăn:
       *
       * Xóa "M"
       * ↓
       * event
       * ↓
       * fetch backend
       * ↓
       * "M" quay lại
       */
      if (Object.keys(dirtyBankFieldsRef.current).length > 0) {
        return;
      }

      refresh();
    };

    const handleStorage = () => {
      /*
       * Storage event có thể đến từ tab/browser khác.
       *
       * Nếu form hiện tại đang có thay đổi chưa lưu,
       * không được phá form đang nhập.
       */
      if (Object.keys(dirtyBankFieldsRef.current).length > 0) {
        return;
      }

      refresh();
    };

    window.addEventListener(
      "flower-shop-payment-settings-updated",
      handlePaymentSettingsUpdated
    );

    window.addEventListener(
      "flower-shop-site-settings-updated",
      handlePaymentSettingsUpdated
    );

    window.addEventListener("storage", handleStorage);

    return () => {
      cancelled = true;

      window.removeEventListener(
        "flower-shop-payment-settings-updated",
        handlePaymentSettingsUpdated
      );

      window.removeEventListener(
        "flower-shop-site-settings-updated",
        handlePaymentSettingsUpdated
      );

      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const bankTransfer = settings?.bankTransfer || {};

  /*
   * Cập nhật trường cấu hình chuyển khoản.
   *
   * Đồng thời đánh dấu field đã được Admin chỉnh sửa.
   */
  const updateBankTransfer = (field, value) => {
    setSettings((current) => ({
      ...current,

      bankTransfer: {
        ...(current?.bankTransfer || {}),

        [field]: value,
      },
    }));

    setDirtyBankFields((current) => {
      const next = {
        ...current,
        [field]: true,
      };

      dirtyBankFieldsRef.current = next;

      return next;
    });
  };

  /*
   * Upload QR ngân hàng thực tế.
   *
   * Lưu ý:
   * QR này KHÔNG thay thế QR động của từng đơn hàng.
   * QR động vẫn phải được tạo từ:
   *
   * BIN
   * + số tài khoản
   * + số tiền
   * + nội dung chuyển khoản
   */
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

  /*
   * Lưu cấu hình thanh toán.
   *
   * QUAN TRỌNG:
   * Trước khi lưu, luôn lấy cấu hình mới nhất từ backend.
   *
   * Sau đó:
   * - giữ nguyên các field mới nhất từ backend;
   * - chỉ ghi đè những field mà Admin hiện tại thực sự thay đổi.
   *
   * Điều này tránh Browser B dùng dữ liệu cũ để ghi đè
   * thay đổi mới của Browser A.
   */
  const handleSave = async () => {
    const accountNumber = String(bankTransfer.accountNumber || "")
      .trim()
      .replace(/\s+/g, "");

    const accountName = String(bankTransfer.accountName || "").trim();

    const bankName = String(bankTransfer.bankName || "").trim();

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
       * Lấy cấu hình mới nhất từ backend trước khi save.
       */
      const latestSettings = await fetchPaymentSettings({
        emitEvent: false,
      });

      const latestBankTransfer = latestSettings?.bankTransfer || {};

      /*
       * Bắt đầu từ dữ liệu mới nhất trên backend.
       */
      const mergedBankTransfer = {
        ...latestBankTransfer,
      };

      /*
       * Chỉ ghi đè những field mà Admin hiện tại
       * thực sự đã chỉnh sửa.
       */
      Object.keys(dirtyBankFields).forEach((field) => {
        if (dirtyBankFields[field]) {
          mergedBankTransfer[field] = bankTransfer[field];
        }
      });

      /*
       * Chuẩn hóa lại các giá trị quan trọng.
       */
      const finalBankName = String(mergedBankTransfer.bankName || "").trim();

      const finalBankCode = String(mergedBankTransfer.bankCode || "").trim();

      const finalAccountNumber = String(mergedBankTransfer.accountNumber || "")
        .trim()
        .replace(/\s+/g, "");

      const finalAccountName = String(
        mergedBankTransfer.accountName || ""
      ).trim();

      const finalPrefix = String(
        mergedBankTransfer.transferContentPrefix || ""
      ).trim();

      if (!finalBankName) {
        notifyError("Vui lòng nhập tên ngân hàng.");

        return;
      }

      if (!finalAccountNumber) {
        notifyError("Vui lòng nhập số tài khoản nhận tiền.");

        return;
      }

      if (!finalAccountName) {
        notifyError("Vui lòng nhập tên chủ tài khoản.");

        return;
      }

      if (!finalPrefix) {
        notifyError("Vui lòng nhập tiền tố nội dung chuyển khoản.");

        return;
      }

      /*
       * Kiểm tra và chuẩn hóa ngân hàng theo VietQR.
       */
      const resolvedBank = await resolvePaymentBank({
        bankCode: finalBankCode,
        bankName: finalBankName,
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

      /*
       * Tạo payload cuối cùng.
       *
       * Dữ liệu payment ở đây được xây dựng từ
       * bản mới nhất backend + các thay đổi thực sự
       * của Admin hiện tại.
       */
      const mergedSettings = {
        ...latestSettings,

        bankTransfer: {
          ...mergedBankTransfer,

          enabled: mergedBankTransfer.enabled !== false,

          bankName: finalBankName,

          /*
           * Luôn lưu BIN chuẩn VietQR.
           */
          bankCode: resolvedBank.bin,

          accountNumber: finalAccountNumber,

          accountName: finalAccountName,

          /*
           * QR upload chỉ là QR ngân hàng thực tế/dự phòng.
           *
           * Không dùng QR upload làm QR động của từng đơn.
           */
          qrCodeUrl: String(mergedBankTransfer.qrCodeUrl || "").trim(),

          transferContentPrefix: finalPrefix,

          instructions: String(mergedBankTransfer.instructions || "").trim(),
        },
      };

      const saved = await savePaymentSettings(mergedSettings);

      /*
       * Backend đã lưu thành công.
       *
       * Giữ nguyên dữ liệu backend vừa trả về trên form.
       * Không cho event đồng bộ bên ngoài ghi đè.
       */
      setSettings(saved);

      dirtyBankFieldsRef.current = {};

      setDirtyBankFields({});

      notifySuccess(
        `Đã lưu cấu hình thanh toán. BIN VietQR: ${resolvedBank.bin}.`
      );
    } catch (error) {
      console.error("Không thể lưu cấu hình thanh toán:", error);

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
                  placeholder="HTH"
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
