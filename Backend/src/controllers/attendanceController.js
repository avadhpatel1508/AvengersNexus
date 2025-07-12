const User = require('../models/user');

// Generate 4-digit OTP
const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

// ✅ Admin route → Send OTP to a user
const sendOtpToUser = async (req, res) => {
    const { userId } = req.body;

    try {
        const otpCode = generateOtp();
        const expiresAt = new Date(Date.now() + 60 * 1000); // 1 minute from now

        const user = await User.findByIdAndUpdate(userId, {
            otp: {
                code: otpCode,
                expiresAt,
                verified: false
            }
        }, { new: true, runValidators: true });

        if (!user) return res.status(404).json({ message: "User not found" });

        // TODO: Implement OTP delivery (e.g., SMS, Email)
        // Example: await sendOtpViaEmail(user.email, otpCode);

        res.status(200).json({ message: "OTP sent successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ✅ User route → Verify OTP and mark attendance
const verifyOtpAndMarkAttendance = async (req, res) => {
    const { userId } = req.user; // userId from JWT middleware
    const { enteredOtp } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const otpData = user.otp;

        if (!otpData || new Date() > otpData.expiresAt) {
            // Mark Absent if OTP expired
            user.attendance.push({
                date: new Date(),
                time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
                status: 'Absent'
            });
            user.otp = undefined;
            await user.save();
            return res.status(400).json({ message: "OTP expired", status: "Absent" });
        }

        if (otpData.code !== enteredOtp) {
            // Wrong OTP → mark Absent
            user.attendance.push({
                date: new Date(),
                time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
                status: 'Absent'
            });
            user.otp = undefined;
            await user.save();
            return res.status(400).json({ message: "Incorrect OTP", status: "Absent" });
        }

        // ✅ Correct OTP → mark Present
        user.attendance.push({
            date: new Date(),
            time: new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' }),
            status: 'Present'
        });
        user.otp = undefined; // Clear OTP
        await user.save();

        res.status(200).json({ message: "Attendance marked as Present", status: "Present" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = { sendOtpToUser, verifyOtpAndMarkAttendance };