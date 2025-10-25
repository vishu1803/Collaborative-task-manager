import { Task, ITask } from '../models/Task';
import { TaskStatus, TaskPriority } from '../types';
import { AppError } from '../middleware/errorHandler';
import mongoose from 'mongoose';

interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  creatorId?: string;
  overdue?: boolean;
}

interface TaskQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: TaskFilters;
}

export class TaskService {
  static async createTask(taskData: {
    title: string;
    description: string;
    dueDate: string;
    priority: TaskPriority;
    assignedToId: string;
    creatorId: string;
  }): Promise<ITask> {
    try {
      // Validate assignedToId exists
      const { User } = require('../models/User');
      const assignedUser = await User.findById(taskData.assignedToId);
      if (!assignedUser) {
        throw new AppError('Assigned user not found', 404);
      }

      const task = new Task({
        ...taskData,
        dueDate: new Date(taskData.dueDate),
        status: TaskStatus.TODO
      });

      await task.save();
      
      // Populate user data for response
      await task.populate('creatorId assignedToId', 'name email');
      
      return task;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create task', 500);
    }
  }

  static async getTasks(options: TaskQueryOptions = {}): Promise<{
    tasks: ITask[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalTasks: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        filters = {}
      } = options;

      // Build query
      const query: any = {};

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.priority) {
        query.priority = filters.priority;
      }

      if (filters.assignedToId) {
        query.assignedToId = filters.assignedToId;
      }

      if (filters.creatorId) {
        query.creatorId = filters.creatorId;
      }

      if (filters.overdue) {
        query.dueDate = { $lt: new Date() };
        query.status = { $ne: TaskStatus.COMPLETED };
      }

      // Build sort object
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute queries
      const [tasks, totalTasks] = await Promise.all([
        Task.find(query)
          .populate('creatorId assignedToId', 'name email')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        Task.countDocuments(query)
      ]);

      const totalPages = Math.ceil(totalTasks / limit);

      return {
        tasks: tasks as unknown as ITask[],
        pagination: {
          currentPage: page,
          totalPages,
          totalTasks,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      throw new AppError('Failed to retrieve tasks', 500);
    }
  }

