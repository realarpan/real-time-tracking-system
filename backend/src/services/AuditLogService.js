'use strict';

const AuditLog = require('../models/AuditLog');
const flags = require('../config/featureFlags');

class AuditLogService {
  async writeEvent(event) {
    if (!flags.AUDIT_LOGGING_ENABLED) {
      return null;
    }

    try {
      return await AuditLog.create({
        ...event,
        email: event.email
          ? event.email.trim().toLowerCase()
          : undefined,
      });
    } catch (error) {
      // Avoid logging sensitive authentication data.
      console.error(
        '[AUDIT] Failed to persist audit event:',
        error instanceof Error ? error.message : 'Unknown error',
      );

      throw new Error('Audit event could not be recorded.');
    }
  }

  async logFaceAuthAttempt(
    userId,
    email,
    isMatch,
    confidence,
    ipAddress,
  ) {
    return this.writeEvent({
      userId: userId || null,
      email,
      eventType: 'FACE_AUTH_ATTEMPT',
      success: Boolean(isMatch),
      confidence:
        Number.isFinite(Number(confidence))
          ? Math.min(100, Math.max(0, Number(confidence)))
          : undefined,
      ipAddress,
    });
  }

  async logFaceRegistration(userId, email, success, ipAddress) {
    return this.writeEvent({
      userId: userId || null,
      email,
      eventType: 'FACE_REGISTRATION',
      success: Boolean(success),
      ipAddress,
    });
  }

  async getAllLogsForUser(userId, limit = 100) {
    if (!userId) return [];

    const safeLimit = Math.min(
      500,
      Math.max(1, Math.trunc(Number(limit) || 100)),
    );

    return AuditLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .lean();
  }

  async getFailedAttempts(userId, hours = 24) {
    if (!userId) return [];

    const safeHours = Math.min(
      720,
      Math.max(1, Number(hours) || 24),
    );

    const cutoffTime = new Date(
      Date.now() - safeHours * 60 * 60 * 1000,
    );

    return AuditLog.find({
      userId,
      success: false,
      createdAt: { $gte: cutoffTime },
    })
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
  }
}

module.exports = new AuditLogService();
