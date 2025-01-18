const app = require("./app");
const db = require("./database/index.js");

db.on("open", () => {
  console.log("Database connection successful");
});

db.on("error", (err) => {
  console.error("Database connection error:", err);
});

module.exports = app;
