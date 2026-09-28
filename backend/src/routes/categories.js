const express = require("express");
const Category = require("../models/Category");
const requireAuth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const { slugify } = require("../services/productService");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const filter =
      String(req.query.includeInactive) === "true" ? {} : { active: true };
    const items = await Category.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .lean();
    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const item = await Category.findById(req.params.id).lean();
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy danh mục." });
    res.json({ success: true, item });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  requireAuth,
  authorize("admin", "manager", "product_manager"),
  async (req, res, next) => {
    try {
      const item = await Category.create({
        ...req.body,
        name: String(req.body.name || "").trim(),
        slug: slugify(req.body.slug || req.body.name),
      });
      res.status(201).json({ success: true, item });
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/:id",
  requireAuth,
  authorize("admin", "manager", "product_manager"),
  async (req, res, next) => {
    try {
      const allowedFields = [
        "name",
        "slug",
        "description",
        "image",
        "active",
        "showOnHome",
        "sortOrder",
        "seoTitle",
        "seoDescription",
      ];

      const update = {};

      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          update[field] = req.body[field];
        }
      }

      if (update.name !== undefined) {
        update.name = String(update.name).trim();
      }

      if (update.slug !== undefined || update.name !== undefined) {
        update.slug = slugify(update.slug || update.name);
      }

      if (update.description !== undefined) {
        update.description = String(update.description || "");
      }

      if (update.image !== undefined) {
        update.image = String(update.image || "");
      }

      if (update.active !== undefined) {
        update.active = Boolean(update.active);
      }

      if (update.showOnHome !== undefined) {
        update.showOnHome = Boolean(update.showOnHome);
      }

      if (update.sortOrder !== undefined) {
        update.sortOrder = Number(update.sortOrder) || 0;
      }

      if (update.seoTitle !== undefined) {
        update.seoTitle = String(update.seoTitle || "").trim();
      }

      if (update.seoDescription !== undefined) {
        update.seoDescription = String(update.seoDescription || "").trim();
      }

      if (!Object.keys(update).length) {
        return res.status(400).json({
          success: false,
          message: "Không có trường hợp lệ để cập nhật.",
        });
      }

      const item = await Category.findByIdAndUpdate(
        req.params.id,
        { $set: update },
        {
          new: true,
          runValidators: true,
        },
      ).lean();

      if (!item) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục.",
        });
      }

      res.json({
        success: true,
        item,
      });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/:id",
  requireAuth,
  authorize("admin", "manager", "product_manager"),
  async (req, res, next) => {
    try {
      const item = await Category.findByIdAndUpdate(
        req.params.id,
        { $set: { active: false } },
        { new: true },
      ).lean();
      if (!item)
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy danh mục." });
      res.json({ success: true, item });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
