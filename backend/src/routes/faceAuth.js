const express = require('express');
const jwt = require('jsonwebtoken');
const faceAuthService = require('../services/FaceAuthService');
const User = require('../models/User');
const router = express.Router();

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (e) { res.status(401).json({ error: 'Invalid' }); }
};

router.post('/register', authMiddleware, async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'Image required' });
    const result = await faceAuthService.registerFace(req.user.id, imageBase64);
    res.json({ success: true, message: 'Face registered', data: { faceAuthEnabled: result.user.faceAuthEnabled, registeredAt: result.user.faceRegisteredAt } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, imageBase64 } = req.body;
    if (!email || !imageBase64) return res.status(400).json({ error: 'Email and image required' });
    const result = await faceAuthService.authenticateFace(email, imageBase64);
    if (result.isMatch) {
      const user = await User.findOne({ email });
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' });
      return res.json({ success: true, token, user: { id: user._id, email: user.email }, confidence: result.confidence.toFixed(2) });
    } else {
      return res.status(401).json({ success: false, message: 'Face auth failed', confidence: result.confidence.toFixed(2) });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
