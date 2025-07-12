const Mission = require("../models/mission")
const Submission= require("../models/submission")
const submitMission = async(req,res)=>{
    try{
        const userId = req.params._id;
        const missionId = req.params.id;
        const status = req.params.body;

        if(!userId || !missionId || !status){
            return res.status(400).send("Some Field Missing")
        }
        //Fetch the mission from the database
        const mission = await Mission.findById(missionId)

        const submittedResult = Submission.create({
            userId, missionId, status
        })
        submittedResult.status = 'completed'
     
        await submittedResult.save();
        res.status(201).send(submittedResult)
        
        
    }
    catch(error){
        res.send("Error: ",error);
    }
}

module.exports = submitMission;