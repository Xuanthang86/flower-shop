const PAYMENT_SETTINGS_STORAGE_KEY = "flower-shop-payment-settings";

const DEFAULT_PAYMENT_SETTINGS = {
  bankTransfer: {
    enabled: true,

    bankName: "",

    bankCode: "",

    accountNumber: "",

    accountName: "",

    qrCodeUrl: "",

    transferContentPrefix: "FLOWERSHOP",

    instructions:
      "Vui lòng chuyển đúng số tiền và giữ nguyên nội dung chuyển khoản theo thông tin trên.",
  },
};

const clone = (value) => JSON.parse(JSON.stringify(value));

const normalizeSettings = (value = {}) => ({
  ...clone(DEFAULT_PAYMENT_SETTINGS),

  ...(value && typeof value === "object" ? value : {}),

  bankTransfer: {
    ...clone(DEFAULT_PAYMENT_SETTINGS.bankTransfer),

    ...(value?.bankTransfer || {}),
  },
});

const normalizeApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const base = String(configured).replace(/\/+$/, "");

  return base.endsWith("/api") ? base : `${base}/api`;
};

const API_BASE_URL = normalizeApiBaseUrl();

const readStoredPaymentSettings = () => {
  try {
    const raw = localStorage.getItem(PAYMENT_SETTINGS_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    return normalizeSettings(JSON.parse(raw));
  } catch (error) {
    console.warn("Không thể đọc cấu hình thanh toán trong trình duyệt:", error);

    return null;
  }
};

const writeStoredPaymentSettings = (settings) => {
  const normalized = normalizeSettings(settings);

  try {
    localStorage.setItem(
      PAYMENT_SETTINGS_STORAGE_KEY,
      JSON.stringify(normalized)
    );
  } catch (error) {
    const storageError = new Error(
      "Không thể lưu cấu hình thanh toán. Bộ nhớ trình duyệt có thể đã đầy.",
      {
        cause: error,
      }
    );

    console.error("Không thể lưu cấu hình thanh toán:", storageError);

    throw storageError;
  }

  return normalized;
};

const syncPaymentSettingsToBackend = async (paymentSettings) => {
  const normalized = normalizeSettings(paymentSettings);

  let snapshotResponse;

  try {
    snapshotResponse = await fetch(`${API_BASE_URL}/data/snapshot`, {
      method: "GET",

      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch {
    throw new Error(
      "Không thể kết nối backend để đồng bộ cấu hình thanh toán."
    );
  }

  const snapshotPayload = await snapshotResponse.json().catch(() => ({}));

  if (!snapshotResponse.ok) {
    throw new Error(
      snapshotPayload?.message || "Không thể đọc cấu hình website từ backend."
    );
  }

  const currentSnapshot =
    snapshotPayload?.snapshot && typeof snapshotPayload.snapshot === "object"
      ? snapshotPayload.snapshot
      : {};

  const currentSettings =
    currentSnapshot?.settings && typeof currentSnapshot.settings === "object"
      ? currentSnapshot.settings
      : {};

  const nextSettings = {
    ...currentSettings,

    payment: {
      ...(currentSettings.payment || {}),

      ...normalized,
    },
  };

  let saveResponse;

  try {
    saveResponse = await fetch(`${API_BASE_URL}/data/snapshot`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        products: Array.isArray(currentSnapshot.products)
          ? currentSnapshot.products
          : [],

        categories: Array.isArray(currentSnapshot.categories)
          ? currentSnapshot.categories
          : [],

        settings: nextSettings,
      }),
    });
  } catch {
    throw new Error("Không thể kết nối backend để lưu cấu hình thanh toán.");
  }

  const savePayload = await saveResponse.json().catch(() => ({}));

  if (!saveResponse.ok) {
    throw new Error(
      savePayload?.message || "Backend không thể lưu cấu hình thanh toán."
    );
  }

  return normalized;
};

export const readPaymentSettings = () => {
  const stored = readStoredPaymentSettings();

  if (stored) {
    return stored;
  }

  try {
    const rawSiteSettings = localStorage.getItem("flower-shop-site-settings");

    if (rawSiteSettings) {
      const siteSettings = JSON.parse(rawSiteSettings);

      if (siteSettings?.payment && typeof siteSettings.payment === "object") {
        const migrated = normalizeSettings(siteSettings.payment);

        try {
          localStorage.setItem(
            PAYMENT_SETTINGS_STORAGE_KEY,
            JSON.stringify(migrated)
          );
        } catch (storageError) {
          console.warn(
            "Không thể lưu cấu hình thanh toán sau khi migration:",
            storageError
          );
        }

        return migrated;
      }
    }
  } catch (error) {
    console.warn("Không thể migration cấu hình thanh toán cũ:", error);
  }

  return clone(DEFAULT_PAYMENT_SETTINGS);
};

export const savePaymentSettings = async (paymentSettings = {}) => {
  const current = readPaymentSettings();

  const next = normalizeSettings({
    ...current,

    ...paymentSettings,

    bankTransfer: {
      ...current.bankTransfer,

      ...(paymentSettings?.bankTransfer || {}),
    },
  });

  const saved = writeStoredPaymentSettings(next);

  window.dispatchEvent(new Event("flower-shop-payment-settings-updated"));

  window.dispatchEvent(new Event("flower-shop-site-settings-updated"));

  try {
    await syncPaymentSettingsToBackend(saved);
  } catch (error) {
    throw new Error(
      error?.message ||
        "Đã lưu trên trình duyệt nhưng chưa đồng bộ được backend.",
      {
        cause: error,
      }
    );
  }

  return saved;
};

export const buildTransferContent = (
  orderCode,
  bankTransferSettings = DEFAULT_PAYMENT_SETTINGS.bankTransfer
) => {
  const normalizedOrderCode = String(orderCode || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  if (!normalizedOrderCode) {
    return "";
  }

  const prefix = String(bankTransferSettings?.transferContentPrefix || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  return `${prefix}${normalizedOrderCode}`.slice(0, 50);
};

export const buildVietQrUrl = ({
  bankCode,
  accountNumber,
  amount,
  accountName,
  transferContent,
}) => {
  const bank = String(bankCode || "")
    .trim()
    .replace(/\s+/g, "");

  const account = String(accountNumber || "")
    .trim()
    .replace(/\s+/g, "");

  const numericAmount = Math.round(Number(amount) || 0);

  if (!bank || !account || numericAmount <= 0) {
    return "";
  }

  if (account.length > 19) {
    return "";
  }

  const params = new URLSearchParams();

  params.set("amount", String(numericAmount));

  const normalizedTransferContent = String(transferContent || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 50);

  if (normalizedTransferContent) {
    params.set("addInfo", normalizedTransferContent);
  }

  const normalizedAccountName = String(accountName || "")
    .trim()
    .slice(0, 50);

  if (normalizedAccountName) {
    params.set("accountName", normalizedAccountName);
  }

  return `https://img.vietqr.io/image/${encodeURIComponent(
    bank
  )}-${encodeURIComponent(account)}-compact2.png?${params.toString()}`;
};

export const getPaymentSettingsUpdatedEvent =
  "flower-shop-payment-settings-updated";

export const getDefaultPaymentSettings = () => clone(DEFAULT_PAYMENT_SETTINGS);
