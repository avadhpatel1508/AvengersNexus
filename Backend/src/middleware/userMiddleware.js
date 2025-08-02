const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redish");

const userMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "auth/no-token",
        message: "Authentication token is missing",
      });
    }

    const isBlocked = await redisClient.get(`token:${token}`);
    if (isBlocked) {
      return res.status(401).json({
        success: false,
        error: "auth/token-blocked",
        message: "Session expired. Please log in again.",
      });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_KEY);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: "auth/invalid-token",
        message: "Invalid or expired token",
      });
    }

    const user = await User.findById(payload._id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "auth/user-not-found",
        message: "User not found",
      });
    }

    req.user = user;
    req.token = token; // optional
    next();
  } catch (error) {
    console.error("🛡️ Auth Middleware Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = userMiddleware;
