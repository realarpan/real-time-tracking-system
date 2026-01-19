const axios = require('axios');
const User = require('../models/User');

class FaceAuthService {
  constructor(pythonServiceUrl = 'http://localhost:5000') {
    this.pythonServiceUrl = pythonServiceUrl;
  }

  async generateFaceEmbedding(imageBase64) {
    try {
      const response = await axios.post(
        `${this.pythonServiceUrl}/api/face/embed`,
        { image: imageBase64 },
        { timeout: 10000 }
      );
      return response.data.embedding;
    } catch (error) {
      throw new Error(`Face embedding failed: ${error.message}`);
    }
  }

  async registerFace(userId, imageBase64) {
    try {
      const embedding = await this.generateFaceEmbedding(imageBase64);
      const user = await User.findByIdAndUpdate(userId, {
        faceEmbedding: embedding,
        faceAuthEnabled: true,
        faceRegisteredAt: new Date()
      }, { new: true });
      return { success: true, user };
    } catch (error) {
      throw error;
    }
  }

  async authenticateFace(email, imageBase64) {
    try {
      const user = await User.findOne({ email });
      if (!user || !user.faceAuthEnabled) throw new Error('Face auth not enabled');
      const newEmbedding = await this.generateFaceEmbedding(imageBase64);
      const distance = this.euclideanDistance(user.faceEmbedding, newEmbedding);
      const isMatch = distance < 0.6;
      await User.findByIdAndUpdate(user._id, {
        'faceAuthAttempts.lastAttempt': new Date(),
        'faceAuthAttempts.success': isMatch ? user.faceAuthAttempts.success + 1 : user.faceAuthAttempts.success,
        'faceAuthAttempts.failed': !isMatch ? user.faceAuthAttempts.failed + 1 : user.faceAuthAttempts.failed
      });
      return { isMatch, distance, confidence: (1 - distance) * 100 };
    } catch (error) {
      throw error;
    }
  }

  euclideanDistance(emb1, emb2) {
    let sum = 0;
    for (let i = 0; i < emb1.length; i++) sum += Math.pow(emb1[i] - emb2[i], 2);
    return Math.sqrt(sum);
  }

  compareEmbeddings(emb1, emb2, threshold = 0.6) {
    return this.euclideanDistance(emb1, emb2) < threshold;
  }
}

module.exports = new FaceAuthService(process.env.PYTHON_SERVICE_URL || 'http://localhost:5000');
