const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redish");

const adminMiddleware = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) throw new Error("Token is not present");

    const payload = jwt.verify(token, process.env.JWT_KEY);
    const { _id } = payload;

    const isBlocked = await redisClient.exists(`token:${token}`);
    if (isBlocked) throw new Error("Invalid Token (blacklisted)");

    const user = await User.findById(_id);
    if (!user) throw new Error("User doesn't exist");

    if (user.role !== 'admin') {
      throw new Error("Access denied: Admins only");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("🔐 Admin Middleware Error:", error.message);
    return res.status(403).json({ success: false, message: error.message });
  }
};

module.exports = adminMiddleware;