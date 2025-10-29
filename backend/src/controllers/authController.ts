import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';

export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };

    try {
      const result = await AuthService.register(name, email, password);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'User registered successfully',
        data: result,
      };

      res.status(201).json(response);
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Registration failed',
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  });

  static login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    try {
      const result = await AuthService.login(email, password);

      const response: ApiResponse<typeof result> = {
        success: true,
        message: 'Login successful',
        data: result,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Login failed',
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  });

  static getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Use both id and userId for compatibility
    const userId = (req.user as any)?.id || (req.user as any)?.userId;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    try {
      const user = await AuthService.getUserProfile(userId);

      const response: ApiResponse<typeof user> = {
        success: true,
        message: 'Profile retrieved successfully',
        data: user,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve profile',
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  });

  static updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req.user as any)?.id || (req.user as any)?.userId;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const updates = req.body as { name?: string; email?: string };

    try {
      const user = await AuthService.updateUserProfile(userId, updates);

      const response: ApiResponse<typeof user> = {
        success: true,
        message: 'Profile updated successfully',
        data: user,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update profile',
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  });

  static logout = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const response: ApiResponse = {
      success: true,
      message: 'Logged out successfully',
    };

    res.status(200).json(response);
  });

  static refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req.user as any)?.id || (req.user as any)?.userId;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    try {
      const user = await AuthService.getUserProfile(userId);
      
      const response: ApiResponse<typeof user> = {
        success: true,
        message: 'Token refreshed successfully', 
        data: user,
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to refresh token',
        error: error.message,
      };

      res.status(statusCode).json(response);
    }
  });
}
