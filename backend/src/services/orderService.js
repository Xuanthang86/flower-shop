const crypto = require("crypto");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const Payment = require("../models/Payment");
const User = require("../models/User");
const {
  sendNewOrderNotification,
  sendOrderStatusNotification,
} = require("./emailService");

const ALLOWED_CHANNELS = [
  "website",
  "facebook",
  "shopee",
  "zalo",
  "hotline",
  "store",
  "other",
];

const ALLOWED_PAYMENT_METHODS = ["cod", "bank_transfer"];

const slugifyProductName = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/*
 * ==========================================================
 * SNAPSHOT PRODUCT FALLBACK
 * ==========================================================
 *
 * Catalog frontend hiện có thể chứa Product mới trong
 * SharedSnapshot trước khi collection Product được đồng bộ.
 *
 * Trường hợp này đặc biệt dễ xảy ra với dữ liệu legacy:
 *
 * frontend:
 *   id = 10
 *   name = Grand Success
 *
 * backend Product:
 *   chưa có document tương ứng
 *
 * SharedSnapshot:
 *   đã có Grand Success
 *
 * Backend phải tự hydrate Product từ snapshot trước khi
 * tạo Order để Order / Payment / Inventory vẫn sử dụng
 * Product collection làm nguồn dữ liệu giao dịch.
 */

const getSharedSnapshotProducts = async () => {
  if (!mongoose.connection?.db) {
    return [];
  }

  try {
    const collection = mongoose.connection.db.collection("sharedsnapshots");

    const snapshot = await collection.findOne(
      {
        key: "main",
      },
      {
        projection: {
          products: 1,
        },
      },
    );

    return Array.isArray(snapshot?.products) ? snapshot.products : [];
  } catch (error) {
    console.warn(
      "Không thể đọc Product từ SharedSnapshot:",
      error?.message || error,
    );

    return [];
  }
};

const findSnapshotProductForCartItem = (item, snapshotProducts) => {
  if (!Array.isArray(snapshotProducts)) {
    return null;
  }

  const productId = String(item?.productId || item?.id || "").trim();

  const productSlug = String(item?.productSlug || item?.slug || "")
    .trim()
    .toLowerCase();

  const productName = String(item?.productName || item?.name || "")
    .trim()
    .toLowerCase();

  /*
   * 1. Legacy ID / current ID
   */
  if (productId) {
    const byId = snapshotProducts.find(
      (product) =>
        String(
          product?.id || product?._id || product?.productId || "",
        ).trim() === productId,
    );

    if (byId) {
      return byId;
    }
  }

  /*
   * 2. Slug
   */
  if (productSlug) {
    const bySlug = snapshotProducts.find(
      (product) =>
        String(product?.slug || product?.productSlug || "")
          .trim()
          .toLowerCase() === productSlug,
    );

    if (bySlug) {
      return bySlug;
    }
  }

  /*
   * 3. Tên sản phẩm
   */
  if (productName) {
    const byName = snapshotProducts.find(
      (product) =>
        String(product?.name || "")
          .trim()
          .toLowerCase() === productName,
    );

    if (byName) {
      return byName;
    }
  }

  return null;
};

