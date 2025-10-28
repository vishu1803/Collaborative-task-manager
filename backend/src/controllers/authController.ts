import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { ApiResponse } from '../types/api';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler'; // ensure exported from errorHandler.ts

// Extend Request to include authenticated user (from JWT middleware)
interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    email?: string;
    name?: string;
  };
}

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
      const statusCode =
        error instanceof AppError
          ? error.statusCode
          : error.code === 11000
          ? 400
          : 500;

      const response: ApiResponse<null> = {
        success: false,
        message: error.message || 'Registration failed',
        data: null,
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
      const statusCode =
        error instanceof AppError
          ? error.statusCode
          : error.message?.includes('Invalid') 
          ? 401 
          : 500;

      const response: ApiResponse<null> = {
        success: false,
        message: error.message || 'Login failed',
        data: null,
      };

      res.status(statusCode).json(response);
    }
  });

  static getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?._id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const user = await AuthService.getUserProfile(userId);

    const response: ApiResponse<typeof user> = {
      success: true,
      message: 'Profile retrieved successfully',
      data: user,
    };

    res.status(200).json(response);
  });

  static updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?._id;

    if (!userId) {
      throw new AppError('User not authenticated', 401);
    }

    const updates = req.body as { name?: string; email?: string };

    const user = await AuthService.updateUserProfile(userId, updates);

    const response: ApiResponse<typeof user> = {
      success: true,
      message: 'Profile updated successfully',
      data: user,
    };

    res.status(200).json(response);
  });
}
