const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const getTransporter = () => {
  const host = String(process.env.SMTP_HOST || "").trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = String(process.env.SMTP_USER || "").trim();
  const pass = String(process.env.SMTP_PASS || "").trim();

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    auth: {
      user,
      pass,
    },
  });
};

const getNotificationEmail = async () => {
  const configured = String(process.env.EMAIL_NOTIFICATION_TO || "")
    .trim()
    .toLowerCase();

  const SharedSnapshot = mongoose.models.SharedSnapshot;

  if (!SharedSnapshot) {
    return configured;
  }

  try {
    const snapshot = await SharedSnapshot.findOne({
      key: "main",
    }).lean();

    const configuredInSettings = String(
      snapshot?.settings?.notifications?.orderEmail || "",
    )
      .trim()
      .toLowerCase();

    return configuredInSettings || configured;
  } catch (error) {
    console.warn("[email] Không thể đọc email nhận thông báo:", error);

    return configured;
  }
};

const formatMoney = (value) =>
  `${Math.round(Number(value) || 0).toLocaleString("vi-VN")}đ`;

const formatVietnamDateTime = (value) => {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",

    year: "numeric",

    month: "2-digit",

    day: "2-digit",

    hour: "2-digit",

    minute: "2-digit",

    second: "2-digit",

    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);

  const result = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      result[part.type] = part.value;
    }
  });

  return `${result.day}/${result.month}/${result.year} ${result.hour}:${result.minute}:${result.second}`;
};

const formatVietnamDate = (value) => {
  if (!value) {
    return "";
  }

  const raw = String(value).trim();

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (iso) {
    return `${iso[3]}/${iso[2]}/${iso[1]}`;
  }

  return formatVietnamDateTime(value).split(" ")[0];
};

const formatDeliveryTimeSlot = (value) => {
  const raw = String(value || "").trim();

  if (!raw) {
    return "";
  }

  const match = raw.match(
    /^(\d{1,2})(?::\d{2})?\s*[-–]\s*(\d{1,2})(?::\d{2})?$/,
  );

  if (!match) {
    return raw;
  }

  const [, start, end] = match;

  return `Từ ${Number(start)} giờ đến ${Number(end)} giờ`;
};

const getPaymentDescription = (order) => {
  if (order?.paymentMethod !== "bank_transfer") {
    return "Thanh toán khi nhận hàng";
  }

  const depositPercent = Number(order?.paymentDepositPercent) === 50 ? 50 : 100;

  const depositAmount = Math.max(0, Number(order?.paymentDepositAmount) || 0);

  const remainingAmount = Math.max(
    0,
    Number(order?.paymentRemainingAmount) || 0,
  );

  if (depositPercent === 50) {
    return `Đã thanh toán trước 50% — ${formatMoney(
      depositAmount,
    )}; còn lại ${formatMoney(remainingAmount)} khi nhận hoa.`;
  }

  return `Đã thanh toán 100% — ${formatMoney(depositAmount)}.`;
};

const getFullRecipientAddress = (recipient = {}) => {
  const parts = [
    recipient.houseNumber,
    recipient.street,
    recipient.wardName,
    recipient.provinceName,
  ]
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  return parts.join(", ");
};

const getStatusLabel = (status) => {
  const labels = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    processing: "Đang chuẩn bị",
    shipping: "Đang giao",
    delivered: "Đã giao",
    cancelled: "Đã hủy",
  };

  return labels[status] || status || "";
};

