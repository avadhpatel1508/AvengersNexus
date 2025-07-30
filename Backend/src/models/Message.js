const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  mission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mission',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isSeenBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
  ],
  reactions: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
      emoji: String,
    },
  ],
});

module.exports = mongoose.model('Message', messageSchema);
