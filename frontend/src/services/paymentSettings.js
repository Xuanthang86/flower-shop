const PAYMENT_SETTINGS_STORAGE_KEY = "flower-shop-payment-settings";

const VIETQR_BANKS_API_URL = "https://api.vietqr.io/v2/banks";

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

/* ==========================================================
   VIETQR BANK DATABASE
   ========================================================== */

let vietQrBanksCache = null;

let vietQrBanksPromise = null;

const normalizeLookupText = (value) =>
  String(value || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

const normalizeBankCodeValue = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();

export const loadVietQrBanks = async () => {
  if (Array.isArray(vietQrBanksCache) && vietQrBanksCache.length > 0) {
    return vietQrBanksCache;
  }

  if (vietQrBanksPromise) {
    return vietQrBanksPromise;
  }

  vietQrBanksPromise = fetch(VIETQR_BANKS_API_URL, {
    method: "GET",

    headers: {
      Accept: "application/json",
    },
  })
    .then(async (response) => {
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload?.desc || "Không thể tải danh sách ngân hàng VietQR."
        );
      }

      if (String(payload?.code) !== "00" || !Array.isArray(payload?.data)) {
        throw new Error(
          payload?.desc || "Danh sách ngân hàng VietQR không hợp lệ."
        );
      }

      const banks = payload.data
        .map((bank) => ({
          id: bank?.id,
          name: String(bank?.name || "").trim(),
          code: normalizeBankCodeValue(bank?.code),
          bin: String(bank?.bin || "").replace(/\D/g, ""),
          shortName: normalizeBankCodeValue(bank?.shortName),
          logo: String(bank?.logo || "").trim(),
          transferSupported: Number(bank?.transferSupported) === 1,
          lookupSupported: Number(bank?.lookupSupported) === 1,
        }))
        .filter(
          (bank) => bank.bin.length === 6 && bank.name && bank.transferSupported
        );

      vietQrBanksCache = banks;

      return banks;
    })
    .catch((error) => {
      vietQrBanksPromise = null;

      throw error;
    })
    .finally(() => {
      vietQrBanksPromise = null;
    });

  return vietQrBanksPromise;
};

/**
 * Tìm ngân hàng VietQR chuẩn từ:
 *
 * - BIN
 * - code
 * - shortName
 * - tên ngân hàng
 *
 * Kết quả trả về BIN chuẩn để dùng cho Quick Link.
 */
export const resolveVietQrBank = async (value) => {
  const banks = await loadVietQrBanks();

  const raw = String(value || "").trim();

  if (!raw) {
    return null;
  }

  const normalized = normalizeLookupText(raw);

  const exactBin = banks.find((bank) => bank.bin === raw);

  if (exactBin) {
    return exactBin;
  }

  const exactCode = banks.find(
    (bank) => normalizeLookupText(bank.code) === normalized
  );

  if (exactCode) {
    return exactCode;
  }

  const exactShortName = banks.find(
    (bank) => normalizeLookupText(bank.shortName) === normalized
  );

  if (exactShortName) {
    return exactShortName;
  }

  const exactName = banks.find(
    (bank) => normalizeLookupText(bank.name) === normalized
  );

  if (exactName) {
    return exactName;
  }

  const partialMatch = banks.find((bank) => {
    const bankName = normalizeLookupText(bank.name);
    const bankCode = normalizeLookupText(bank.code);
    const bankShortName = normalizeLookupText(bank.shortName);

    return (
      (bankName && bankName.includes(normalized)) ||
      (normalized && bankName.includes(normalized)) ||
      (bankCode && bankCode === normalized) ||
      (bankShortName && bankShortName === normalized)
    );
  });

  return partialMatch || null;
};

/**
 * Chuẩn hóa bankCode hiện tại thành BIN VietQR.
 *
 * Ưu tiên bankCode.
 * Nếu bankCode không hợp lệ thì thử bankName.
 */
export const resolvePaymentBank = async ({ bankCode, bankName } = {}) => {
  const candidates = [bankCode, bankName]
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  for (const candidate of candidates) {
    const bank = await resolveVietQrBank(candidate);

    if (bank) {
      return bank;
    }
  }

  return null;
};

/* ==========================================================
   VIETQR QUICK LINK
   ========================================================== */

export const buildVietQrUrl = ({
  bankCode,
  accountNumber,
  amount,
  accountName,
  transferContent,
}) => {
  const normalizedBankCode = String(bankCode || "")
    .trim()
    .replace(/\s+/g, "");

  const normalizedAccountNumber = String(accountNumber || "")
    .trim()
    .replace(/\s+/g, "");

  const numericAmount = Math.round(Number(amount) || 0);

  if (!normalizedBankCode || !normalizedAccountNumber || numericAmount <= 0) {
    return "";
  }

  /*
   * Sau khi v19.2:
   *
   * Checkout/Admin phải truyền BIN 6 số đã được
   * resolve từ VietQR Bank Database.
   *
   * Không cho phép mã ngân hàng tùy ý đi vào QR động.
   */
  if (!/^\d{6}$/.test(normalizedBankCode)) {
    return "";
  }

  /*
   * VietQR Quick Link hỗ trợ account number / alias /
   * virtual account và giới hạn tối đa 19 ký tự.
   */
  if (
    normalizedAccountNumber.length < 6 ||
    normalizedAccountNumber.length > 19
  ) {
    return "";
  }

  const bankId = encodeURIComponent(normalizedBankCode);

  const accountNo = encodeURIComponent(normalizedAccountNumber);

  const params = new URLSearchParams();

  params.set("amount", String(numericAmount));

  const normalizedTransferContent = String(transferContent || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "D")
    .replace(/[^A-Z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 50);

  if (normalizedTransferContent) {
    params.set("addInfo", normalizedTransferContent);
  }

  const normalizedAccountName = String(accountName || "")
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "D")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .toUpperCase()
    .slice(0, 50);

  if (normalizedAccountName) {
    params.set("accountName", normalizedAccountName);
  }

  return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?${params.toString()}`;
};

export const getPaymentSettingsUpdatedEvent =
  "flower-shop-payment-settings-updated";

export const getDefaultPaymentSettings = () => clone(DEFAULT_PAYMENT_SETTINGS);
