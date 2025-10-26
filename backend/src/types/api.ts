import { Request, Response } from 'express';
import { IUser } from './index';

// Extend Express Request with user
export interface AuthenticatedRequest extends Request {
  user: IUser;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Controller Types
export type ControllerFunction<_T = any> = (
  req: AuthenticatedRequest,
  res: Response
) => Promise<void>;

export type PublicControllerFunction<_T = any> = (
  req: Request,
  res: Response
) => Promise<void>;

// Service Response Types
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Pagination Types
export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  items: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Query Filter Types
export interface TaskFilters {
  status?: string;
  priority?: string;
  assignedToId?: string;
  creatorId?: string;
  overdue?: boolean;
}

// Database Query Types
export interface DatabaseQuery {
  filter: Record<string, any>;
  sort: Record<string, 1 | -1>;
  skip: number;
  limit: number;
}