const hydrateMissingProductsFromSnapshot = async (
  requestedItems,
  existingProducts,
) => {
  const snapshotProducts = await getSharedSnapshotProducts();

  if (!snapshotProducts.length) {
    return;
  }

  const existingBySlug = new Set(
    existingProducts
      .map((product) =>
        String(product?.slug || "")
          .trim()
          .toLowerCase(),
      )
      .filter(Boolean),
  );

  const existingByName = new Set(
    existingProducts
      .map((product) =>
        String(product?.name || "")
          .trim()
          .toLowerCase(),
      )
      .filter(Boolean),
  );

  for (const item of requestedItems) {
    const snapshotProduct = findSnapshotProductForCartItem(
      item,
      snapshotProducts,
    );

    if (!snapshotProduct) {
      continue;
    }

    const name = String(snapshotProduct.name || "").trim();

    const slug = String(
      snapshotProduct.slug ||
        snapshotProduct.productSlug ||
        slugifyProductName(name),
    ).trim();

    if (!name || !slug) {
      continue;
    }

    /*
     * Nếu Product đã tồn tại theo slug hoặc tên,
     * tuyệt đối không tạo bản sao.
     */
    if (
      existingBySlug.has(slug.toLowerCase()) ||
      existingByName.has(name.toLowerCase())
    ) {
      continue;
    }

    const stockQuantity = Math.max(
      0,
      Math.floor(
        Number(snapshotProduct.stockQuantity ?? snapshotProduct.stock ?? 0) ||
          0,
      ),
    );

    const active =
      snapshotProduct.active !== false &&
      snapshotProduct.disabled !== true &&
      snapshotProduct.soldOut !== true;

    try {
      await Product.updateOne(
        {
          slug,
        },
        {
          $setOnInsert: {
            name,
            slug,

            categorySlug: String(
              snapshotProduct.categorySlug || snapshotProduct.category || "",
            ).trim(),

            price: Math.max(0, Number(snapshotProduct.price) || 0),

            oldPrice: Math.max(0, Number(snapshotProduct.oldPrice) || 0),

            badge: String(snapshotProduct.badge || "").trim(),

            image: String(
              snapshotProduct.image || snapshotProduct.imageUrl || "",
            ).trim(),

            description: String(snapshotProduct.description || ""),

            salesCount: Math.max(0, Number(snapshotProduct.salesCount || 0)),

            stockQuantity,

            isNew: Boolean(snapshotProduct.isNew),

            active,

            seoTitle: String(snapshotProduct.seoTitle || ""),

            seoDescription: String(snapshotProduct.seoDescription || ""),

            imageAlt: String(snapshotProduct.imageAlt || ""),

            priceType:
              snapshotProduct.priceType === "contact" ? "contact" : "fixed",
          },
        },
        {
          upsert: true,
        },
      );

      existingBySlug.add(slug.toLowerCase());

      existingByName.add(name.toLowerCase());
    } catch (error) {
      /*
       * Race condition:
       * Browser khác có thể vừa tạo Product này.
       *
       * Không làm hỏng toàn bộ Checkout.
       */
      if (error?.code !== 11000) {
        console.warn(
          `Không thể hydrate Product "${name}":`,
          error?.message || error,
        );
      }
    }
  }
};

