const mongoose = require('mongoose');
const { Schema } = mongoose;

const attendanceSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Present', 'Absent'],
    required: true
  },
  otpSessionId: {
    type: String, 
  }
}, {
  timestamps: true
});

attendanceSchema.index({ user: 1, date: 1 }, { unique: true }); // Prevents duplicate entries per user per date

const Attendance = mongoose.model('attendance', attendanceSchema);
module.exports = Attendance;
