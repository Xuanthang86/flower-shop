const express = require("express");
const requireAuth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const service = require("../services/couponService");

const router = express.Router();

router.post("/validate", requireAuth, async (req, res, next) => {
  try {
    const result = await service.validateCoupon({
      code: req.body.code,
      subtotal: req.body.subtotal,
      userId: req.user._id,
    });
    res.json({ success: true, code: result.code, discount: result.discount, coupon: result.coupon });
  } catch (error) { next(error); }
});

router.get("/", requireAuth, authorize("admin", "manager"), async (req, res, next) => {
  try { res.json({ success: true, items: await service.list() }); }
  catch (error) { next(error); }
});

router.post("/", requireAuth, authorize("admin", "manager"), async (req, res, next) => {
  try { res.status(201).json({ success: true, item: await service.create(req.body) }); }
  catch (error) { next(error); }
});

router.patch("/:id", requireAuth, authorize("admin", "manager"), async (req, res, next) => {
  try { res.json({ success: true, item: await service.update(req.params.id, req.body) }); }
  catch (error) { next(error); }
});

module.exports = router;
