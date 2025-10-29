import * as dotenv from 'dotenv';
import * as path from 'path';

// Load the correct .env file depending on environment
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env';

dotenv.config({
  path: path.resolve(process.cwd(), envFile)
});

// Helper to ensure required environment variables exist
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
  return value;
}

// Export validated configuration
export const config = {
  /* 🌍 Environment */
  nodeEnv:        process.env.NODE_ENV || 'development',
  isProduction:   process.env.NODE_ENV === 'production',
  isDevelopment:  process.env.NODE_ENV === 'development',
  isTest:         process.env.NODE_ENV === 'test',

  /* 🖥️ Server */
  port:           parseInt(process.env.PORT || '5000', 10),
  host:           process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost'),

  /* 🗄️ Database - FIXED: Changed from mongoUri to databaseUrl */
  databaseUrl:    requireEnv('DATABASE_URL'),

  /* 🔐 JWT */
  jwtSecret:      requireEnv('JWT_SECRET'),
  jwtExpiresIn:   process.env.JWT_EXPIRES_IN || '24h',

  /* 🌐 CORS */
  frontendUrl:    requireEnv('FRONTEND_URL'),
  socketCorsOrigin: process.env.SOCKET_CORS_ORIGIN || process.env.FRONTEND_URL,

  /* 🛡️ Security */
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  rateLimitWindow:  parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10),
  rateLimitMax:     parseInt(process.env.RATE_LIMIT_MAX || '100', 10),

  /* ✅ Validation function */
  validate() {
    if (this.isProduction) {
      // Enforce stronger requirements in production
      if (this.jwtSecret.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long in production');
      }

      // FIXED: Now using this.databaseUrl instead of this.databaseUrl
      if (!this.databaseUrl.includes('postgresql://')) {
        console.warn('⚠️  DATABASE_URL should be a PostgreSQL connection string');
      }
    }

    console.log('═══════════════════════════════════════');
    console.log(`🌍 Environment:         ${this.nodeEnv}`);
    console.log(`🚀 Server Host:         ${this.host}`);
    console.log(`🔌 Server Port:         ${this.port}`);
    console.log(`🔒 CORS Allowed Origin: ${this.frontendUrl}`);
    console.log(`🗄️ Database:           PostgreSQL`);
    console.log('═══════════════════════════════════════');
  }
};

// Validate configuration immediately when imported
config.validate();