const generateOrderCode = async (preferredCode = "") => {
  const normalizedPreferred = String(preferredCode || "")
    .trim()
    .toUpperCase();

  if (normalizedPreferred) {
    const exists = await Order.exists({
      orderCode: normalizedPreferred,
    });

    if (!exists) {
      return normalizedPreferred;
    }

    throw Object.assign(new Error("Mã đơn hàng đã tồn tại."), {
      status: 409,
    });
  }

  const vietnamDateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const vietnamDate = Object.fromEntries(
    vietnamDateParts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  const prefix = `HTH${String(vietnamDate.year).slice(-2)}${String(
    vietnamDate.month,
  ).padStart(2, "0")}${String(vietnamDate.day).padStart(2, "0")}`;

  for (let i = 0; i < 100; i += 1) {
    const code = `${prefix}-${String(crypto.randomInt(0, 10000)).padStart(
      4,
      "0",
    )}`;

    if (
      !(await Order.exists({
        orderCode: code,
      }))
    ) {
      return code;
    }
  }

  throw new Error("Không thể tạo mã đơn hàng duy nhất.");
};

const normalizeItems = (items) => {
  if (!Array.isArray(items) || !items.length) {
    throw Object.assign(new Error("Đơn hàng phải có ít nhất một sản phẩm."), {
      status: 400,
    });
  }

  return items.map((item) => {
    const productId = String(item?.productId || item?.id || "").trim();

    const productName = String(item?.productName || item?.name || "").trim();

    const productSlug = String(
      item?.productSlug || item?.slug || slugifyProductName(productName) || "",
    ).trim();

    const quantity = Math.floor(Number(item?.quantity) || 0);

    if (!productId && !productSlug && !productName) {
      throw Object.assign(new Error("Sản phẩm trong đơn hàng không hợp lệ."), {
        status: 400,
      });
    }

    if (quantity < 1) {
      throw Object.assign(new Error("Số lượng sản phẩm phải lớn hơn 0."), {
        status: 400,
      });
    }

    return {
      productId,
      productSlug,
      productName,
      quantity,
    };
  });
};

const calculateOrder = async ({ items, couponCode = "", shippingFee = 0 }) => {
  const requested = normalizeItems(items);

  const validObjectIds = requested
    .map((item) => item.productId)
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  const slugs = requested.map((item) => item.productSlug).filter(Boolean);

  const names = requested.map((item) => item.productName).filter(Boolean);

  const normalizedSlugs = requested
    .map((item) => item.productSlug)
    .filter(Boolean);

  const productOrConditions = [];

  if (validObjectIds.length > 0) {
    productOrConditions.push({
      _id: {
        $in: validObjectIds,
      },
    });
  }

  if (normalizedSlugs.length > 0) {
    productOrConditions.push({
      slug: {
        $in: normalizedSlugs,
      },
    });
  }

  if (names.length > 0) {
    productOrConditions.push({
      name: {
        $in: names,
      },
    });
  }

  if (productOrConditions.length === 0) {
    throw Object.assign(
      new Error("Không xác định được sản phẩm trong giỏ hàng."),
      {
        status: 400,
      },
    );
  }

  let products = await Product.find({
    active: true,

    $or: productOrConditions,
  }).lean();

  /*
   * ==========================================================
   * SELF-HEAL PRODUCT
   * ==========================================================
   *
   * Nếu Product collection chưa có một Product mà Cart đang
   * gửi lên, thử lấy Product đó từ SharedSnapshot và hydrate
   * vào Product collection.
   *
   * Điều này xử lý dữ liệu legacy như:
   *
   * id = 10
   * name = Grand Success
   *
   * mà không làm Checkout phụ thuộc vào ID legacy.
   */

  const existingByIdForHydration = new Set(
    products.map((product) => String(product._id)),
  );

  const existingBySlugForHydration = new Set(
    products
      .map((product) =>
        String(product.slug || "")
          .trim()
          .toLowerCase(),
      )
      .filter(Boolean),
  );

  const existingByNameForHydration = new Set(
    products
      .map((product) =>
        String(product.name || "")
          .trim()
          .toLowerCase(),
      )
      .filter(Boolean),
  );

  const hasProductMatch = (item) => {
    const productId = String(item.productId || "").trim();

    const productSlug = String(item.productSlug || "")
      .trim()
      .toLowerCase();

    const productName = String(item.productName || "")
      .trim()
      .toLowerCase();

    if (
      productId &&
      mongoose.Types.ObjectId.isValid(productId) &&
      existingByIdForHydration.has(productId)
    ) {
      return true;
    }

    if (productSlug && existingBySlugForHydration.has(productSlug)) {
      return true;
    }

    if (productName && existingByNameForHydration.has(productName)) {
      return true;
    }

    return false;
  };

  const unresolvedItems = requested.filter((item) => !hasProductMatch(item));

  if (unresolvedItems.length > 0) {
    await hydrateMissingProductsFromSnapshot(unresolvedItems, products);

    /*
     * Query lại Product collection sau hydrate.
     */
    products = await Product.find({
      active: true,

      $or: productOrConditions,
    }).lean();
  }

  const byId = new Map();

  const bySlug = new Map();

  const byName = new Map();

  products.forEach((product) => {
    byId.set(String(product._id), product);

    if (product.slug) {
      bySlug.set(String(product.slug), product);
    }

    if (product.name) {
      byName.set(String(product.name).trim().toLowerCase(), product);
    }
  });

  const normalizedItems = requested.map((item) => {
    let product = null;

    /*
     * 1. Ưu tiên ObjectId nếu frontend đã gửi
     * đúng MongoDB Product _id.
     */
    if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
      product = byId.get(String(item.productId));
    }

    /*
     * 2. Nếu ID frontend không phải Mongo ObjectId
     * hoặc không còn tồn tại → tìm theo slug.
     */
    if (!product && item.productSlug) {
      product = bySlug.get(String(item.productSlug).trim());
    }

    /*
     * 3. Fallback cuối cùng theo tên.
     */
    if (!product && item.productName) {
      product = byName.get(String(item.productName).trim().toLowerCase());
    }

    if (!product || product.active !== true) {
      throw Object.assign(
        new Error(
          `Sản phẩm "${item.productName || item.productSlug || item.productId}" không còn tồn tại hoặc đã ngừng bán.`,
        ),
        {
          status: 400,
        },
      );
    }

    if (Number(product.stockQuantity) < item.quantity) {
      throw Object.assign(
        new Error(`Sản phẩm "${product.name}" không đủ tồn kho.`),
        {
          status: 400,
        },
      );
    }

    const unitPrice = Math.max(0, Math.round(Number(product.price) || 0));

    return {
      productId: product._id,

      productName: String(product.name || "").trim(),

      productImage: String(product.image || "").trim(),

      unitPrice,

      quantity: item.quantity,

      subtotal: unitPrice * item.quantity,
    };
  });

  const subtotal = normalizedItems.reduce(
    (sum, item) => sum + item.subtotal,
    0,
  );

  let discount = 0;
  let coupon = null;

  const normalizedCouponCode = String(couponCode || "")
    .trim()
    .toUpperCase();

  if (normalizedCouponCode) {
    coupon = await Coupon.findOne({
      code: normalizedCouponCode,
      active: true,
    }).lean();

    if (!coupon) {
      throw Object.assign(new Error("Mã giảm giá không hợp lệ."), {
        status: 400,
      });
    }

    const now = new Date();

    if (coupon.startsAt && now < new Date(coupon.startsAt)) {
      throw Object.assign(new Error("Mã giảm giá chưa bắt đầu."), {
        status: 400,
      });
    }

    if (coupon.expiresAt && now > new Date(coupon.expiresAt)) {
      throw Object.assign(new Error("Mã giảm giá đã hết hạn."), {
        status: 400,
      });
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      throw Object.assign(new Error("Mã giảm giá đã hết lượt sử dụng."), {
        status: 400,
      });
    }

    if (subtotal < Number(coupon.minOrderValue || 0)) {
      throw Object.assign(
        new Error(
          "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã giảm giá.",
        ),
        {
          status: 400,
        },
      );
    }

    discount =
      coupon.discountType === "percentage"
        ? Math.round((subtotal * Number(coupon.discountValue || 0)) / 100)
        : Math.max(0, Math.round(Number(coupon.discountValue || 0)));

    if (Number(coupon.maxDiscount || 0) > 0) {
      discount = Math.min(discount, Number(coupon.maxDiscount));
    }

    discount = Math.min(discount, subtotal);
  }

  const normalizedShippingFee = Math.max(
    0,
    Math.round(Number(shippingFee) || 0),
  );

  if (!Number.isFinite(Number(shippingFee)) || Number(shippingFee) < 0) {
    throw Object.assign(new Error("Phí giao hàng không hợp lệ."), {
      status: 400,
    });
  }

  const grandTotal = Math.max(0, subtotal - discount + normalizedShippingFee);

  return {
    items: normalizedItems,
    subtotal,
    discount,
    shippingFee: normalizedShippingFee,
    grandTotal,
    coupon,
  };
};

