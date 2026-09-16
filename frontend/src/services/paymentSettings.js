import {
  DEFAULT_SITE_SETTINGS,
  readSiteSettings,
  saveSiteSettings,
  SITE_SETTINGS_UPDATED_EVENT,
} from "@/services/siteSettings";

export const DEFAULT_PAYMENT_SETTINGS = {
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

export const readPaymentSettings = () => {
  const settings = readSiteSettings();

  return {
    ...clone(DEFAULT_PAYMENT_SETTINGS),

    ...(settings?.payment || {}),

    bankTransfer: {
      ...clone(DEFAULT_PAYMENT_SETTINGS.bankTransfer),

      ...(settings?.payment?.bankTransfer || {}),
    },
  };
};

export const savePaymentSettings = (paymentSettings = {}) => {
  const currentSettings = readSiteSettings();

  const nextPayment = {
    ...clone(DEFAULT_PAYMENT_SETTINGS),

    ...currentSettings?.payment,

    ...paymentSettings,

    bankTransfer: {
      ...clone(DEFAULT_PAYMENT_SETTINGS.bankTransfer),

      ...(currentSettings?.payment?.bankTransfer || {}),

      ...(paymentSettings?.bankTransfer || {}),
    },
  };

  return saveSiteSettings({
    ...currentSettings,

    payment: nextPayment,
  });
};

export const buildTransferContent = (
  orderCode,
  bankTransferSettings = DEFAULT_PAYMENT_SETTINGS.bankTransfer
) => {
  const normalizedOrderCode = String(orderCode || "")
    .trim()
    .toUpperCase();

  if (!normalizedOrderCode) {
    return "";
  }

  const prefix = String(
    bankTransferSettings?.transferContentPrefix || ""
  ).trim();

  if (!prefix) {
    return normalizedOrderCode;
  }

  return `${prefix} ${normalizedOrderCode}`.trim();
};

export const buildVietQrUrl = ({
  bankCode,
  accountNumber,
  amount,
  accountName,
  transferContent,
}) => {
  const bank = String(bankCode || "").trim();

  const account = String(accountNumber || "").trim();

  const numericAmount = Number(amount) || 0;

  if (!bank || !account || numericAmount <= 0) {
    return "";
  }

  const params = new URLSearchParams();

  params.set("amount", String(Math.round(numericAmount)));

  if (transferContent) {
    params.set("addInfo", String(transferContent));
  }

  if (accountName) {
    params.set("accountName", String(accountName));
  }

  return `https://img.vietqr.io/image/${encodeURIComponent(
    bank
  )}-${encodeURIComponent(account)}-compact2.png?${params.toString()}`;
};

export const getPaymentSettingsUpdatedEvent = SITE_SETTINGS_UPDATED_EVENT;

export const getDefaultPaymentSettings = () =>
  clone(DEFAULT_SITE_SETTINGS?.payment || DEFAULT_PAYMENT_SETTINGS);
