import { prismaTest } from '../setup';
import { Priority, Status } from '@prisma/client';
import { JWTUtils } from '../../utils/jwt';
import * as bcrypt from 'bcryptjs';

// Test data factories
export class TestDataFactory {
  static async createTestUser(overrides: Partial<any> = {}) {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', 10), // Hash password for Prisma
      ...overrides
    };
    
    const user = await prismaTest.user.create({
      data: userData
    });
    
    return user;
  }

  static async createTestTask(creatorId: string, assignedToId: string, overrides: Partial<any> = {}) {
    const taskData = {
      title: 'Test Task',
      description: 'Test task description',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      priority: Priority.MEDIUM,
      status: Status.TODO,
      creatorId,
      assignedToId,
      ...overrides
    };
    
    const task = await prismaTest.task.create({
      data: taskData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });
    
    return task;
  }

  static async createMultipleUsers(count: number = 3) {
    const users = [];
    
    for (let i = 1; i <= count; i++) {
      const user = await this.createTestUser({
        name: `Test User ${i}`,
        email: `test${i}@example.com`,
      });
      users.push(user);
    }
    
    return users;
  }

  static async createMultipleTasks(creatorId: string, assignedToId: string, count: number = 5) {
    const tasks = [];
    const priorities = Object.values(Priority);
    const statuses = Object.values(Status);
    
    for (let i = 1; i <= count; i++) {
      const task = await this.createTestTask(creatorId, assignedToId, {
        title: `Test Task ${i}`,
        description: `Test task ${i} description`,
        priority: priorities[i % priorities.length],
        status: statuses[i % statuses.length],
      });
      tasks.push(task);
    }
    
    return tasks;
  }

  static generateAuthToken(user: any): string {
    return JWTUtils.generateToken({
      userId: user.id, // Use Prisma's string ID
      email: user.email
    });
  }

  static async createUserWithToken(overrides: Partial<any> = {}) {
    const user = await this.createTestUser(overrides);
    const token = this.generateAuthToken(user);
    
    return { user, token };
  }
}

// Test assertions helpers
export class TestAssertions {
  static expectValidUser(user: any) {
    expect(user).toBeDefined();
    expect(user.id).toBeDefined(); // Prisma uses 'id' not '_id'
    expect(user.name).toBeDefined();
    expect(user.email).toBeDefined();
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
    expect(user.password).toBeUndefined(); // Should be excluded in API responses
  }

  static expectValidTask(task: any) {
    expect(task).toBeDefined();
    expect(task.id).toBeDefined(); // Prisma uses 'id' not '_id'
    expect(task.title).toBeDefined();
    expect(task.description).toBeDefined();
    expect(task.dueDate).toBeDefined();
    expect(task.priority).toBeDefined();
    expect(task.status).toBeDefined();
    expect(task.creatorId).toBeDefined();
    expect(task.assignedToId).toBeDefined();
    expect(task.createdAt).toBeDefined();
    expect(task.updatedAt).toBeDefined();
  }

  static expectValidTaskWithUsers(task: any) {
    this.expectValidTask(task);
    
    if (task.creator) {
      expect(task.creator.id).toBeDefined();
      expect(task.creator.name).toBeDefined();
      expect(task.creator.email).toBeDefined();
    }
    
    if (task.assignedTo) {
      expect(task.assignedTo.id).toBeDefined();
      expect(task.assignedTo.name).toBeDefined();
      expect(task.assignedTo.email).toBeDefined();
    }
  }

  static expectApiResponse(response: any, expectedStatus: number) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('success');
    expect(response.body).toHaveProperty('message');
  }

  static expectSuccessResponse(response: any, expectedStatus: number = 200) {
    this.expectApiResponse(response, expectedStatus);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  }

  static expectErrorResponse(response: any, expectedStatus: number) {
    this.expectApiResponse(response, expectedStatus);
    expect(response.body.success).toBe(false);
  }

  static expectPaginatedResponse(response: any) {
    this.expectSuccessResponse(response);
    expect(response.body.pagination).toBeDefined();
    expect(response.body.pagination.currentPage).toBeDefined();
    expect(response.body.pagination.totalPages).toBeDefined();
    expect(response.body.pagination.totalTasks || response.body.pagination.totalItems).toBeDefined();
    expect(response.body.pagination.hasNext).toBeDefined();
    expect(response.body.pagination.hasPrev).toBeDefined();
  }

  static expectValidJWT(token: string) {
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  }

  static expectValidAuthResponse(response: any) {
    this.expectSuccessResponse(response, 200);
    expect(response.body.data.user).toBeDefined();
    expect(response.body.data.token).toBeDefined();
    this.expectValidUser(response.body.data.user);
    this.expectValidJWT(response.body.data.token);
  }
}

// Database helpers
export class TestDatabase {
  static async clearAllData() {
    await prismaTest.task.deleteMany();
    await prismaTest.user.deleteMany();
  }

  static async getUserCount() {
    return await prismaTest.user.count();
  }

  static async getTaskCount() {
    return await prismaTest.task.count();
  }

  static async findUserByEmail(email: string) {
    return await prismaTest.user.findUnique({
      where: { email }
    });
  }

  static async findTaskById(id: string) {
    return await prismaTest.task.findUnique({
      where: { id },
      include: {
        creator: true,
        assignedTo: true
      }
    });
  }
}

// Backward compatibility exports
export const TaskStatus = Status;
export const TaskPriority = Priority;