const create = async ({
  payload = {},
  user,
  suppressNewOrderEmail = false,
}) => {
  if (!user?._id) {
    throw Object.assign(new Error("Bạn cần đăng nhập để tạo đơn hàng."), {
      status: 401,
    });
  }

  const calculation = await calculateOrder({
    items: payload.items,
    couponCode: payload.couponCode,
    shippingFee: payload.shippingFee,
  });

  const paymentMethod = String(payload.paymentMethod || "")
    .trim()
    .toLowerCase();

  if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
    throw Object.assign(new Error("Phương thức thanh toán không hợp lệ."), {
      status: 400,
    });
  }

  const channel = String(payload.channel || "website")
    .trim()
    .toLowerCase();

  if (!ALLOWED_CHANNELS.includes(channel)) {
    throw Object.assign(new Error("Kênh đơn hàng không hợp lệ."), {
      status: 400,
    });
  }

  const orderCode = await generateOrderCode(payload.orderCode);

  const customer = await User.findById(user._id).lean();

  if (!customer) {
    throw Object.assign(new Error("Không tìm thấy tài khoản khách hàng."), {
      status: 401,
    });
  }

  const recipient = payload.recipient || payload.address || {};

  const sender = payload.sender || {};

  const paymentDepositPercent =
    Number(payload.paymentDepositPercent) === 50 ? 50 : 100;

  const paymentDepositAmount = Math.round(
    (calculation.grandTotal * paymentDepositPercent) / 100,
  );

  const paymentRemainingAmount = Math.max(
    0,
    calculation.grandTotal - paymentDepositAmount,
  );

  const order = await Order.create({
    orderCode,

    customerId: customer._id,

    customerSnapshot: {
      fullName: String(customer.name || "").trim(),

      phone: String(customer.phone || "").trim(),

      email: String(customer.email || "")
        .trim()
        .toLowerCase(),
    },

    senderSnapshot: {
      fullName: String(sender.name || "").trim(),

      phone: String(sender.phone || "").trim(),

      email: String(sender.email || "")
        .trim()
        .toLowerCase(),

      isHiddenFromRecipient: sender.isHiddenFromRecipient !== false,
    },

    recipientSnapshot: {
      fullName: String(recipient.fullName || recipient.name || "").trim(),

      phone: String(recipient.phone || "").trim(),

      email: String(recipient.email || "")
        .trim()
        .toLowerCase(),

      provinceCode: String(
        recipient.provinceCode || recipient.address?.provinceCode || "",
      ).trim(),

      provinceName: String(
        recipient.provinceName || recipient.address?.provinceName || "",
      ).trim(),

      wardCode: String(
        recipient.wardCode || recipient.address?.wardCode || "",
      ).trim(),

      wardName: String(
        recipient.wardName || recipient.address?.wardName || "",
      ).trim(),

      houseNumber: String(
        recipient.houseNumber || recipient.address?.houseNumber || "",
      ).trim(),

      street: String(
        recipient.street || recipient.address?.street || "",
      ).trim(),

      note: String(recipient.note || payload.notes || "").trim(),

      address: String(
        recipient.addressLine || recipient.address || payload.addressLine || "",
      ).trim(),
    },

    items: calculation.items,

    subtotal: calculation.subtotal,

    discount: calculation.discount,

    shippingFee: calculation.shippingFee,

    grandTotal: calculation.grandTotal,

    couponCode: calculation.coupon?.code || "",

    paymentMethod,

    /*
     * Payment status luôn do backend
     * kiểm soát.
     *
     * Không nhận paymentStatus từ Frontend.
     */
    paymentStatus: "pending",

    status: "pending",

    channel,

    deliveryDate: payload.deliveryDate || null,

    deliveryTimeSlot: String(payload.deliveryTimeSlot || "").trim(),

    deliveryMode: String(payload.deliveryMode || "").trim(),

    deliveryModeLabel: String(payload.deliveryModeLabel || "").trim(),

    deliveryTimeSlotLabel: String(payload.deliveryTimeSlotLabel || "").trim(),

    estimatedDeliveryTime: String(payload.estimatedDeliveryTime || "").trim(),

    deliveryDistanceKm: Number.isFinite(Number(payload.deliveryDistanceKm))
      ? Number(payload.deliveryDistanceKm)
      : null,

    deliveryNote: String(payload.deliveryNote || "").trim(),

    shippingSnapshot:
      payload.shippingSnapshot && typeof payload.shippingSnapshot === "object"
        ? payload.shippingSnapshot
        : null,

    notes: String(payload.notes || "").trim(),

    paymentDepositPercent,

    paymentDepositAmount,

    paymentRemainingAmount,

    /*
     * Không nhận paymentIntentId
     * từ Frontend ở bước create order.
     *
     * PaymentIntent sẽ được backend
     * tạo/ràng buộc sau.
     */
    paymentIntentId: "",
  });

  if (calculation.coupon) {
    await Coupon.updateOne(
      {
        _id: calculation.coupon._id,
      },
      {
        $inc: {
          usedCount: 1,
        },
      },
    );
  }

  for (const item of calculation.items) {
    const stockUpdate = await Product.updateOne(
      {
        _id: item.productId,
        active: true,
        stockQuantity: {
          $gte: item.quantity,
        },
      },
      {
        $inc: {
          stockQuantity: -item.quantity,
          salesCount: item.quantity,
        },
      },
    );

    if (stockUpdate.modifiedCount !== 1) {
      await Order.deleteOne({
        _id: order._id,
      });

      throw Object.assign(
        new Error(
          `Sản phẩm "${item.productName}" không còn đủ tồn kho. Vui lòng thử lại.`,
        ),
        {
          status: 409,
        },
      );
    }
  }

  const payment = await Payment.create({
    orderId: order._id,

    provider: "",

    method: paymentMethod,

    amount: paymentDepositAmount,

    currency: "VND",

    status: "pending",

    transactionId: "",

    paidAt: null,

    paymentIntentId: "",
  });

  order.paymentId = payment._id;

  await order.save();

  const finalOrder = await Order.findById(order._id).lean();

  if (!suppressNewOrderEmail) {
    void sendNewOrderNotification(finalOrder);
  }

  return {
    order: finalOrder,
    payment: payment.toObject(),
  };
};

