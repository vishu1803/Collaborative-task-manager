'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types';
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from '@/hooks/useTasks';
import { useAuth } from './AuthContext';
import { TaskSortField, TaskFilters as ApiTaskFilters } from '@/types/api';

interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  creatorId?: string;
  overdue?: boolean;
  page: number;
  limit: number;
  sortBy: TaskSortField;
  sortOrder: 'asc' | 'desc';
}

interface CreateTaskData {
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  assignedToId: string;
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedToId?: string;
}

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTasks: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  createTask: (taskData: CreateTaskData) => Promise<Task>;
  updateTask: (id: string, updates: UpdateTaskData) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  setFilters: (filters: Partial<TaskFilters>) => void;
  setPage: (page: number) => void;
  refreshTasks: () => void;
  fetchTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: React.ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const { isAuthenticated: _isAuthenticated } = useAuth();

  const [filters, setFiltersState] = useState<TaskFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

 // ✅ Proper normalization and typing
const normalizedFilters: ApiTaskFilters = {
  ...filters,
  ...(filters.status && { status: filters.status }),
  ...(filters.priority && { priority: filters.priority }),
  ...(filters.assignedToId && { assignedToId: filters.assignedToId }),
  ...(filters.creatorId && { creatorId: filters.creatorId }),
  ...(filters.overdue !== undefined && { overdue: filters.overdue }),
  sortBy: (filters.sortBy as TaskSortField) || 'createdAt',
  sortOrder: filters.sortOrder || 'asc',
};


  const { tasks, pagination, loading, error, refresh } = useTasks(normalizedFilters);
  const { trigger: createTaskMutation, isMutating: isCreating } = useCreateTask();
  const { trigger: updateTaskMutation, isMutating: isUpdating } = useUpdateTask();
  const { trigger: deleteTaskMutation, isMutating: isDeleting } = useDeleteTask();

  const setFilters = useCallback((newFilters: Partial<TaskFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  }, []);

  const setPage = useCallback(
    (page: number) => {
      setFilters({ page });
    },
    [setFilters]
  );

  const createTask = useCallback(
    async (taskData: CreateTaskData): Promise<Task> => {
      const result = await createTaskMutation(taskData);
      return result;
    },
    [createTaskMutation]
  );

  const updateTask = useCallback(
    async (id: string, updates: UpdateTaskData): Promise<Task> => {
      const result = await updateTaskMutation({ id, data: updates });
      return result;
    },
    [updateTaskMutation]
  );

  const deleteTask = useCallback(
    async (id: string): Promise<void> => {
      await deleteTaskMutation(id);
    },
    [deleteTaskMutation]
  );

  const refreshTasks = useCallback(() => {
    refresh();
  }, [refresh]);

  const fetchTasks = useCallback(async () => {
    refresh();
  }, [refresh]);

  const combinedLoading = loading || isCreating || isUpdating || isDeleting;

  const value: TaskContextType = {
    tasks,
    loading: combinedLoading,
    error,
    filters,
    pagination,
    createTask,
    updateTask,
    deleteTask,
    setFilters,
    setPage,
    refreshTasks,
    fetchTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}

export function useTaskContext() {
  return useTask();
}
