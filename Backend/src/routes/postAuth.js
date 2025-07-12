const express = require('express');
const postRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware');
const { CreatePost, UpdatePost, DeletePost, getPostById, getAllPost } = require('../controllers/userPost');

// Admin routes
postRouter.post('/create', adminMiddleware, CreatePost);
postRouter.put('/:id', adminMiddleware, UpdatePost);
postRouter.delete('/delete/:id', adminMiddleware, DeletePost);

// User + Admin routes (static routes first)
postRouter.get('/', getAllPost);

// Dynamic route should be last
postRouter.get('/:id', getPostById);

module.exports = postRouter;
