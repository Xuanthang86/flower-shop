const mongoose = require("mongoose");

const Product = require("../models/Product");

const slugify = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeCreatePayload = (payload = {}) => ({
  name: String(payload.name || "").trim(),

  slug: slugify(payload.slug || payload.name),

  categoryId: payload.categoryId || undefined,

  categorySlug: String(payload.categorySlug || "").trim(),

  price: Math.max(0, Number(payload.price) || 0),

  priceType: payload.priceType === "contact" ? "contact" : "fixed",

  oldPrice: Math.max(0, Number(payload.oldPrice) || 0),

  badge: String(payload.badge || "").trim(),

  image: String(payload.image || payload.imageUrl || "").trim(),

  description: String(payload.description || "").trim(),

  salesCount: Math.max(0, Number(payload.salesCount || payload.sold || 0)),

  stockQuantity: Math.max(
    0,
    Math.floor(Number(payload.stockQuantity ?? payload.stock ?? 0) || 0),
  ),

  isNew: Boolean(payload.isNew),

  active: payload.active !== false && payload.disabled !== true,

  seoTitle: String(payload.seoTitle || "").trim(),

  seoDescription: String(payload.seoDescription || "").trim(),

  imageAlt: String(payload.imageAlt || "").trim(),
});

const PRODUCT_PATCH_FIELDS = [
  "name",
  "slug",
  "categoryId",
  "categorySlug",
  "price",
  "priceType",
  "oldPrice",
  "badge",
  "image",
  "description",
  "salesCount",
  "stockQuantity",
  "isNew",
  "active",
  "seoTitle",
  "seoDescription",
  "imageAlt",
];

const normalizePatchPayload = (payload = {}) => {
  const update = {};

  for (const field of PRODUCT_PATCH_FIELDS) {
    if (payload[field] === undefined) {
      continue;
    }

    switch (field) {
      case "name": {
        const value = String(payload.name || "").trim();

        if (value) {
          update.name = value;
        }

        break;
      }

      case "slug": {
        const value = slugify(payload.slug);

        if (value) {
          update.slug = value;
        }

        break;
      }

      case "categoryId":
        update.categoryId = payload.categoryId || null;
        break;

      case "categorySlug":
      case "badge":
      case "description":
      case "seoTitle":
      case "seoDescription":
      case "imageAlt":
        update[field] = String(payload[field] || "").trim();
        break;

      case "price":
      case "oldPrice":
      case "salesCount":
        update[field] = Math.max(0, Number(payload[field]) || 0);
        break;

      case "priceType":
        update.priceType =
          payload.priceType === "contact" ? "contact" : "fixed";
        break;

      case "stockQuantity":
        update.stockQuantity = Math.max(
          0,
          Math.floor(Number(payload[field]) || 0),
        );
        break;

      case "isNew":
      case "active":
        update[field] = Boolean(payload[field]);
        break;

      case "image":
        update.image = String(payload.image || payload.imageUrl || "").trim();
        break;

      default:
        break;
    }
  }

  if (update.name !== undefined && update.slug === undefined) {
    update.slug = slugify(update.name);
  }

  return update;
};

const list = async ({ page = 1, limit = 50, includeInactive = false } = {}) => {
  const safePage = Math.max(1, Number(page) || 1);

  const safeLimit = Math.min(200, Math.max(1, Number(limit) || 50));

  const filter = includeInactive ? {} : { active: true };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),

    Product.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page: safePage,
    limit: safeLimit,
  };
};

const getById = async (id) => {
  const normalizedId = String(id || "").trim();

  let item = null;

  if (mongoose.Types.ObjectId.isValid(normalizedId)) {
    item = await Product.findById(normalizedId).lean();
  }

  if (!item) {
    item = await Product.findOne({
      $or: [
        {
          slug: normalizedId,
        },
        {
          name: normalizedId,
        },
      ],
    }).lean();
  }

  if (!item) {
    throw Object.assign(new Error("Không tìm thấy sản phẩm."), {
      status: 404,
    });
  }

  return item;
};

const create = async (payload = {}) => {
  const normalized = normalizeCreatePayload(payload);

  if (!normalized.name) {
    throw Object.assign(new Error("Tên sản phẩm là bắt buộc."), {
      status: 400,
    });
  }

  return Product.create(normalized);
};

const update = async (id, payload = {}) => {
  const updatePayload = normalizePatchPayload(payload);

  if (!Object.keys(updatePayload).length) {
    throw Object.assign(
      new Error("Không có trường hợp lệ để cập nhật sản phẩm."),
      {
        status: 400,
      },
    );
  }

  const updated = await Product.findByIdAndUpdate(
    id,
    {
      $set: updatePayload,
    },
    {
      new: true,
      runValidators: true,
    },
  ).lean();

  if (!updated) {
    throw Object.assign(new Error("Không tìm thấy sản phẩm."), {
      status: 404,
    });
  }

  return updated;
};

const remove = async (id) => {
  const updated = await Product.findByIdAndUpdate(
    id,
    {
      $set: {
        active: false,
      },
    },
    {
      new: true,
    },
  ).lean();

  if (!updated) {
    throw Object.assign(new Error("Không tìm thấy sản phẩm."), {
      status: 404,
    });
  }

  return updated;
};

module.exports = {
  slugify,
  normalizeCreatePayload,
  normalizePatchPayload,
  list,
  getById,
  create,
  update,
  remove,
};
