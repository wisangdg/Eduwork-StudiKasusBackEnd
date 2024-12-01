const { getToken, policyFor } = require("../utils/index.js");
const jwt = require("jsonwebtoken");
const config = require("../app/config.js");
const User = require("../app/user/model.js");

function decodeToken() {
  return async function (req, res, next) {
    try {
      let token = getToken(req);

      if (!token) return next();

      req.user = jwt.verify(token, config.secretKey);

      let user = await User.findOne({ token: { $in: [token] } });

      if (!user) {
        res.json({
          error: 1,
          message: "Token Expired",
        });
      }
    } catch (err) {
      if (err && err.name === "JsonWebTokenError") {
        return res.json({
          error: 1,
          message: err.message,
        });
      }

      next(err);
    }

    return next();
  };
}

//middleware untuk check hak akses
function police_check(action, subject) {
  return function (req, res, next) {
    let policy = policyFor(req.user);
    if (!policy.can(action, subject)) {
      return res.json({
        error: 1,
        message: `You are not allowed to ${action} ${subject}`,
      });
    }
  };
}

module.exports = {
  decodeToken,
  police_check,
};
