import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/env';
import { logger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalLimiter, securityHeaders } from './middleware/security';
import userRoutes from './routes/users';

// Import routes
import authRoutes from './routes/auth';

const app = express();

// Trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeaders);
app.use(generalLimiter);

// CORS configuration
const corsOptions = {
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
app.use(logger);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    data: {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.nodeEnv,
      version: process.env.npm_package_version || '1.0.0'
    }
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Handle 404 for API routes

app.use('/api', (req, res) => {
  return notFoundHandler(req, res);
});



// General 404 handler (matches all unmatched routes)
app.use((req, res) => {
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
  'DELETE /api/users/:id'
]
    }
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
