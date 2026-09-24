const Product = require("../models/Product");

const slugify = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizePayload = (payload = {}) => ({
  name: String(payload.name || "").trim(),
  slug: slugify(payload.slug || payload.name),
  categoryId: payload.categoryId || undefined,
  categorySlug: String(payload.categorySlug || "").trim(),
  price: Math.max(0, Number(payload.price) || 0),
  oldPrice: Math.max(0, Number(payload.oldPrice) || 0),
  badge: String(payload.badge || "").trim(),
  image: String(payload.image || payload.imageUrl || "").trim(),
  description: String(payload.description || "").trim(),
  salesCount: Math.max(0, Number(payload.salesCount || payload.sold || 0)),
  stockQuantity: Math.max(0, Math.floor(Number(payload.stockQuantity ?? payload.stock ?? 0) || 0)),
  isNew: Boolean(payload.isNew),
  active: payload.active !== false && payload.disabled !== true,
  seoTitle: String(payload.seoTitle || "").trim(),
  seoDescription: String(payload.seoDescription || "").trim(),
  imageAlt: String(payload.imageAlt || "").trim(),
});

const list = async ({ page = 1, limit = 50, includeInactive = false } = {}) => {
  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.min(200, Math.max(1, Number(limit) || 50));
  const filter = includeInactive ? {} : { active: true };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { items, total, page: safePage, limit: safeLimit };
};

const getById = async (id) => {
  const item = await Product.findById(id).lean();
  if (!item) throw Object.assign(new Error("Không tìm thấy sản phẩm."), { status: 404 });
  return item;
};

const create = async (payload) => Product.create(normalizePayload(payload));

const update = async (id, payload) => {
  const updated = await Product.findByIdAndUpdate(
    id,
    { $set: normalizePayload(payload) },
    { new: true, runValidators: true },
  ).lean();

  if (!updated) throw Object.assign(new Error("Không tìm thấy sản phẩm."), { status: 404 });
  return updated;
};

const remove = async (id) => {
  const updated = await Product.findByIdAndUpdate(
    id,
    { $set: { active: false } },
    { new: true },
  ).lean();

  if (!updated) throw Object.assign(new Error("Không tìm thấy sản phẩm."), { status: 404 });
  return updated;
};

module.exports = { slugify, normalizePayload, list, getById, create, update, remove };
