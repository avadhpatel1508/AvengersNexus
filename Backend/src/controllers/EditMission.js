const User = require("../models/user")

const addUniqueMission = async (userId, missionName) =>{
    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $addToSet: { missionCompleted: missionName } },
            { new: true }
        );
        console.log('Mission added (unique):', updatedUser.missionCompleted);
        return updatedUser;
    } catch (error) {
        console.error('Error adding mission:', error);
        throw error;
    }
}
module.exports = addUniqueMission