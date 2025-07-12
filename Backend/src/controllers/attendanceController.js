const User = require('../models/user');

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();

const startAttendance = async (req, res) => {
    try {
        const otpCode = generateOTP();
        const expiresAt = new Date(Date.now() + 60 * 1000); // 1 minute from now

        // Set OTP for all users
        await User.updateMany({}, {
            $set: {
                otp: { code: otpCode, expiresAt }
            }
        });

        res.status(200).json({
            message: 'Attendance session started',
            otp: otpCode, // only show in dev/test
            expiresAt
        });

        // OPTIONAL: Set a timer to auto-mark absent users after expiry
        setTimeout(async () => {
            const now = new Date();
            const users = await User.find();

            for (const user of users) {
                const todayMarked = user.attendance.find(
                    a => new Date(a.date).toDateString() === now.toDateString()
                );

                if (!todayMarked) {
                    user.attendance.push({
                        date: now,
                        status: 'Absent'
                    });
                    user.otp = {}; // clear otp after use
                    await user.save();
                }
            }

        }, 60 * 1000); // 1 minute
    } catch (err) {
        res.status(500).json({ message: 'Failed to start attendance', error: err.message });
    }
};
const submitAttendance = async (req, res) => {
    try {
        const { userId, otpEntered } = req.body;
        const user = await User.findById(userId);
        const now = new Date();

        if (!user || !user.otp || !user.otp.code) {
            return res.status(400).json({ message: "No active OTP session" });
        }

        const isValid = otpEntered === user.otp.code && now < new Date(user.otp.expiresAt);

        if (!isValid) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        // Check if already marked
        const alreadyMarked = user.attendance.find(
            a => new Date(a.date).toDateString() === now.toDateString()
        );

        if (alreadyMarked) {
            return res.status(400).json({ message: "Attendance already submitted today" });
        }

        // Mark Present
        user.attendance.push({
            date: now,
            status: 'Present'
        });

        user.otp = {}; // clear OTP after successful submit
        await user.save();

        res.status(200).json({ message: "Marked Present" });

    } catch (err) {
        res.status(500).json({ message: "Attendance submission failed", error: err.message });
    }
};

module.exports = {submitAttendance, startAttendance};