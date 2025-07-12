const redisClient = require("../config/redish");
const User = require("../models/user");
const validate = require("../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Helper to generate token
const generateToken = (user) => {
    return jwt.sign(
        { _id: user._id, emailId: user.emailId, role: user.role },
        process.env.JWT_KEY,
        { expiresIn: '7d' }
    );
};

// -------------------- Register --------------------
const register = async (req, res) => {
    try {
        validate(req.body);
        const { firstName, emailId, passWord } = req.body;

        const hashedPassword = await bcrypt.hash(passWord, 10);
        const user = await User.create({ ...req.body, passWord: hashedPassword });

        const token = generateToken(user);

        res.cookie('token', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            httpOnly: true,
            sameSite: 'lax',
            secure:false
        });

        res.status(201).json({
            user: {
                firstName: user.firstName,
                emailId: user.emailId,
                _id: user._id,
            },
            message: "Register successfully"
        });
    } catch (err) {
        console.error("Register Error:", err.message);
        res.status(400).send("Error: " + err.message);
    }
};

// -------------------- Login --------------------
const login = async (req, res) => {
    try {
        const { emailId, passWord } = req.body;

        if (!emailId || !passWord) throw new Error("Invalid Credentials");

        const user = await User.findOne({ emailId });
        if (!user) throw new Error("User not found");

        const match = await bcrypt.compare(passWord, user.passWord);
        if (!match) throw new Error("Invalid Credentials");

        const token = generateToken(user);

        res.cookie('token', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'lax',
            secure:false
        });

        res.status(200).json({
            user: {
                firstName: user.firstName,
                emailId: user.emailId,
                _id: user._id,
                role: user.role
            },
            message: "Login successfully"
        });
    } catch (err) {
        console.error("Login Error:", err.message);
        res.status(401).send("Error: " + err.message);
    }
};

// -------------------- Logout --------------------
const logout = async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) throw new Error("Token missing in cookies");

        const payload = jwt.decode(token);
        if (!payload || !payload.exp) throw new Error("Invalid token");

        await redisClient.set(`token:${token}`, 'Blocked');
        await redisClient.expireAt(`token:${token}`, payload.exp);

        res.cookie("token", null, { expires: new Date(0), httpOnly: true });
        res.send("Logout successfully");
    } catch (err) {
        console.error("Logout Error:", err.message);
        res.status(401).send("Error: " + err.message);
    }
};

// -------------------- Admin Register --------------------
const adminRegister = async (req, res) => {
    try {
        validate(req.body);

        const hashedPassword = await bcrypt.hash(req.body.passWord, 10);
        const user = await User.create({ ...req.body, passWord: hashedPassword, role: "admin" });

        const token = generateToken(user);

        res.cookie('token', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'lax',
        });

        res.status(201).send("Admin registered successfully");
    } catch (err) {
        console.error("Admin Register Error:", err.message);
        res.status(400).send("Error: " + err.message);
    }
};

// -------------------- Delete Profile --------------------
const deleteProfile = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.result._id);
        res.status(200).send("Profile deleted successfully");
    } catch (err) {
        console.error("Delete Profile Error:", err.message);
        res.status(500).send("Internal server error");
    }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("firstName emailId _id role");
    res.status(200).json({
      users,
      message: "Users retrieved successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving users",
      error: error.message,
    });
  }
}
const getPresentUsers = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const users = await User.find({
      attendance: {
        $elemMatch: {
          date: { $gte: new Date(startDate), $lte: new Date(endDate) },
          status: "Present"
        }
      }
    }).select('firstName lastName'); // optional: limit returned fields

    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: "Error fetching present users", error: err.message });
  }
};
module.exports = { register, login, logout, adminRegister, deleteProfile , getAllUsers, getPresentUsers};
