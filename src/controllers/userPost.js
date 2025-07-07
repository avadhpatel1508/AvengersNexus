const Post = require('../models/post');
const redisClient = require("../config/redish");
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose')
// Create Post (Admin only)
const CreatePost = async (req, res) => {
  try {
   
    // Create and save Post
    const post = new Post({
      title: req.body.title,
      description: req.body.description,
      importance: req.body.importance
    });

    const savedPost = await post.save();
    res.status(201).json(savedPost);
    
  }
  catch (error) {
    console.error("Full error object:", error);
    res.status(400).send("post creation failed", error.message)
  }
};
// Update post (Admin only)
const UpdatePost = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate only the fields being updated
        const allowedUpdates = ['title', 'description','importance'];
        const updates = Object.keys(req.body);
        
        // Check for invalid fields
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' });
        }

        // Find and update the post
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).send({ error: 'post not found' });
        }

        // Apply updates
        updates.forEach(update => post[update] = req.body[update]);
        await post.save();

        res.status(200).send({
            message: "post updated successfully",
            updatedFields: updates,
            post
        });
    } catch (error) {
        res.status(400).send({
            error: "Error updating post",
            details: error.message
        });
    }
};

// Delete post (Admin only)
const DeletePost = async (req, res) => {
    try {
        const { id } = req.params;
        
        const deletedPost = await Post.findByIdAndDelete(id);
        
        if (!deletedPost) {
            throw new Error("Post not found");
        }
        
        res.status(200).send("POst deleted successfully");
    } catch (error) {
        res.status(400).send("Error: " + error.message);
    }
};

// Get Post by ID (User and Admin)
const getPostById = async (req, res) => {
    const { id } = req.params;
    try {
      if(!id){
        return res.status(400).send("Id is missing");
      }
      const getPost  = await Post.findById(id);

      if(!getPost) {
        return res.status(404).send("Post is missing")
      }
      res.status(200).send(getPost)
    }
    catch(err){
      res.status(401).send("Error :",err)
    }
};

// Get All posts (User and Admin)
const getAllPost = async (req, res) => {
    try {
        // Check Redis cache first
      const getAllPost  = await Post.find({});

      if(!getAllPost) {
        return res.status(404).send("Post is missing")
        
       
      }
       res.status(200).send(getAllPost);
    } 
    catch (error) {
        res.status(400).send("Error: " + error.message);
    }
};

module.exports = {
    CreatePost,
    UpdatePost,
    DeletePost,
    getPostById,
    getAllPost
};