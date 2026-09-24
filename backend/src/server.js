require("dotenv").config();

const crypto = require("crypto");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cloudinary = require("cloudinary").v2;

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const addressRoutes = require("./routes/addresses");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const couponRoutes = require("./routes/coupons");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payments");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = Number(process.env.PORT || 5000);

let databaseReady = false;
let cloudinaryConfigured = false;
let cloudinaryVerified = false;

const SharedSnapshotSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, index: true },
    products: { type: [mongoose.Schema.Types.Mixed], default: [] },
    categories: { type: [mongoose.Schema.Types.Mixed], default: [] },
    settings: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false },
);

const SharedSnapshot =
  mongoose.models.SharedSnapshot ||
  mongoose.model("SharedSnapshot", SharedSnapshotSchema);

const PaymentIntentLegacySchema = new mongoose.Schema(
  {
    intentId: { type: String, unique: true, index: true },
    orderCode: { type: String, unique: true, index: true },
    reference: String,
    amount: Number,
    currency: { type: String, default: "VND" },
    paymentMethod: String,
    status: { type: String, enum: ["pending", "paid", "failed", "refunded", "expired", "cancelled"], default: "pending" },
    expiresAt: Date,
    paidAt: Date,
    paymentAttemptedAt: Date,
    transactionId: String,
    transaction: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true, minimize: false },
);

const PaymentIntentLegacy =
  mongoose.models.PaymentIntentLegacy ||
  mongoose.model("PaymentIntentLegacy", PaymentIntentLegacySchema);

const PaymentTransactionLegacySchema = new mongoose.Schema(
  {
    provider: { type: String, default: "sepay" },
    providerTransactionId: { type: String, unique: true, index: true },
    intentId: String,
    orderCode: String,
    gateway: String,
    accountNumber: String,
    transferType: String,
    amount: Number,
    content: String,
    code: String,
    referenceCode: String,
    transactionDate: String,
    rawPayload: mongoose.Schema.Types.Mixed,
    matched: Boolean,
  },
  { timestamps: true, minimize: false },
);

const PaymentTransactionLegacy =
  mongoose.models.PaymentTransactionLegacy ||
  mongoose.model("PaymentTransactionLegacy", PaymentTransactionLegacySchema);

const configureCloudinary = () => {
  const cloudinaryUrl = String(process.env.CLOUDINARY_URL || "").trim();
  const cloudName = String(process.env.CLOUDINARY_CLOUD_NAME || "").trim();
  const apiKey = String(process.env.CLOUDINARY_API_KEY || "").trim();
  const apiSecret = String(process.env.CLOUDINARY_API_SECRET || "").trim();

  if (cloudinaryUrl) {
    cloudinary.config({ secure: true });
    return true;
  }

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    return true;
  }

  return false;
};

const connectDatabase = async () => {
  const uri = String(process.env.MONGODB_URI || "").trim();
  if (!uri) throw new Error("MONGODB_URI chưa được cấu hình.");

  await mongoose.connect(uri);
  databaseReady = true;
  console.log("MongoDB connected.");
};

app.use(helmet());
app.use(cookieParser());

app.use(cors({
  origin: (origin, callback) => {
    const configured = String(process.env.FRONTEND_URL || "http://localhost:5173")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!origin || configured.includes("*") || configured.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin không được phép bởi CORS."));
  },
  credentials: true,
}));

app.use(morgan("dev"));

/*
 * Webhook SePay cần raw body để xác thực chữ ký.
 * Các route JSON thông thường dùng express.json bên dưới.
 */
app.use("/api/payments/webhooks/sepay", express.raw({ type: "*/*", limit: "2mb" }));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.get("/api/health", async (req, res) => {
  if (!cloudinaryConfigured) cloudinaryConfigured = configureCloudinary();

  if (cloudinaryConfigured && !cloudinaryVerified) {
    try {
      await cloudinary.api.ping();
      cloudinaryVerified = true;
    } catch {
      cloudinaryVerified = false;
    }
  }

  res.json({
    ok: true,
    databaseReady,
    cloudinaryConfigured,
    cloudinaryVerified,
    timestamp: new Date().toISOString(),
  });
});