  static async getTaskById(taskId: string): Promise<ITask> {
    try {
      if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new AppError('Invalid task ID format', 400);
      }

      const task = await Task.findById(taskId)
        .populate('creatorId assignedToId', 'name email');

      if (!task) {
        throw new AppError('Task not found', 404);
      }

      return task;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to retrieve task', 500);
    }
  }

  static async updateTask(
    taskId: string,
    updates: Partial<{
      title: string;
      description: string;
      dueDate: string;
      priority: TaskPriority;
      status: TaskStatus;
      assignedToId: string;
    }>,
    userId: string
  ): Promise<ITask> {
    try {
      if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new AppError('Invalid task ID format', 400);
      }

      // Find the task first
      const existingTask = await Task.findById(taskId);
      if (!existingTask) {
        throw new AppError('Task not found', 404);
      }

      // Check if user has permission to update (creator or assignee)
      const canUpdate = existingTask.creatorId.toString() === userId || 
                       existingTask.assignedToId.toString() === userId;

      if (!canUpdate) {
        throw new AppError('You do not have permission to update this task', 403);
      }

      // If assignedToId is being updated, validate the new user exists
      if (updates.assignedToId) {
        const { User } = require('../models/User');
        const assignedUser = await User.findById(updates.assignedToId);
        if (!assignedUser) {
          throw new AppError('Assigned user not found', 404);
        }
      }

      // Prepare update data
      const updateData: any = { ...updates };
      if (updates.dueDate) {
        updateData.dueDate = new Date(updates.dueDate);
      }

      const task = await Task.findByIdAndUpdate(
        taskId,
        updateData,
        { new: true, runValidators: true }
      ).populate('creatorId assignedToId', 'name email');

      return task!;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update task', 500);
    }
  }

  static async deleteTask(taskId: string, userId: string): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(taskId)) {
        throw new AppError('Invalid task ID format', 400);
      }

      const task = await Task.findById(taskId);
      if (!task) {
        throw new AppError('Task not found', 404);
      }

      // Only the creator can delete the task
      if (task.creatorId.toString() !== userId) {
        throw new AppError('Only the task creator can delete this task', 403);
      }

      await Task.findByIdAndDelete(taskId);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete task', 500);
    }
  }

  static async getTaskStatistics(userId?: string): Promise<any> {
    try {
      const matchCondition = userId 
        ? { 
            $or: [
              { creatorId: new mongoose.Types.ObjectId(userId) },
              { assignedToId: new mongoose.Types.ObjectId(userId) }
            ]
          }
        : {};

      const stats = await Task.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            todo: {
              $sum: { $cond: [{ $eq: ['$status', TaskStatus.TODO] }, 1, 0] }
            },
            inProgress: {
              $sum: { $cond: [{ $eq: ['$status', TaskStatus.IN_PROGRESS] }, 1, 0] }
            },
            review: {
              $sum: { $cond: [{ $eq: ['$status', TaskStatus.REVIEW] }, 1, 0] }
            },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', TaskStatus.COMPLETED] }, 1, 0] }
            },
            overdue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $lt: ['$dueDate', new Date()] },
                      { $ne: ['$status', TaskStatus.COMPLETED] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            byPriority: {
              $push: '$priority'
            }
          }
        },
        {
          $project: {
            _id: 0,
            total: 1,
            byStatus: {
              todo: '$todo',
              inProgress: '$inProgress',
              review: '$review',
              completed: '$completed'
            },
            overdue: 1,
            completionRate: {
              $cond: [
                { $gt: ['$total', 0] },
                { $multiply: [{ $divide: ['$completed', '$total'] }, 100] },
                0
              ]
            },
            priorityCounts: {
              low: {
                $size: {
                  $filter: {
                    input: '$byPriority',
                    cond: { $eq: ['$$this', TaskPriority.LOW] }
                  }
                }
              },
              medium: {
                $size: {
                  $filter: {
                    input: '$byPriority',
                    cond: { $eq: ['$$this', TaskPriority.MEDIUM] }
                  }
                }
              },
              high: {
                $size: {
                  $filter: {
                    input: '$byPriority',
                    cond: { $eq: ['$$this', TaskPriority.HIGH] }
                  }
                }
              },
              urgent: {
                $size: {
                  $filter: {
                    input: '$byPriority',
                    cond: { $eq: ['$$this', TaskPriority.URGENT] }
                  }
                }
              }
            }
          }
        }
      ]);

      return stats[0] || {
        total: 0,
        byStatus: { todo: 0, inProgress: 0, review: 0, completed: 0 },
        overdue: 0,
        completionRate: 0,
        priorityCounts: { low: 0, medium: 0, high: 0, urgent: 0 }
      };
    } catch (error) {
      throw new AppError('Failed to retrieve task statistics', 500);
    }
  }

  static async getUserTasks(userId: string, type: 'assigned' | 'created' | 'all' = 'all'): Promise<ITask[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError('Invalid user ID format', 400);
      }

      let query: any = {};

      switch (type) {
        case 'assigned':
          query.assignedToId = userId;
          break;
        case 'created':
          query.creatorId = userId;
          break;
        case 'all':
        default:
          query = {
            $or: [
              { creatorId: userId },
              { assignedToId: userId }
            ]
          };
          break;
      }

      const tasks = await Task.find(query)
        .populate('creatorId assignedToId', 'name email')
        .sort({ dueDate: 1, priority: -1 })
        .lean();

      return tasks as unknown as ITask[];
    } catch (error) {
      throw new AppError('Failed to retrieve user tasks', 500);
    }
  }
}
