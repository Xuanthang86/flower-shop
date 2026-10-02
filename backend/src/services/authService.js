const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const sanitizeUser = (user) => {
  if (!user) return null;

  return {
    id: String(user._id || user.id),
    name: user.name || "",
    fullName: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    avatar: user.avatar || "",
    role: user.role || "customer",
    disabled: Boolean(user.disabled),
    emailVerified: Boolean(user.emailVerified),
    provider: user.provider || "local",
    providerId: user.providerId || "",
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null,
    lastLoginAt: user.lastLoginAt || null,
  };
};

const getJwtSecret = () => {
  const secret = String(process.env.JWT_SECRET || "").trim();
  if (!secret)
    throw Object.assign(new Error("JWT_SECRET chưa được cấu hình."), {
      status: 503,
    });
  return secret;
};

const issueToken = (user) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(
    { sub: String(user._id), role: user.role, email: user.email },
    getJwtSecret(),
    { expiresIn },
  );
};

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

const register = async ({ name, fullName, email, phone, password }) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    throw Object.assign(new Error("Email và mật khẩu là bắt buộc."), {
      status: 400,
    });
  }

  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) {
    throw Object.assign(new Error("Email đã được sử dụng."), { status: 409 });
  }

  const passwordHash = await bcrypt.hash(String(password), 12);
  const user = await User.create({
    name: String(name || fullName || "").trim(),
    email: normalizedEmail,
    phone: String(phone || "").trim(),
    passwordHash,
    provider: "local",
    emailVerified: false,
  });

  return { user: sanitizeUser(user), token: issueToken(user) };
};

const login = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });

  if (!user || user.disabled) {
    throw Object.assign(new Error("Email hoặc mật khẩu không đúng."), {
      status: 401,
    });
  }

  if (!user.passwordHash) {
    throw Object.assign(
      new Error("Tài khoản này chưa có mật khẩu đăng nhập."),
      { status: 401 },
    );
  }

  const matched = await bcrypt.compare(
    String(password || ""),
    user.passwordHash,
  );
  if (!matched) {
    throw Object.assign(new Error("Email hoặc mật khẩu không đúng."), {
      status: 401,
    });
  }

  user.lastLoginAt = new Date();
  await user.save();

  return { user: sanitizeUser(user), token: issueToken(user) };
};

const upsertGoogleUser = async ({ email, name, avatar, providerId }) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !providerId) {
    throw Object.assign(new Error("Thông tin Google không đầy đủ."), {
      status: 400,
    });
  }

  let user = await User.findOne({
    $or: [{ email: normalizedEmail }, { provider: "google", providerId }],
  });

  if (!user) {
    user = await User.create({
      name: String(name || "").trim() || normalizedEmail,
      email: normalizedEmail,
      avatar: String(avatar || "").trim(),
      provider: "google",
      providerId: String(providerId),
      emailVerified: true,
      lastLoginAt: new Date(),
    });
  } else {
    user.name = String(name || user.name || normalizedEmail).trim();
    user.avatar = String(avatar || user.avatar || "").trim();
    user.provider = "google";
    user.providerId = String(providerId);
    user.emailVerified = true;
    user.lastLoginAt = new Date();
    await user.save();
  }

  return { user: sanitizeUser(user), token: issueToken(user) };
};

const resolveRecoveryUser = async (identifier) => {
  const value = String(identifier || "").trim();

  if (!value) {
    throw Object.assign(new Error("Vui lòng nhập email hoặc số điện thoại."), {
      status: 400,
    });
  }

  const normalizedEmail = value.toLowerCase();

  const user = await User.findOne({
    $or: [{ email: normalizedEmail }, { phone: value }],
  });

  if (!user || user.disabled) {
    throw Object.assign(new Error("Không tìm thấy tài khoản phù hợp."), {
      status: 404,
    });
  }

  return user;
};

const createMailer = () => {
  const host = String(process.env.SMTP_HOST || "").trim();

  const port = Number(process.env.SMTP_PORT || 587);

  const user = String(process.env.SMTP_USER || "").trim();

  const pass = String(process.env.SMTP_PASS || "").trim();

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
    auth: {
      user,
      pass,
    },
  });
};

const requestPasswordReset = async ({ identifier }) => {
  const user = await resolveRecoveryUser(identifier);

  const code = String(crypto.randomInt(0, 1000000)).padStart(6, "0");

  const codeHash = crypto.createHash("sha256").update(code).digest("hex");

  user.resetCodeHash = codeHash;

  user.resetCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  user.resetRequestedAt = new Date();

  await user.save();

  const transporter = createMailer();

  if (!transporter) {
    if (String(process.env.DEV_EXPOSE_RESET_CODE).toLowerCase() === "true") {
      return {
        message: "Mã xác minh được tạo ở chế độ phát triển.",
        devCode: code,
      };
    }

    throw Object.assign(
      new Error("SMTP chưa được cấu hình để gửi mã xác minh."),
      { status: 503 },
    );
  }

  const from = String(process.env.SMTP_FROM || process.env.SMTP_USER).trim();

  await transporter.sendMail({
    from,
    to: user.email,
    subject: "Mã xác minh khôi phục mật khẩu - HTH Flower Shop",
    text: [
      `Mã xác minh của bạn là: ${code}`,
      "",
      "Mã có hiệu lực trong 10 phút.",
      "Nếu bạn không yêu cầu khôi phục mật khẩu, hãy bỏ qua email này.",
    ].join("\n"),
  });

  return {
    message: "Mã xác minh đã được gửi đến email của tài khoản.",
  };
};

const resetPassword = async ({ identifier, code, newPassword }) => {
  const user = await resolveRecoveryUser(identifier);

  const passwordHash = await bcrypt.hash(String(newPassword), 12);

  const normalizedCode = String(code || "").trim();

  const codeHash = crypto
    .createHash("sha256")
    .update(normalizedCode)
    .digest("hex");

  if (!user.resetCodeHash || user.resetCodeHash !== codeHash) {
    throw Object.assign(new Error("Mã xác minh không chính xác."), {
      status: 400,
    });
  }

  if (
    !user.resetCodeExpiresAt ||
    new Date(user.resetCodeExpiresAt).getTime() < Date.now()
  ) {
    throw Object.assign(
      new Error("Mã xác minh đã hết hạn. Vui lòng yêu cầu mã mới."),
      { status: 400 },
    );
  }

  user.passwordHash = passwordHash;

  user.provider = "local";

  user.resetCodeHash = "";

  user.resetCodeExpiresAt = null;

  user.resetRequestedAt = null;

  await user.save();

  return {
    message: "Đặt lại mật khẩu thành công.",
  };
};

const changePassword = async ({ userId, currentPassword, newPassword }) => {
  const user = await User.findById(userId);

  if (!user) {
    throw Object.assign(new Error("Không tìm thấy tài khoản."), {
      status: 404,
    });
  }

  if (!user.passwordHash) {
    throw Object.assign(new Error("Tài khoản chưa có mật khẩu."), {
      status: 400,
    });
  }

  const matched = await bcrypt.compare(
    String(currentPassword || ""),
    user.passwordHash,
  );

  if (!matched) {
    throw Object.assign(new Error("Mật khẩu hiện tại không chính xác."), {
      status: 400,
    });
  }

  user.passwordHash = await bcrypt.hash(String(newPassword), 12);

  await user.save();

  return {
    message: "Đổi mật khẩu thành công.",
  };
};

module.exports = {
  sanitizeUser,
  issueToken,
  register,
  login,
  upsertGoogleUser,
  changePassword,
  requestPasswordReset,
  resetPassword,
};
