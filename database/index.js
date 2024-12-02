const mongoose = require("mongoose");
const { dbHost, dbPass, dbName, dbPort, dbUser } = require("../app/config.js");

const connectionString = `mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?authSource=admin`;

mongoose
  .connect(connectionString, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("Berhasil terhubung ke MongoDB"))
  .catch((err) => console.error("Gagal terhubung ke MongoDB:", err));

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Koneksi error:"));
db.once("open", () => {
  console.log("Koneksi ke database berhasil dibuka");
});

module.exports = db;
