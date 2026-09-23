const mongoose = require("mongoose");

const connectDatabase = async () => {
  const uri = String(process.env.MONGODB_URI || "").trim();

  if (!uri) {
    throw new Error("Thiếu MONGODB_URI trong backend/.env.");
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log("MongoDB connected successfully.");
};

const disconnectDatabase = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

module.exports = {
  connectDatabase,
  disconnectDatabase,
};
