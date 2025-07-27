const express = require('express');
const postRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const { CreatePost, UpdatePost, DeletePost, getPostById, getAllPost } = require('../controllers/userPost');
const User = require('../models/user')
const { sendEmail } = require('../utils/mailer'); // or wherever your file is
const Post  = require('../models/post')
// Admin routes
postRouter.post('/create', adminMiddleware, CreatePost);
postRouter.put('/:id', adminMiddleware, UpdatePost);
postRouter.delete('/delete/:id', adminMiddleware, DeletePost);

// User + Admin routes (static routes first)
postRouter.get('/', getAllPost);

// Dynamic route should be last
postRouter.get('/:id', getPostById);

postRouter.post('/notify-important-post', async (req, res) => {
  try {
    const { title, description } = req.body;

    // Get all user emails (use 'emailId', not 'email')
    const users = await User.find({}, 'emailId');
    const emailList = users
      .map(user => user.emailId)
      .filter(email => typeof email === 'string' && email.trim() !== '');

    if (emailList.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid user emails found.' });
    }

    //  Send email to each user (you can batch this if needed)
    await Promise.all(
      emailList.map(email => sendEmail(email, title, description))
    );

    res.status(200).json({ success: true, message: 'Emails sent successfully.' });
  } catch (error) {
    console.error(' Error sending emails:', error);
    res.status(500).json({ success: false, message: 'Failed to send emails.' });
  }
});

  module.exports = postRouter;