const buildOrderRows = (order) => {
  const items = Array.isArray(order?.items) ? order.items : [];

  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border:1px solid #eee;">
            ${String(item.productName || "Sản phẩm")}
          </td>
          <td style="padding:8px;border:1px solid #eee;text-align:center;">
            ${Number(item.quantity) || 0}
          </td>
          <td style="padding:8px;border:1px solid #eee;text-align:right;">
            ${formatMoney(item.unitPrice)}
          </td>
          <td style="padding:8px;border:1px solid #eee;text-align:right;">
            ${formatMoney(item.subtotal)}
          </td>
        </tr>
      `,
    )
    .join("");
};

const buildOrderHtml = (order, title) => {
  const sender = order?.senderSnapshot || {};
  const recipient = order?.recipientSnapshot || {};
  const customer = order?.customerSnapshot || {};

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333;">
      <h2 style="color:#db2777;">
        ${title}
      </h2>

      <p>
        <strong>Mã đơn hàng:</strong>
        ${order?.orderCode || ""}
      </p>

      <p>
        <strong>Trạng thái:</strong>
        ${getStatusLabel(order?.status)}
      </p>

      <p>
        <strong>Thời gian đặt:</strong>
        ${formatDateTime(order?.createdAt)}
      </p>

      <hr />

      <h3>Thông tin người gửi</h3>

      <p>
        ${sender.fullName || customer.fullName || ""}<br />
        ${sender.phone || customer.phone || ""}<br />
        ${sender.email || customer.email || ""}
      </p>

      <h3>Thông tin người nhận</h3>

      <p>
        ${recipient.fullName || ""}<br />
        ${recipient.phone || ""}<br />
        ${recipient.email || ""}
      </p>

      <p>
        ${recipient.houseNumber || ""}
        ${recipient.street || ""}<br />
        ${recipient.wardName || ""}<br />
        ${recipient.provinceName || ""}
      </p>

      <h3>Sản phẩm</h3>

      <table
        style="width:100%;border-collapse:collapse;"
      >
        <thead>
          <tr>
            <th style="padding:8px;border:1px solid #eee;text-align:left;">
              Sản phẩm
            </th>
            <th style="padding:8px;border:1px solid #eee;">
              SL
            </th>
            <th style="padding:8px;border:1px solid #eee;">
              Đơn giá
            </th>
            <th style="padding:8px;border:1px solid #eee;">
              Thành tiền
            </th>
          </tr>
        </thead>

        <tbody>
          ${buildOrderRows(order)}
        </tbody>
      </table>

      <p>
        <strong>Tạm tính:</strong>
        ${formatMoney(order?.subtotal)}
      </p>

      <p>
        <strong>Giảm giá:</strong>
        ${formatMoney(order?.discount)}
      </p>

      <p>
        <strong>Phí giao hàng:</strong>
        ${formatMoney(order?.shippingFee)}
      </p>

      <p style="font-size:18px;">
        <strong>Tổng cộng:</strong>
        ${formatMoney(order?.grandTotal)}
      </p>

      <p>
        <strong>Hình thức thanh toán:</strong>
        ${
          order?.paymentMethod === "bank_transfer"
            ? "Chuyển khoản"
            : "Thanh toán khi nhận hàng"
        }
      </p>

      <p>
        <strong>Ngày giao:</strong>
        ${order?.deliveryDate ? formatDateTime(order.deliveryDate) : ""}
      </p>

      <p>
        <strong>Khung giờ:</strong>
        ${order?.deliveryTimeSlot || ""}
      </p>

      ${order?.notes ? `<p><strong>Ghi chú:</strong> ${order.notes}</p>` : ""}
    </div>
  `;
};

const sendOrderEmail = async ({ order, subject, title }) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn("[email] SMTP chưa được cấu hình. Bỏ qua gửi email.");

    return {
      sent: false,
      skipped: true,
    };
  }

  const to = await getNotificationEmail();

  if (!to) {
    console.warn("[email] Chưa cấu hình email nhận thông báo.");

    return {
      sent: false,
      skipped: true,
    };
  }

  const from =
    String(process.env.SMTP_FROM || "").trim() ||
    String(process.env.SMTP_USER || "").trim();

  if (!from) {
    console.warn("[email] Chưa cấu hình SMTP_FROM.");

    return {
      sent: false,
      skipped: true,
    };
  }

  await transporter.sendMail({
    from,
    to,
    subject,
    html: buildOrderHtml(order, title),
  });

  return {
    sent: true,
    skipped: false,
  };
};

const sendNewOrderNotification = async (order) => {
  try {
    return await sendOrderEmail({
      order,
      subject: `Đơn hàng mới ${order?.orderCode || ""}`,
      title: "Có đơn hàng mới",
    });
  } catch (error) {
    console.error("[email] Không thể gửi email đơn hàng mới:", error);

    return {
      sent: false,
      skipped: false,
      error: error?.message || String(error),
    };
  }
};

const sendOrderStatusNotification = async (order) => {
  try {
    return await sendOrderEmail({
      order,
      subject: `Cập nhật trạng thái đơn hàng ${order?.orderCode || ""}`,
      title: `Đơn hàng ${order?.orderCode || ""} đã cập nhật trạng thái`,
    });
  } catch (error) {
    console.error("[email] Không thể gửi email cập nhật trạng thái:", error);

    return {
      sent: false,
      skipped: false,
      error: error?.message || String(error),
    };
  }
};

module.exports = {
  sendNewOrderNotification,
  sendOrderStatusNotification,
};
