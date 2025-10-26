import useSWR, { SWRResponse } from 'swr';
import useSWRMutation, { SWRMutationResponse } from 'swr/mutation';
import { Task } from '@/types';
import { TaskQueryParams } from '@/types/api';
import { CreateTaskFormData, UpdateTaskFormData } from '@/types/forms';
import { SWR_KEYS, getAuthSWRKey, invalidateTaskCache } from '@/lib/swr';
import { taskAPI, TasksResponse, MyTasksResponse, TaskStatsResponse } from '@/lib/api';

// Strongly typed task hooks
export function useTasks(filters: TaskQueryParams = {}): {
  tasks: Task[];
  pagination: TasksResponse['pagination'];
  loading: boolean;
  error: string | null;
  mutate: SWRResponse<TasksResponse, Error>['mutate'];
  refresh: () => void;
} {
  const key = getAuthSWRKey(SWR_KEYS.TASKS(filters));
  
  const { data, error, isLoading, mutate }: SWRResponse<TasksResponse, Error> = useSWR(
    key,
    null,
    {
      keepPreviousData: true,
      revalidateOnMount: true,
    }
  );

  return {
    tasks: data?.tasks ?? [],
    pagination: data?.pagination ?? {
      currentPage: 1,
      totalPages: 1,
      totalTasks: 0,
      hasNext: false,
      hasPrev: false,
    },
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
    refresh: () => void mutate(),
  };
}

export function useTask(id: string): {
  task: Task | null;
  loading: boolean;
  error: string | null;
  mutate: SWRResponse<Task, Error>['mutate'];
  refresh: () => void;
} {
  const key = getAuthSWRKey(id ? SWR_KEYS.TASK_BY_ID(id) : null);
  
  const { data, error, isLoading, mutate }: SWRResponse<Task, Error> = useSWR(key);

  return {
    task: data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
    refresh: () => void mutate(),
  };
}

export function useMyTasks(type: 'assigned' | 'created' | 'all' = 'all'): {
  tasks: Task[];
  total: number;
  type: string;
  loading: boolean;
  error: string | null;
  mutate: SWRResponse<MyTasksResponse, Error>['mutate'];
  refresh: () => void;
} {
  const key = getAuthSWRKey(SWR_KEYS.MY_TASKS(type));
  
  const { data, error, isLoading, mutate }: SWRResponse<MyTasksResponse, Error> = useSWR(key);

  return {
    tasks: data?.tasks ?? [],
    total: data?.total ?? 0,
    type: data?.type ?? type,
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
    refresh: () => void mutate(),
  };
}

export function useOverdueTasks(): {
  tasks: Task[];
  total: number;
  loading: boolean;
  error: string | null;
  mutate: SWRResponse<{ tasks: Task[]; total: number }, Error>['mutate'];
  refresh: () => void;
} {
  const key = getAuthSWRKey(SWR_KEYS.OVERDUE_TASKS);
  
  const { data, error, isLoading, mutate }: SWRResponse<{ tasks: Task[]; total: number }, Error> = useSWR(key);

  return {
    tasks: data?.tasks ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
    refresh: () => void mutate(),
  };
}

export function useTaskStatistics(userId?: string): {
  stats: TaskStatsResponse;
  loading: boolean;
  error: string | null;
  mutate: SWRResponse<TaskStatsResponse, Error>['mutate'];
  refresh: () => void;
} {
  const key = getAuthSWRKey(SWR_KEYS.TASK_STATISTICS(userId));
  
  const { data, error, isLoading, mutate }: SWRResponse<TaskStatsResponse, Error> = useSWR(key);

  return {
    stats: data ?? {
      total: 0,
      byStatus: { todo: 0, inProgress: 0, review: 0, completed: 0 },
      overdue: 0,
      completionRate: 0,
      priorityCounts: { low: 0, medium: 0, high: 0, urgent: 0 },
    },
    loading: isLoading,
    error: error?.message ?? null,
    mutate,
    refresh: () => void mutate(),
  };
}

// Mutation hooks with strong typing
export function useCreateTask(): SWRMutationResponse<Task, Error, string, CreateTaskFormData> {
  return useSWRMutation(
    'create-task',
    async (_: string, { arg }: { arg: CreateTaskFormData }) => {
      const response = await taskAPI.createTask(arg);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      await invalidateTaskCache();
      return response.data;
    }
  );
}

export function useUpdateTask(): SWRMutationResponse<Task, Error, string, { id: string; data: UpdateTaskFormData }> {
  return useSWRMutation(
    'update-task',
    async (_: string, { arg }: { arg: { id: string; data: UpdateTaskFormData } }) => {
      const response = await taskAPI.updateTask(arg.id, arg.data);
      if (!response.success || !response.data) {
        throw new Error(response.message);
      }
      await invalidateTaskCache();
      return response.data;
    }
  );
}

export function useDeleteTask(): SWRMutationResponse<boolean, Error, string, string> {
  return useSWRMutation(
    'delete-task',
    async (_: string, { arg }: { arg: string }) => {
      const response = await taskAPI.deleteTask(arg);
      if (!response.success) {
        throw new Error(response.message);
      }
      await invalidateTaskCache();
      return true;
    }
  );
}
