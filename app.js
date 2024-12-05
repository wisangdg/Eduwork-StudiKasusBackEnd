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

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(cors());
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
  res.render("index", {
    title: "Eduwork API Service",
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
