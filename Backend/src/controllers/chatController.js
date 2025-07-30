// controllers/chatController.js

const Message = require('../models/Message');
const User = require('../models/user');
const Mission = require('../models/mission');
const Chat = require('../models/chat')
// Get all messages for a specific mission
const getMessagesByMission = async (req, res) => {
  const { missionId } = req.params;

  try {
    // Check if mission exists
    const missionExists = await Mission.findById(missionId);
    if (!missionExists) {
      return res.status(404).json({ success: false, message: "Mission not found" });
    }

    const messages = await Message.find({ mission: missionId })
      .populate('sender', 'firstName lastName emailId') // match your User model fields
      .sort({ timestamp: 1 });

    res.status(200).json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
// Get all chat groups for the logged-in user
const getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;

  const chats = await Chat.find({ participants: userId })
  .select('groupName participants createdAt mission')
  .populate('mission', 'title Location difficulty');



    res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error("Get User Chats Error:", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {getMessagesByMission , getUserChats};