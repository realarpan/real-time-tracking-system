
'use strict';

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 254,
      default: undefined,
    },

    eventType: {
      type: String,
      required: true,
      enum: [
        'FACE_AUTH_ATTEMPT',
        'FACE_REGISTRATION',
        'FACE_AUTH_DISABLED',
        'MFA_VERIFICATION',
        'LOGIN_SUCCESS',
        'LOGIN_FAILURE',
        'LOCATION_UPDATE',
        'SECURITY_EVENT',
      ],
      index: true,
    },

    success: {
      type: Boolean,
      required: true,
    },

    confidence: {
      type: Number,
      min: 0,
      max: 100,
      default: undefined,
    },

    ipAddress: {
      type: String,
      maxlength: 64,
      default: undefined,
    },

    details: {
      type: mongoose.Schema.Types.Mixed,
      default: undefined,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: true,
  },
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ eventType: 1, createdAt: -1 });
auditLogSchema.index({ success: 1, createdAt: -1 });

module.exports =
  mongoose.models.AuditLog ||
  mongoose.model('AuditLog', auditLogSchema);
