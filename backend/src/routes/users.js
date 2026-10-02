const express = require("express");
const bcrypt = require("bcrypt");
const { body } = require("express-validator");
const User = require("../models/User");
const requireAuth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const validate = require("../middleware/validate");
const { sanitizeUser } = require("../services/authService");

const router = express.Router();

router.get("/me", requireAuth, (req, res) => {
  res.json({ success: true, user: sanitizeUser(req.user) });
});

router.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.name !== undefined || req.body.fullName !== undefined)
      updates.name = String(req.body.name ?? req.body.fullName ?? "").trim();
    if (req.body.phone !== undefined)
      updates.phone = String(req.body.phone || "").trim();
    if (req.body.avatar !== undefined)
      updates.avatar = String(req.body.avatar || "").trim();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true },
    );
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/",
  requireAuth,
  authorize("admin", "manager"),
  async (req, res, next) => {
    try {
      const users = await User.find({})
        .select("-passwordHash")
        .sort({ createdAt: -1 })
        .lean();
      res.json({ success: true, items: users });
    } catch (error) {
      next(error);
    }
  },
);

router.post("/", requireAuth, authorize("admin"), async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!["manager", "product_manager"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Chỉ được tạo tài khoản Manager hoặc Product Manager.",
      });
    }

    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    const exists = await User.findOne({
      $or: [
        { email: normalizedEmail },
        {
          phone: String(phone || "").trim(),
        },
      ],
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "Email hoặc số điện thoại đã được sử dụng.",
      });
    }

    const passwordHash = await bcrypt.hash(String(password || ""), 12);

    const user = await User.create({
      name: String(name || "").trim(),

      email: normalizedEmail,

      phone: String(phone || "").trim(),

      passwordHash,

      role,

      provider: "local",

      emailVerified: false,

      disabled: false,
    });

    res.status(201).json({
      success: true,
      user: sanitizeUser(user),
      message: "Tạo tài khoản thành công.",
    });
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/:id",
  requireAuth,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const allowed = [
        "name",
        "phone",
        "avatar",
        "role",
        "disabled",
        "emailVerified",
      ];
      const update = {};
      for (const key of allowed)
        if (req.body[key] !== undefined) update[key] = req.body[key];

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: update },
        { new: true, runValidators: true },
      ).select("-passwordHash");
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "Không tìm thấy người dùng." });
      res.json({ success: true, user });
    } catch (error) {
      next(error);
    }
  },
);

router.patch(
  "/:id/password",
  requireAuth,
  authorize("admin"),
  async (req, res, next) => {
    try {
      const password = String(req.body?.password || "");

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu phải có ít nhất 8 ký tự.",
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const user = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            passwordHash,
            resetCodeHash: "",
            resetCodeExpiresAt: null,
            resetRequestedAt: null,
          },
        },
        {
          new: true,
        },
      ).select("-passwordHash");

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng.",
        });
      }

      res.json({
        success: true,
        user,
        message: "Đã đặt lại mật khẩu tài khoản.",
      });
    } catch (error) {
      next(error);
    }
  },
);

router.delete(
  "/:id",
  requireAuth,
  authorize("admin"),
  async (req, res, next) => {
    try {
      if (String(req.params.id) === String(req.user._id)) {
        return res.status(400).json({
          success: false,
          message: "Không thể tự xóa tài khoản đang đăng nhập.",
        });
      }

      const target = await User.findById(req.params.id);

      if (!target) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người dùng.",
        });
      }

      if (target.role === "admin") {
        return res.status(400).json({
          success: false,
          message: "Không thể xóa tài khoản Admin.",
        });
      }

      await User.deleteOne({
        _id: req.params.id,
      });

      res.json({
        success: true,
        message: "Đã xóa tài khoản.",
      });
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
