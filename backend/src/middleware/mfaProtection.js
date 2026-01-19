const faceAuthService = require('../services/FaceAuthService');
const flags = require('../config/featureFlags');

const mfaProtectionMiddleware = async (req, res, next) => {
  if (!flags.FACE_AUTH_AS_MFA) return next();
  req.mfaRequired = true;
  req.mfaVerified = false;
  next();
};

const verifyMFAWithFace = async (req, res) => {
  try {
    const { imageBase64, email } = req.body;
    if (!imageBase64 || !email) return res.status(400).json({ error: 'Image required' });
    const result = await faceAuthService.authenticateFace(email, imageBase64);
    if (result.isMatch && result.confidence > flags.FACE_CONFIDENCE_THRESHOLD) {
      req.mfaVerified = true;
      return res.json({ success: true, mfaVerified: true, confidence: result.confidence.toFixed(2) });
    }
    return res.status(401).json({ success: false, message: 'MFA verification failed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { mfaProtectionMiddleware, verifyMFAWithFace };
