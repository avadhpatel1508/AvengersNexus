// models/Chat.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const chatSchema = new Schema({
  mission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'mission',
    required: true,
    unique: true
  },
  groupName: {
  type: String,
  required: true
},
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastMessage: {
    type: String
  }
});

module.exports = mongoose.models.chat || mongoose.model('chat', chatSchema);
