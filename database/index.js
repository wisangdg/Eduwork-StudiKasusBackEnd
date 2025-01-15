const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

const { DB_HOST, DB_PASS, DB_NAME, DB_USER } = process.env;

const connectionString = `mongodb+srv://${DB_USER}:${DB_PASS}@${DB_HOST}/${DB_NAME}?retryWrites=true&w=majority`;

mongoose
  .connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Berhasil terhubung ke MongoDB Atlas"))
  .catch((err) => console.error("Gagal terhubung ke MongoDB Atlas:", err));

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Koneksi error:"));
db.once("open", () => {
  console.log("Koneksi ke database berhasil dibuka");
});

module.exports = db;