const getById = async (id, user) => {
  const filter = {
    _id: id,
  };

  if (String(user?.role || "") === "customer") {
    filter.customerId = user._id;
  }

  const order = await Order.findOne(filter).lean();

  if (!order) {
    throw Object.assign(new Error("Không tìm thấy đơn hàng."), {
      status: 404,
    });
  }

  const payment = order.paymentId
    ? await Payment.findById(order.paymentId).lean()
    : await Payment.findOne({
        orderId: order._id,
      }).lean();

  return {
    ...order,

    payment: payment
      ? {
          ...payment,

          id: String(payment.paymentIntentId || payment._id || ""),

          _id: String(payment._id),
        }
      : null,
  };
};

const escapeRegex = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const list = async ({
  user,
  page = 1,
  limit = 50,
  status = "",
  search = "",
}) => {
  const safePage = Math.max(1, Number(page) || 1);

  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 50));

  const filter = {};

  if (String(user?.role || "") === "customer") {
    filter.customerId = user._id;
  }

  if (status) {
    filter.status = status;
  }

  const keyword = String(search || "").trim();

  if (keyword) {
    const regex = new RegExp(escapeRegex(keyword), "i");

    filter.$or = [
      {
        orderCode: regex,
      },

      {
        "customerSnapshot.fullName": regex,
      },

      {
        "customerSnapshot.phone": regex,
      },

      {
        "customerSnapshot.email": regex,
      },

      {
        "recipientSnapshot.fullName": regex,
      },

      {
        "recipientSnapshot.phone": regex,
      },

      {
        "recipientSnapshot.email": regex,
      },
    ];
  }

  const [items, total] = await Promise.all([
    Order.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .lean(),

    Order.countDocuments(filter),
  ]);

  return {
    items,

    total,

    page: safePage,

    limit: safeLimit,

    totalPages: Math.ceil(total / safeLimit),
  };
};

