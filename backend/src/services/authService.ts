import { prisma } from '../config/database';
import { JWTUtils } from '../utils/jwt';
import { JWTPayload } from '../types';
import { AppError } from '../middleware/errorHandler';
import * as bcrypt from 'bcryptjs';

export class AuthService {
  static async register(name: string, email: string, password: string) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        // password excluded
      }
    });

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
    };

    const token = JWTUtils.generateToken(payload);

    return {
      user,
      token,
    };
  }

  static async login(email: string, password: string) {
    // Find user with password
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
    };

    const token = JWTUtils.generateToken(payload);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        // password excluded
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  static async updateUserProfile(userId: string, updates: { name?: string; email?: string }) {
    // Check if email is already taken by another user
    if (updates.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: updates.email,
          id: { not: userId },
        },
      });
      
      if (existingUser) {
        throw new AppError('Email is already taken', 400);
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        // password excluded
      }
    });

    return user;
  }

  // Additional methods for completeness
  static async validateEmailUnique(email: string, excludeUserId?: string) {
    const where: any = { email };
    if (excludeUserId) {
      where.id = { not: excludeUserId };
    }

    const user = await prisma.user.findFirst({ where });
    return !user; // Returns true if email is unique
  }

  static async changePassword(userId: string, oldPassword: string, newPassword: string) {
    // Get user with current password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });
  }
}
