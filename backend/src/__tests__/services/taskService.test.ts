import { TaskService } from '../../services/taskService';
import { TaskStatus, TaskPriority } from '../../types';
import { TestDataFactory } from '../utils/testHelpers';

describe('TaskService', () => {
  let creator: any;
  let assignee: any;

  beforeEach(async () => {
    creator = await TestDataFactory.createTestUser({ 
      name: 'Creator', 
      email: 'creator@example.com' 
    });
    assignee = await TestDataFactory.createTestUser({ 
      name: 'Assignee', 
      email: 'assignee@example.com' 
    });
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test description',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        priority: TaskPriority.HIGH,
        assignedToId: assignee._id.toString(),
        creatorId: creator._id.toString()
      };

      const result = await TaskService.createTask(taskData);

      expect(result).toBeDefined();
      expect(result.title).toBe(taskData.title);
      expect(result.description).toBe(taskData.description);
      expect(result.priority).toBe(taskData.priority);
      expect(result.status).toBe(TaskStatus.TODO);
      expect(result.creatorId).toBeDefined();
      expect(result.assignedToId).toBeDefined();
    });

    it('should throw error when assigned user does not exist', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test description',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        priority: TaskPriority.HIGH,
        assignedToId: '507f1f77bcf86cd799439011', // Non-existent ID
        creatorId: creator._id.toString()
      };

      await expect(
        TaskService.createTask(taskData)
      ).rejects.toThrow('Assigned user not found');
    });
  });

  describe('getTasks', () => {
    beforeEach(async () => {
      // Create test tasks
      await TestDataFactory.createTestTask(creator._id, assignee._id, {
        title: 'Task 1',
        priority: TaskPriority.HIGH,
        status: TaskStatus.TODO
      });
      await TestDataFactory.createTestTask(creator._id, assignee._id, {
        title: 'Task 2',
        priority: TaskPriority.LOW,
        status: TaskStatus.COMPLETED
      });
      await TestDataFactory.createTestTask(creator._id, assignee._id, {
        title: 'Task 3',
        priority: TaskPriority.URGENT,
        status: TaskStatus.IN_PROGRESS
      });
    });

    it('should return all tasks with pagination', async () => {
      const result = await TaskService.getTasks({
        page: 1,
        limit: 10
      });

      expect(result).toBeDefined();
      expect(result.tasks).toHaveLength(3);
      expect(result.pagination.totalTasks).toBe(3);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalPages).toBe(1);
    });

    it('should filter tasks by status', async () => {
      const result = await TaskService.getTasks({
        page: 1,
        limit: 10,
        filters: { status: TaskStatus.COMPLETED }
      });

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks![0].status).toBe(TaskStatus.COMPLETED);
    });

    it('should filter tasks by priority', async () => {
      const result = await TaskService.getTasks({
        page: 1,
        limit: 10,
        filters: { priority: TaskPriority.URGENT }
      });

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks![0].priority).toBe(TaskPriority.URGENT);
    });

    it('should paginate results correctly', async () => {
      const result = await TaskService.getTasks({
        page: 1,
        limit: 2
      });

      expect(result.tasks).toHaveLength(2);
      expect(result.pagination.totalTasks).toBe(3);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrev).toBe(false);
    });
  });

  describe('updateTask', () => {
    let task: any;

    beforeEach(async () => {
      task = await TestDataFactory.createTestTask(creator._id, assignee._id);
    });

    it('should update task successfully by creator', async () => {
      const updates = {
        title: 'Updated Title',
        status: TaskStatus.IN_PROGRESS
      };

      const result = await TaskService.updateTask(
        task._id.toString(),
        updates,
        creator._id.toString()
      );

      expect(result.title).toBe(updates.title);
      expect(result.status).toBe(updates.status);
    });

    it('should update task successfully by assignee', async () => {
      const updates = {
        status: TaskStatus.COMPLETED
      };

      const result = await TaskService.updateTask(
        task._id.toString(),
        updates,
        assignee._id.toString()
      );

      expect(result.status).toBe(updates.status);
    });

    it('should throw error when user has no permission', async () => {
      const otherUser = await TestDataFactory.createTestUser({ 
        email: 'other@example.com' 
      });

      const updates = {
        title: 'Unauthorized Update'
      };

      await expect(
  TaskService.updateTask(
    task._id.toString(),
    updates,
    (otherUser._id as any).toString()
  )
).rejects.toThrow('You do not have permission to update this task');

    });

    it('should throw error for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      await expect(
        TaskService.updateTask(fakeId, { title: 'Update' }, creator._id.toString())
      ).rejects.toThrow('Task not found');
    });
  });

  describe('deleteTask', () => {
    let task: any;

    beforeEach(async () => {
      task = await TestDataFactory.createTestTask(creator._id, assignee._id);
    });

    it('should delete task successfully by creator', async () => {
      await expect(
        TaskService.deleteTask(task._id.toString(), creator._id.toString())
      ).resolves.not.toThrow();
    });

    it('should throw error when non-creator tries to delete', async () => {
      await expect(
        TaskService.deleteTask(task._id.toString(), assignee._id.toString())
      ).rejects.toThrow('Only the task creator can delete this task');
    });

    it('should throw error for non-existent task', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      await expect(
        TaskService.deleteTask(fakeId, creator._id.toString())
      ).rejects.toThrow('Task not found');
    });
  });

  describe('getTaskStatistics', () => {
    beforeEach(async () => {
      // Create tasks with different statuses
      await TestDataFactory.createTestTask(creator._id, assignee._id, {
        status: TaskStatus.TODO
      });
      await TestDataFactory.createTestTask(creator._id, assignee._id, {
        status: TaskStatus.IN_PROGRESS
      });
      await TestDataFactory.createTestTask(creator._id, assignee._id, {
        status: TaskStatus.COMPLETED
      });
      await TestDataFactory.createTestTask(creator._id, assignee._id, {
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday (overdue)
        status: TaskStatus.TODO
      });
    });

    it('should return correct task statistics', async () => {
      const stats = await TaskService.getTaskStatistics();

      expect(stats).toBeDefined();
      expect(stats.total).toBe(4);
      expect(stats.byStatus.todo).toBe(2);
      expect(stats.byStatus.inProgress).toBe(1);
      expect(stats.byStatus.completed).toBe(1);
      expect(stats.overdue).toBe(1);
      expect(stats.completionRate).toBe(25); // 1/4 * 100
    });

    it('should return statistics for specific user', async () => {
      const stats = await TaskService.getTaskStatistics(assignee._id.toString());

      expect(stats).toBeDefined();
      expect(stats.total).toBe(4); // All tasks are assigned to this user
    });
  });
});
