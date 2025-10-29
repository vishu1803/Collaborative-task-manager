import { Request, Response, NextFunction } from 'express';
import { JWTUtils } from '../utils/jwt';
import { prisma } from '../config/database';
import { ApiResponse } from '../types';

// Extend Express Request type to include user


// Main authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: 'Access denied. No token provided.'
      };
      res.status(401).json(response);
      return;
    }

    const decoded = JWTUtils.verifyToken(token);

    // Find user using Prisma
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        // password excluded for security
      }
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid token. User not found.'
      };
      res.status(401).json(response);
      return;
    }

    // Add user to request object
    req.user = {
      ...user,
      userId: user.id, // For backward compatibility
    };
    
    next();
    
  } catch (error) {
    console.error('Authentication error:', error);
    
    const response: ApiResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Authentication failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    res.status(401).json(response);
  }
};

// Optional middleware for routes that work with or without auth
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = JWTUtils.verifyToken(token);
      
      // Find user using Prisma
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
          // password excluded for security
        }
      });

      if (user) {
        req.user = {
          ...user,
          userId: user.id, // For backward compatibility
        };
      }
    }

    next();
  } catch (error) {
    // Continue without authentication for optional auth
    next();
  }
};

// Middleware to check if user is admin (if you have role-based auth)
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    const response: ApiResponse = {
      success: false,
      message: 'Authentication required'
    };
    res.status(401).json(response);
    return;
  }

  // Add admin check logic here if you have user roles
  // For now, just continue
  next();
};

// Middleware to extract user ID from token (lightweight version)
export const extractUserId = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    const token = JWTUtils.extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = JWTUtils.verifyToken(token);
      req.user = { userId: decoded.userId, email: decoded.email } as any;
    }
    
    next();
  } catch (error) {
    next();
  }
};
