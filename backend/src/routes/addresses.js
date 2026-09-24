const express = require("express");
const Address = require("../models/Address");
const requireAuth = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const items = await Address.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 }).lean();
    res.json({ success: true, items });
  } catch (error) { next(error); }
});

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const payload = req.body || {};
    const item = await Address.create({
      userId: req.user._id,
      recipientName: String(payload.recipientName || payload.fullName || "").trim(),
      phone: String(payload.phone || "").trim(),
      addressLine: String(payload.addressLine || payload.address || "").trim(),
      ward: String(payload.ward || payload.wardName || "").trim(),
      district: String(payload.district || payload.districtName || "").trim(),
      province: String(payload.province || payload.provinceName || "").trim(),
      note: String(payload.note || "").trim(),
      isDefault: Boolean(payload.isDefault),
    });

    if (item.isDefault) {
      await Address.updateMany({ userId: req.user._id, _id: { $ne: item._id } }, { $set: { isDefault: false } });
    }
    res.status(201).json({ success: true, item });
  } catch (error) { next(error); }
});

router.patch("/:id", requireAuth, async (req, res, next) => {
  try {
    const item = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body || {} },
      { new: true, runValidators: true },
    );
    if (!item) return res.status(404).json({ success: false, message: "Không tìm thấy địa chỉ." });
    if (item.isDefault) await Address.updateMany({ userId: req.user._id, _id: { $ne: item._id } }, { $set: { isDefault: false } });
    res.json({ success: true, item });
  } catch (error) { next(error); }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const result = await Address.deleteOne({ _id: req.params.id, userId: req.user._id });
    if (!result.deletedCount) return res.status(404).json({ success: false, message: "Không tìm thấy địa chỉ." });
    res.json({ success: true });
  } catch (error) { next(error); }
});

module.exports = router;
