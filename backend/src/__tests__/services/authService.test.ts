import mongoose from 'mongoose';
import { AuthService } from '../../services/authService';
import { User } from '../../models/User';
import { TestDataFactory } from '../utils/testHelpers';

describe('AuthService', () => {
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const result = await AuthService.register(userData.name, userData.email, userData.password);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.name).toBe(userData.name);
      expect(result.user.email).toBe(userData.email);
      expect(result.user.password).toBeUndefined(); // Should not be returned
    });

    it('should throw error when email already exists', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      await TestDataFactory.createTestUser(userData);

      await expect(
        AuthService.register(userData.name, userData.email, userData.password)
      ).rejects.toThrow('User with this email already exists');
    });

    it('should hash password before saving', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      await AuthService.register(userData.name, userData.email, userData.password);

      const savedUser = await User.findOne({ email: userData.email }).select('+password');
      expect(savedUser?.password).not.toBe(userData.password);
      expect(savedUser?.password).toBeDefined();
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      await TestDataFactory.createTestUser(userData);

      const result = await AuthService.login(userData.email, userData.password);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(userData.email);
    });

    it('should throw error with incorrect email', async () => {
      await expect(
        AuthService.login('nonexistent@example.com', 'password123')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error with incorrect password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      await TestDataFactory.createTestUser(userData);

      await expect(
        AuthService.login(userData.email, 'wrongpassword')
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile by ID', async () => {
      const user = await TestDataFactory.createTestUser();
      const userId = (user._id as mongoose.Types.ObjectId).toString();

      const result = await AuthService.getUserProfile(userId);

      expect(result).toBeDefined();
      expect(result._id.toString()).toBe(userId);
      expect(result.name).toBe(user.name);
      expect(result.email).toBe(user.email);
    });

    it('should throw error for non-existent user ID', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      await expect(
        AuthService.getUserProfile(fakeId)
      ).rejects.toThrow('User not found');
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const user = await TestDataFactory.createTestUser();
      const userId = (user._id as mongoose.Types.ObjectId).toString();

      const updates = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const result = await AuthService.updateUserProfile(userId, updates);

      expect(result).toBeDefined();
      expect(result.name).toBe(updates.name);
      expect(result.email).toBe(updates.email);
    });

    it('should throw error when updating to existing email', async () => {
    await TestDataFactory.createTestUser({ email: 'user1@example.com' });
      const user2 = await TestDataFactory.createTestUser({ email: 'user2@example.com' });

      const user2Id = (user2._id as mongoose.Types.ObjectId).toString();

      await expect(
        AuthService.updateUserProfile(user2Id, { email: 'user1@example.com' })
      ).rejects.toThrow('Email is already taken');
    });
  });
});
