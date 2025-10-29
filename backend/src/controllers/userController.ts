import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { AppError } from '../middleware/errorHandler';

export class UserController {
  static getAllUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const currentUserId = (req.user as any)?.id || (req.user as any)?.userId;
    const { includeMe = false } = req.query;

    try {
      const users = await UserService.getAllUsers();
      
      const filteredUsers = includeMe === 'true' || !currentUserId
        ? users 
        : users.filter(user => user.id !== currentUserId);

      const response: ApiResponse = {
        success: true,
        message: 'Users retrieved successfully',
        data: filteredUsers
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve users',
        error: error.message
      };

      res.status(statusCode).json(response);
    }
  });

  static getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
      throw new AppError('User ID is required', 400);
    }

    try {
      const user = await UserService.getUserById(id);

      const response: ApiResponse = {
        success: true,
        message: 'User retrieved successfully',
        data: user
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve user',
        error: error.message
      };

      res.status(statusCode).json(response);
    }
  });

  static updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updates = req.body;
    const currentUserId = (req.user as any)?.id || (req.user as any)?.userId;

    if (!id) {
      throw new AppError('User ID is required', 400);
    }

    if (id !== currentUserId) {
      throw new AppError('You can only update your own profile', 403);
    }

    try {
      const user = await UserService.updateUser(id, updates);

      const response: ApiResponse = {
        success: true,
        message: 'User updated successfully',
        data: user
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to update user',
        error: error.message
      };

      res.status(statusCode).json(response);
    }
  });

  static deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const currentUserId = (req.user as any)?.id || (req.user as any)?.userId;

    if (!id) {
      throw new AppError('User ID is required', 400);
    }

    if (id !== currentUserId) {
      throw new AppError('You can only delete your own account', 403);
    }

    try {
      await UserService.deleteUser(id);

      const response: ApiResponse = {
        success: true,
        message: 'User deleted successfully'
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to delete user',
        error: error.message
      };

      res.status(statusCode).json(response);
    }
  });

  static getUserStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const currentUserId = (req.user as any)?.id || (req.user as any)?.userId;

    const targetUserId = id || currentUserId;

    if (!targetUserId) {
      throw new AppError('User ID is required', 400);
    }

    try {
      const stats = await UserService.getUserStats(targetUserId);

      const response: ApiResponse = {
        success: true,
        message: 'User statistics retrieved successfully',
        data: stats
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve user statistics',
        error: error.message
      };

      res.status(statusCode).json(response);
    }
  });

  // NEW: Search users method
  
static searchUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { q } = req.query;
  const query = q as string;
  const currentUserId = (req.user as any)?.id || (req.user as any)?.userId;

  if (!query || query.trim().length < 2) {
    const response: ApiResponse = {
      success: false,
      message: 'Search query must be at least 2 characters long'
    };
    res.status(400).json(response);
    return;
  }

  try {
    const users = await UserService.searchUsers(query.trim(), currentUserId);

    const response: ApiResponse = {
      success: true,
      message: 'Users found successfully',
      data: users
    };

    res.status(200).json(response);
  } catch (error: any) {
    const statusCode = error instanceof AppError ? error.statusCode : 500;

    const response: ApiResponse = {
      success: false,
      message: error.message || 'Failed to search users',
      error: error.message
    };

    res.status(statusCode).json(response);
  }
});


  // NEW: Get current user stats method
  static getCurrentUserStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const currentUserId = (req.user as any)?.id || (req.user as any)?.userId;

    if (!currentUserId) {
      throw new AppError('User not authenticated', 401);
    }

    try {
      const stats = await UserService.getUserStats(currentUserId);

      const response: ApiResponse = {
        success: true,
        message: 'Current user statistics retrieved successfully',
        data: stats
      };

      res.status(200).json(response);
    } catch (error: any) {
      const statusCode = error instanceof AppError ? error.statusCode : 500;

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to retrieve user statistics',
        error: error.message
      };

      res.status(statusCode).json(response);
    }
  });
}
