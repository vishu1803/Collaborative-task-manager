import { Socket } from 'socket.io';
import { JWTUtils } from '../utils/jwt';
import { User } from '../models/User';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
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

    // Get user from database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return next(new Error('User not found'));
    }

    // Attach user to socket
    socket.userId = (user._id as any).toString();
    socket.user = user;

    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
};
