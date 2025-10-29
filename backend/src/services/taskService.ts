import { prisma } from '../config/database';
import { Priority, Status, Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

// Update to match Prisma enums
export type TaskStatus = Status;
export type TaskPriority = Priority;

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
  }) {
    try {
      // Validate assignedToId exists
      const assignedUser = await prisma.user.findUnique({
        where: { id: taskData.assignedToId }
      });
      
      if (!assignedUser) {
        throw new AppError('Assigned user not found', 404);
      }

      // Validate creatorId exists
      const creator = await prisma.user.findUnique({
        where: { id: taskData.creatorId }
      });
      
      if (!creator) {
        throw new AppError('Creator user not found', 404);
      }

      const task = await prisma.task.create({
        data: {
          title: taskData.title,
          description: taskData.description,
          dueDate: new Date(taskData.dueDate),
          priority: taskData.priority,
          status: Status.TODO,
          creatorId: taskData.creatorId,
          assignedToId: taskData.assignedToId,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
      
      return task;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Create task error:', error);
      throw new AppError('Failed to create task', 500);
    }
  }

  static async getTasks(options: TaskQueryOptions = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        filters = {}
      } = options;

      // Build where clause
      const where: Prisma.TaskWhereInput = {};

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.priority) {
        where.priority = filters.priority;
      }

      if (filters.assignedToId) {
        where.assignedToId = filters.assignedToId;
      }

      if (filters.creatorId) {
        where.creatorId = filters.creatorId;
      }

      if (filters.overdue) {
        where.dueDate = { lt: new Date() };
        where.status = { not: Status.COMPLETED };
      }

      // Build orderBy
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      // Calculate pagination
      const skip = (page - 1) * limit;

      // Execute queries
      const [tasks, totalTasks] = await Promise.all([
        prisma.task.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          include: {
            creator: {
              select: { id: true, name: true, email: true },
            },
            assignedTo: {
              select: { id: true, name: true, email: true },
            },
          },
        }),
        prisma.task.count({ where }),
      ]);

      const totalPages = Math.ceil(totalTasks / limit);

      return {
        tasks,
        pagination: {
          currentPage: page,
          totalPages,
          totalTasks,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error('Get tasks error:', error);
      throw new AppError('Failed to retrieve tasks', 500);
    }
  }

  static async getTaskById(taskId: string) {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          creator: {
            select: { id: true, name: true, email: true },
          },
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      if (!task) {
        throw new AppError('Task not found', 404);
      }

      return task;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Get task by ID error:', error);
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
  ) {
    try {
      // Find the task first
      const existingTask = await prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!existingTask) {
        throw new AppError('Task not found', 404);
      }

      // Check if user has permission to update (creator or assignee)
      const canUpdate = existingTask.creatorId === userId || 
                       existingTask.assignedToId === userId;

      if (!canUpdate) {
        throw new AppError('You do not have permission to update this task', 403);
      }

      // If assignedToId is being updated, validate the new user exists
      if (updates.assignedToId) {
        const assignedUser = await prisma.user.findUnique({
          where: { id: updates.assignedToId }
        });
        
        if (!assignedUser) {
          throw new AppError('Assigned user not found', 404);
        }
      }

      // Prepare update data
      const updateData: Prisma.TaskUpdateInput = { ...updates };
      
      if (updates.dueDate) {
        updateData.dueDate = new Date(updates.dueDate);
      }

      const task = await prisma.task.update({
        where: { id: taskId },
        data: updateData,
        include: {
          creator: {
            select: { id: true, name: true, email: true },
          },
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return task;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Update task error:', error);
      throw new AppError('Failed to update task', 500);
    }
  }

  static async deleteTask(taskId: string, userId: string): Promise<void> {
    try {
      const task = await prisma.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        throw new AppError('Task not found', 404);
      }

      // Only the creator can delete the task
      if (task.creatorId !== userId) {
        throw new AppError('Only the task creator can delete this task', 403);
      }

      await prisma.task.delete({
        where: { id: taskId },
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('Delete task error:', error);
      throw new AppError('Failed to delete task', 500);
    }
  }

  static async getTaskStatistics(userId?: string) {
    try {
      const where: Prisma.TaskWhereInput = userId 
        ? { 
            OR: [
              { creatorId: userId },
              { assignedToId: userId }
            ]
          }
        : {};

      const [
        total,
        todoCount,
        inProgressCount,
        reviewCount,
        completedCount,
        overdueCount,
        lowCount,
        mediumCount,
        highCount,
        urgentCount,
      ] = await Promise.all([
        prisma.task.count({ where }),
        prisma.task.count({ where: { ...where, status: Status.TODO } }),
        prisma.task.count({ where: { ...where, status: Status.IN_PROGRESS } }),
        prisma.task.count({ where: { ...where, status: Status.REVIEW } }),
        prisma.task.count({ where: { ...where, status: Status.COMPLETED } }),
        prisma.task.count({
          where: {
            ...where,
            dueDate: { lt: new Date() },
            status: { not: Status.COMPLETED },
          },
        }),
        prisma.task.count({ where: { ...where, priority: Priority.LOW } }),
        prisma.task.count({ where: { ...where, priority: Priority.MEDIUM } }),
        prisma.task.count({ where: { ...where, priority: Priority.HIGH } }),
        prisma.task.count({ where: { ...where, priority: Priority.URGENT } }),
      ]);

      const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

      return {
        total,
        byStatus: {
          todo: todoCount,
          inProgress: inProgressCount,
          review: reviewCount,
          completed: completedCount,
        },
        overdue: overdueCount,
        completionRate,
        priorityCounts: {
          low: lowCount,
          medium: mediumCount,
          high: highCount,
          urgent: urgentCount,
        },
      };
    } catch (error) {
      console.error('Get task statistics error:', error);
      throw new AppError('Failed to retrieve task statistics', 500);
    }
  }

  static async getUserTasks(userId: string, type: 'assigned' | 'created' | 'all' = 'all') {
    try {
      let where: Prisma.TaskWhereInput = {};

      switch (type) {
        case 'assigned':
          where.assignedToId = userId;
          break;
        case 'created':
          where.creatorId = userId;
          break;
        case 'all':
        default:
          where = {
            OR: [
              { creatorId: userId },
              { assignedToId: userId }
            ]
          };
          break;
      }

      const tasks = await prisma.task.findMany({
        where,
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
          { priority: 'desc' },
        ],
      });

      return tasks;
    } catch (error) {
      console.error('Get user tasks error:', error);
      throw new AppError('Failed to retrieve user tasks', 500);
    }
  }
}
