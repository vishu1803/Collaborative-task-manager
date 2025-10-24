import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/collaborative-task-manager',
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  socketCorsOrigin: process.env.SOCKET_CORS_ORIGIN || 'http://localhost:3000',
};

// Validate required environment variables
if (!process.env.JWT_SECRET && config.nodeEnv === 'production') {
  throw new Error('JWT_SECRET is required in production');
}

if (!process.env.MONGODB_URI && config.nodeEnv === 'production') {
  throw new Error('MONGODB_URI is required in production');
}
