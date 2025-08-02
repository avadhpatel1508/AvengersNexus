const Mission = require('../models/mission');
const redisClient = require("../config/redish");
const jwt = require("jsonwebtoken");
const validate = require("../utils/validator");
const mongoose = require('mongoose')
const User = require("../models/user")
const Chat = require('../models/chat');
const Message = require('../models/Message')
require("dotenv").config();

// Create Mission (Admin only)
const CreateMission = (io) => async (req, res) => {
  try {
    const { title, description, Location, avengersAssigned, difficulty, amount } = req.body;

    // Validate required fields
    if (!title || !description || !Location || !avengersAssigned?.length || !difficulty || !amount) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const adminId = req.user?._id;
    if (!adminId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Create payment info for each assigned user
    const paymentInfo = avengersAssigned.map(userId => ({
      user: userId,
      amount,
      paymentIntentId: "",
      status: "pending",
      paidAt: null,
    }));

    // Create new mission
    const newMission = await Mission.create({
      title,
      description,
      Location,
      avengersAssigned,
      difficulty,
      amount,
      paymentInfo,
      createdBy: adminId,
    });

    // Create group chat
    const participants = [adminId, ...avengersAssigned];
    const newChat = await Chat.create({
      mission: newMission._id,
      participants,
      groupName: title,
      lastMessage: `Group created for mission: ${title}`,
    });

    // Emit socket event to each user room
    participants.forEach(userId => {
      io.to(userId.toString()).emit("groupCreated", {
        chatId: newChat._id,
        groupName: title,
        missionId: newMission._id,
        participants,
        createdAt: newChat.createdAt,
      });
    });

    // Final response
    res.status(201).json({
      success: true,
      message: "Mission and chat group created successfully.",
      mission: newMission,
      chat: newChat,
    });

  } catch (error) {
    console.error("❌ Create Mission Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Update Mission (Admin only)
const UpdateMission = async (req, res) => {
    try {
        const { _id } = req.params;

        const allowedUpdates = ['title', 'description', 'Location', 'difficulty', 'avengersAssigned', 'isCompleted'];
        const updates = Object.keys(req.body);

        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' });
        }

        const mission = await Mission.findById(_id);
        if (!mission) {
            return res.status(404).send({ error: 'Mission not found' });
        }

        // Apply updates
        updates.forEach(update => {
            if (update === 'difficulty' && typeof req.body[update] === 'string') {
                mission[update] = req.body[update].toLowerCase();
            } else {
                mission[update] = req.body[update];
            }
        });

        await mission.save();

        if (mission.isCompleted === true) {
            await User.updateMany(
                { _id: { $in: mission.avengersAssigned } },
                { $addToSet: { missionCompleted: mission._id } }
            );
        }

        res.status(200).send({
            message: "Mission updated successfully",
            updatedFields: updates,
            mission
        });
    } catch (error) {
        res.status(400).send({
            error: "Error updating mission",
            details: error.message
        });
    }
};

// Delete Mission (Admin only)
const DeleteMission = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete mission
    const deletedMission = await Mission.findByIdAndDelete(id);
    if (!deletedMission) {
      return res.status(404).json({ message: "Mission not found" });
    }

    // Delete associated chat
    const deletedChat = await Chat.findOneAndDelete({ mission: id });

    res.status(200).json({
      success: true,
      message: "Mission and associated chat group deleted successfully.",
      deletedMissionId: deletedMission._id,
      deletedChatId: deletedChat?._id || null,
    });
  } catch (error) {
    console.error("❌ Delete Mission Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


// Get Mission by ID (User and Admin)
const getMissionById = async (req, res) => {
    const { id } = req.params;
    try {
      if(!id){
        return res.status(400).send("Id is missing");
      }
      const getMission  = await Mission.findById(id);

      if(!getMission) {
        return res.status(404).send("Problem is missing")
      }
      res.status(200).send(getMission)
    }
    catch(err){
      res.status(401).send("Error :",err)
    }
};

// Get All Missions (User and Admin)
const getAllMission = async (req, res) => {
    try {
        const getMissionAll  = await Mission.find({});

        if(!getMissionAll) {
            return res.status(404).send("Mission is missing")
        }
        res.status(200).send(getMissionAll);
    } 
    catch (error) {
        res.status(400).send("Error: " + error.message);
    }
};

const getCompletedMissionsByUser = async (req, res) => {
    try {
        const userId = req.result._id;

        const user = await User.findById(userId).populate({
            path: "missionCompleted",
            select: "_id title difficulty discription"
        });
        
        if (!user || !user.missionCompleted.length) {
            return res.status(200).send([]);
        }
        res.status(200).send(user.missionCompleted);
    }
    catch (err) {
        res.status(500).send("Server Error");
    }
};

const completeMissionById = async (req, res) => {
    try {
        const { id } = req.params;

        const mission = await Mission.findById(id).populate('avengersAssigned');
        if (!mission) return res.status(404).json({ error: "Mission not found" });
        if (mission.isCompleted) return res.status(400).json({ error: "Mission is already completed" });

        const amount = mission.amount;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: "Invalid reward amount in mission" });
        }

        const admin = await User.findOne({ role: 'admin' });
        if (!admin) return res.status(404).json({ error: "Admin not found" });

        const totalPayout = amount * mission.avengersAssigned.length;
        if (admin.totalReward < totalPayout) {
            return res.status(400).json({ error: "Admin does not have enough balance to pay users" });
        }

        const paymentResults = [];

        for (const user of mission.avengersAssigned) {
            try {
                user.totalReward += amount;
                user.missionCompleted.addToSet(mission._id);
                await user.save();

                mission.paymentInfo.push({
                    user: user._id,
                    amount,
                    paymentIntentId: null,
                    status: 'succeeded',
                    paidAt: new Date()
                });

                paymentResults.push({ user: user._id, status: 'succeeded' });
            } catch (err) {
                mission.paymentInfo.push({
                    user: user._id,
                    amount,
                    paymentIntentId: null,
                    status: 'failed',
                    paidAt: new Date()
                });

                paymentResults.push({ user: user._id, status: 'failed', reason: err.message });
            }
        }

        admin.totalReward -= totalPayout;
        await admin.save();

        mission.isCompleted = true;
        mission.completedAt = new Date();
        await mission.save();

        res.status(200).json({
            message: "Mission marked as completed and rewards distributed",
            missionId: mission._id,
            payments: paymentResults
        });
    } catch (err) {
        console.error("Error completing mission:", err);
        res.status(500).json({ error: "Failed to complete mission", details: err.message });
    }
};

const getRewardsByUser = async (req, res) => {
    const { userId } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        const missions = await Mission.find({ 'paymentInfo.user': userId });

        const rewardHistory = missions.flatMap((mission) =>
            mission.paymentInfo
                .filter((info) => info.user.toString() === userId)
                .map((info) => ({
                    missionId: mission._id,
                    title: mission.title,
                    amount: info.amount,
                    status: info.status,
                    paidAt: info.paidAt,
                }))
        );

        const user = await User.findById(userId).select('totalReward');
        const totalReward = user?.totalReward || 0;

        res.json({ totalReward, rewardHistory });
    } catch (err) {
        console.error('Error fetching rewards:', err);
        res.status(500).json({ error: 'Failed to fetch rewards' });
    }
};

const getUserMissionStats = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Get assigned missions (not completed)
        const assignedMissions = await Mission.countDocuments({
            avengersAssigned: userId,
            isCompleted: false
        });

        // Get completed missions
        const completedMissions = await User.findById(userId)
            .select('missionCompleted')
            .then(user => user?.missionCompleted?.length || 0);

        res.status(200).json({
            assignedMissions,
            completedMissions,
            totalMissions: assignedMissions + completedMissions
        });
    } catch (err) {
        console.error('Error fetching mission stats:', err);
        res.status(500).json({ error: 'Failed to fetch mission stats', details: err.message });
    }
};

module.exports = {
    CreateMission,
    UpdateMission,
    DeleteMission,
    getMissionById,
    getAllMission,
    getCompletedMissionsByUser,
    completeMissionById,
    getRewardsByUser,
    getUserMissionStats
};