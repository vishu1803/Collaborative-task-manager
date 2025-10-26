import { Request, Response } from 'express';
import { UserService } from '../services/userService';
import { ApiResponse } from '../types';
import { asyncHandler } from '../middleware/errorHandler';

export class UserController {
  static getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const currentUserId = (req.user as any)._id.toString();
    const { includeMe } = req.query;
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
    
    return res.status(200).json(response);
  });

  static getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    const user = await UserService.getUserById(id as string);
    
    const response: ApiResponse = {
      success: true,
      message: 'User retrieved successfully',
      data: user
    };
    
    return res.status(200).json(response);
  });

  static searchUsers = asyncHandler(async (req: Request, res: Response) => {
    const { q: searchTerm } = req.query;
    const currentUserId = (req.user as any)._id.toString();
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

    return res.status(200).json(response);
  });

  static getUserStats = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    //const _currentUserId = (req.user as any)._id.toString(); // unused, prefixed with _

    const userStats = await UserService.getUserStats(id as string);

    const response: ApiResponse = {
      success: true,
      message: 'User statistics retrieved successfully',
      data: userStats
    };

    return res.status(200).json(response);
  });

  static getCurrentUserStats = asyncHandler(async (req: Request, res: Response) => {
    const currentUserId = (req.user as any)._id.toString();

    const userStats = await UserService.getUserStats(currentUserId);

    const response: ApiResponse = {
      success: true,
      message: 'Your statistics retrieved successfully',
      data: userStats
    };

    return res.status(200).json(response);
  });

  static deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    //const _currentUserId = (req.user as any)._id.toString(); // unused, prefixed with _

    if (!id) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    await UserService.deleteUser(id as string);

    const response: ApiResponse = {
      success: true,
      message: 'Account deleted successfully'
    };

    return res.status(200).json(response);
  });
}
