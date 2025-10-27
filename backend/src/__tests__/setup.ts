import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// In-memory MongoDB instance
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to in-memory database
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }

  console.log('🧪 Test database connected');
});

afterAll(async () => {
  // Clean up
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();

  console.log('🧪 Test database disconnected');
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    if (collection) {
      await collection.deleteMany({});
    }
  }
});

// Mock console methods to reduce noise during testing
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test environment
process.env.NODE_ENV = 'test';
