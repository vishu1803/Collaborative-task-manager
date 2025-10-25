import { AuthResponse, ApiResponse, LoginCredentials, RegisterCredentials, Task, TaskStatus, TaskPriority } from '@/types';


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// API client class
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
export const api = new ApiClient(API_BASE_URL);

// Auth API functions
export const authAPI = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    return api.post<AuthResponse['data']>('/auth/register', credentials);
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return api.post<AuthResponse['data']>('/auth/login', credentials);
  },

  getProfile: async () => {
    return api.get('/auth/profile');
  },

  updateProfile: async (data: { name?: string; email?: string }) => {
    return api.put('/auth/profile', data);
  },
};

// Check if server is reachable
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    return response.ok;
  } catch {
    return false;
  }
};


// Task API functions
export const taskAPI = {
  // Get all tasks with filters
  getTasks: async (params?: {
    page?: number;
    limit?: number;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedToId?: string;
    creatorId?: string;
    overdue?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }
    return api.get<{
      tasks: Task[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalTasks: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>(`/tasks?${searchParams.toString()}`);
  },

  // Get task by ID
  getTaskById: async (id: string) => {
    return api.get<Task>(`/tasks/${id}`);
  },

  // Create new task
  createTask: async (taskData: {
    title: string;
    description: string;
    dueDate: string;
    priority: TaskPriority;
    assignedToId: string;
  }) => {
    return api.post<Task>('/tasks', taskData);
  },

  // Update task
  updateTask: async (id: string, updates: Partial<{
    title: string;
    description: string;
    dueDate: string;
    priority: TaskPriority;
    status: TaskStatus;
    assignedToId: string;
  }>) => {
    return api.put<Task>(`/tasks/${id}`, updates);
  },

  // Delete task
  deleteTask: async (id: string) => {
    return api.delete(`/tasks/${id}`);
  },

  // Get current user's tasks
  getMyTasks: async (type?: 'assigned' | 'created' | 'all') => {
    const params = type ? `?type=${type}` : '';
    return api.get<{
      tasks: Task[];
      total: number;
      type: string;
    }>(`/tasks/my-tasks${params}`);
  },

  // Get overdue tasks
  getOverdueTasks: async () => {
    return api.get<{
      tasks: Task[];
      total: number;
    }>('/tasks/overdue');
  },

  // Get task statistics
  getTaskStatistics: async (userId?: string) => {
    const params = userId ? `?userId=${userId}` : '';
    return api.get<{
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
    }>(`/tasks/statistics${params}`);
  },
};

// User API functions  
export const userAPI = {
  // Get all users
  getUsers: async (includeMe?: boolean) => {
    const params = includeMe ? '?includeMe=true' : '';
    return api.get<{
      users: Array<{
        _id: string;
        name: string;
        email: string;
      }>;
      total: number;
    }>(`/users${params}`);
  },

  // Search users
  searchUsers: async (searchTerm: string, includeMe?: boolean) => {
    const params = new URLSearchParams({ q: searchTerm });
    if (includeMe) params.append('includeMe', 'true');
    return api.get<{
      users: Array<{
        _id: string;
        name: string;
        email: string;
      }>;
      total: number;
      searchTerm: string;
    }>(`/users/search?${params.toString()}`);
  },

  // Get current user stats
  getMyStats: async () => {
    return api.get('/users/me/stats');
  },
};

