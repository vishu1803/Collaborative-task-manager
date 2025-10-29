import { prisma } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { Status } from '@prisma/client';

export class UserService {
  static async getAllUsers(excludeUserId?: string) {
    try {
      const where = excludeUserId ? { id: { not: excludeUserId } } : {};
      
      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
        orderBy: { name: 'asc' },
      });
      
      return users;
    } catch (error) {
      console.error('Get all users error:', error);
      throw new AppError('Failed to retrieve users', 500);
    }
  }

  static async getUserById(userId: string) {
    try {
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
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Get user by ID error:', error);
      throw new AppError('Failed to retrieve user', 500);
    }
  }

  static async searchUsers(searchTerm: string, excludeUserId?: string) {
    try {
      const where: any = {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } }
        ]
      };

      if (excludeUserId) {
        where.id = { not: excludeUserId };
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: { name: 'asc' },
        take: 20, // Limit results
      });

      return users;
    } catch (error) {
      console.error('Search users error:', error);
      throw new AppError('Failed to search users', 500);
    }
  }

  static async getUserStats(userId: string) {
    try {
      const [user, taskCounts] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        }),
        Promise.all([
          // Total created tasks
          prisma.task.count({
            where: { creatorId: userId },
          }),
          // Total assigned tasks
          prisma.task.count({
            where: { assignedToId: userId },
          }),
          // Completed tasks (assigned to user)
          prisma.task.count({
            where: {
              assignedToId: userId,
              status: Status.COMPLETED,
            },
          }),
          // Overdue tasks (assigned to user)
          prisma.task.count({
            where: {
              assignedToId: userId,
              dueDate: { lt: new Date() },
              status: { not: Status.COMPLETED },
            },
          }),
        ]),
      ]);

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const [totalCreated, totalAssigned, completedTasks, overdueTasks] = taskCounts;

      const completionRate = totalAssigned > 0 
        ? Math.round((completedTasks / totalAssigned) * 100)
        : 0;

      return {
        user,
        statistics: {
          totalCreated,
          totalAssigned,
          completedTasks,
          overdueTasks,
          completionRate,
        },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Get user stats error:', error);
      throw new AppError('Failed to retrieve user statistics', 500);
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      // Check if user has any tasks (as creator or assignee)
      const userTasks = await prisma.task.findFirst({
        where: {
          OR: [
            { creatorId: userId },
            { assignedToId: userId }
          ]
        }
      });

      if (userTasks) {
        throw new AppError(
          'Cannot delete user with existing tasks. Please reassign or delete tasks first.',
          400
        );
      }

      // Delete the user
      const deletedUser = await prisma.user.delete({
        where: { id: userId },
      });
      
      if (!deletedUser) {
        throw new AppError('User not found', 404);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      // Handle Prisma not found error
      if ((error as any).code === 'P2025') {
        throw new AppError('User not found', 404);
      }
      
      console.error('Delete user error:', error);
      throw new AppError('Failed to delete user', 500);
    }
  }

  static async updateUser(userId: string, updates: {
    name?: string;
    email?: string;
  }) {
    try {
      // Check if email is already taken by another user
      if (updates.email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: updates.email,
            id: { not: userId },
          },
        });

        if (existingUser) {
          throw new AppError('Email is already taken by another user', 400);
        }
      }

      const updatedUser = await prisma.user.update({
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

      return updatedUser;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      // Handle Prisma not found error
      if ((error as any).code === 'P2025') {
        throw new AppError('User not found', 404);
      }
      
      // Handle unique constraint error
      if ((error as any).code === 'P2002') {
        throw new AppError('Email is already taken', 400);
      }
      
      console.error('Update user error:', error);
      throw new AppError('Failed to update user', 500);
    }
  }

  static async getUserWithTasks(userId: string, taskType: 'created' | 'assigned' | 'all' = 'all') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      let taskWhere: any = {};

      switch (taskType) {
        case 'created':
          taskWhere = { creatorId: userId };
          break;
        case 'assigned':
          taskWhere = { assignedToId: userId };
          break;
        case 'all':
        default:
          taskWhere = {
            OR: [
              { creatorId: userId },
              { assignedToId: userId }
            ]
          };
          break;
      }

      const tasks = await prisma.task.findMany({
        where: taskWhere,
        include: {
          creator: {
            select: { id: true, name: true, email: true },
          },
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: [
          { dueDate: 'asc' },
          { createdAt: 'desc' },
        ],
      });

      return {
        user,
        tasks,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Get user with tasks error:', error);
      throw new AppError('Failed to retrieve user with tasks', 500);
    }
  }
}
