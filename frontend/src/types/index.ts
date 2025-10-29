// User types
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// Task types
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW', 
  COMPLETED = 'COMPLETED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  creatorId: User;
  assignedToId: User;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Socket types
export interface TaskNotification {
  type: 'created' | 'updated' | 'deleted' | 'assigned' | 'status_changed' | 'priority_changed';
  task: Task;
  message: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
  };
}

// Add to existing types
export interface TaskNotification {
  type: 'created' | 'updated' | 'deleted' | 'assigned' | 'status_changed' | 'priority_changed';
  task: Task;
  message: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
  };
  read?: boolean; // Add read status for UI
}
