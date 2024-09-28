const authService = require("../services/authService");

exports.requireAuth = async (req, res, next) => {
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
};

exports.optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (token) {
      try {
        const user = await authService.verifyToken(token);
        req.user = user;
      } catch {
        // no error handling needed. Requests can proceed as anonymous user.
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};
