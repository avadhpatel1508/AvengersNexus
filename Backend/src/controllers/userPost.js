const Post = require('../models/post');

// Create Post (Admin only)
const CreatePost = async (req, res) => {
    try {
        const { title, description, importance } = req.body;

        // Create and save Post (no author)
        const post = new Post({
            title,
            description,
            importance
        });

        const savedPost = await post.save();
        res.status(201).json(savedPost);
    } catch (error) {
        console.error("Error creating post:", error);
        res.status(400).send({ error: "Post creation failed", details: error.message });
    }
};

// Update Post (Admin only)
const UpdatePost = async (req, res) => {
    try {
        const { id } = req.params;
        const allowedUpdates = ['title', 'description', 'importance'];
        const updates = Object.keys(req.body);

        const isValidOperation = updates.every(update => allowedUpdates.includes(update));
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Invalid updates!' });
        }

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).send({ error: 'Post not found' });
        }

        updates.forEach(update => post[update] = req.body[update]);
        await post.save();

        res.status(200).send({
            message: "Post updated successfully",
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

// Delete Post (Admin only)
const DeletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPost = await Post.findByIdAndDelete(id);

        if (!deletedPost) {
            return res.status(404).send({ error: "Post not found" });
        }

        res.status(200).send({ message: "Post deleted successfully" });
    } catch (error) {
        res.status(400).send({ error: "Error deleting post", details: error.message });
    }
};

// Get Post by ID (User and Admin)
const getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).send({ error: "Id is missing" });

        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).send({ error: "Post not found" });
        }

        res.status(200).send(post);
    } catch (err) {
        res.status(500).send({ error: "Error fetching post", details: err.message });
    }
};

// Get All Posts (User and Admin)
const getAllPost = async (req, res) => {
    try {
        const posts = await Post.find({});
        res.status(200).send(posts);
    } catch (error) {
        res.status(400).send({ error: "Error fetching posts", details: error.message });
    }
};

module.exports = {
    CreatePost,
    UpdatePost,
    DeletePost,
    getPostById,
    getAllPost
};
