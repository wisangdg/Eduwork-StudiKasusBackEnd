const { policyFor } = require("../utils/index.js");
const jwt = require("jsonwebtoken");
const config = require("../app/config.js");
const User = require("../app/user/model.js");
const { getToken } = require("../utils/index.js");

const decodeToken = async (req, res, next) => {
  try {
    const token = getToken(req);
    console.log("Authorization Header:", token);
    if (!token) return next();

    // Verifikasi token
    jwt.verify(token, config.secretKey);

    // Cari user berdasarkan token
    let user = await User.findOne({ token: { $in: [token] } });
    if (!user) {
      return res.json({
        error: 1,
        message: "Token Expired",
      });
    }

    req.user = user;
    return next();
  } catch (err) {
    if (err && err.name === "JsonWebTokenError") {
      return res.json({
        error: 1,
        message: err.message,
      });
    }
    // Tangani error lainnya
    return res.status(500).json({
      error: 1,
      message: "Internal Server Error",
    });
  }
};

// Middleware untuk memeriksa hak akses
function police_check(action, subject) {
  return function (req, res, next) {
    let policy = policyFor(req.user);
    if (!policy.can(action, subject)) {
      return res.json({
        error: 1,
        message: `You are not allowed to ${action} ${subject}`,
      });
    }
    next();
  };
}

module.exports = {
  decodeToken,
  police_check,
};
