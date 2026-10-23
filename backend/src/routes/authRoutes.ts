
import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import User = require('../models/User');
import faceAuthRoutes = require('./faceAuth');

const router = express.Router();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (
    !secret ||
    secret.length < 32 ||
    [
      'secret',
      'your_jwt_secret_key',
      'your_jwt_secret_change_this_in_production',
    ].includes(secret)
  ) {
    throw new Error('A secure JWT_SECRET must be configured.');
  }

  return secret;
}

function createToken(userId: string): string {
  return jwt.sign({ id: userId }, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
}

function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  try {
    const decoded = jwt.verify(
      authorization.slice(7).trim(),
      getJwtSecret(),
    );

    if (
      typeof decoded !== 'object' ||
      !decoded ||
      typeof decoded.id !== 'string'
    ) {
      res.status(401).json({ error: 'Invalid authentication token.' });
      return;
    }

    req.user = { id: decoded.id };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body || {};

    if (
      typeof name !== 'string' ||
      !name.trim() ||
      name.trim().length > 100
    ) {
      return res.status(400).json({
        error: 'Name is required and must not exceed 100 characters.',
      });
    }

    if (
      typeof email !== 'string' ||
      !validator.isEmail(email.trim())
    ) {
      return res.status(400).json({
        error: 'A valid email address is required.',
      });
    }

    if (
      typeof password !== 'string' ||
      password.length < 8 ||
      password.length > 72
    ) {
      return res.status(400).json({
        error: 'Password must contain between 8 and 72 characters.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    }).select('_id');

    if (existingUser) {
      return res.status(409).json({
        error: 'An account with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = createToken(user._id.toString());

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: unknown) {
    const mongoError = error as {
      code?: number;
      message?: string;
    };

    if (mongoError.code === 11000) {
      return res.status(409).json({
        error: 'An account with this email already exists.',
      });
    }

    console.error(
      '[AUTH] Registration failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );

    return res.status(500).json({
      error: 'Unable to create the account at this time.',
    });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== 'string' ||
      !validator.isEmail(email.trim()) ||
      typeof password !== 'string' ||
      !password
    ) {
      return res.status(400).json({
        error: 'A valid email and password are required.',
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        error: 'Invalid email or password.',
      });
    }

    const token = createToken(user._id.toString());

    return res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: unknown) {
    console.error(
      '[AUTH] Login failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );

    return res.status(500).json({
      error: 'Unable to sign in at this time.',
    });
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  // JWTs are stateless. The client must discard its token.
  return res.json({
    success: true,
    message: 'Logged out. Please discard your authentication token.',
  });
});

router.get(
  '/me',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await User.findById(req.user?.id).select(
        '_id name email faceAuthEnabled faceRegisteredAt trackingActive lastLocation createdAt updatedAt',
      );

      if (!user) {
        return res.status(404).json({ error: 'Account not found.' });
      }

      return res.json({
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          faceAuthEnabled: user.faceAuthEnabled,
          faceRegisteredAt: user.faceRegisteredAt,
          trackingActive: user.trackingActive,
          lastLocation: user.lastLocation,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error: unknown) {
      console.error(
        '[AUTH] Profile lookup failed:',
        error instanceof Error ? error.message : 'Unknown error',
      );

      return res.status(500).json({
        error: 'Unable to retrieve your profile.',
      });
    }
  },
);

router.use('/face', faceAuthRoutes);

export default router;
