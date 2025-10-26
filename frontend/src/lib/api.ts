import { 
  ApiResponse, 
  TaskQueryParams
} from '@/types/api';
import { 
  LoginFormData, 
  RegisterFormData, 
  UpdateProfileFormData,
  CreateTaskFormData,
  UpdateTaskFormData 
} from '@/types/forms';
import { Task, User } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Type-safe HTTP client
class TypedApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options,
      body: options.body ?? null,
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = response.status !== 204 ? await response.json() : {} as ApiResponse<T>;
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create typed API client instance
export const api = new TypedApiClient(API_BASE_URL);

// Authentication API
export interface AuthResponse {
  user: User;
  token: string;
}

export const authAPI = {
  register: (credentials: RegisterFormData): Promise<ApiResponse<AuthResponse>> => {
    return api.post<AuthResponse>('/auth/register', credentials);
  },

  login: (credentials: LoginFormData): Promise<ApiResponse<AuthResponse>> => {
    return api.post<AuthResponse>('/auth/login', credentials);
  },

  getProfile: (): Promise<ApiResponse<User>> => {
    return api.get<User>('/auth/profile');
  },

  updateProfile: (data: UpdateProfileFormData): Promise<ApiResponse<User>> => {
    return api.put<User>('/auth/profile', data);
  },
} as const;

// Task API
export interface TasksResponse {
  tasks: Task[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTasks: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface MyTasksResponse {
  tasks: Task[];
  total: number;
  type: string;
}

export const taskAPI = {
  getTasks: (params?: TaskQueryParams): Promise<ApiResponse<TasksResponse>> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    return api.get<TasksResponse>(`/tasks${searchParams.toString() ? `?${searchParams.toString()}` : ''}`);
  },

  getTaskById: (id: string): Promise<ApiResponse<Task>> => {
    return api.get<Task>(`/tasks/${id}`);
  },

  createTask: (taskData: CreateTaskFormData): Promise<ApiResponse<Task>> => {
    return api.post<Task>('/tasks', taskData);
  },

  updateTask: (id: string, updates: UpdateTaskFormData): Promise<ApiResponse<Task>> => {
    return api.put<Task>(`/tasks/${id}`, updates);
  },

  deleteTask: (id: string): Promise<ApiResponse<void>> => {
    return api.delete<void>(`/tasks/${id}`);
  },

  getMyTasks: (type?: 'assigned' | 'created' | 'all'): Promise<ApiResponse<MyTasksResponse>> => {
    return api.get<MyTasksResponse>(`/tasks/my-tasks${type ? `?type=${type}` : ''}`);
  },

  getStats: (): Promise<ApiResponse<TaskStatsResponse>> => {
    return api.get<TaskStatsResponse>('/tasks/stats');
  },
} as const;

// User API
export interface UsersResponse {
  users: Array<{
    _id: string;
    name: string;
    email: string;
  }>;
  total: number;
}

// Task stats response interface
export interface TaskStatsResponse {
  total: number;
  byStatus: {
    todo: number;
    inProgress: number;
    review: number;
    completed: number;
  };
  overdue: number;
  completionRate: number;
  priorityCounts?: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}



export interface UserStatsResponse {
  user: User;
  statistics: {
    totalCreated: number;
    totalAssigned: number;
    completedTasks: number;
    overdueTasks: number;
    completionRate: number;
  };
}

export const userAPI = {
  getUsers: (includeMe?: boolean): Promise<ApiResponse<UsersResponse>> => {
    return api.get<UsersResponse>(`/users${includeMe ? '?includeMe=true' : ''}`);
  },

  searchUsers: (searchTerm: string, includeMe?: boolean): Promise<ApiResponse<UsersResponse & { searchTerm: string }>> => {
    const params = new URLSearchParams({ q: searchTerm });
    if (includeMe) params.append('includeMe', 'true');
    return api.get<UsersResponse & { searchTerm: string }>(`/users/search?${params.toString()}`);
  },

  getMyStats: (): Promise<ApiResponse<UserStatsResponse>> => {
    return api.get<UserStatsResponse>('/users/me/stats');
  },
} as const;

// Health check
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.ok;
  } catch {
    return false;
  }
};
