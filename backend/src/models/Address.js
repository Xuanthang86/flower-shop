const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recipientName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
      maxlength: 200,
    },

    provinceCode: {
      type: String,
      default: "",
      trim: true,
    },

    provinceName: {
      type: String,
      default: "",
      trim: true,
    },

    wardCode: {
      type: String,
      default: "",
      trim: true,
    },

    wardName: {
      type: String,
      default: "",
      trim: true,
    },

    houseNumber: {
      type: String,
      default: "",
      trim: true,
    },

    street: {
      type: String,
      default: "",
      trim: true,
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },

    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

addressSchema.index({
  userId: 1,
  isDefault: 1,
});

module.exports =
  mongoose.models.Address || mongoose.model("Address", addressSchema);
