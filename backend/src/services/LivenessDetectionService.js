const axios = require('axios');

class LivenessDetectionService {
  constructor(pythonServiceUrl = 'http://localhost:5000') {
    this.pythonServiceUrl = pythonServiceUrl;
  }

  async detectLiveness(frameSequence) {
    try {
      const response = await axios.post(
        `${this.pythonServiceUrl}/api/face/liveness`,
        { frames: frameSequence },
        { timeout: 15000 }
      );
      return {
        isLive: response.data.is_live,
        confidence: response.data.confidence,
        details: response.data.details
      };
    } catch (error) {
      throw new Error(`Liveness detection failed: ${error.message}`);
    }
  }

  async detectBlink(frame1, frame2, frame3) {
    try {
      const response = await axios.post(
        `${this.pythonServiceUrl}/api/face/blink-detection`,
        { frames: [frame1, frame2, frame3] }
      );
      return response.data.blink_detected;
    } catch (error) {
      console.error('Blink detection error:', error);
      return false;
    }
  }

  async detectHeadMovement(frameSequence) {
    try {
      const response = await axios.post(
        `${this.pythonServiceUrl}/api/face/movement-detection`,
        { frames: frameSequence }
      );
      return response.data.movement_detected;
    } catch (error) {
      console.error('Movement detection error:', error);
      return false;
    }
  }

  async detectLivenessWithFrames(frames, threshold = 0.7) {
    if (frames.length < 3) throw new Error('Minimum 3 frames required');
    const isLive = await this.detectLiveness(frames);
    if (!isLive.isLive) return { isLive: false, confidence: 0 };
    const hasBlink = await this.detectBlink(frames[0], frames[1], frames[2]);
    const hasMovement = await this.detectHeadMovement(frames.slice(0, Math.min(5, frames.length)));
    const confidence = (isLive.confidence + (hasBlink ? 20 : 0) + (hasMovement ? 15 : 0)) / 3;
    return { isLive: confidence >= threshold * 100, confidence };
  }
}

module.exports = new LivenessDetectionService(process.env.PYTHON_SERVICE_URL || 'http://localhost:5000');
