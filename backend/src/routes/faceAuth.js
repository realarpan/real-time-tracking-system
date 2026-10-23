'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const faceAuthService = require('../services/FaceAuthService');
const auditLogService = require('../services/AuditLogService');
const flags = require('../config/featureFlags');

const router = express.Router();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (
    typeof secret !== 'string' ||
    secret.length < 32 ||
    ['secret', 'your_jwt_secret_key', 'your_jwt_secret_change_this_in_production'].includes(secret)
  ) {
    throw new Error('Authentication is not configured securely.');
  }

  return secret;
}

function authMiddleware(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const token = authorization.slice(7).trim();

  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());

    if (
      typeof decoded !== 'object' ||
      !decoded ||
      typeof decoded.id !== 'string'
    ) {
      return res.status(401).json({ error: 'Invalid authentication token.' });
    }

    req.user = { id: decoded.id };
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

function getClientIp(req) {
  // Do not trust arbitrary X-Forwarded-For headers unless proxy trust
  // has been configured correctly in the Express application.
  return req.ip || req.socket?.remoteAddress || undefined;
}

function handleServiceError(res, error) {
  const message =
    error instanceof Error ? error.message : 'Request could not be completed.';

  if (message.includes('currently disabled')) {
    return res.status(503).json({ error: 'Face authentication is unavailable.' });
  }

  if (message.includes('not found')) {
    return res.status(404).json({ error: 'Account not found.' });
  }

  if (
    message.includes('required') ||
    message.includes('too large') ||
    message.includes('invalid embedding')
  ) {
    return res.status(400).json({ error: message });
  }

  console.error('[FACE_AUTH] Request failed:', message);
  return res.status(503).json({
    error: 'Face authentication could not be completed. Please try again later.',
  });
}

router.post('/register', authMiddleware, async (req, res) => {
  if (!flags.FACE_AUTH_ENABLED) {
    return res.status(503).json({ error: 'Face authentication is unavailable.' });
  }

  const { imageBase64 } = req.body || {};

  if (typeof imageBase64 !== 'string' || !imageBase64.trim()) {
    return res.status(400).json({ error: 'A face image is required.' });
  }

  try {
    const result = await faceAuthService.registerFace(
      req.user.id,
      imageBase64,
    );

    await auditLogService.logFaceRegistration(
      result.user._id,
      result.user.email,
      true,
      getClientIp(req),
    );

    return res.status(200).json({
      success: true,
      message: 'Face registration completed.',
      data: {
        faceAuthEnabled: result.user.faceAuthEnabled,
        registeredAt: result.user.faceRegisteredAt,
      },
    });
  } catch (error) {
    try {
      await auditLogService.logFaceRegistration(
        req.user.id,
        undefined,
        false,
        getClientIp(req),
      );
    } catch {
      // Do not expose audit storage errors to the client.
    }

    return handleServiceError(res, error);
  }
});

router.post('/login', async (req, res) => {
  if (!flags.FACE_AUTH_ENABLED) {
    return res.status(503).json({ error: 'Face authentication is unavailable.' });
  }

  const { email, imageBase64 } = req.body || {};

  if (
    typeof email !== 'string' ||
    !email.trim() ||
    typeof imageBase64 !== 'string' ||
    !imageBase64.trim()
  ) {
    return res.status(400).json({
      error: 'Email and a face image are required.',
    });
  }

  let result;

  try {
    result = await faceAuthService.authenticateFace(email, imageBase64);

    await auditLogService.logFaceAuthAttempt(
      result.userId,
      email,
      result.isMatch,
      result.confidence,
      getClientIp(req),
    );

    if (
      !result.isMatch ||
      result.confidence < flags.FACE_CONFIDENCE_THRESHOLD
    ) {
      return res.status(401).json({
        success: false,
        message: 'Face authentication failed.',
      });
    }

    const user = await User.findById(result.userId).select(
      '_id email name faceAuthEnabled',
    );

    if (!user || !user.faceAuthEnabled) {
      return res.status(401).json({
        success: false,
        message: 'Face authentication failed.',
      });
    }

    const token = jwt.sign(
      { id: user._id.toString() },
      getJwtSecret(),
      { expiresIn: process.env.JWT_EXPIRE || '7d' },
    );

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      confidence: Number(result.confidence.toFixed(2)),
    });
  } catch (error) {
    try {
      await auditLogService.logFaceAuthAttempt(
        result?.userId || null,
        email,
        false,
        result?.confidence,
        getClientIp(req),
      );
    } catch {
      // Keep audit storage failures out of the public response.
    }

    return handleServiceError(res, error);
  }
});

router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      '_id faceAuthEnabled faceRegisteredAt livenessCheckRequired',
    );

    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    return res.json({
      success: true,
      data: {
        enabled: flags.FACE_AUTH_ENABLED && user.faceAuthEnabled,
        registeredAt: user.faceRegisteredAt,
        livenessCheckRequired: user.livenessCheckRequired,
      },
    });
  } catch (error) {
    console.error(
      '[FACE_AUTH] Status lookup failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );

    return res.status(500).json({ error: 'Unable to retrieve face-auth status.' });
  }
});

router.delete('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $unset: { faceEmbedding: 1 },
        $set: {
          faceAuthEnabled: false,
          faceRegisteredAt: null,
        },
      },
      { new: true },
    ).select('_id email');

    if (!user) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    await auditLogService.writeEvent({
      userId: user._id,
      email: user.email,
      eventType: 'FACE_AUTH_DISABLED',
      success: true,
      ipAddress: getClientIp(req),
    });

    return res.json({
      success: true,
      message: 'Face authentication registration has been removed.',
    });
  } catch (error) {
    console.error(
      '[FACE_AUTH] Face removal failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );

    return res.status(500).json({
      error: 'Unable to remove face authentication registration.',
    });
  }
});

module.exports = router;
