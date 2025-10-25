'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '@/types';
import { taskAPI } from '@/lib/api';
import { useAuth } from './AuthContext';

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
  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (taskData: CreateTaskData) => Promise<Task>;
  updateTask: (id: string, updates: UpdateTaskData) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  setFilters: (filters: Partial<TaskFilters>) => void;
  setPage: (page: number) => void;
  refreshTasks: () => Promise<void>;
}

interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedToId?: string;
  creatorId?: string;
  overdue?: boolean;
  page: number;
  limit: number;
  sortBy: string;
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

const TaskContext = createContext<TaskContextType | undefined>(undefined);

interface TaskProviderProps {
  children: React.ReactNode;
}

export function TaskProvider({ children }: TaskProviderProps) {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<TaskFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTasks: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Fetch tasks when filters change or user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated, filters]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await taskAPI.getTasks(filters);
      
      if (response.success && response.data) {
        setTasks(response.data.tasks);
        setPagination(response.data.pagination);
      } else {
        throw new Error(response.message || 'Failed to fetch tasks');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: CreateTaskData): Promise<Task> => {
    try {
      const response = await taskAPI.createTask(taskData);
      
      if (response.success && response.data) {
        // Add new task to the beginning of the list
        setTasks(prev => [response.data!, ...prev]);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create task');
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to create task';
      setError(error);
      throw new Error(error);
    }
  };

  const updateTask = async (id: string, updates: UpdateTaskData): Promise<Task> => {
    try {
      const response = await taskAPI.updateTask(id, updates);
      
      if (response.success && response.data) {
        // Update task in the list
        setTasks(prev => 
          prev.map(task => 
            task._id === id ? response.data! : task
          )
        );
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update task');
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update task';
      setError(error);
      throw new Error(error);
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    try {
      const response = await taskAPI.deleteTask(id);
      
      if (response.success) {
        // Remove task from the list
        setTasks(prev => prev.filter(task => task._id !== id));
      } else {
        throw new Error(response.message || 'Failed to delete task');
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to delete task';
      setError(error);
      throw new Error(error);
    }
  };

  const setFilters = (newFilters: Partial<TaskFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
      // Reset to first page when filters change
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  };

  const setPage = (page: number) => {
    setFilters({ page });
  };

  const refreshTasks = async () => {
    await fetchTasks();
  };

  const value: TaskContextType = {
    tasks,
    loading,
    error,
    filters,
    pagination,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    setFilters,
    setPage,
    refreshTasks,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}
