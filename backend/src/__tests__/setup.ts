import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';


// Test database configuration
const DATABASE_URL = 'file:./test.db';

// Create Prisma client for testing
export const prismaTest = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
});

// Test database setup
beforeAll(async () => {
  console.log('🧪 Setting up test database...');
  
  // Set environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = DATABASE_URL;
  
  try {
    // Push schema to test database (creates tables)
    execSync('npx prisma db push --force-reset', {
      cwd: process.cwd(),
      stdio: 'pipe',
    });
    
    // Connect to test database
    await prismaTest.$connect();
    
    console.log('✅ Test database connected and schema applied');
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    throw error;
  }
});

// Clean up after all tests
afterAll(async () => {
  console.log('🧪 Cleaning up test database...');
  
  try {
    // Disconnect from test database
    await prismaTest.$disconnect();
    
    // Clean up test database file
    execSync('rm -f prisma/test.db prisma/test.db-journal', {
      cwd: process.cwd(),
      stdio: 'ignore',
    });
    
    console.log('✅ Test database cleaned up');
  } catch (error) {
    console.error('❌ Test cleanup failed:', error);
  }
});

// Clean database before each test
beforeEach(async () => {
  try {
    // Delete all data in reverse order to handle foreign keys
    await prismaTest.task.deleteMany();
    await prismaTest.user.deleteMany();
  } catch (error) {
    console.error('❌ Test data cleanup failed:', error);
  }
});

// Alternative: Clean database after each test
afterEach(async () => {
  try {
    // Optional: additional cleanup if needed
    await prismaTest.task.deleteMany();
    await prismaTest.user.deleteMany();
  } catch (error) {
    // Ignore cleanup errors
  }
});

// Mock console methods to reduce noise during testing
const originalConsole = global.console;

global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: originalConsole.error, // Keep error logs for debugging
};

// Reset console after tests (optional)
afterAll(() => {
  global.console = originalConsole;
});

// Mock JWT for testing
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock-jwt-token'),
  verify: jest.fn(() => ({
    userId: 'test-user-id',
    email: 'test@example.com'
  })),
  decode: jest.fn(() => ({
    userId: 'test-user-id',
    email: 'test@example.com'
  }))
}));

// Mock bcrypt for faster tests
jest.mock('bcryptjs', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password')),
  compare: jest.fn(() => Promise.resolve(true)),
  genSalt: jest.fn(() => Promise.resolve('salt')),
}));

// Test utilities
export const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed-password',
    ...overrides
  };
  
  return await prismaTest.user.create({
    data: defaultUser
  });
};

export const createTestTask = async (creatorId: string, assignedToId: string, overrides = {}) => {
  const defaultTask = {
    title: 'Test Task',
    description: 'Test task description',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    priority: 'MEDIUM' as const,
    status: 'TODO' as const,
    creatorId,
    assignedToId,
    ...overrides
  };
  
  return await prismaTest.task.create({
    data: defaultTask
  });
};

// Auth helpers for tests
export const createAuthenticatedRequest = (userId: string, email: string) => {
  return {
    user: {
      userId,
      email
    }
  };
};

// Database transaction helper for complex tests
export const withTransaction = async (callback: (tx: PrismaClient) => Promise<void>) => {
  await prismaTest.$transaction(async (tx) => {
    await callback(tx as PrismaClient);
  });
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = DATABASE_URL;
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes';
process.env.BCRYPT_SALT_ROUNDS = '4'; // Lower rounds for faster tests

console.log('🧪 Test environment configured');
