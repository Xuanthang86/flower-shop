const express = require("express");
const crypto = require("crypto");

const requireAuth = require("../middleware/auth");

const {
  createIntent,
  getIntent,
  markStarted,
  applySePayWebhook,
} = require("../services/paymentService");

const Payment = require("../models/Payment");
const Order = require("../models/Order");

const router = express.Router();

const isStaff = (user) =>
  ["admin", "manager"].includes(String(user?.role || ""));

const verifyWebhook = (req) => {
  const secret = String(process.env.SEPAY_WEBHOOK_SECRET || "").trim();

  if (!secret) {
    return true;
  }

  const signature = String(
    req.headers["x-sepay-signature"] || req.headers["x-signature"] || "",
  ).trim();

  if (!signature) {
    return false;
  }

  const raw = Buffer.isBuffer(req.body)
    ? req.body
    : Buffer.from(JSON.stringify(req.body || {}));

  const expected = crypto
    .createHmac("sha256", secret)
    .update(raw)
    .digest("hex");

  const normalized = signature.replace(/^sha256=/i, "");

  return (
    normalized.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(normalized), Buffer.from(expected))
  );
};

/*
 * POST /api/payments/intents
 *
 * PaymentIntent luôn phải thuộc một Order
 * đã tồn tại và thuộc User hiện tại.
 */
router.post("/intents", requireAuth, async (req, res, next) => {
  try {
    const intent = await createIntent({
      depositPercent: req.body?.depositPercent,

      draft: req.body?.draft,

      checkoutSignature: req.body?.checkoutSignature,

      user: req.user,
    });

    res.status(201).json({
      success: true,
      paymentIntent: require("../services/paymentService").serializeIntent(
        intent,
      ),
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/intents/:intentId/started",
  requireAuth,
  async (req, res, next) => {
    try {
      res.json({
        success: true,
        paymentIntent: await markStarted(req.params.intentId, req.user),
      });
    } catch (error) {
      next(error);
    }
  },
);

router.post("/intents/:intentId/order", requireAuth, async (req, res, next) => {
  try {
    const order = await finalizePaidBankTransferOrder(
      req.params.intentId,
      req.user,
    );

    res.status(201).json({
      success: true,

      order,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/intents/:intentId", requireAuth, async (req, res, next) => {
  try {
    res.json({
      success: true,
      paymentIntent: await getIntent(req.params.intentId, req.user),
    });
  } catch (error) {
    next(error);
  }
});

/*
 * Webhook là server-to-server.
 * Không dùng requireAuth vì SePay không có
 * user session của khách hàng.
 */
router.post("/webhooks/sepay", async (req, res, next) => {
  try {
    if (!verifyWebhook(req)) {
      return res.status(401).json({
        success: false,
        message: "Webhook signature không hợp lệ.",
      });
    }

    const payload = Buffer.isBuffer(req.body)
      ? JSON.parse(req.body.toString("utf8") || "{}")
      : req.body;

    const result = await applySePayWebhook(payload);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
});

/*
 * GET /api/payments/:id
 *
 * Payment chỉ được đọc bởi:
 * - chính Customer sở hữu Order
 * - Admin / Manager
 */
router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).lean();

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy thanh toán.",
      });
    }

    const order = await Order.findById(payment.orderId)
      .select("customerId")
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng của thanh toán.",
      });
    }

    const ownsOrder =
      String(order.customerId || "") === String(req.user._id || "");

    if (!ownsOrder && !isStaff(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem thanh toán này.",
      });
    }

    res.json({
      success: true,
      item: payment,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
