import { Router } from 'express';
import { TaskController } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';
import { 
  validate, 
  validateQuery, 
  validateParams,
  createTaskSchema,
  updateTaskSchema,
  getTasksQuerySchema,
  getTaskByIdSchema,
  getUserTasksQuerySchema,
  getMyTasksQuerySchema
} from '../utils/validation';

const router = Router();

// All task routes require authentication
router.use(authenticate);

// Task statistics
router.get('/statistics', TaskController.getTaskStatistics);

// Get overdue tasks
router.get('/overdue', TaskController.getOverdueTasks);

// Get current user's tasks
router.get('/my-tasks', validateQuery(getMyTasksQuerySchema), TaskController.getMyTasks);

// Get user tasks (by user ID)
router.get('/user-tasks', validateQuery(getUserTasksQuerySchema), TaskController.getUserTasks);

// Create task
router.post('/', validate(createTaskSchema), TaskController.createTask);

// Get all tasks with filtering and pagination
router.get('/', validateQuery(getTasksQuerySchema), TaskController.getTasks);

// Get task by ID
router.get('/:id', validateParams(getTaskByIdSchema), TaskController.getTaskById);

// Update task
router.put('/:id', validateParams(getTaskByIdSchema), validate(updateTaskSchema), TaskController.updateTask);

// Delete task
router.delete('/:id', validateParams(getTaskByIdSchema), TaskController.deleteTask);

export default router;
