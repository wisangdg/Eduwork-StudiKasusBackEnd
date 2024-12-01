const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const invoiceSchema = Schema(
  {
    sub_total: {
      type: Number,
      required: [true, "sub total harus diisi"],
    },
    delivery_fee: {
      type: Number,
      required: [true, "delivery fee harus diisi"],
    },
    delivery_address: {
      provinsi: { type: String, required: [true, "Provinsi harus diisi"] },
      kabupaten: { type: String, required: [true, "Kabupaten harus diisi"] },
      kecamatan: { type: String, required: [true, "Kecamatan harus diisi"] },
      kelurahan: { type: String, required: [true, "Kelurahan harus diisi"] },

      detail: { type: String },
    },

    total: {
      type: Number,
      required: [true, "total harus diisi"],
    },

    payment_status: {
      type: String,
      enum: ["waiting payment", "paid"],
      default: "waiting payment",
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    order_items: [
      {
        type: Schema.Types.ObjectId,
        ref: "OrderItem",
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("Invoice", invoiceSchema);
