require("dotenv").config();

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../src/models/User");

const INPUT_FILE = path.join(__dirname, "bulk-staff.json");

const ALLOWED_ROLES = new Set(["manager", "product_manager"]);

const MIN_PASSWORD_LENGTH = 8;

const loadAccounts = () => {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Không tìm thấy file dữ liệu: ${INPUT_FILE}`);
  }

  const raw = fs.readFileSync(INPUT_FILE, "utf8");

  const accounts = JSON.parse(raw);

  if (!Array.isArray(accounts)) {
    throw new Error("bulk-staff.json phải chứa một mảng tài khoản.");
  }

  return accounts;
};

const validateAccount = (account, index) => {
  const row = index + 1;

  const name = String(account?.name || "").trim();

  const email = String(account?.email || "")
    .trim()
    .toLowerCase();

  const phone = String(account?.phone || "").trim();

  const password = String(account?.password || "");

  const role = String(account?.role || "")
    .trim()
    .toLowerCase();

  if (!name) {
    throw new Error(`Dòng ${row}: thiếu name.`);
  }

  if (!email) {
    throw new Error(`Dòng ${row}: thiếu email.`);
  }

  if (!phone) {
    throw new Error(`Dòng ${row}: thiếu phone.`);
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `Dòng ${row}: mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`,
    );
  }

  if (!ALLOWED_ROLES.has(role)) {
    throw new Error(
      `Dòng ${row}: role "${role}" không hợp lệ. ` +
        `Chỉ được manager hoặc product_manager.`,
    );
  }

  return {
    name,
    email,
    phone,
    password,
    role,
  };
};

const createAccounts = async () => {
  const accounts = loadAccounts();

  if (accounts.length === 0) {
    throw new Error("Không có tài khoản nào trong bulk-staff.json.");
  }

  const validatedAccounts = accounts.map(validateAccount);

  const emailSet = new Set();
  const phoneSet = new Set();

  for (const account of validatedAccounts) {
    if (emailSet.has(account.email)) {
      throw new Error(`Email bị trùng trong file: ${account.email}`);
    }

    if (phoneSet.has(account.phone)) {
      throw new Error(`Số điện thoại bị trùng trong file: ${account.phone}`);
    }

    emailSet.add(account.email);
    phoneSet.add(account.phone);
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error("Thiếu MONGODB_URI trong backend/.env.");
  }

  await mongoose.connect(mongoUri);

  console.log("MongoDB connected.");

  let created = 0;
  let skipped = 0;

  try {
    for (const account of validatedAccounts) {
      const exists = await User.findOne({
        $or: [{ email: account.email }, { phone: account.phone }],
      });

      if (exists) {
        console.log(
          `SKIP: ${account.email} - email hoặc số điện thoại đã tồn tại.`,
        );

        skipped += 1;

        continue;
      }

      const passwordHash = await bcrypt.hash(account.password, 12);

      await User.create({
        name: account.name,
        email: account.email,
        phone: account.phone,
        passwordHash,
        role: account.role,
        provider: "local",
        emailVerified: false,
        disabled: false,
      });

      console.log(`CREATED: ${account.email} [${account.role}]`);

      created += 1;
    }

    console.log("");
    console.log("===== KẾT QUẢ =====");
    console.log(`Đã tạo: ${created}`);
    console.log(`Bỏ qua: ${skipped}`);
    console.log(`Tổng: ${validatedAccounts.length}`);
  } finally {
    await mongoose.disconnect();
  }
};

createAccounts().catch(async (error) => {
  console.error("");
  console.error("===== BULK CREATE FAILED =====");
  console.error(error.message);

  try {
    await mongoose.disconnect();
  } catch {
    // Không làm gì nếu MongoDB chưa kết nối.
  }

  process.exit(1);
});
