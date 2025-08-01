const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redish");

const userMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Fallback: Allow Bearer token in header too
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new Error("Token is not present");
    }

    // Verify JWT
    const payload = jwt.verify(token, process.env.JWT_KEY);
    if (!payload?._id) {
      throw new Error("Invalid token payload");
    }

    // Redis blocklist check
    const isBlocked = await redisClient.exists(`token:${token}`);
    if (isBlocked) {
      throw new Error("Token is blocked, please login again");
    }

    // Get user from DB
    const user = await User.findById(payload._id);
    if (!user) {
      throw new Error("User does not exist");
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    console.error("🛡️ Auth Error:", error.message);
    res.status(401).json({
      success: false,
      message: "Unauthorized access",
      error: error.message,
    });
  }
};

module.exports = userMiddleware;
