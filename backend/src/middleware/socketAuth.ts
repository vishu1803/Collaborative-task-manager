import { Socket } from 'socket.io';
import { JWTUtils } from '../utils/jwt';
import { prisma } from '../config/database';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  };
}

export const socketAuthMiddleware = async (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;

    if (!token) {
      return next(new Error('Authentication token required'));
    }

    // Extract token if it has Bearer prefix
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;

    // Verify token
    const decoded = JWTUtils.verifyToken(cleanToken);

    // Get user from database using Prisma
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
      return next(new Error('User not found'));
    }

    // Attach user to socket
    socket.userId = user.id;
    socket.user = user;

    console.log(`🔌 Socket authenticated for user: ${user.email} (${user.id})`);
    
    next();
  } catch (error) {
    console.error('Socket authentication failed:', error);
    next(new Error('Authentication failed'));
  }
};

// Optional: Socket middleware for handling disconnection
export const socketDisconnectHandler = (socket: AuthenticatedSocket) => {
  return () => {
    if (socket.user) {
      console.log(`🔌 Socket disconnected for user: ${socket.user.email} (${socket.userId})`);
    }
  };
};

// Optional: Middleware to validate user is still active
export const socketUserValidation = async (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
) => {
  try {
    if (!socket.userId) {
      return next(new Error('No user ID in socket'));
    }

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: socket.userId },
      select: { id: true }
    });

    if (!user) {
      return next(new Error('User no longer exists'));
    }

    next();
  } catch (error) {
    next(new Error('User validation failed'));
  }
};
