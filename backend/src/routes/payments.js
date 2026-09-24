const express = require("express");
const crypto = require("crypto");
const requireAuth = require("../middleware/auth");
const { createIntent, getIntent, markStarted, applySePayWebhook } = require("../services/paymentService");

const router = express.Router();

const verifyWebhook = (req) => {
  const secret = String(process.env.SEPAY_WEBHOOK_SECRET || "").trim();
  if (!secret) return true;

  const signature = String(req.headers["x-sepay-signature"] || req.headers["x-signature"] || "").trim();
  if (!signature) return false;

  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));
  const expected = crypto.createHmac("sha256", secret).update(raw).digest("hex");
  const normalized = signature.replace(/^sha256=/i, "");
  return normalized.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(normalized), Buffer.from(expected));
};

router.post("/intents", async (req, res, next) => {
  try {
    const intent = await createIntent({ amount: req.body.amount });
    res.status(201).json({ success: true, paymentIntent: {
      id: intent.intentId,
      orderCode: intent.orderCode,
      amount: intent.amount,
      currency: intent.currency,
      status: intent.status,
      expiresAt: intent.expiresAt,
    }});
  } catch (error) { next(error); }
});

router.post("/intents/:intentId/started", async (req, res, next) => {
  try { res.json({ success: true, paymentIntent: await markStarted(req.params.intentId) }); }
  catch (error) { next(error); }
});

router.get("/intents/:intentId", async (req, res, next) => {
  try { res.json({ success: true, paymentIntent: await getIntent(req.params.intentId) }); }
  catch (error) { next(error); }
});

router.post("/webhooks/sepay", async (req, res, next) => {
  try {
    if (!verifyWebhook(req)) return res.status(401).json({ success: false, message: "Webhook signature không hợp lệ." });
    const payload = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString("utf8") || "{}") : req.body;
    const result = await applySePayWebhook(payload);
    res.json({ success: true, ...result });
  } catch (error) { next(error); }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try {
    const Payment = require("../models/Payment");
    const payment = await Payment.findById(req.params.id).lean();
    if (!payment) return res.status(404).json({ success: false, message: "Không tìm thấy thanh toán." });
    res.json({ success: true, item: payment });
  } catch (error) { next(error); }
});

module.exports = router;
