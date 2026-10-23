'use strict';

const axios = require('axios');
const User = require('../models/User');
const flags = require('../config/featureFlags');

const EMBEDDING_LENGTH = 128;
const MATCH_DISTANCE_THRESHOLD = 0.6;

class FaceAuthService {
  constructor() {
    this.pythonServiceUrl = (
      process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000'
    ).replace(/\/+$/, '');

    this.http = axios.create({
      baseURL: this.pythonServiceUrl,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
      maxContentLength: 2 * 1024 * 1024,
      maxBodyLength: 2 * 1024 * 1024,
    });
  }

  validateEmbedding(embedding) {
    if (
      !Array.isArray(embedding) ||
      embedding.length !== EMBEDDING_LENGTH ||
      !embedding.every(
        (value) => typeof value === 'number' && Number.isFinite(value),
      )
    ) {
      throw new Error('The face service returned an invalid embedding.');
    }

    return embedding;
  }

  async generateFaceEmbedding(imageBase64) {
    if (typeof imageBase64 !== 'string' || !imageBase64.trim()) {
      throw new Error('A valid face image is required.');
    }

    // Reject unexpectedly large requests before contacting the Python service.
    if (imageBase64.length > 1_500_000) {
      throw new Error('The image is too large.');
    }

    try {
      const response = await this.http.post('/api/face/embed', {
        image: imageBase64,
      });

      return this.validateEmbedding(response.data?.embedding);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('The face service')) {
        throw error;
      }

      throw new Error('Face processing is temporarily unavailable.');
    }
  }

  async registerFace(userId, imageBase64) {
    if (!flags.FACE_AUTH_ENABLED) {
      throw new Error('Face authentication is currently disabled.');
    }

    if (!userId) {
      throw new Error('An authenticated user is required.');
    }

    const embedding = await this.generateFaceEmbedding(imageBase64);

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          faceEmbedding: embedding,
          faceAuthEnabled: true,
          faceRegisteredAt: new Date(),
        },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select('+faceEmbedding');

    if (!user) {
      throw new Error('User account not found.');
    }

    return { success: true, user };
  }

  async authenticateFace(email, imageBase64) {
    if (!flags.FACE_AUTH_ENABLED) {
      throw new Error('Face authentication is currently disabled.');
    }

    if (typeof email !== 'string' || !email.trim()) {
      throw new Error('A valid email address is required.');
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
      faceAuthEnabled: true,
    }).select('+faceEmbedding');

    if (!user || !Array.isArray(user.faceEmbedding)) {
      throw new Error('Face authentication could not be completed.');
    }

    const storedEmbedding = this.validateEmbedding(user.faceEmbedding);
    const newEmbedding = await this.generateFaceEmbedding(imageBase64);
    const distance = this.euclideanDistance(storedEmbedding, newEmbedding);
    const isMatch = distance < MATCH_DISTANCE_THRESHOLD;

    // Atomic increments avoid lost updates when multiple attempts overlap.
    const update = {
      $set: { 'faceAuthAttempts.lastAttempt': new Date() },
      $inc: isMatch
        ? { 'faceAuthAttempts.success': 1 }
        : { 'faceAuthAttempts.failed': 1 },
    };

    await User.updateOne({ _id: user._id }, update);

    // This is a distance-derived indicator, not a calibrated probability.
    const confidence = Math.max(
      0,
      Math.min(100, (1 - distance / MATCH_DISTANCE_THRESHOLD) * 100),
    );

    return {
      isMatch,
      distance,
      confidence,
      userId: user._id.toString(),
    };
  }

  euclideanDistance(embeddingA, embeddingB) {
    const a = this.validateEmbedding(embeddingA);
    const b = this.validateEmbedding(embeddingB);

    let sum = 0;

    for (let index = 0; index < EMBEDDING_LENGTH; index += 1) {
      const difference = a[index] - b[index];
      sum += difference * difference;
    }

    return Math.sqrt(sum);
  }

  compareEmbeddings(
    embeddingA,
    embeddingB,
    threshold = MATCH_DISTANCE_THRESHOLD,
  ) {
    if (!Number.isFinite(threshold) || threshold <= 0) {
      throw new Error('The matching threshold must be a positive number.');
    }

    return this.euclideanDistance(embeddingA, embeddingB) < threshold;
  }
}

module.exports = new FaceAuthService();