const updateStatus = async (id, status, paymentStatus) => {
  const allowed = [
    "pending",
    "confirmed",
    "processing",
    "shipping",
    "delivered",
    "cancelled",
  ];

  if (!allowed.includes(status)) {
    throw Object.assign(new Error("Trạng thái đơn hàng không hợp lệ."), {
      status: 400,
    });
  }

  const existingOrder = await Order.findById(id).lean();

  if (!existingOrder) {
    throw Object.assign(new Error("Không tìm thấy đơn hàng."), {
      status: 404,
    });
  }

  const update = {
    status,
  };

  if (status === "delivered") {
    update.deliveredAt = new Date();
  }

  if (status === "cancelled") {
    update.cancelledAt = new Date();
  }

  if (paymentStatus) {
    const allowedPaymentStatus = [
      "pending",
      "partially_paid",
      "paid",
      "failed",
      "refunded",
      "cancelled",
    ];

    if (!allowedPaymentStatus.includes(paymentStatus)) {
      throw Object.assign(new Error("Trạng thái thanh toán không hợp lệ."), {
        status: 400,
      });
    }

    update.paymentStatus = paymentStatus;
  }

  const order = await Order.findByIdAndUpdate(
    id,
    {
      $set: update,
    },
    {
      new: true,
      runValidators: true,
    },
  ).lean();

  if (!order) {
    throw Object.assign(new Error("Không tìm thấy đơn hàng."), {
      status: 404,
    });
  }

  if (String(existingOrder.status || "") !== String(order.status || "")) {
    void sendOrderStatusNotification(order);
  }

  return order;
};

module.exports = {
  generateOrderCode,
  calculateOrder,
  create,
  getById,
  list,
  updateStatus,
};
