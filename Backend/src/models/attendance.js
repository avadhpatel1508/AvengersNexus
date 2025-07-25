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
    default: 'Absent',
    required: true
  },
  otpSessionId: {
    type: String, 
  }
}, {
  timestamps: true
});
attendanceSchema.pre('validate', function (next) {
  this.date = new Date(this.date.setHours(0, 0, 0, 0));
  next();
});

attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('attendance', attendanceSchema);
module.exports = Attendance;
