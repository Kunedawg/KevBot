// const jwt = require("jsonwebtoken");
// const { API_JWT_SECRET } = require("../config/secrets");
const authService = require("../services/authService");

async function jwtAuth(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Access token is missing" });
    const user = await authService.verifyToken(token);
    if (!user) return res.status(403).json({ error: "Invalid access token" });
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = jwtAuth;
