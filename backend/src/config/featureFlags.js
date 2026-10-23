
'use strict';

function readBoolean(name, defaultValue) {
  const value = process.env[name];

  if (value === undefined || value.trim() === '') {
    return defaultValue;
  }

  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;

  throw new Error(
    `Invalid environment variable ${name}: expected "true" or "false".`,
  );
}

function readNumber(name, defaultValue, minimum, maximum) {
  const rawValue = process.env[name];

  if (rawValue === undefined || rawValue.trim() === '') {
    return defaultValue;
  }

  const value = Number(rawValue);

  if (
    !Number.isFinite(value) ||
    value < minimum ||
    value > maximum
  ) {
    throw new Error(
      `Invalid environment variable ${name}: expected a number between ${minimum} and ${maximum}.`,
    );
  }

  return value;
}

module.exports = Object.freeze({
  FACE_AUTH_ENABLED: readBoolean('FACE_AUTH_ENABLED', false),

  LIVENESS_DETECTION_ENABLED: readBoolean(
    'LIVENESS_DETECTION_ENABLED',
    true,
  ),

  FACE_AUTH_AS_MFA: readBoolean('FACE_AUTH_AS_MFA', false),

  FACE_CONFIDENCE_THRESHOLD: readNumber(
    'FACE_CONFIDENCE_THRESHOLD',
    85,
    0,
    100,
  ),

  LIVENESS_CONFIDENCE_THRESHOLD: readNumber(
    'LIVENESS_THRESHOLD',
    70,
    0,
    100,
  ),

  MAX_FAILED_ATTEMPTS: readNumber(
    'MAX_FAILED_ATTEMPTS',
    5,
    1,
    100,
  ),

  AUDIT_LOGGING_ENABLED: readBoolean('AUDIT_LOGGING', true),

  RATE_LIMIT_WINDOW_MS: readNumber(
    'RATE_LIMIT_WINDOW_MS',
    15 * 60 * 1000,
    1000,
    24 * 60 * 60 * 1000,
  ),

  RATE_LIMIT_MAX_REQUESTS: readNumber(
    'RATE_LIMIT_MAX_REQUESTS',
    100,
    1,
    10000,
  ),

  SESSION_EXPIRY_HOURS: readNumber(
    'SESSION_EXPIRY_HOURS',
    24,
    1,
    720,
  ),

  DEBUG_MODE: readBoolean('DEBUG', false),
});
