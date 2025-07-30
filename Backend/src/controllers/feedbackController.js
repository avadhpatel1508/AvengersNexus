const Feedback  = require( '../models/Feedback.js');

// POST /feedback - User sends feedback
const sendFeedback = async (req, res) => {
   try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message || !userId) {
      return res.status(400).json({ error: 'Message or user missing' });
    }

    const newFeedback = new Feedback({ user: userId, message });
    await newFeedback.save();

    res.status(201).json({ success: true, feedback: newFeedback });
  } catch (err) {
    console.error('❌ Feedback Save Error:', err);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
}

// GET /admin/feedbacks - Admin views all feedback
const getAllFeedbacks = async (req, res) => {
  try {

    const feedbacks = await Feedback.find();
    res.status(200).json({ feedbacks });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};


const markFeedbackAsSeen = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { id } = req.params;

    const deletedFeedback = await Feedback.findByIdAndDelete(id);

    if (!deletedFeedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.status(200).json({ message: 'Feedback marked as seen and deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  sendFeedback,
  getAllFeedbacks,
  markFeedbackAsSeen
};
