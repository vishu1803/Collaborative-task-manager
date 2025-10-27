import { User } from '../../models/User';
import { Task } from '../../models/Task';
import { TaskStatus, TaskPriority } from '../../types';
import { JWTUtils } from '../../utils/jwt';

// Test data factories
export class TestDataFactory {
  static async createTestUser(overrides: Partial<any> = {}) {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      ...overrides
    };
    
    const user = new User(userData);
    await user.save();
    return user;
  }

  static async createTestTask(creatorId: string, assignedToId: string, overrides: Partial<any> = {}) {
    const taskData = {
      title: 'Test Task',
      description: 'Test task description',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      creatorId,
      assignedToId,
      ...overrides
    };
    
    const task = new Task(taskData);
    await task.save();
    return task;
  }

  static generateAuthToken(user: any): string {
    return JWTUtils.generateToken({
      userId: user._id.toString(),
      email: user.email
    });
  }
}

// Test assertions helpers
export class TestAssertions {
  static expectValidUser(user: any) {
    expect(user).toBeDefined();
    expect(user._id).toBeDefined();
    expect(user.name).toBeDefined();
    expect(user.email).toBeDefined();
    expect(user.createdAt).toBeDefined();
    expect(user.updatedAt).toBeDefined();
    expect(user.password).toBeUndefined(); // Should be excluded
  }

  static expectValidTask(task: any) {
    expect(task).toBeDefined();
    expect(task._id).toBeDefined();
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
}
