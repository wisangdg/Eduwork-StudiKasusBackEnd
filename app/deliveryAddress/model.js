const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const deliveryAddressSchema = Schema(
  {
    name: {
      type: String,
      maxlength: [255, "Panjang nama alamat maksimal 255 karakter"],
      required: [true, "Nama alamat harus diisi"],
    },

    kelurahan: {
      type: String,
      required: true,
      maxlength: [255, "Panjang kelurahan maksimal 255 karakter"],
    },

    kecamatan: {
      type: String,
      required: [true, "Kecamatan harus diisi"],
      maxlength: [255, "Panjang nama kecamatan maksimal 255 karakter"],
    },

    kabupaten: {
      type: String,
      required: [true, "Kecamatan harus diisi"],
      maxlength: [255, "Panjang nama kabupaten maksimal 255 karakter"],
    },

    provinsi: {
      type: String,
      required: [true, "Kecamatan harus diisi"],
      maxlength: [255, "Panjang nama kabupaten maksimal 255 karakter"],
    },

    detail: {
      type: String,
      required: [true, "Detail alamat harus diisi"],
      maxlength: [1000, "Panjang detail alamat maksimal 1000 karakter"],
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = model("DeliveryAddress", deliveryAddressSchema);
