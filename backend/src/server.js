require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const app = express();

const PORT = Number(process.env.PORT || 5000);

const allowedOrigins = String(
  process.env.FRONTEND_ORIGIN || "http://localhost:5173",
)
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin không được phép: ${origin}`));
  },

  methods: ["GET", "HEAD", "PUT", "POST", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan("dev"));

app.use(
  express.json({
    limit: "20mb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "20mb",
  }),
);

const hasPlaceholder = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  return (
    !normalized ||
    normalized.includes("your_api_key") ||
    normalized.includes("your_api_secret") ||
    normalized.includes("your_cloud_name") ||
    normalized.includes("replace_me")
  );
};

const cloudinaryConfigured = () => {
  if (
    process.env.CLOUDINARY_URL &&
    !hasPlaceholder(process.env.CLOUDINARY_URL)
  ) {
    cloudinary.config(process.env.CLOUDINARY_URL);

    return true;
  }

  if (
    hasPlaceholder(process.env.CLOUDINARY_CLOUD_NAME) ||
    hasPlaceholder(process.env.CLOUDINARY_API_KEY) ||
    hasPlaceholder(process.env.CLOUDINARY_API_SECRET)
  ) {
    return false;
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

    api_key: process.env.CLOUDINARY_API_KEY,

    api_secret: process.env.CLOUDINARY_API_SECRET,

    secure: true,
  });

  return true;
};

const snapshotSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      required: true,
      default: "main",
    },

    products: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    categories: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },

    settings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

const SharedSnapshot =
  mongoose.models.SharedSnapshot ||
  mongoose.model("SharedSnapshot", snapshotSchema);

let databaseReady = false;

const validateEnvironment = () => {
  const missing = [];

  if (!process.env.MONGODB_URI) {
    missing.push("MONGODB_URI");
  }

  if (!cloudinaryConfigured()) {
    missing.push("Cloudinary credentials");
  }

  if (missing.length) {
    throw new Error(
      `Thiếu cấu hình backend: ${missing.join(
        ", ",
      )}. Hãy kiểm tra file backend/.env.`,
    );
  }
};

const connectDatabase = async () => {
  validateEnvironment();

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  databaseReady = true;

  console.log("MongoDB connected successfully.");
};

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    databaseReady,
    cloudinaryConfigured: cloudinaryConfigured(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/data/snapshot", async (req, res, next) => {
  try {
    if (!databaseReady) {
      return res.status(503).json({
        initialized: false,
        message: "MongoDB chưa kết nối.",
      });
    }

    const document = await SharedSnapshot.findOne({
      key: "main",
    }).lean();

    if (!document) {
      return res.json({
        initialized: false,
        snapshot: null,
        updatedAt: null,
      });
    }

    return res.json({
      initialized: true,

      snapshot: {
        products: Array.isArray(document.products) ? document.products : [],

        categories: Array.isArray(document.categories)
          ? document.categories
          : [],

        settings:
          document.settings && typeof document.settings === "object"
            ? document.settings
            : {},
      },

      updatedAt: document.updatedAt || document.createdAt || null,
    });
  } catch (error) {
    next(error);
  }
});

app.put("/api/data/snapshot", async (req, res, next) => {
  try {
    if (!databaseReady) {
      return res.status(503).json({
        message: "MongoDB chưa kết nối. Kiểm tra MONGODB_URI và backend.",
      });
    }

    const products = Array.isArray(req.body?.products) ? req.body.products : [];

    const categories = Array.isArray(req.body?.categories)
      ? req.body.categories
      : [];

    const settings =
      req.body?.settings && typeof req.body.settings === "object"
        ? req.body.settings
        : {};

    const saved = await SharedSnapshot.findOneAndUpdate(
      {
        key: "main",
      },
      {
        $set: {
          products,
          categories,
          settings,
        },

        $setOnInsert: {
          key: "main",
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: false,
      },
    ).lean();

    return res.json({
      success: true,
      updatedAt: saved.updatedAt || new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/media/upload", async (req, res, next) => {
  try {
    const { dataUri, folder } = req.body || {};

    if (!dataUri || typeof dataUri !== "string") {
      return res.status(400).json({
        message: "Thiếu dữ liệu hình ảnh Data URI.",
      });
    }

    if (!dataUri.startsWith("data:image/")) {
      return res.status(400).json({
        message: "Định dạng hình ảnh không hợp lệ.",
      });
    }

    if (!cloudinaryConfigured()) {
      return res.status(503).json({
        message:
          "Cloudinary chưa được cấu hình đúng. Hãy kiểm tra CLOUDINARY_URL hoặc bộ ba CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET trong backend/.env.",
      });
    }

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

app.use((error, req, res, next) => {
  console.error("Backend error:", error);

  const status = Number(error?.status) >= 400 ? Number(error.status) : 500;

  res.status(status).json({
    message: error?.message || "Đã xảy ra lỗi máy chủ.",
  });
});

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

startServer();
