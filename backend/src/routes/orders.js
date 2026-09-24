const express = require("express");
const requireAuth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const service = require("../services/orderService");

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    res.json({ success: true, ...(await service.list({
      user: req.user,
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
    })) });
  } catch (error) { next(error); }
});

router.post("/", async (req, res, next) => {
  try {
    const result = await service.create({ payload: req.body, user: req.user || null });
    res.status(201).json({ success: true, ...result });
  } catch (error) { next(error); }
});

router.get("/:id", requireAuth, async (req, res, next) => {
  try { res.json({ success: true, item: await service.getById(req.params.id, req.user) }); }
  catch (error) { next(error); }
});

router.patch("/:id/status", requireAuth, authorize("admin", "manager"), async (req, res, next) => {
  try {
    res.json({
      success: true,
      item: await service.updateStatus(req.params.id, req.body.status, req.body.paymentStatus),
    });
  } catch (error) { next(error); }
});

module.exports = router;
