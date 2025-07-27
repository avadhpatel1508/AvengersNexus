const redisClient = require("../config/redish");
const User = require("../models/user");
const validate = require("../utils/validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendOtpMail } = require("../utils/mailer");

// Helper to generate token
const generateToken = (user) => {
  return jwt.sign(
    { _id: user._id, emailId: user.emailId, role: user.role },
    process.env.JWT_KEY,
    { expiresIn: "7d" }
  );
};

// -------------------- Register --------------------
const SendOtpSignup = async (req, res) => {
  const { emailId } = req.body;
  const normalizedEmail = emailId.trim().toLowerCase();
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  try {
    await redisClient.set(`otp:${normalizedEmail}`, otp, { EX: 300 }); // expires in 5 min
    await sendOtpMail(normalizedEmail, otp);

    console.log("OTP sent to:", normalizedEmail, "=>", otp);
    res.status(200).json({ message: "OTP sent" });
  } catch (err) {
    console.error("OTP Send Error:", err.message);
    res.status(500).json({ error: "Error sending OTP" });
  }
};

// STEP 2: Verify OTP
const VerifyOtpSignup = async (req, res) => {
  const { emailId, otp } = req.body;
  const normalizedEmail = emailId.trim().toLowerCase();

  try {
    const storedOtp = await redisClient.get(`otp:${normalizedEmail}`);
    if (storedOtp === otp) {
      await redisClient.del(`otp:${normalizedEmail}`);
      await redisClient.set(`verified:${normalizedEmail}`, "true", { EX: 600 }); // valid for 10 min
      return res.status(200).json({ verified: true });
    } else {
      return res.status(400).json({ verified: false, error: "Invalid OTP" });
    }
  } catch (err) {
    console.error("OTP Verification Error:", err.message);
    return res.status(500).json({ error: "OTP verification failed" });
  }
};

// STEP 3: Register User
const register = async (req, res) => {
  const { firstName, emailId, passWord } = req.body;
  const normalizedEmail = emailId.trim().toLowerCase();

  try {
    const isVerified = await redisClient.get(`verified:${normalizedEmail}`);
    if (isVerified !== "true") {
      return res.status(400).json({ message: "Please verify OTP before registering." });
    }

    const existingUser = await User.findOne({ emailId: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({ firstName, emailId: normalizedEmail, passWord });
    await newUser.save();
    await redisClient.del(`verified:${normalizedEmail}`);

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration Error:", err.message);
    res.status(500).json({ message: "Registration failed" });
  }
}
// -------------------- Login --------------------
const login = async (req, res) => {
  try {
    const { emailId, passWord } = req.body;
    const normalizedEmail = emailId.trim().toLowerCase();

    if (!normalizedEmail || !passWord) throw new Error("Invalid Credentials");

    const user = await User.findOne({ emailId: normalizedEmail });
    if (!user) throw new Error("User not found");

    const match = await bcrypt.compare(passWord, user.passWord);
    if (!match) throw new Error("Invalid Credentials");

    const token = generateToken(user);

    res.cookie("token", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    res.status(200).json({
      user: {
        firstName: user.firstName,
        emailId: user.emailId,
        _id: user._id,
        role: user.role,
      },
      message: "Login successfully",
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

    await redisClient.set(`token:${token}`, "Blocked");
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
    const user = await User.create({
      ...req.body,
      emailId: req.body.emailId.trim().toLowerCase(),
      passWord: hashedPassword,
      role: "admin",
    });

    const token = generateToken(user);

    res.cookie("token", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
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

// -------------------- Get All Users --------------------
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
};

// -------------------- Get Present Users --------------------
const getPresentUsers = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const users = await User.find({
      attendance: {
        $elemMatch: {
          date: { $gte: new Date(startDate), $lte: new Date(endDate) },
          status: "Present",
        },
      },
    }).select("firstName lastName");

    res.json({ users });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching present users",
      error: err.message,
    });
  }
};

// -------------------- Get User by ID --------------------
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Include totalReward and paymentInfo here
    const user = await User.findById(userId).select("_id firstName emailId role totalReward paymentInfo");

    if (!user) {
      return res.status(404).json({ message: `User with ID ${userId} not found` });
    }

    res.status(200).json({
      _id: user._id,
      firstName: user.firstName || "",
      emailId: user.emailId || "",
      role: user.role || "user",
      totalReward: user.totalReward || 0,
      paymentInfo: user.paymentInfo || [],
      message: "User retrieved successfully",
    });
  } catch (error) {
    console.error(`Error fetching user ${req.params.id}:`, error.message);
    res.status(500).json({ message: "Server error while fetching user" });
  }
};



module.exports = {
  register,
  login,
  logout,
  adminRegister,
  deleteProfile,
  getAllUsers,
  getPresentUsers,
  getUserById,
  SendOtpSignup,
  VerifyOtpSignup,
};
