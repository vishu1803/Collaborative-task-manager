import { z } from 'zod';
import { TaskPriority, TaskStatus } from './index';

// Form Schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(255, 'Email too long'),
  password: z                                          
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')  
    .max(128, 'Password too long'),
});

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')    
      .max(50, 'Name cannot exceed 50 characters')     
      .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address')
      .max(255, 'Email too long'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters')
      .max(128, 'Password too long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')    
      .max(50, 'Name cannot exceed 50 characters')     
      .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
      .optional(),
    email: z
      .string()
      .email('Invalid email address')
      .max(255, 'Email too long')
      .optional(),
  })
  .strict();

export const createTaskSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(100, 'Title cannot exceed 100 characters')  
      .trim(),
    description: z
      .string()
      .min(1, 'Description is required')
      .max(1000, 'Description cannot exceed 1000 characters')
      .trim(),
    dueDate: z
      .string()
      .min(1, 'Due date is required')
      .refine((date) => {
        const selectedDate = new Date(date);
        const now = new Date();
        return selectedDate > now;
      }, 'Due date must be in the future'),
    priority: z.nativeEnum(TaskPriority),
    assignedToId: z
      .string()
      .min(1, 'Please select an assignee')
      .regex(/^c[a-zA-Z0-9]{24}$/, 'Invalid user ID format'), // ✅ Fixed for CUID
  })
  .strict();

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(100, 'Title cannot exceed 100 characters')  
      .trim()
      .optional(),
    description: z
      .string()
      .min(1, 'Description is required')
      .max(1000, 'Description cannot exceed 1000 characters')
      .trim()
      .optional(),
    dueDate: z
      .string()
      .refine((date) => {
        if (!date) return true; // Optional field      
        const selectedDate = new Date(date);
        const now = new Date();
        return selectedDate > now;
      }, 'Due date must be in the future')
      .optional(),
    priority: z.nativeEnum(TaskPriority).optional(),   
    status: z.nativeEnum(TaskStatus).optional(),       
    assignedToId: z
      .string()
      .regex(/^c[a-zA-Z0-9]{24}$/, 'Invalid user ID format') // ✅ Fixed for CUID
      .optional(),
  })
  .strict();

// Inferred Form Types
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;

// Form State Types
export interface FormState<T> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Form Event Types
export type FormSubmitHandler<T> = (data: T) => Promise<void> | void;
export type FormValidationResult<T> = {
  isValid: boolean;
  errors: Partial<Record<keyof T, string>>;
};
