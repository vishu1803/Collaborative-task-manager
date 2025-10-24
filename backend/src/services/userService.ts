import { User, IUser } from '../models/User';
import { AppError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

export class UserService {
  static async getAllUsers(excludeUserId?: string): Promise<IUser[]> {
    try {
      const query = excludeUserId ? { _id: { $ne: excludeUserId } } : {};
      
      const users = await User.find(query, 'name email _id createdAt')
        .sort({ name: 1 })
        .lean<IUser[]>(); // Cast result to IUser[]
      
      return users;
    } catch (error) {
      throw new AppError('Failed to retrieve users', 500);
    }
  }

  static async getUserById(userId: string): Promise<IUser> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError('Invalid user ID format', 400);
      }

      const user = await User.findById(userId, 'name email _id createdAt updatedAt');
      
      if (!user) {
        throw new AppError('User not found', 404);
      }

      return user;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to retrieve user', 500);
    }
  }

  static async searchUsers(searchTerm: string, excludeUserId?: string): Promise<IUser[]> {
    try {
      const searchRegex = new RegExp(searchTerm, 'i'); // Case-insensitive search
      
      const query: any = {
        $or: [
          { name: { $regex: searchRegex } },
          { email: { $regex: searchRegex } }
        ]
      };

      if (excludeUserId) {
        query._id = { $ne: excludeUserId };
      }

      const users = await User.find(query, 'name email _id')
        .sort({ name: 1 })
        .limit(20) // Limit results
        .lean<IUser[]>(); // Cast result to IUser[]

      return users;
    } catch (error) {
      throw new AppError('Failed to search users', 500);
    }
  }

  static async getUserStats(userId: string): Promise<any> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError('Invalid user ID format', 400);
      }

      const { Task } = require('../models/Task');
      const userObjectId = new mongoose.Types.ObjectId(userId);
      
      const [user, taskStats] = await Promise.all([
        User.findById(userId, 'name email _id createdAt'),
        Task.aggregate([
          {
            $match: {
              $or: [
                { creatorId: userObjectId },
                { assignedToId: userObjectId }
              ]
            }
          },
          {
            $group: {
              _id: null,
              totalCreated: {
                $sum: {
                  $cond: [{ $eq: ['$creatorId', userObjectId] }, 1, 0]
                }
              },
              totalAssigned: {
                $sum: {
                  $cond: [{ $eq: ['$assignedToId', userObjectId] }, 1, 0]
                }
              },
              completedTasks: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ['$assignedToId', userObjectId] },
                        { $eq: ['$status', 'Completed'] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              },
              overdueTasks: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ['$assignedToId', userObjectId] },
                        { $lt: ['$dueDate', new Date()] },
                        { $ne: ['$status', 'Completed'] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              }
            }
          }
        ])
      ]);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const stats = taskStats[0] || {
        totalCreated: 0,
        totalAssigned: 0,
        completedTasks: 0,
        overdueTasks: 0
      };

      return {
        user,
        statistics: {
          ...stats,
          completionRate: stats.totalAssigned > 0 
            ? Math.round((stats.completedTasks / stats.totalAssigned) * 100)
            : 0
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to retrieve user statistics', 500);
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError('Invalid user ID format', 400);
      }

      const { Task } = require('../models/Task');

      const userTasks = await Task.findOne({
        $or: [
          { creatorId: userId },
          { assignedToId: userId }
        ]
      });

      if (userTasks) {
        throw new AppError(
          'Cannot delete user with existing tasks. Please reassign or delete tasks first.',
          400
        );
      }

      const deletedUser = await User.findByIdAndDelete(userId);
      
      if (!deletedUser) {
        throw new AppError('User not found', 404);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete user', 500);
    }
  }
}
