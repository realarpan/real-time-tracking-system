
'use strict';

const mongoose = require('mongoose');
const validator = require('validator');

const locationSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
    },
    timestamp: {
      type: Date,
    },
  },
  { _id: false },
);

const faceAuthAttemptsSchema = new mongoose.Schema(
  {
    success: {
      type: Number,
      default: 0,
      min: 0,
    },
    failed: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastAttempt: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      validate: {
        validator(value) {
          return validator.isEmail(value);
        },
        message: 'Please provide a valid email address.',
      },
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    faceEmbedding: {
      type: [Number],
      default: undefined,
      select: false,
      validate: {
        validator(value) {
          if (value == null) return true;

          return (
            Array.isArray(value) &&
            value.length === 128 &&
            value.every(Number.isFinite)
          );
        },
        message: 'Face embedding must contain 128 finite numeric values.',
      },
    },

    faceAuthEnabled: {
      type: Boolean,
      default: false,
    },

    faceRegisteredAt: {
      type: Date,
      default: null,
    },

    faceAuthAttempts: {
      type: faceAuthAttemptsSchema,
      default: () => ({}),
    },

    livenessCheckRequired: {
      type: Boolean,
      default: true,
    },

    trackingActive: {
      type: Boolean,
      default: false,
    },

    lastLocation: {
      type: locationSchema,
      default: undefined,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    strict: 'throw',
    toJSON: {
      transform(_doc, result) {
        delete result.password;
        delete result.faceEmbedding;
        delete result.__v;
        return result;
      },
    },
  },
);

userSchema.index({ email: 1 }, { unique: true });

module.exports =
  mongoose.models.User || mongoose.model('User', userSchema);
