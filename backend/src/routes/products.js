const express = require("express");
const { body } = require("express-validator");
const requireAuth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const service = require("../services/productService");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    res.json({ success: true, ...(await service.list({
      page: req.query.page,
      limit: req.query.limit,
      includeInactive: String(req.query.includeInactive) === "true",
    })) });
  } catch (error) { next(error); }
});

router.get("/:id", async (req, res, next) => {
  try { res.json({ success: true, item: await service.getById(req.params.id) }); }
  catch (error) { next(error); }
});

router.post("/", requireAuth, authorize("admin", "manager", "product_manager"),
  body("name").notEmpty().withMessage("Tên sản phẩm là bắt buộc."),
  body("price").isFloat({ min: 0 }).withMessage("Giá sản phẩm không hợp lệ."),
  validate,
  async (req, res, next) => {
    try { res.status(201).json({ success: true, item: await service.create(req.body) }); }
    catch (error) { next(error); }
  },
);

router.patch("/:id", requireAuth, authorize("admin", "manager", "product_manager"), async (req, res, next) => {
  try { res.json({ success: true, item: await service.update(req.params.id, req.body) }); }
  catch (error) { next(error); }
});

router.delete("/:id", requireAuth, authorize("admin", "manager", "product_manager"), async (req, res, next) => {
  try { res.json({ success: true, item: await service.remove(req.params.id) }); }
  catch (error) { next(error); }
});

module.exports = router;
