var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var app = express();
const cors = require("cors");
const { decodeToken } = require("./middlewares");
const productRoute = require("./app/product/routes.js");
const categoryRoute = require("./app/category/routes.js");
const tagRoute = require("./app/tag/routes.js");
const authRoute = require("./app/auth/routes.js");
const deliveryAddressRoute = require("./app/deliveryAddress/routes.js");
const cartRoute = require("./app/cart/routes.js");
const orderRoute = require("./app/order/routes.js");
const invoiceRoute = require("./app/invoice/routes.js");

app.use(
  cors({
    origin: [
      "https://eduwork-studi-kasus-front-end.vercel.app",
      "https://eduwork-studi-kasus-front-git-500630-wisang-drillians-projects.vercel.app/",
      "https://eduwork-studi-kasus-front-kqy9aq4w4-wisang-drillians-projects.vercel.app",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    exposedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false,
  })
);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Credentials", true);
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
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
      status: err.status || 500,
    },
  });
});

module.exports = app;
