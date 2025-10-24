import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

export class UserController {
  static getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const currentUserId = req.user._id.toString();
    const { includeMe } = req.query;
    
    // Exclude current user unless specifically requested
    const excludeUserId = includeMe === 'true' ? undefined : currentUserId;
    
    const users = await UserService.getAllUsers(excludeUserId);
    
    const response: ApiResponse = {
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        total: users.length
      }
    };
    
    res.status(200).json(response);
  });

  static getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const user = await UserService.getUserById(id);
    
    const response: ApiResponse = {
      success: true,
      message: 'User retrieved successfully',
      data: user
    };
    
    res.status(200).json(response);
  });

  static searchUsers = asyncHandler(async (req: Request, res: Response) => {
    const { q: searchTerm } = req.query;
    const currentUserId = req.user._id.toString();
    const { includeMe } = req.query;
    
    if (!searchTerm || typeof searchTerm !== 'string') {
      const response: ApiResponse = {
        success: false,
        message: 'Search term is required'
      };
      return res.status(400).json(response);
    }

    if (searchTerm.length < 2) {
      const response: ApiResponse = {
        success: false,
        message: 'Search term must be at least 2 characters long'
      };
      return res.status(400).json(response);
    }
    
    const excludeUserId = includeMe === 'true' ? undefined : currentUserId;
    const users = await UserService.searchUsers(searchTerm, excludeUserId);
    
    const response: ApiResponse = {
      success: true,
      message: 'User search completed successfully',
      data: {
        users,
        total: users.length,
        searchTerm
      }
    };
    
    res.status(200).json(response);
  });

  static getUserStats = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const currentUserId = req.user._id.toString();
    
    // Users can only view their own stats or any user stats if they're viewing profile
    // For now, we'll allow viewing any user's stats for dashboard purposes
    
    const userStats = await UserService.getUserStats(id);
    
    const response: ApiResponse = {
      success: true,
      message: 'User statistics retrieved successfully',
      data: userStats
    };
    
    res.status(200).json(response);
  });

  static getCurrentUserStats = asyncHandler(async (req: Request, res: Response) => {
    const currentUserId = req.user._id.toString();
    
    const userStats = await UserService.getUserStats(currentUserId);
    
    const response: ApiResponse = {
      success: true,
      message: 'Your statistics retrieved successfully',
      data: userStats
    };
    
    res.status(200).json(response);
  });

  static deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const currentUserId = req.user._id.toString();
    
    // Users can only delete their own account
    if (id !== currentUserId) {
      const response: ApiResponse = {
        success: false,
        message: 'You can only delete your own account'
      };
      return res.status(403).json(response);
    }
    
    await UserService.deleteUser(id);
    
    const response: ApiResponse = {
      success: true,
      message: 'Account deleted successfully'
    };
    
    res.status(200).json(response);
  });
}
