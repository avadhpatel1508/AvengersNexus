const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redish");

const adminMiddleware = async (req, res, next) => {
  try {
    // ✅ Extract token from cookies or Authorization header
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) throw new Error("Token is not present");

    // ✅ Verify JWT
    const payload = jwt.verify(token, process.env.JWT_KEY);
    const { _id, role } = payload;

    if (!role || role !== "admin") {
      throw new Error("Access denied: Admins only");
    }

    // ✅ Check if token is blacklisted in Redis
    const isBlocked = await redisClient.exists(`token:${token}`);
    if (isBlocked) throw new Error("Invalid Token (blacklisted)");

    // ✅ Check if user exists in MongoDB
    const user = await User.findById(_id);
    if (!user) throw new Error("User doesn't exist");

    // ✅ Attach user to request for further use
    req.user = user;
    next();
  } catch (error) {
    console.error("🔐 Admin Middleware Error:", error.message);
    return res.status(401).json({ success: false, message: error.message });
  }
};

module.exports = adminMiddleware;
