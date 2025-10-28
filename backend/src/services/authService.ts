import { User } from '../models/User';
import { JWTUtils } from '../utils/jwt';
import { JWTPayload } from '../types';
import { AppError } from '../middleware/errorHandler';  // ✅ use shared error class

export class AuthService {
  static async register(name: string, email: string, password: string) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('User with this email already exists', 400);
    }

    const user = new User({ name, email, password });
    await user.save();

    const payload: JWTPayload = {
      userId: (user._id as any).toString(),
      email: user.email,
    };

    const token = JWTUtils.generateToken(payload);

    return {
      user: user.toJSON(),
      token,
    };
  }

  static async login(email: string, password: string) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const payload: JWTPayload = {
      userId: (user._id as any).toString(),
      email: user.email,
    };

    const token = JWTUtils.generateToken(payload);

    return {
      user: user.toJSON(),
      token,
    };
  }

  static async getUserProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user.toJSON();
  }

  static async updateUserProfile(userId: string, updates: { name?: string; email?: string }) {
    if (updates.email) {
      const existingUser = await User.findOne({
        email: updates.email,
        _id: { $ne: userId },
      });
      if (existingUser) {
        throw new AppError('Email is already taken', 400);
      }
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user.toJSON();
  }
}
