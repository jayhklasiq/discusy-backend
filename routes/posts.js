const express = require('express');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// GET /posts: Fetch all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'name email');
    res.send(posts);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// POST /posts: Create a new post (protected)
router.post('/create', authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  try {
    const post = new Post({ title, content, author: req.user.id });
    await post.save();
    res.status(201).send(post);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// PUT /posts/:id: Update a post (protected)
router.put('update/:id', authMiddleware, async (req, res) => {
  const { title, content } = req.body;
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { title, content }, { new: true });
    if (!post) {
      return res.status(404).send({ error: 'Post not found' });
    }
    res.send(post);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// DELETE /posts/:id: Delete a post (protected)
router.delete('/delete/:id', authMiddleware, async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).send({ error: 'Post not found' });
    }
    res.send({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router; 
// GET /posts/:id: Fetch a post by ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'name email');
    if (!post) {
      return res.status(404).send({ error: 'Post not found' });
    }
    res.send(post);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});