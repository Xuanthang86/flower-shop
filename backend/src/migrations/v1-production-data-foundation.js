/*
Migration V1 - Production Data Foundation

Usage:
  node src/migrations/v1-production-data-foundation.js ./legacy-snapshot.json

The input is a JSON object or the current frontend snapshot:
{
  "products": [],
  "categories": [],
  "coupons": [],
  "users": [],
  "addresses": [],
  "orders": []
}

This migration is idempotent by stable legacy identifiers where available.
It never reads browser localStorage directly.
*/
require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const User = require("../models/User");
const Address = require("../models/Address");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const Payment = require("../models/Payment");

const slugify = (value) =>
  String(value || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const readInput = () => {
  const input = process.argv[2] || process.env.LEGACY_SNAPSHOT_FILE;
  if (!input) throw new Error("Thiếu đường dẫn file legacy snapshot JSON.");
  const absolute = path.resolve(process.cwd(), input);
  return JSON.parse(fs.readFileSync(absolute, "utf8"));
};

const asArray = (value) => Array.isArray(value) ? value : [];

const run = async () => {
  const uri = String(process.env.MONGODB_URI || "").trim();
  if (!uri) throw new Error("MONGODB_URI chưa được cấu hình.");

  const snapshot = readInput();
  await mongoose.connect(uri);

  const report = { users: 0, addresses: 0, categories: 0, products: 0, coupons: 0, orders: 0, payments: 0 };

  const userMap = new Map();
  const productMap = new Map();

  for (const raw of asArray(snapshot.users)) {
    const email = String(raw.email || "").trim().toLowerCase();
    if (!email) continue;
    const user = await User.findOneAndUpdate(
      { email },
      { $set: {
        name: String(raw.name || raw.fullName || "").trim(),
        phone: String(raw.phone || "").trim(),
        avatar: String(raw.avatar || "").trim(),
        role: raw.role || "customer",
        disabled: Boolean(raw.disabled),
        emailVerified: Boolean(raw.emailVerified),
        provider: raw.provider || "local",
        providerId: String(raw.providerId || ""),
      }},
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    userMap.set(String(raw.id || raw._id || email), user._id);
    report.users++;
  }

  for (const raw of asArray(snapshot.categories)) {
    const slug = slugify(raw.slug || raw.name);
    if (!slug) continue;
    await Category.findOneAndUpdate(
      { slug },
      { $set: {
        name: String(raw.name || "").trim(),
        description: String(raw.description || ""),
        image: String(raw.image || ""),
        active: raw.active !== false,
        showOnHome: raw.showOnHome !== false,
        sortOrder: Number(raw.sortOrder || 0),
        seoTitle: String(raw.seoTitle || ""),
        seoDescription: String(raw.seoDescription || ""),
      }},
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    report.categories++;
  }

  for (const raw of asArray(snapshot.products)) {
    const slug = slugify(raw.slug || raw.name || raw.id);
    if (!slug) continue;
    const category = raw.categorySlug
      ? await Category.findOne({ slug: slugify(raw.categorySlug) }).lean()
      : null;

    const product = await Product.findOneAndUpdate(
      { slug },
      { $set: {
        name: String(raw.name || "").trim(),
        slug,
        categoryId: category?._id,
        categorySlug: String(raw.categorySlug || ""),
        price: Math.max(0, Number(raw.price || 0)),
        oldPrice: Math.max(0, Number(raw.oldPrice || 0)),
        badge: String(raw.badge || ""),
        image: String(raw.image || raw.imageUrl || ""),
        description: String(raw.description || ""),
        salesCount: Math.max(0, Number(raw.salesCount || raw.sold || 0)),
        stockQuantity: Math.max(0, Math.floor(Number(raw.stockQuantity ?? raw.stock ?? 0))),
        isNew: Boolean(raw.isNew),
        active: raw.active !== false && raw.disabled !== true,
        seoTitle: String(raw.seoTitle || ""),
        seoDescription: String(raw.seoDescription || ""),
        imageAlt: String(raw.imageAlt || ""),
      }},
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    productMap.set(String(raw.id || raw._id || slug), product._id);
    report.products++;
  }

  for (const raw of asArray(snapshot.coupons)) {
    const code = String(raw.code || "").trim().toUpperCase();
    if (!code) continue;
    await Coupon.findOneAndUpdate(
      { code },
      { $set: {
        description: String(raw.description || ""),
        discountType: raw.discountType || (Number(raw.discountPercent) > 0 ? "percentage" : "fixed"),
        discountValue: Number(raw.discountValue ?? raw.discountPercent ?? 0),
        minOrderValue: Number(raw.minOrderValue ?? raw.minimumOrder ?? 0),
        maxDiscount: Number(raw.maxDiscount ?? raw.maximumDiscount ?? 0),
        startsAt: raw.startsAt || raw.startDate || null,
        expiresAt: raw.expiresAt || raw.endDate || null,
        usageLimit: Number(raw.usageLimit || 0),
        usedCount: Number(raw.usedCount || 0),
        active: raw.active !== false,
      }},
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    report.coupons++;
  }

  for (const raw of asArray(snapshot.addresses)) {
    const userId = userMap.get(String(raw.userId || raw.customerId || ""));
    if (!userId) continue;
    await Address.findOneAndUpdate(
      {
        userId,
        recipientName: String(raw.recipientName || raw.fullName || "").trim(),
        phone: String(raw.phone || "").trim(),
        addressLine: String(raw.addressLine || raw.address || "").trim(),
      },
      { $set: {
        ward: String(raw.ward || raw.wardName || ""),
        district: String(raw.district || raw.districtName || ""),
        province: String(raw.province || raw.provinceName || ""),
        note: String(raw.note || ""),
        isDefault: Boolean(raw.isDefault),
      }},
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    report.addresses++;
  }

  for (const raw of asArray(snapshot.orders)) {
    const orderCode = String(raw.orderCode || raw.code || "").trim();
    if (!orderCode) continue;

    const customerId = userMap.get(String(raw.customerId || raw.userId || "")) || null;
    const rawItems = asArray(raw.items || raw.orderItems);
    const items = rawItems.map((item) => {
      const productId = productMap.get(String(item.productId || item.id || "")) || null;
      const quantity = Math.max(1, Number(item.quantity || 1));
      const unitPrice = Math.max(0, Number(item.unitPrice ?? item.price ?? 0));
      return {
        productId,
        productName: String(item.productName || item.name || ""),
        productImage: String(item.productImage || item.image || ""),
        unitPrice,
        quantity,
        subtotal: Math.max(0, Number(item.subtotal ?? unitPrice * quantity)),
      };
    });

    const order = await Order.findOneAndUpdate(
      { orderCode },
      { $set: {
        customerId,
        customerSnapshot: {
          fullName: String(raw.customerSnapshot?.fullName || raw.customerName || raw.fullName || ""),
          phone: String(raw.customerSnapshot?.phone || raw.phone || ""),
          email: String(raw.customerSnapshot?.email || raw.email || ""),
        },
        recipientSnapshot: {
          fullName: String(raw.recipientSnapshot?.fullName || raw.recipientName || ""),
          phone: String(raw.recipientSnapshot?.phone || raw.phone || ""),
          email: String(raw.recipientSnapshot?.email || raw.email || ""),
          address: String(raw.recipientSnapshot?.address || raw.address || ""),
        },
        items,
        subtotal: Number(raw.subtotal || 0),
        discount: Number(raw.discount ?? raw.discountAmount ?? 0),
        shippingFee: Number(raw.shippingFee || 0),
        grandTotal: Number(raw.grandTotal ?? raw.total ?? 0),
        couponCode: String(raw.couponCode || ""),
        paymentMethod: String(raw.paymentMethod || ""),
        paymentStatus: raw.paymentStatus || "pending",
        status: raw.status || "pending",
        channel: raw.channel || "website",
        deliveryDate: raw.deliveryDate || null,
        deliveryTimeSlot: String(raw.deliveryTimeSlot || ""),
        notes: String(raw.notes || ""),
      }},
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    report.orders++;

    if (raw.paymentMethod || raw.paymentStatus || raw.paymentAmount) {
      await Payment.findOneAndUpdate(
        { orderId: order._id },
        { $set: {
          method: String(raw.paymentMethod || ""),
          provider: String(raw.paymentProvider || ""),
          amount: Number(raw.paymentAmount ?? raw.grandTotal ?? 0),
          currency: "VND",
          status: raw.paymentStatus || "pending",
          transactionId: String(raw.transactionId || ""),
          paidAt: raw.paidAt || null,
        }},
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      report.payments++;
    }
  }

  console.log(JSON.stringify({ success: true, report }, null, 2));
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Migration failed:", error);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
