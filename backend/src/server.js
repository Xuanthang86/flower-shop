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

  optionsSuccessStatus: 204,
};

app.disable("x-powered-by");

app.use(helmet());

/*
 * Không dùng:
 *
 * app.options("*", ...)
 *
 * vì Express 5/path-to-regexp không còn
 * chấp nhận wildcard "*" kiểu cũ.
 *
 * cors middleware tự xử lý preflight.
 */
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

const isPlaceholder = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (!normalized) {
    return true;
  }

  return [
    "your_api_key",
    "your_api_secret",
    "your_cloud_name",
    "<your_api_key>",
    "<your_api_secret>",
    "<your_cloud_name>",
    "replace_me",
    "replace-this",
  ].some((placeholder) => normalized.includes(placeholder));
};

const configureCloudinary = () => {
  /*
   * Ưu tiên bộ ba riêng nếu đầy đủ.
   * Điều này tránh trường hợp CLOUDINARY_URL
   * còn placeholder nhưng biến riêng đã đúng.
   */
  const cloudName = String(process.env.CLOUDINARY_CLOUD_NAME || "").trim();

  const apiKey = String(process.env.CLOUDINARY_API_KEY || "").trim();

  const apiSecret = String(process.env.CLOUDINARY_API_SECRET || "").trim();

  if (
    !isPlaceholder(cloudName) &&
    !isPlaceholder(apiKey) &&
    !isPlaceholder(apiSecret)
  ) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    return true;
  }

  const cloudinaryUrl = String(process.env.CLOUDINARY_URL || "").trim();

  if (cloudinaryUrl && !isPlaceholder(cloudinaryUrl)) {
    cloudinary.config(cloudinaryUrl);

    return true;
  }

  return false;
};

const isCloudinaryConfigured = () => {
  return configureCloudinary();
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

const validateMongoEnvironment = () => {
  if (!String(process.env.MONGODB_URI || "").trim()) {
    throw new Error("Thiếu MONGODB_URI. Hãy kiểm tra backend/.env.");
  }
};

const connectDatabase = async () => {
  validateMongoEnvironment();

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  databaseReady = true;

  console.log("MongoDB connected successfully.");

  console.log(`Cloudinary configured: ${isCloudinaryConfigured()}`);
};

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    databaseReady,
    cloudinaryConfigured: isCloudinaryConfigured(),
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

app.post("/api/media/upload", async (req, res) => {
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

    const configured = isCloudinaryConfigured();

    if (!configured) {
      return res.status(503).json({
        message:
          "Cloudinary chưa được cấu hình. Hãy điền CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY và CLOUDINARY_API_SECRET hợp lệ trong backend/.env rồi khởi động lại backend.",
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
