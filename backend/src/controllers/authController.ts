import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { ApiResponse } from '../types/api';
import { asyncHandler } from '../middleware/errorHandler';

// Type-safe controller methods
export class AuthController {
  static register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, email, password } = req.body as {
      name: string;
      email: string;
      password: string;
    };
    
    const result = await AuthService.register(name, email, password);
    
    const response: ApiResponse<typeof result> = {
      success: true,
      message: 'User registered successfully',
      data: result
    };
    
    res.status(201).json(response);
  });

  static login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };
    
    const result = await AuthService.login(email, password);
    
    const response: ApiResponse<typeof result> = {
      success: true,
      message: 'Login successful',
      data: result
    };
    
    res.status(200).json(response);
  });

  static getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user._id.toString();
    
    const user = await AuthService.getUserProfile(userId);
    
    const response: ApiResponse<typeof user> = {
      success: true,
      message: 'Profile retrieved successfully',
      data: user
    };
    
    res.status(200).json(response);
  });

  static updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user._id.toString();
    const updates = req.body as { name?: string; email?: string };
    
    const user = await AuthService.updateUserProfile(userId, updates);
    
    const response: ApiResponse<typeof user> = {
      success: true,
      message: 'Profile updated successfully',
      data: user
    };
    
    res.status(200).json(response);
  });
}
