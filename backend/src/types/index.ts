import { User, Task, Priority, Status } from '@prisma/client';

// Re-export Prisma types as both types and values
export { User, Task, Priority, Status } from '@prisma/client';

// User types - extending Prisma User type


// User types - extending Prisma User type
export interface IUser extends User {
  // Prisma User already has: id, name, email, password, createdAt, updatedAt
  // Add any custom methods or computed properties here if needed
}

// Task types - extending Prisma Task type
export interface ITask extends Task {
  // Prisma Task already has: id, title, description, dueDate, priority, status, 
  // creatorId, assignedToId, createdAt, updatedAt
  // Add any custom methods or computed properties here if needed
}

// Use Prisma enums instead of custom enums
export const TaskStatus = Status;
export const TaskPriority = Priority;

// Type aliases for backward compatibility
export type TaskStatusType = Status;
export type TaskPriorityType = Priority;

// Enum values for easy access in frontend/validation
export const TASK_STATUS_VALUES = Object.values(Status);
export const TASK_PRIORITY_VALUES = Object.values(Priority);

// Task with related user data (for API responses)
export interface TaskWithUsers extends Task {
  creator: {
    id: string;
    name: string;
    email: string;
  };
  assignedTo: {
    id: string;
    name: string;
    email: string;
  };
}

// User with task counts (for statistics)
export interface UserWithStats extends User {
  statistics: {
    totalCreated: number;
    totalAssigned: number;
    completedTasks: number;
    overdueTasks: number;
    completionRate: number;
  };
}

// Auth related types
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Pagination types
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}

// Task filter types
export interface TaskFilters {
  status?: Status;
  priority?: Priority;
  assignedToId?: string;
  creatorId?: string;
  overdue?: boolean;
}

export interface TaskQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: TaskFilters;
}

// Task statistics type
export interface TaskStatistics {
  total: number;
  byStatus: {
    todo: number;
    inProgress: number;
    review: number;
    completed: number;
  };
  overdue: number;
  completionRate: number;
  priorityCounts: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

// Request/Response types for controllers
export interface CreateTaskRequest {
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  assignedToId: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: Priority;
  status?: Status;
  assignedToId?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

// Socket.io event types (for real-time features)
export interface SocketEventData {
  userId: string;
  taskId?: string;
  action: 'task_created' | 'task_updated' | 'task_deleted' | 'user_connected' | 'user_disconnected';
  data?: any;
}

// Express Request extension (for authenticated routes)
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
      };
    }
  }
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface AppErrorType {
  message: string;
  statusCode: number;
  isOperational?: boolean;
}
