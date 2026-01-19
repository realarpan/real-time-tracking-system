module.exports = {
  FACE_AUTH_ENABLED: process.env.FACE_AUTH_ENABLED === 'true' || true,
  LIVENESS_DETECTION_ENABLED: process.env.LIVENESS_DETECTION === 'true' || true,
  FACE_AUTH_AS_MFA: process.env.FACE_AUTH_AS_MFA === 'true' || false,
  FACE_CONFIDENCE_THRESHOLD: parseFloat(process.env.FACE_CONFIDENCE_THRESHOLD) || 85,
  LIVENESS_CONFIDENCE_THRESHOLD: parseFloat(process.env.LIVENESS_THRESHOLD) || 70,
  MAX_FAILED_ATTEMPTS: parseInt(process.env.MAX_FAILED_ATTEMPTS) || 5,
  AUDIT_LOGGING_ENABLED: process.env.AUDIT_LOGGING === 'true' || true,
  RATE_LIMIT_WINDOW_MS: 3600000,
  RATE_LIMIT_MAX_REQUESTS: 10,
  SESSION_EXPIRY_HOURS: 24,
  DEBUG_MODE: process.env.DEBUG === 'true' || false
};
