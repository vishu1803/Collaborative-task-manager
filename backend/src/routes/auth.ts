import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validate, registerSchema, loginSchema, updateProfileSchema } from '../utils/validation';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), AuthController.register);
router.post('/login', validate(loginSchema), AuthController.login);

// Protected routes - require authentication
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, validate(updateProfileSchema), AuthController.updateProfile);

// Additional auth routes
//router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.getProfile); // Alias for profile

export default router;
