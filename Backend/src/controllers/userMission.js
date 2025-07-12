const Mission = require('../models/mission');
const redisClient = require("../config/redish");
const jwt = require("jsonwebtoken");
const validate = require("../utils/validator");
const mongoose = require('mongoose')
const User = require("../models/user")
require("dotenv").config();
// Create Mission (Admin only)
const CreateMission = async (req, res) => {
      try{
         const { title, description, Location, avengersAssigned, difficulty } = req.body;

        // 5. Create the mission
        const mission = await Mission.create({
            title,
            description,
            Location,
            avengersAssigned,
            difficulty: difficulty.toLowerCase(),
        });

        res.status(201).send({ message: "Mission created successfully", mission });
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
  }
// Update Mission (Admin only)
const UpdateMission = async (req, res) => {
    try {
        const { id } = req.params;

        const allowedUpdates = ['title', 'description', 'Location', 'difficulty', 'avengersAssigned', 'isCompleted'];
        const updates = Object.keys(req.body);

        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' });
        }

        const mission = await Mission.findById(id);
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
                { $addToSet: { missionCompleted: mission._id } } // $addToSet prevents duplicates
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


const getCompletedMissionsByUser =  async(req,res)=>{
   
    try{
       
      const userId = req.result._id;

      const user =  await User.findById(userId).populate({
        path:"missionCompleted",
        select:"_id title difficulty discription"
      });
      
      if (!user || !user.missionCompleted.length) {
        return res.status(200).send([]);
        }
      res.status(200).send(user.missionCompleted);

    }
    catch(err){
      res.status(500).send("Server Error");
    }
}


module.exports = {
    CreateMission,
    UpdateMission,
    DeleteMission,
    getMissionById,
    getAllMission,
    getCompletedMissionsByUser
    
};