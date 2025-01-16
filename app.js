var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const cors = require("cors");
const timeout = require("connect-timeout");
const { decodeToken } = require("./middlewares");
const productRoute = require("./app/product/routes.js");
const categoryRoute = require("./app/category/routes.js");
const tagRoute = require("./app/tag/routes.js");
const authRoute = require("./app/auth/routes.js");
const deliveryAddressRoute = require("./app/deliveryAddress/routes.js");
const cartRoute = require("./app/cart/routes.js");
const orderRoute = require("./app/order/routes.js");
const invoiceRoute = require("./app/invoice/routes.js");
const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Intercept OPTIONS method
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log("Origin:", req.headers.origin);
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  next();
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(decodeToken);

app.use("/auth", authRoute);
app.use("/api", productRoute);
app.use("/api", categoryRoute);
app.use("/api", tagRoute);
app.use("/api", deliveryAddressRoute);
app.use("/api", cartRoute);
app.use("/api", orderRoute);
app.use("/api", invoiceRoute);

//home
app.use("/", function (req, res) {
  res.json({
    message: "Eduwork API Service",
    status: "Running",
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  if (err.timeout) {
    return res.status(504).json({
      error: "Server timeout",
      message: "The request took too long to process",
    });
  }

  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    status: err.status || 500,
  });
});

module.exports = app;
