import { Task, User, TaskStatus, TaskPriority } from '@/types';

// Type guard functions
export function isTask(obj: unknown): obj is Task {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    'description' in obj &&
    'dueDate' in obj &&
    'priority' in obj &&
    'status' in obj &&
    'creatorId' in obj &&
    'assignedToId' in obj &&
    'createdAt' in obj &&
    'updatedAt' in obj
  );
}

export function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'email' in obj &&
    'createdAt' in obj &&
    'updatedAt' in obj
  );
}

export function isTaskStatus(value: unknown): value is TaskStatus {
  return Object.values(TaskStatus).includes(value as TaskStatus);
}

export function isTaskPriority(value: unknown): value is TaskPriority {
  return Object.values(TaskPriority).includes(value as TaskPriority);
}

// Validation functions
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateObjectId(id: string): boolean {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
}

export function validateDateString(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date > new Date();
}

// Runtime type checking
export function assertIsTask(obj: unknown): asserts obj is Task {
  if (!isTask(obj)) {
    throw new Error('Object is not a valid Task');
  }
}

export function assertIsUser(obj: unknown): asserts obj is User {
  if (!isUser(obj)) {
    throw new Error('Object is not a valid User');
  }
}
