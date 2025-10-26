// Import enums from index.ts to ensure consistency
import { TaskStatus, TaskPriority } from './index';

// Base API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Pagination Types
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

// Query Parameters Types
export interface TaskQueryParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  creatorId?: string;
  overdue?: boolean;
  sortBy?: TaskSortField;
  sortOrder?: SortOrder;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  includeMe?: boolean;
}

// Sort Types
export type TaskSortField = 'createdAt' | 'updatedAt' | 'dueDate' | 'title' | 'priority' | 'status';
export type SortOrder = 'asc' | 'desc';

// Filter Types
export interface TaskFilters extends TaskQueryParams {
  page: number;
  limit: number;
  sortBy: TaskSortField;
  sortOrder: SortOrder;
}
