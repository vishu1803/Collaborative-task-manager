import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma = globalThis.__prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

export const connectDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 Connecting to PostgreSQL...');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }

    // Test the connection
    await prisma.$connect();
    console.log('✅ PostgreSQL connected successfully');
    
    // Run migrations
    console.log('🔄 Running database migrations...');
    // Migrations will be run automatically with Prisma
    
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  console.log('🔌 PostgreSQL disconnected');
};
