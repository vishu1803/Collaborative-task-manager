import { PrismaClient } from '@prisma/client';

// Check if we have a test database URL
const hasTestDB = process.env.DATABASE_URL && process.env.DATABASE_URL.includes('test');

let prismaTest: PrismaClient;

if (hasTestDB) {
  prismaTest = new PrismaClient();
} else {
  // Mock Prisma if no test DB
  prismaTest = {
    user: {
      create: jest.fn().mockResolvedValue({ id: 'test-id', email: 'test@test.com', name: 'Test User' }),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    task: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
      count: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  } as any;
}

export { prismaTest };

export const createTestUser = async (userData: any = {}) => {
  const defaultData = {
    id: `user-${Date.now()}`,
    email: `test-${Date.now()}@example.com`,
    name: 'Test User',
    password: 'hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const user = { ...defaultData, ...userData };
  
  if (hasTestDB) {
    return await prismaTest.user.create({ data: user });
  } else {
    return user;
  }
};

beforeAll(async () => {
  if (hasTestDB) {
    await prismaTest.$connect();
    console.log('✅ Test database connected');
  } else {
    console.log('⚠️ Using mock database for tests');
  }
});

afterAll(async () => {
  if (hasTestDB) {
    await prismaTest.$disconnect();
  }
});

beforeEach(async () => {
  if (hasTestDB) {
    await prismaTest.task.deleteMany({});
    await prismaTest.user.deleteMany({});
  }
});
