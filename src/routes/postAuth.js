const express = require('express');
const postRouter = express.Router();
const adminMiddleware = require('../middleware/adminMiddleware')
const { CreatePost, UpdatePost, DeletePost, getPostById, getAllPost} = require('../controllers/userPost');

//Create
//admin
postRouter.post('/create',adminMiddleware, CreatePost);
postRouter.put('/:id',adminMiddleware, UpdatePost);
postRouter.delete('/delete/:ip',adminMiddleware, DeletePost);
//user as well as admin
postRouter.get('/:id', getPostById);
postRouter.get('/', getAllPost);



module.exports = postRouter;

//fetch
//update
//delete