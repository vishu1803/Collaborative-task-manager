import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import { logger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalLimiter, securityHeaders } from './middleware/security';
import userRoutes from './routes/users';
import taskRoutes from './routes/tasks';
import authRoutes from './routes/auth';

const app = express();

// Trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeaders);
app.use(generalLimiter);

/* ==================== CORS Configuration ==================== */
const allowedOrigins = [
  'http://localhost:3000',
  'https://collaborative-task-manager-fc26-dfdd13at5.vercel.app',
  'https://collaborative-task-manager-fc26.vercel.app', // fallback older domain
];


const corsOptions = {
  origin: (origin: string | undefined, callback: any) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
};

app.use(cors(corsOptions));

console.log('✅ CORS Allowed Origins:', allowedOrigins);
/* ========================================================== */

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
app.use(logger);

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
      version: process.env.npm_package_version || '1.0.0',
    },
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Base routes for api info
app.get('/api', (_req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 Collaborative Task Manager API is running',
    endpoints: [
      '/api/auth/register',
      '/api/auth/login',
      '/api/tasks',
      '/api/users'
    ]
  });
});

// Handle 404 for API routes
app.use('/api', (_req, res) => {
  return notFoundHandler(_req, res);
});

// General 404 handler (matches all unmatched routes)
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    data: {
      availableEndpoints: [
        'GET /health',
        'POST /api/auth/register',
        'POST /api/auth/login',
        'GET /api/auth/profile',
        'PUT /api/auth/profile',
        'GET /api/users',
        'GET /api/users/search?q=searchTerm',
        'GET /api/users/me/stats',
        'GET /api/users/:id',
        'GET /api/users/:id/stats',
        'DELETE /api/users/:id',
        'POST /api/tasks',
        'GET /api/tasks',
        'GET /api/tasks/statistics',
        'GET /api/tasks/overdue',
        'GET /api/tasks/my-tasks',
        'GET /api/tasks/user-tasks',
        'GET /api/tasks/:id',
        'PUT /api/tasks/:id',
        'DELETE /api/tasks/:id',
      ],
    },
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
