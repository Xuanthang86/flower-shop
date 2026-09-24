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
    if (req.body.name !== undefined || req.body.fullName !== undefined) updates.name = String(req.body.name ?? req.body.fullName ?? "").trim();
    if (req.body.phone !== undefined) updates.phone = String(req.body.phone || "").trim();
    if (req.body.avatar !== undefined) updates.avatar = String(req.body.avatar || "").trim();

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });
    res.json({ success: true, user: sanitizeUser(user) });
  } catch (error) { next(error); }
});

router.get("/", requireAuth, authorize("admin", "manager"), async (req, res, next) => {
  try {
    const users = await User.find({}).select("-passwordHash").sort({ createdAt: -1 }).lean();
    res.json({ success: true, items: users });
  } catch (error) { next(error); }
});

router.patch("/:id", requireAuth, authorize("admin"), async (req, res, next) => {
  try {
    const allowed = ["name", "phone", "avatar", "role", "disabled", "emailVerified"];
    const update = {};
    for (const key of allowed) if (req.body[key] !== undefined) update[key] = req.body[key];

    const user = await User.findByIdAndUpdate(req.params.id, { $set: update }, { new: true, runValidators: true }).select("-passwordHash");
    if (!user) return res.status(404).json({ success: false, message: "Không tìm thấy người dùng." });
    res.json({ success: true, user });
  } catch (error) { next(error); }
});

module.exports = router;
