const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { authRequired, requireRole } = require('../middleware/authMiddleware');
const { uploadStreamToBlob } = require('../services/blobService');
const { createVideo, listVideos, getVideoById, addCommentToVideo, addRatingToVideo } = require('../models/db');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 } }); // 200MB limit for demo

// List videos (public)
router.get('/', async (req, res) => {
  try {
    const q = req.query.q;
    const items = await listVideos(q);
    res.json({ items });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single video
router.get('/:id', async (req, res) => {
  try {
    const video = await getVideoById(req.params.id);
    if (!video) return res.status(404).json({ message: 'Not found' });
    res.json(video);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload (creator only)
router.post(
  '/upload',
  authRequired,
  requireRole('creator'),
  upload.single('video'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'Video file missing' });

      const { originalname, mimetype } = req.file;
      const stream = require('stream');
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer);

      // Upload to Azure Blob and get SAS URL
      const blobSasUrl = await uploadStreamToBlob(bufferStream, mimetype, originalname);

      const id = `video_${uuidv4()}`;
      const video = {
        id,
        title: req.body.title || originalname,
        publisher: req.body.publisher || req.user.email,
        producer: req.body.producer || '',
        genre: req.body.genre || 'General',
        ageRating: req.body.ageRating || 'PG',
        blobUrl: blobSasUrl, // store SAS URL
        uploaderId: req.user.id,
        createdAt: new Date().toISOString(),
        comments: [],
        ratings: [],
      };

      const created = await createVideo(video);
      res.json(created);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: 'Upload failed', error: e.message });
    }
  }
);

// Comment
router.post('/:id/comment', authRequired, async (req, res) => {
  try {
    const id = req.params.id;
    const comment = {
      userId: req.user.id,
      userEmail: req.user.email,
      text: req.body.text,
      createdAt: new Date().toISOString(),
    };
    const updated = await addCommentToVideo(id, comment);
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Rating
router.post('/:id/rating', authRequired, async (req, res) => {
  try {
    const id = req.params.id;
    const rating = { userId: req.user.id, rating: Number(req.body.rating), createdAt: new Date().toISOString() };
    const updated = await addRatingToVideo(id, rating);
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;