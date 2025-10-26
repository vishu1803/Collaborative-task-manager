import { Request, Response } from 'express';
import { TaskService } from '../services/taskService';
import { ApiResponse, TaskStatus, TaskPriority } from '../types';
import { asyncHandler } from '../middleware/errorHandler';
import { socketManager } from '../sockets/socketManager';

export class TaskController {
  static createTask = asyncHandler(async (req: Request, res: Response) => {
    const { title, description, dueDate, priority, assignedToId } = req.body;
    const creatorId = (req.user as any)._id.toString();

    const task = await TaskService.createTask({
      title,
      description,
      dueDate,
      priority,
      assignedToId,
      creatorId
    });

    socketManager.notifyTaskCreated(task, (req.user as any).name);

    const response: ApiResponse = {
      success: true,
      message: 'Task created successfully',
      data: task
    };

    res.status(201).json(response);
  });

  static updateTask = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) throw new Error('Task ID is required');

    const updates = req.body;
    const userId = (req.user as any)._id.toString();

    const oldTask = await TaskService.getTaskById(id!);

    const task = await TaskService.updateTask(id!, updates, userId);

    const changes: string[] = [];
    if (updates.title) changes.push('title');
    if (updates.description) changes.push('description');
    if (updates.dueDate) changes.push('due date');

    if (updates.status && oldTask.status !== updates.status) {
      changes.push('status');
      socketManager.notifyTaskStatusChanged(
        task,
        (req.user as any).name,
        oldTask.status,
        updates.status
      );
    }

    if (updates.priority && oldTask.priority !== updates.priority) {
      changes.push('priority');
      socketManager.notifyTaskPriorityChanged(
        task,
        (req.user as any).name,
        oldTask.priority,
        updates.priority
      );
    }

    if (updates.assignedToId && (oldTask.assignedToId as any).toString() !== updates.assignedToId) {
      changes.push('assignee');
      socketManager.notifyTaskReassigned(
        task,
        (req.user as any).name,
        (oldTask.assignedToId as any).toString(),
        updates.assignedToId
      );
    } else if (changes.length > 0) {
      socketManager.notifyTaskUpdated(task, (req.user as any).name, changes);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Task updated successfully',
      data: task
    };

    res.status(200).json(response);
  });

  static deleteTask = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) throw new Error('Task ID is required');

    const userId = (req.user as any)._id.toString();
    const task = await TaskService.getTaskById(id!);

    await TaskService.deleteTask(id!, userId);

    socketManager.notifyTaskDeleted(
      (task._id as any).toString(),
      task.title,
      (task.creatorId as any)._id?.toString() || (task.creatorId as any).toString(),
      (task.assignedToId as any)._id?.toString() || (task.assignedToId as any).toString(),
      (req.user as any).name
    );

    const response: ApiResponse = {
      success: true,
      message: 'Task deleted successfully'
    };

    res.status(200).json(response);
  });

  static getTasks = asyncHandler(async (req: Request, res: Response) => {
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

    if (status && Object.values(TaskStatus).includes(status as TaskStatus)) {
      filters.status = status as TaskStatus;
    }

    if (priority && Object.values(TaskPriority).includes(priority as TaskPriority)) {
      filters.priority = priority as TaskPriority;
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

  static getTaskById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) throw new Error('Task ID is required');

    const task = await TaskService.getTaskById(id!);

    const response: ApiResponse = {
      success: true,
      message: 'Task retrieved successfully',
      data: task
    };

    res.status(200).json(response);
  });

  static getTaskStatistics = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.query;
    
    const targetUserId = (userId as string) || (req.user as any)._id.toString();
    
    const stats = await TaskService.getTaskStatistics(targetUserId);

    const response: ApiResponse = {
      success: true,
      message: 'Task statistics retrieved successfully',
      data: stats
    };

    res.status(200).json(response);
  });

  static getUserTasks = asyncHandler(async (req: Request, res: Response) => {
    const { userId, type = 'all' } = req.query;
    const currentUserId = (req.user as any)._id.toString();
    
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

  static getMyTasks = asyncHandler(async (req: Request, res: Response) => {
    const { type = 'all' } = req.query;
    const currentUserId = (req.user as any)._id.toString();
    
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
  });

  static getOverdueTasks = asyncHandler(async (req: Request, res: Response) => {
    const currentUserId = (req.user as any)._id.toString();
    
    const result = await TaskService.getTasks({
      filters: { overdue: true },
      sortBy: 'dueDate',
      sortOrder: 'asc',
      limit: 100
    });

    const userOverdueTasks = result.tasks.filter((task: any) => 
      (task.creatorId as any)._id.toString() === currentUserId || 
      (task.assignedToId as any)._id.toString() === currentUserId
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
  });
}
