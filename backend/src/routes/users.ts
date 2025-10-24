import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { 
  validateQuery, 
  validateParams, 
  searchUsersSchema, 
  getUserByIdSchema 
} from '../utils/validation';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Get all users (for task assignment dropdown)
router.get('/', UserController.getAllUsers);

// Search users with validation
router.get('/search', validateQuery(searchUsersSchema), UserController.searchUsers);

// Get current user's statistics
router.get('/me/stats', UserController.getCurrentUserStats);

// Get user by ID with validation
router.get('/:id', validateParams(getUserByIdSchema), UserController.getUserById);

// Get user statistics with validation
router.get('/:id/stats', validateParams(getUserByIdSchema), UserController.getUserStats);

// Delete user account (self-deletion only) with validation
router.delete('/:id', validateParams(getUserByIdSchema), UserController.deleteUser);

export default router;
