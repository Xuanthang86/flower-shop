const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
  if (!secret) throw Object.assign(new Error("JWT_SECRET chưa được cấu hình."), { status: 503 });
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

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const register = async ({ name, fullName, email, phone, password }) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) {
    throw Object.assign(new Error("Email và mật khẩu là bắt buộc."), { status: 400 });
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
    throw Object.assign(new Error("Email hoặc mật khẩu không đúng."), { status: 401 });
  }

  if (!user.passwordHash) {
    throw Object.assign(new Error("Tài khoản này chưa có mật khẩu đăng nhập."), { status: 401 });
  }

  const matched = await bcrypt.compare(String(password || ""), user.passwordHash);
  if (!matched) {
    throw Object.assign(new Error("Email hoặc mật khẩu không đúng."), { status: 401 });
  }

  user.lastLoginAt = new Date();
  await user.save();

  return { user: sanitizeUser(user), token: issueToken(user) };
};

const upsertGoogleUser = async ({ email, name, avatar, providerId }) => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !providerId) {
    throw Object.assign(new Error("Thông tin Google không đầy đủ."), { status: 400 });
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

module.exports = {
  sanitizeUser,
  issueToken,
  register,
  login,
  upsertGoogleUser,
};
