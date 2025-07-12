const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20
    },
    lastName: {
        type: String,
        minLength: 3,
        maxLength: 20
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        immutable: true
    },
    passWord: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        min: 10,
        max: 50
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    missionCompleted: [{
        type: Schema.Types.ObjectId,
        ref: 'mission',
        unique: true
    }],

    attendance: [{
        date: { type: Date, required: true },
        status: { type: String, enum: ['Present', 'Absent'], required: true },
    }],

    otp: {
        code: { type: String }, // stores the 4-digit OTP
        expiresAt: { type: Date }, // expiry time
        verified: { type: Boolean, default: false } // true if user entered correctly
    }

}, {
    timestamps: true
});

const User = mongoose.model("user", userSchema);
module.exports = User;
