const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

const Post = require('../models/Post');

// @route GET api/posts
// @desc Get Posts
// @access Private
router.get('/', verifyToken, async (req, res) => {
    try {
        const posts = await Post.find({
            user: req.userId,
        }).populate('user', ['username']);
        return res.status(200).json({
            success: true,
            posts,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Missing username and/or password',
        });
    }
});

// @route POST api/posts
// @desc Create Post
// @access Private
router.post('/', verifyToken, async (req, res) => {
    const {
        title,
        description,
        url,
        status,
    } = req.body;

    // Simple validation
    if (!title) {
        return res.status(400).json({
            success: false,
            message: 'Title is required',
        });
    }

    try {
        const newPost = new Post({
            title,
            description,
            url: (url.startsWith('https://')) ? url : `https://${url}`,
            status: status || 'TO LEARN',
            user: req.userId,
        });
        await newPost.save();

        return res.status(201).json({
            success: true,
            message: 'Create post successfully',
            post: newPost
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Missing username and/or password',
        });
    }
});

// @route PUT api/posts
// @desc Update Post
// @access Private
router.put('/:id', verifyToken, async (req, res) => {
    const {
        title,
        description,
        url,
        status,
    } = req.body;

    // Simple validation
    if (!title) {
        return res.status(400).json({
            success: false,
            message: 'Title is required',
        });
    }

    try {
        let updatedPost = {
            title,
            description: description || '',
            url: ((url.startsWith('https://')) ? url : `https://${url}`) || '',
            status: status || 'TO LEARN',
        };
        
        const postUpdateCondition = {
            _id: req.params.id,
            user: req.userId,
        };

        updatedPost = await Post.findByIdAndUpdate(postUpdateCondition, updatedPost, { new: true });

        // User not authorized to update post
        if (!updatedPost) {
            return res.status(401).json({
                success: false,
                message: 'Post not found or user not authorized'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Update post successfully',
            post: updatedPost,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

// @route DELETE api/posts
// @desc Delete Post
// @access Private
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const postDeleteCondition = {
            _id: req.params.id,
            user: req.userId
        };
        const deletedPost = await Post.findOneAndDelete(postDeleteCondition);
        console.log(postDeleteCondition, deletedPost);

        // User not authorized or post not found
        if (!deletedPost) {
            return res.status(401).json({
                success: false,
                message: 'Post not found or user not authorized'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Delete post successfully',
            post: deletedPost,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Internal server error',
        });
    }
});

module.exports = router;
