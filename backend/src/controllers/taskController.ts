import { Request, Response } from 'express';
import { TaskService } from '../services/taskService';
import { ApiResponse, Status, Priority } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { socketManager } from '../sockets/socketManager';

export class TaskController {
  static createTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { title, description, dueDate, priority, assignedToId } = req.body;
    const creatorId = (req.user as any)?.id || (req.user as any)?.userId;

    if (!creatorId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const task = await TaskService.createTask({
      title,
      description,
      dueDate,
      priority,
      assignedToId,
      creatorId
    });

    socketManager.notifyTaskCreated(task, (req.user as any)?.name || 'Unknown User');

    const response: ApiResponse = {
      success: true,
      message: 'Task created successfully',
      data: task
    };

    res.status(201).json(response);
    return;
  });

  static updateTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id) throw new Error('Task ID is required');

    const updates = req.body;
    const userId = (req.user as any)?.id || (req.user as any)?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const oldTask = await TaskService.getTaskById(id);
    const task = await TaskService.updateTask(id, updates, userId);

    const changes: string[] = [];
    if (updates.title) changes.push('title');
    if (updates.description) changes.push('description');
    if (updates.dueDate) changes.push('due date');

    if (updates.status && oldTask.status !== updates.status) {
      changes.push('status');
      socketManager.notifyTaskStatusChanged(
        task,
        (req.user as any)?.name || 'Unknown User',
        oldTask.status,
        updates.status
      );
    }

    if (updates.priority && oldTask.priority !== updates.priority) {
      changes.push('priority');
      socketManager.notifyTaskPriorityChanged(
        task,
        (req.user as any)?.name || 'Unknown User',
        oldTask.priority,
        updates.priority
      );
    }

    if (updates.assignedToId && oldTask.assignedToId !== updates.assignedToId) {
      changes.push('assignee');
      socketManager.notifyTaskReassigned(
        task,
        (req.user as any)?.name || 'Unknown User',
        oldTask.assignedToId,
        updates.assignedToId
      );
    } else if (changes.length > 0) {
      socketManager.notifyTaskUpdated(task, (req.user as any)?.name || 'Unknown User', changes);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Task updated successfully',
      data: task
    };

    res.status(200).json(response);
    return;
  });

  static deleteTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id) throw new Error('Task ID is required');

    const userId = (req.user as any)?.id || (req.user as any)?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }

    const task = await TaskService.getTaskById(id);
    await TaskService.deleteTask(id, userId);

    socketManager.notifyTaskDeleted(
      task.id,
      task.title,
      task.creatorId,
      task.assignedToId,
      (req.user as any)?.name || 'Unknown User'
    );

    const response: ApiResponse = {
      success: true,
      message: 'Task deleted successfully'
    };

    res.status(200).json(response);
    return;
  });

  static getTasks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const {
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      priority,
      assignedToId,
      creatorId,
      overdue
    } = req.query;

    const filters: any = {};

    if (status && ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'].includes(status as string)) {
      filters.status = status as Status;
    }

    if (priority && ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority as string)) {
      filters.priority = priority as Priority;
    }

    if (assignedToId && typeof assignedToId === 'string') {
      filters.assignedToId = assignedToId;
    }

    if (creatorId && typeof creatorId === 'string') {
      filters.creatorId = creatorId;
    }

    if (overdue === 'true') {
      filters.overdue = true;
    }

    const result = await TaskService.getTasks({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc',
      filters
    });

    const response: ApiResponse = {
      success: true,
      message: 'Tasks retrieved successfully',
      data: result
    };

    res.status(200).json(response);
  });

  static getTaskById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!id) throw new Error('Task ID is required');

    const task = await TaskService.getTaskById(id);

    const response: ApiResponse = {
      success: true,
      message: 'Task retrieved successfully',
      data: task
    };

    res.status(200).json(response);
  });

  static getTaskStatistics = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.query;
    const currentUserId = (req.user as any)?.id || (req.user as any)?.userId;
    
    const targetUserId = (userId as string) || currentUserId;
    
    const stats = await TaskService.getTaskStatistics(targetUserId);

    const response: ApiResponse = {
      success: true,
      message: 'Task statistics retrieved successfully',
      data: stats
    };

    res.status(200).json(response);
  });

  static getUserTasks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId, type = 'all' } = req.query;
    const currentUserId = (req.user as any)?.id || (req.user as any)?.userId;
    
    const targetUserId = (userId as string) || currentUserId;
    
    const tasks = await TaskService.getUserTasks(
      targetUserId, 
      type as 'assigned' | 'created' | 'all'
    );

    const response: ApiResponse = {
      success: true,
      message: `${type} tasks retrieved successfully`,
      data: {
        tasks,
        total: tasks.length,
        type,
        userId: targetUserId
      }
    };

    res.status(200).json(response);
  });

  static getMyTasks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { type = 'all' } = req.query;
    const currentUserId = (req.user as any)?.id || (req.user as any)?.userId;
    
    if (!currentUserId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    
    const tasks = await TaskService.getUserTasks(
      currentUserId, 
      type as 'assigned' | 'created' | 'all'
    );

    const response: ApiResponse = {
      success: true,
      message: `Your ${type} tasks retrieved successfully`,
      data: {
        tasks,
        total: tasks.length,
        type
      }
    };

    res.status(200).json(response);
    return;
  });

  static getOverdueTasks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const currentUserId = (req.user as any)?.id || (req.user as any)?.userId;
    
    if (!currentUserId) {
      res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
      return;
    }
    
    const result = await TaskService.getTasks({
      filters: { overdue: true },
      sortBy: 'dueDate',
      sortOrder: 'asc',
      limit: 100
    });

    const userOverdueTasks = result.tasks.filter((task: any) => 
      task.creatorId === currentUserId || task.assignedToId === currentUserId
    );

    const response: ApiResponse = {
      success: true,
      message: 'Overdue tasks retrieved successfully',
      data: {
        tasks: userOverdueTasks,
        total: userOverdueTasks.length
      }
    };

    res.status(200).json(response);
    return;
  });
}
