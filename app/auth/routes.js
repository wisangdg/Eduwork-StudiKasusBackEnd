const router = require("express").Router();
const { decodeToken } = require("../../middlewares/index.js");
const authController = require("./controller.js");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

passport.use(
  new LocalStrategy({ usernameField: "email" }, authController.localStrategy)
);
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", decodeToken, authController.me);

module.exports = router;
