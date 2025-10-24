import { Request, Response, NextFunction } from 'express';
import { JWTUtils } from '../utils/jwt';
import { User } from '../models/User';
import { ApiResponse } from '../types';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for token in Authorization header
    const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: 'Access denied. No token provided.'
      };
      return res.status(401).json(response);
    }

    // Verify token
    const decoded = JWTUtils.verifyToken(token);
    
    // Get user from database (excluding password)
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid token. User not found.'
      };
      return res.status(401).json(response);
    }

    // Attach user to request object
    req.user = user;
    next();
    
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Authentication failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(401).json(response);
  }
};

// Optional middleware for routes that work with or without auth
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = JWTUtils.verifyToken(token);
      const user = await User.findById(decoded.userId).select('-password');
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't return an error, just continue without user
    next();
  }
};
