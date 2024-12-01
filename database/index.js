const mongoose = require("mongoose");
const { dbHost, dbPass, dbName, dbPort, dbUser } = require("../app/config.js");
mongoose
  .connect(
    `mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?authSource=admin`
  )
  .then(() => console.log("Berhasil terhubung ke MongoDB"))
  .catch((err) => console.error("Gagal terhubung ke MongoDB:", err));

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Koneksi error:"));

module.exports = db;

//"mongodb://127.0.0.1:27017/eduworkstore"
