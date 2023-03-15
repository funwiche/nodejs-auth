require("dotenv").config();
const JWT = require("jsonwebtoken");
const SECRET = process.env.ACCESS_TOKEN_SECRET;

/** Verify Token */
module.exports = (req, res, next) => {
  const auth_header = req.headers["authorization"];
  const token = auth_header && auth_header.split(" ")[1];
  if (token == null) return res.status(401).json("no-token");
  JWT.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json("invalid-token");
    req.user = user;
    next();
  });
};