/* Legacy snapshot API is retained for a controlled frontend migration period. */
app.get("/api/data/snapshot", async (req, res, next) => {
  try {
    if (!databaseReady) return res.status(503).json({ initialized: false, message: "MongoDB chưa kết nối." });

    const document = await SharedSnapshot.findOne({ key: "main" }).lean();
    if (!document) {
      return res.json({ initialized: false, snapshot: null, updatedAt: null });
    }

    return res.json({
      initialized: true,
      snapshot: {
        products: Array.isArray(document.products) ? document.products : [],
        categories: Array.isArray(document.categories) ? document.categories : [],
        settings: document.settings || {},
      },
      updatedAt: document.updatedAt || document.createdAt || null,
    });
  } catch (error) { next(error); }
});

app.put("/api/data/snapshot", async (req, res, next) => {
  try {
    if (!databaseReady) return res.status(503).json({ message: "MongoDB chưa kết nối." });

    const saved = await SharedSnapshot.findOneAndUpdate(
      { key: "main" },
      {
        $set: {
          products: Array.isArray(req.body?.products) ? req.body.products : [],
          categories: Array.isArray(req.body?.categories) ? req.body.categories : [],
          settings: req.body?.settings && typeof req.body.settings === "object" ? req.body.settings : {},
        },
        $setOnInsert: { key: "main" },
      },
      { upsert: true, new: true, runValidators: false },
    ).lean();

    res.json({ success: true, updatedAt: saved.updatedAt || new Date().toISOString() });
  } catch (error) { next(error); }
});

/*
 * Authentication is mounted before protected domain routes.
 * Orders POST remains public to support guest checkout; when a valid JWT
 * is present the route receives req.user from optionalAuth below.
 */
const optionalAuth = async (req, res, next) => {
  const authorization = String(req.headers.authorization || "");
  const cookieToken = req.cookies?.accessToken;
  const token = authorization.toLowerCase().startsWith("bearer ")
    ? authorization.slice(7).trim()
    : String(cookieToken || "").trim();

  if (!token) return next();

  try {
    const jwt = require("jsonwebtoken");
    const User = require("./models/User");
    const secret = String(process.env.JWT_SECRET || "").trim();
    if (!secret) return next();
    const payload = jwt.verify(token, secret);
    const user = await User.findById(payload.sub).lean();
    if (user && !user.disabled) req.user = user;
  } catch {}
  return next();
};

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/coupons", couponRoutes);

app.use("/api/orders", optionalAuth, orderRoutes);
app.use("/api/payments", paymentRoutes);

/*
 * Cloudinary media upload retained from the existing application.
 */
app.post("/api/media/upload", async (req, res) => {
  try {
    const { dataUri, folder } = req.body || {};
    if (!dataUri || typeof dataUri !== "string" || !dataUri.startsWith("data:image/")) {
      return res.status(400).json({ message: "Thiếu hoặc sai định dạng Data URI hình ảnh." });
    }

    cloudinaryConfigured = configureCloudinary();
    if (!cloudinaryConfigured) {
      return res.status(503).json({
        message: "Cloudinary chưa được cấu hình. Kiểm tra CLOUDINARY_URL hoặc bộ CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET.",
      });
    }

    await cloudinary.api.ping();
    cloudinaryVerified = true;

    const safeFolder =
      String(folder || "flower-shop")
        .replace(/[^a-zA-Z0-9/_-]/g, "")
        .replace(/^\/+|\/+$/g, "") || "flower-shop";

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: safeFolder,
      resource_type: "image",
      overwrite: false,
    });

    return res.status(201).json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(502).json({
      message: error?.message || "Không thể tải hình ảnh lên Cloudinary.",
    });
  }
});

app.use(errorHandler);

const startServer = async () => {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`Flower Shop backend running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Không thể khởi động backend:", error?.message || error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
