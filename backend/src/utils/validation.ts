import { z, ZodError, ZodIssue } from 'zod';
import { TaskStatus, TaskPriority } from '../types';

// User validation schemas
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password cannot exceed 128 characters')
});

export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .trim(),
  password: z.string()
    .min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim()
    .optional(),
  email: z.string()
    .email('Invalid email format')
    .toLowerCase()
    .trim()
    .optional()
});

// Task validation schemas
export const createTaskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters')
    .trim(),
  description: z.string()
    .min(1, 'Description is required')
    .max(1000, 'Description cannot exceed 1000 characters')
    .trim(),
  dueDate: z.string()
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate > new Date();
    }, 'Due date must be a valid future date'),
  priority: z.nativeEnum(TaskPriority),
  assignedToId: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
});

export const updateTaskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title cannot exceed 100 characters')
    .trim()
    .optional(),
  description: z.string()
    .min(1, 'Description is required')
    .max(1000, 'Description cannot exceed 1000 characters')
    .trim()
    .optional(),
  dueDate: z.string()
    .refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate > new Date();
    }, 'Due date must be a valid future date')
    .optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  assignedToId: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
    .optional()
});

// Validation middleware
export const validate = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: unknown) {

      // Type guard to check if it's a ZodError
      const isZodError = (err: unknown): err is ZodError => {
        return err instanceof ZodError;
      };

      if (isZodError(error)) {
        const response = {
          success: false,
          message: 'Validation failed',
          errors: error.issues.map((err: ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        };
        return res.status(400).json(response);
      }

      next(error);
    }
  };
};

// Add these schemas to the existing validation file
export const searchUsersSchema = z.object({
  q: z.string()
    .min(2, 'Search term must be at least 2 characters')
    .max(50, 'Search term cannot exceed 50 characters')
    .trim(),
  includeMe: z.string().optional()
});

export const getUserByIdSchema = z.object({
  id: z.string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
});

// Validation middleware for query parameters
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.query);
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const response = {
          success: false,
          message: 'Query validation failed',
          errors: error.issues.map((err: ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        };
        return res.status(400).json(response);
      }
      next(error);
    }
  };
};

// Validation middleware for URL parameters
export const validateParams = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.params);
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const response = {
          success: false,
          message: 'Parameter validation failed',
          errors: error.issues.map((err: ZodIssue) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        };
        return res.status(400).json(response);
      }
      next(error);
    }
  };
};
