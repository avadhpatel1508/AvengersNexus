const jwt = require("jsonwebtoken");
const User = require("../models/user");
const redisClient = require("../config/redish");

const userMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) throw new Error("Token is not present");

        // Verify JWT
        const payload = jwt.verify(token, process.env.JWT_KEY);
        const { _id } = payload;
        if (!_id) throw new Error("Invalid token");

        // Check if token is blocklisted in Redis
        const isBlocked = await redisClient.exists(`token:${token}`);
        if (isBlocked) throw new Error("Token is blocked, please login again");

        // Find user in DB
        const result = await User.findById(_id);
        if (!result) throw new Error("User does not exist");
        console.log("Cookies received: ", req.cookies);

        req.result = result; // Attach the user to request
        next();
    } catch (error) {
        res.status(401).send("Unauthorized access: " + error.message);
    }
};

module.exports = userMiddleware;
