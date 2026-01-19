const User = require('../models/User');

class AuditLogService {
  async logFaceAuthAttempt(userId, email, isMatch, confidence, ipAddress) {
    const logEntry = { userId, email, timestamp: new Date(), eventType: 'FACE_AUTH_ATTEMPT', success: isMatch, confidence: confidence.toFixed(2), ipAddress };
    console.log(`[AUDIT] Face auth ${isMatch ? 'SUCCESS' : 'FAILED'} for ${email}`);
    return logEntry;
  }

  async logFaceRegistration(userId, email, success, ipAddress) {
    return { userId, email, timestamp: new Date(), eventType: 'FACE_REGISTRATION', success, ipAddress };
  }

  async getAllLogsForUser(userId) {
    const user = await User.findById(userId);
    return user ? user.auditLog || [] : [];
  }

  async getFailedAttempts(userId, hours = 24) {
    const user = await User.findById(userId);
    if (!user) return [];
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return (user.auditLog || []).filter(log => log.timestamp > cutoffTime && !log.success);
  }
}

module.exports = new AuditLogService();
