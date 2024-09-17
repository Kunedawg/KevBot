const jwt = require("jsonwebtoken");
const { API_JWT_SECRET } = require("../config/secrets");

function jwtAuth(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Access token is missing" });

    jwt.verify(token, API_JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ error: "Invalid access token" });
      req.user = user;
      next();
    });
  } catch (error) {
    next(error);
  }
}

module.exports = jwtAuth;
