require("dotenv").config();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const User = require("../src/models/User");

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@hthflowershop.vn";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@12345";

const ADMIN_NAME = process.env.ADMIN_NAME || "Administrator";

const main = async () => {
  if (!MONGO_URI) {
    throw new Error(
      "Chưa cấu hình MONGODB_URI hoặc MONGO_URI trong backend/.env.",
    );
  }

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("ADMIN_EMAIL và ADMIN_PASSWORD không được để trống.");
  }

  await mongoose.connect(MONGO_URI);

  const passwordHash = await bcrypt.hash(String(ADMIN_PASSWORD), 12);

  const normalizedEmail = String(ADMIN_EMAIL).trim().toLowerCase();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    existingUser.name = ADMIN_NAME;
    existingUser.role = "admin";
    existingUser.disabled = false;
    existingUser.passwordHash = passwordHash;
    existingUser.provider = "local";
    existingUser.emailVerified = true;

    await existingUser.save();

    console.log(`Đã cập nhật tài khoản Admin: ${normalizedEmail}`);
  } else {
    await User.create({
      name: ADMIN_NAME,
      email: normalizedEmail,
      passwordHash,
      role: "admin",
      disabled: false,
      provider: "local",
      emailVerified: true,
    });

    console.log(`Đã tạo tài khoản Admin: ${normalizedEmail}`);
  }

  await mongoose.disconnect();

  console.log("Hoàn tất.");
};

main().catch(async (error) => {
  console.error("Không thể tạo/cập nhật Admin:", error);

  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect errors
  }

  process.exit(1);
});
