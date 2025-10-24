import { User } from '../models/User';
import { JWTUtils } from '../utils/jwt';
import { ApiResponse, JWTPayload } from '../types';

export class AuthService {
  static async register(name: string, email: string, password: string) {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user
      const user = new User({ name, email, password });
      await user.save();

      // Generate JWT token
      const payload: JWTPayload = {
        userId: (user._id as any).toString(),
        email: user.email
      };
      
      const token = JWTUtils.generateToken(payload);

      return {
        user: user.toJSON(),
        token
      };
    } catch (error) {
      throw error;
    }
  }

  static async login(email: string, password: string) {
    try {
      // Find user and include password for comparison
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Compare password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const payload: JWTPayload = {
        userId: (user._id as any).toString(),
        email: user.email
      };
      
      const token = JWTUtils.generateToken(payload);

      return {
        user: user.toJSON(),
        token
      };
    } catch (error) {
      throw error;
    }
  }

  static async getUserProfile(userId: string) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return user.toJSON();
    } catch (error) {
      throw error;
    }
  }

  static async updateUserProfile(userId: string, updates: { name?: string; email?: string }) {
    try {
      // Check if email is being updated and if it's already taken
      if (updates.email) {
        const existingUser = await User.findOne({ 
          email: updates.email, 
          _id: { $ne: userId } 
        });
        if (existingUser) {
          throw new Error('Email is already taken');
        }
      }

      const user = await User.findByIdAndUpdate(
        userId,
        updates,
        { new: true, runValidators: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      return user.toJSON();
    } catch (error) {
      throw error;
    }
  }
}
