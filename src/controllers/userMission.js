const Mission = require('../models/mission');
const redisClient = require("../config/redish");
const jwt = require("jsonwebtoken");
const validate = require("../utils/validator");
const mongoose = require('mongoose')
// Create Mission (Admin only)
const CreateMission = async (req, res) => {
  try {
    // Validate ObjectIds first
    const invalidIds = req.body.avengersAssigned.filter(
      id => !mongoose.Types.ObjectId.isValid(id)
    );
    
    if (invalidIds.length > 0) {
      throw new Error("Invalid ID's", invalidIds)
    }

    // Create and save mission
    const mission = new Mission({
      title: req.body.title,
      description: req.body.description,
      Location: req.body.Location,
      difficulty: req.body.difficulty,
      avengersAssigned: req.body.avengersAssigned
    });

    const savedMission = await mission.save();
    res.status(201).json(savedMission);
    
  }
  catch (error) {
    console.error("Full error object:", error);
    res.status(400).send("Mission creation failed", error.message)
  }
};
// Update Mission (Admin only)
const UpdateMission = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate only the fields being updated
        const allowedUpdates = ['title', 'description', 'Location', 'difficulty', 'avengersAssigned', 'isCompleted'];
        const updates = Object.keys(req.body);
        
        // Check for invalid fields
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' });
        }

        // Find and update the mission
        const mission = await Mission.findById(id);
        if (!mission) {
            return res.status(404).send({ error: 'Mission not found' });
        }
        if (req.body.status === 'completed' && mission.status !== 'completed') {
        const userIds = mission.avengersAssigned; // Array of user ObjectIds
        if (userIds && userIds.length > 0) {
          await User.updateMany(
            { _id: { $in: userIds } },
            { $addToSet: { missionCompleted: mission._id } },
            { session }
          );
        }
      }
        // Apply updates
        updates.forEach(update => mission[update] = req.body[update]);
        await mission.save();

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
        
        const deletedMission = await Mission.findByIdAndDelete(id);
        
        if (!deletedMission) {
            throw new Error("Mission not found");
        }
        
        res.status(200).send("Mission deleted successfully");
    } catch (error) {
        res.status(400).send("Error: " + error.message);
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
        // Check Redis cache first
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

// Get Completed Missions by User
const completedMissionByUser = async (req, res) => {
    try {
        const token = req.cookies.token;
        const payload = jwt.verify(token, process.env.JWT_KEY);
        const userId = payload._id;
        
        // Check Redis cache first
        const cachedUserMissions = await redisClient.get(`missions:user:${userId}`);
        if (cachedUserMissions) {
            return res.status(200).json(JSON.parse(cachedUserMissions));
        }
        
        const userMissions = await Mission.find({ avengersAssigned: userId })
            .populate('avengersAssigned', 'username email');
            
        // Cache the user missions in Redis
        await redisClient.set(`missions:user:${userId}`, JSON.stringify(userMissions), 'EX', 3600);
        
        res.status(200).json(userMissions);
    } catch (error) {
        res.status(401).send("Error: " + error.message);
    }
};

const markMissionComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; // From JWT token

    const mission = await Mission.findByIdAndUpdate(
      id,
      {
        isCompleted: true,
        completedAt: new Date(),
        completedBy: userId
      },
      { new: true }
    ).populate('completedBy', 'username email');

    if (!mission) {
      return res.status(404).json({ message: "Mission not found" });
    }

    res.status(200).json({
      message: "Mission marked as complete",
      mission
    });
  } catch (error) {
    res.status(400).json({
      message: "Error completing mission",
      error: error.message
    });
  }
};

module.exports = {
    CreateMission,
    UpdateMission,
    DeleteMission,
    getMissionById,
    getAllMission,
    completedMissionByUser,
    markMissionComplete
};