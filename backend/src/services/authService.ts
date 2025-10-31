import { prisma } from '../config/database';
import { JWTUtils } from '../utils/jwt';
import { JWTPayload } from '../types';
import { AppError } from '../middleware/errorHandler';
import bcrypt from 'bcryptjs';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'; 

export class AuthService {
  // -------------------------------
  // 🟢 REGISTER USER
  // -------------------------------
  static async register(name: string, email: string, password: string) {
    // ✅ 1. Validate required fields
    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      throw new AppError('All fields are required', 400);
    }

    // ✅ 2. Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    // ✅ 3. Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ 4. Create user
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
      },
    });

    // ✅ 5. Generate JWT
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
    };

    const token = JWTUtils.generateToken(payload);

    return { user, token };
  }

  // -------------------------------
  // 🟢 LOGIN USER
  // -------------------------------
  static async login(email: string, password: string) {
    if (!email?.trim() || !password?.trim()) {
      throw new AppError('Email and password are required', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
    };

    const token = JWTUtils.generateToken(payload);
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  // -------------------------------
  // 🟢 GET USER PROFILE
  // -------------------------------
  static async getUserProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  // -------------------------------
  // 🟢 UPDATE USER PROFILE
  // -------------------------------
  static async updateUserProfile(
    userId: string,
    updates: { name?: string; email?: string }
  ) {
    try {
      // ✅ 1. Optional email uniqueness check
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

      // ✅ 2. Update profile
      const user = await prisma.user.update({
        where: { id: userId },
        data: updates,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return user;
    } catch (error: any) {
      // ✅ Handle Prisma "record not found"
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new AppError('User not found', 404);
      }
      throw error;
    }
  }

  // -------------------------------
  // 🟢 CHECK EMAIL UNIQUENESS
  // -------------------------------
  static async validateEmailUnique(email: string, excludeUserId?: string) {
    const where: any = { email };
    if (excludeUserId) where.id = { not: excludeUserId };

    const user = await prisma.user.findFirst({ where });
    return !user;
  }

  // -------------------------------
  // 🟢 CHANGE PASSWORD
  // -------------------------------
  static async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
  }
}
