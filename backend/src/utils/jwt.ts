import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { JWTPayload } from '../types';

export class JWTUtils {
  static generateToken(payload: JWTPayload): string {
    const secret = config.jwtSecret as string;

    const options = {
      expiresIn: config.jwtExpiresIn,
      issuer: 'collaborative-task-manager',
      audience: 'task-manager-users'
    } as const; // inline type, no SignOptions

    return jwt.sign(payload, secret, options);
  }

  static verifyToken(token: string): JWTPayload {
    const secret = config.jwtSecret as string;

    const options = {
      issuer: 'collaborative-task-manager',
      audience: 'task-manager-users'
    } as const; // inline type, no VerifyOptions

    try {
      const decoded = jwt.verify(token, secret, options) as JWTPayload; // cast directly
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      } else {
        throw new Error('Token verification failed');
      }
    }
  }

  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader?.startsWith('Bearer ')) return null;
    return authHeader.substring(7);
  }
}
