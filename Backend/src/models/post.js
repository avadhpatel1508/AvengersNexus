const mongoose = require("mongoose");
const { Schema } = mongoose;

const postSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        minLength: 10,
        maxLength: 300,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    importance: {
        type: String,
        enum: ['important', 'not-important'],
        required: true
    }
    // ❌ No author field
});

const Post = mongoose.model('post', postSchema);

module.exports = Post;
