const path = require("path");
const crypto = require("crypto");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

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

const isDevelopmentOrigin = (origin) =>
  /^https?:\/\/localhost(?::\d+)?$/i.test(origin) ||
  /^https?:\/\/127\.0\.0\.1(?::\d+)?$/i.test(origin);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (
      allowedOrigins.includes("*") ||
      allowedOrigins.includes(origin) ||
      isDevelopmentOrigin(origin)
    ) {
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

app.use(cors(corsOptions));

app.use(morgan("dev"));

const normalizeEnvValue = (value) =>
  String(value || "")
    .trim()
    .replace(/^['"]|['"]$/g, "");

const isPlaceholder = (value) => {
  const normalized = normalizeEnvValue(value).toLowerCase();

  if (!normalized) {
    return true;
  }

  const placeholders = [
    "your_api_key",
    "your_api_secret",
    "your_cloud_name",
    "<your_api_key>",
    "<your_api_secret>",
    "<your_cloud_name>",
    "replace_me",
    "replace-this",
    "your-api-key",
    "your-api-secret",
    "your-cloud-name",
    "cloud_name_thuc_cua_ban",
    "api_key_thuc_cua_ban",
    "api_secret_thuc_cua_ban",
  ];

  return placeholders.some((placeholder) => normalized.includes(placeholder));
};

const configureCloudinary = () => {
  const cloudinaryUrl = normalizeEnvValue(process.env.CLOUDINARY_URL);

  if (
    cloudinaryUrl &&
    !isPlaceholder(cloudinaryUrl) &&
    cloudinaryUrl.startsWith("cloudinary://")
  ) {
    try {
      const parsed = new URL(cloudinaryUrl);

      const apiKey = decodeURIComponent(parsed.username || "");

      const apiSecret = decodeURIComponent(parsed.password || "");

      const cloudName = String(parsed.hostname || "").trim();

      if (
        !isPlaceholder(apiKey) &&
        !isPlaceholder(apiSecret) &&
        !isPlaceholder(cloudName)
      ) {
        cloudinary.config({
          cloud_name: cloudName,

          api_key: apiKey,

          api_secret: apiSecret,

          secure: true,
        });

        return true;
      }
    } catch (error) {
      console.warn("CLOUDINARY_URL không hợp lệ:", error?.message || error);
    }
  }

  const cloudName = normalizeEnvValue(process.env.CLOUDINARY_CLOUD_NAME);

  const apiKey = normalizeEnvValue(process.env.CLOUDINARY_API_KEY);

  const apiSecret = normalizeEnvValue(process.env.CLOUDINARY_API_SECRET);

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

  return false;
};

let cloudinaryConfigured = false;

let cloudinaryVerified = false;

const verifyCloudinary = async () => {
  cloudinaryConfigured = configureCloudinary();

  if (!cloudinaryConfigured) {
    cloudinaryVerified = false;

    return false;
  }

  try {
    await cloudinary.api.ping();

    cloudinaryVerified = true;

    return true;
  } catch (error) {
    cloudinaryVerified = false;

    console.error("Cloudinary verification error:", error?.message || error);

    return false;
  }
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

const paymentIntentSchema = new mongoose.Schema(
  {
    intentId: {
      type: String,
      unique: true,
      required: true,
    },

    orderCode: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    reference: {
      type: String,
      default: "",
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    currency: {
      type: String,
      default: "VND",
    },

    paymentMethod: {
      type: String,
      default: "bank_transfer",
    },

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded", "expired", "cancelled"],
      default: "pending",
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    paymentAttemptedAt: {
      type: Date,
      default: null,
    },

    transactionId: {
      type: String,
      default: "",
    },

    transaction: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

const PaymentIntent =
  mongoose.models.PaymentIntent ||
  mongoose.model("PaymentIntent", paymentIntentSchema);

const paymentTransactionSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      default: "sepay",
    },

    providerTransactionId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    intentId: {
      type: String,
      default: "",
      index: true,
    },

    orderCode: {
      type: String,
      default: "",
      index: true,
    },

    gateway: {
      type: String,
      default: "",
    },

    accountNumber: {
      type: String,
      default: "",
    },

    transferType: {
      type: String,
      default: "",
    },

    amount: {
      type: Number,
      default: 0,
    },

    content: {
      type: String,
      default: "",
    },

    code: {
      type: String,
      default: "",
    },

    referenceCode: {
      type: String,
      default: "",
    },

    transactionDate: {
      type: String,
      default: "",
    },

    rawPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    matched: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

const PaymentTransaction =
  mongoose.models.PaymentTransaction ||
  mongoose.model("PaymentTransaction", paymentTransactionSchema);

let databaseReady = false;

const validateMongoEnvironment = () => {
  if (!normalizeEnvValue(process.env.MONGODB_URI)) {
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

  const verified = await verifyCloudinary();

  console.log(`Cloudinary configured: ${cloudinaryConfigured}`);

  console.log(`Cloudinary verified: ${verified}`);
};

/*
==========================================================
SEPAY WEBHOOK
==========================================================
*
* Route này phải đứng trước express.json()
* để giữ raw body phục vụ HMAC-SHA256.
*/

app.post(
  "/api/payments/webhook/sepay",
  express.raw({
    type: "application/json",
    limit: "2mb",
  }),
  async (req, res) => {
    try {
      if (!databaseReady) {
        return res.status(503).json({
          success: false,
          message: "MongoDB chưa sẵn sàng.",
        });
      }

      const secret = normalizeEnvValue(process.env.SEPAY_WEBHOOK_SECRET);

      if (!secret) {
        return res.status(503).json({
          success: false,
          message: "SEPAY_WEBHOOK_SECRET chưa được cấu hình.",
        });
      }

      const rawBody = Buffer.isBuffer(req.body)
        ? req.body.toString("utf8")
        : String(req.body || "");

      if (!rawBody) {
        return res.status(400).json({
          success: false,
          message: "Webhook body rỗng.",
        });
      }

      const signature = String(req.headers["x-sepay-signature"] || "").trim();

      const timestamp = Number(req.headers["x-sepay-timestamp"] || 0);

      if (!signature || !Number.isFinite(timestamp)) {
        return res.status(401).json({
          success: false,
          message: "Thiếu chữ ký webhook.",
        });
      }

      const timestampAge = Math.abs(Date.now() / 1000 - timestamp);

      if (timestampAge > 300) {
        return res.status(401).json({
          success: false,
          message: "Webhook đã hết thời gian hợp lệ.",
        });
      }

      const expectedSignature = `sha256=${crypto
        .createHmac("sha256", secret)
        .update(`${timestamp}.${rawBody}`)
        .digest("hex")}`;

      const receivedBuffer = Buffer.from(signature);

      const expectedBuffer = Buffer.from(expectedSignature);

      if (
        receivedBuffer.length !== expectedBuffer.length ||
        !crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
      ) {
        return res.status(401).json({
          success: false,
          message: "Chữ ký webhook không hợp lệ.",
        });
      }

      let payload;

      try {
        payload = JSON.parse(rawBody);
      } catch {
        return res.status(400).json({
          success: false,
          message: "Webhook không phải JSON hợp lệ.",
        });
      }

      const providerTransactionId = String(payload?.id || "").trim();

      if (!providerTransactionId) {
        return res.status(400).json({
          success: false,
          message: "Webhook thiếu mã giao dịch.",
        });
      }

      const existingTransaction = await PaymentTransaction.findOne({
        providerTransactionId,
      }).lean();

      if (existingTransaction) {
        return res.json({
          success: true,
        });
      }

      const snapshot = await SharedSnapshot.findOne({
        key: "main",
      }).lean();

      const bankTransferSettings =
        snapshot?.settings?.payment?.bankTransfer || {};

      const expectedAccount = String(
        bankTransferSettings.accountNumber || "",
      ).trim();

      const transferType = String(payload?.transferType || "")
        .trim()
        .toLowerCase();

      const accountNumber = String(payload?.accountNumber || "").trim();

      const transferAmount = Number(payload?.transferAmount) || 0;

      const content = String(payload?.content || "").trim();

      const suppliedCode = String(payload?.code || "").trim();

      const orderCodePattern = /FS-\d{8}(?:-\d{4,12}|\d{2,12})/i;

      const contentOrderCode = content.match(orderCodePattern)?.[0] || "";

      const orderCode = suppliedCode || contentOrderCode;

      const paymentIntent = orderCode
        ? await PaymentIntent.findOne({
            orderCode: {
              $regex: `^${orderCode.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
              $options: "i",
            },
          })
        : null;

      const transaction = new PaymentTransaction({
        provider: "sepay",

        providerTransactionId,

        intentId: paymentIntent?.intentId || "",

        orderCode: paymentIntent?.orderCode || orderCode,

        gateway: String(payload?.gateway || ""),

        accountNumber,

        transferType,

        amount: transferAmount,

        content,

        code: suppliedCode,

        referenceCode: String(payload?.referenceCode || ""),

        transactionDate: String(payload?.transactionDate || ""),

        rawPayload: payload,

        matched: false,
      });

      /*
       * Nếu transaction đã được insert
       * bởi request khác cùng lúc,
       * unique index sẽ chặn bản ghi thứ hai.
       */

      try {
        await transaction.save();
      } catch (saveError) {
        if (saveError?.code === 11000) {
          return res.json({
            success: true,
          });
        }

        throw saveError;
      }

      if (transferType !== "in") {
        return res.json({
          success: true,
        });
      }

      if (!paymentIntent) {
        return res.json({
          success: true,
        });
      }

      if (paymentIntent.status === "paid") {
        return res.json({
          success: true,
        });
      }

      if (
        paymentIntent.expiresAt &&
        new Date(paymentIntent.expiresAt).getTime() < Date.now()
      ) {
        await PaymentIntent.updateOne(
          {
            _id: paymentIntent._id,
          },
          {
            $set: {
              status: "expired",
            },
          },
        );

        return res.json({
          success: true,
        });
      }

      /*
       * Bắt buộc đúng tài khoản nhận.
       */
      if (!expectedAccount || accountNumber !== expectedAccount) {
        return res.json({
          success: true,
        });
      }

      /*
       * Bắt buộc số tiền nhận >= số tiền yêu cầu.
       */
      if (transferAmount < Number(paymentIntent.amount)) {
        return res.json({
          success: true,
        });
      }

      /*
       * Bắt buộc nội dung có mã Payment Intent.
       */
      const normalizedContent = content.toUpperCase();

      const normalizedOrderCode = String(paymentIntent.orderCode).toUpperCase();

      if (!normalizedContent.includes(normalizedOrderCode)) {
        return res.json({
          success: true,
        });
      }

      const paidAt = new Date();

      const transactionSnapshot = {
        provider: "sepay",

        providerTransactionId,

        gateway: String(payload?.gateway || ""),

        accountNumber,

        transferType,

        amount: transferAmount,

        content,

        code: suppliedCode,

        referenceCode: String(payload?.referenceCode || ""),

        transactionDate: String(payload?.transactionDate || ""),
      };

      const updated = await PaymentIntent.findOneAndUpdate(
        {
          _id: paymentIntent._id,

          status: "pending",
        },
        {
          $set: {
            status: "paid",

            paidAt,

            transactionId: providerTransactionId,

            transaction: transactionSnapshot,
          },
        },
        {
          new: true,
        },
      );

      if (updated) {
        await PaymentTransaction.updateOne(
          {
            providerTransactionId,
          },
          {
            $set: {
              matched: true,

              intentId: paymentIntent.intentId,

              orderCode: paymentIntent.orderCode,
            },
          },
        );
      }

      return res.json({
        success: true,
      });
    } catch (error) {
      console.error("SePay webhook error:", error);

      return res.status(500).json({
        success: false,
        message: "Không thể xử lý webhook thanh toán.",
      });
    }
  },
);

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

app.get("/api/health", async (req, res) => {
  const verified = await verifyCloudinary();

  res.json({
    ok: true,

    databaseReady,

    cloudinaryConfigured,

    cloudinaryVerified: verified,

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

/*
==========================================================
CREATE PAYMENT INTENT
==========================================================
*/

const generatePaymentOrderCode = async () => {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const random = String(crypto.randomInt(0, 10000)).padStart(4, "0");

    const code = `FS-${year}${month}${day}-${random}`;

    const existing = await PaymentIntent.exists({
      orderCode: code,
    });

    if (!existing) {
      return code;
    }
  }

  throw new Error("Không thể tạo mã thanh toán duy nhất.");
};

app.post("/api/payments/intents", async (req, res, next) => {
  try {
    if (!databaseReady) {
      return res.status(503).json({
        message: "MongoDB chưa kết nối.",
      });
    }

    const amount = Number(req.body?.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Số tiền thanh toán không hợp lệ.",
      });
    }

    const snapshot = await SharedSnapshot.findOne({
      key: "main",
    }).lean();

    const bankTransferSettings =
      snapshot?.settings?.payment?.bankTransfer || {};

    if (bankTransferSettings.enabled === false) {
      return res.status(400).json({
        message: "Thanh toán chuyển khoản hiện đang được tắt.",
      });
    }

    if (!String(bankTransferSettings.accountNumber || "").trim()) {
      return res.status(400).json({
        message: "Shop chưa cấu hình tài khoản nhận chuyển khoản.",
      });
    }

    const orderCode = await generatePaymentOrderCode();

    const intentId = crypto.randomUUID();

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const paymentIntent = await PaymentIntent.create({
      intentId,

      orderCode,

      reference: orderCode,

      amount: Math.round(amount),

      currency: "VND",

      paymentMethod: "bank_transfer",

      status: "pending",

      expiresAt,
    });

    return res.status(201).json({
      success: true,

      paymentIntent: {
        id: paymentIntent.intentId,

        orderCode: paymentIntent.orderCode,

        amount: paymentIntent.amount,

        currency: paymentIntent.currency,

        status: paymentIntent.status,

        expiresAt: paymentIntent.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

/*
==========================================================
GET PAYMENT INTENT STATUS
==========================================================
*/
app.post("/api/payments/intents/:intentId/started", async (req, res, next) => {
  try {
    if (!databaseReady) {
      return res.status(503).json({
        message: "MongoDB chưa kết nối.",
      });
    }

    const intentId = String(req.params.intentId || "").trim();

    if (!intentId) {
      return res.status(400).json({
        message: "Thiếu mã Payment Intent.",
      });
    }

    const paymentIntent = await PaymentIntent.findOneAndUpdate(
      {
        intentId,
        status: "pending",
      },
      {
        $set: {
          paymentAttemptedAt: new Date(),
        },
      },
      {
        new: true,
      },
    ).lean();

    if (!paymentIntent) {
      return res.status(404).json({
        message:
          "Payment Intent không tồn tại hoặc không còn ở trạng thái chờ thanh toán.",
      });
    }

    return res.json({
      success: true,

      paymentIntent: {
        id: paymentIntent.intentId,

        orderCode: paymentIntent.orderCode,

        reference: paymentIntent.reference || paymentIntent.orderCode || "",

        amount: paymentIntent.amount,

        currency: paymentIntent.currency,

        status: paymentIntent.status,

        expiresAt: paymentIntent.expiresAt,

        paymentAttemptedAt: paymentIntent.paymentAttemptedAt || null,

        paidAt: paymentIntent.paidAt || null,

        transactionId: paymentIntent.transactionId || "",

        transaction: paymentIntent.transaction || null,
      },
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/payments/intents/:intentId", async (req, res, next) => {
  try {
    if (!databaseReady) {
      return res.status(503).json({
        message: "MongoDB chưa kết nối.",
      });
    }

    const intentId = String(req.params.intentId || "").trim();

    if (!intentId) {
      return res.status(400).json({
        message: "Thiếu mã Payment Intent.",
      });
    }

    const paymentIntent = await PaymentIntent.findOne({
      intentId,
    }).lean();

    if (!paymentIntent) {
      return res.status(404).json({
        message: "Không tìm thấy Payment Intent.",
      });
    }

    let status = paymentIntent.status;

    if (
      status === "pending" &&
      paymentIntent.expiresAt &&
      new Date(paymentIntent.expiresAt).getTime() < Date.now()
    ) {
      await PaymentIntent.updateOne(
        {
          _id: paymentIntent._id,
        },
        {
          $set: {
            status: "expired",
          },
        },
      );

      status = "expired";
    }

    return res.json({
      success: true,

      paymentIntent: {
        id: paymentIntent.intentId,

        orderCode: paymentIntent.orderCode,

        amount: paymentIntent.amount,

        currency: paymentIntent.currency,

        status,

        expiresAt: paymentIntent.expiresAt,

        paidAt: paymentIntent.paidAt,

        transactionId: paymentIntent.transactionId || "",

        reference: paymentIntent.reference || paymentIntent.orderCode || "",

        transaction: status === "paid" ? paymentIntent.transaction : null,
      },
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

    const configured = configureCloudinary();

    if (!configured) {
      cloudinaryConfigured = false;

      cloudinaryVerified = false;

      return res.status(503).json({
        message:
          "Cloudinary chưa được cấu hình đúng. Hãy kiểm tra CLOUDINARY_URL hoặc CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY và CLOUDINARY_API_SECRET trong backend/.env.",
      });
    }

    try {
      await cloudinary.api.ping();

      cloudinaryVerified = true;
    } catch (verificationError) {
      cloudinaryVerified = false;

      console.error(
        "Cloudinary verification failed:",
        verificationError?.message || verificationError,
      );

      return res.status(503).json({
        message:
          "Cloudinary không xác thực được thông tin cấu hình. Hãy kiểm tra lại Cloud Name, API Key và API Secret trong Cloudinary Console.",

        detail: verificationError?.message || "Cloudinary verification failed.",
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
