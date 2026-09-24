const express = require("express");

const Address = require("../models/Address");
const requireAuth = require("../middleware/auth");

const router = express.Router();

/*
 * Các field frontend được phép PATCH.
 *
 * Tuyệt đối không nhận:
 * - _id
 * - userId
 * - createdAt
 * - updatedAt
 * - __v
 */
const ADDRESS_PATCH_FIELDS = [
  "recipientName",
  "phone",
  "email",
  "provinceCode",
  "provinceName",
  "wardCode",
  "wardName",
  "houseNumber",
  "street",
  "note",
  "isDefault",
];

const buildPatchPayload = (payload = {}) => {
  const update = {};

  for (const field of ADDRESS_PATCH_FIELDS) {
    if (payload[field] === undefined) {
      continue;
    }

    if (field === "isDefault") {
      update[field] = Boolean(payload[field]);

      continue;
    }

    update[field] = String(payload[field] ?? "").trim();
  }

  return update;
};

/* ============================================================
 * GET /api/addresses
 * ============================================================ */

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const items = await Address.find({
      userId: req.user._id,
    })
      .sort({
        isDefault: -1,
        createdAt: -1,
      })
      .lean();

    return res.json({
      success: true,
      items,
    });
  } catch (error) {
    next(error);
  }
});

/* ============================================================
 * POST /api/addresses
 * ============================================================ */

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const payload = req.body || {};

    const item = await Address.create({
      userId: req.user._id,

      recipientName: String(
        payload.recipientName || payload.fullName || "",
      ).trim(),

      phone: String(payload.phone || "").trim(),

      email: String(payload.email || "").trim(),

      provinceCode: String(payload.provinceCode || "").trim(),

      provinceName: String(
        payload.provinceName || payload.province || "",
      ).trim(),

      wardCode: String(payload.wardCode || "").trim(),

      wardName: String(payload.wardName || payload.ward || "").trim(),

      houseNumber: String(payload.houseNumber || "").trim(),

      street: String(payload.street || payload.streetName || "").trim(),

      note: String(payload.note || "").trim(),

      isDefault: Boolean(payload.isDefault),
    });

    /*
     * Nếu địa chỉ mới là mặc định,
     * bỏ mặc định của các địa chỉ còn lại.
     */
    if (item.isDefault) {
      await Address.updateMany(
        {
          userId: req.user._id,
          _id: {
            $ne: item._id,
          },
        },
        {
          $set: {
            isDefault: false,
          },
        },
      );
    }

    return res.status(201).json({
      success: true,
      item,
    });
  } catch (error) {
    next(error);
  }
});

/* ============================================================
 * PATCH /api/addresses/:id
 *
 * NỘI DUNG 18 — FIX FINAL
 * ============================================================ */

router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const update = buildPatchPayload(req.body || {});

    if (!Object.keys(update).length) {
      return res.status(400).json({
        success: false,
        message: "Không có dữ liệu hợp lệ để cập nhật địa chỉ.",
      });
    }

    const item = await Address.findOneAndUpdate(
      {
        _id: req.params.id,

        /*
         * Ownership bắt buộc.
         */
        userId: req.user._id,
      },

      {
        $set: update,
      },

      {
        new: true,

        runValidators: true,
      },
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa chỉ.",
      });
    }

    if (item.isDefault) {
      await Address.updateMany(
        {
          userId: req.user._id,

          _id: {
            $ne: item._id,
          },
        },

        {
          $set: {
            isDefault: false,
          },
        },
      );
    }

    return res.json({
      success: true,
      item,
    });
  } catch (error) {
    next(error);
  }
});

/* ============================================================
 * DELETE /api/addresses/:id
 * ============================================================ */

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const result = await Address.deleteOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!result.deletedCount) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa chỉ.",
      });
    }

    return res.json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
