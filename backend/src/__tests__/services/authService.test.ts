import { AuthService } from '../../services/authService';
import { prismaTest, createTestUser } from '../setup';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt for consistent testing
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      // Mock bcrypt hash
      mockedBcrypt.hash.mockResolvedValue('hashed-password' as never);

      const result = await AuthService.register(userData.name, userData.email, userData.password);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.name).toBe(userData.name);
      expect(result.user.email).toBe(userData.email);
      // Password field not included in user type
      
      // Verify user was saved to database
      const savedUser = await prismaTest.user.findUnique({
        where: { email: userData.email }
      });
      expect(savedUser).toBeDefined();
      expect(savedUser?.name).toBe(userData.name);
    });

    it('should throw error when email already exists', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      // Create existing user
      await createTestUser(userData);

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

      // Mock bcrypt hash
      mockedBcrypt.hash.mockResolvedValue('hashed-password123' as never);

      await AuthService.register(userData.name, userData.email, userData.password);

      const savedUser = await prismaTest.user.findUnique({
        where: { email: userData.email },
        select: { password: true }
      });

      expect(savedUser?.password).not.toBe(userData.password);
      expect(savedUser?.password).toBe('hashed-password123');
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(userData.password, expect.any(Number));
    });

    it('should validate required fields', async () => {
      await expect(
        AuthService.register('', 'john@example.com', 'password123')
      ).rejects.toThrow();

      await expect(
        AuthService.register('John Doe', '', 'password123')
      ).rejects.toThrow();

      await expect(
        AuthService.register('John Doe', 'john@example.com', '')
      ).rejects.toThrow();
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password'
      };

      // Create test user
      const user = await createTestUser(userData);

      // Mock bcrypt compare
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await AuthService.login(userData.email, 'password123');

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(userData.email);
      expect(result.user.id).toBe(user.id);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', userData.password);
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
        password: 'hashed-password'
      };

      await createTestUser(userData);

      // Mock bcrypt compare to return false
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        AuthService.login(userData.email, 'wrongpassword')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should return user without password field', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password'
      };

      await createTestUser(userData);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await AuthService.login(userData.email, 'password123');

      // Password field not included in user type
      expect(result.user.name).toBe(userData.name);
      expect(result.user.email).toBe(userData.email);
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile by ID', async () => {
      const user = await createTestUser({
        name: 'John Doe',
        email: 'john@example.com'
      });

      const result = await AuthService.getUserProfile(user.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(user.id);
      expect(result.name).toBe(user.name);
      expect(result.email).toBe(user.email);
      // Password field not included in result
    });

    it('should throw error for non-existent user ID', async () => {
      const fakeId = 'clxxxxxxxxxxxxxxxxxxxxxxxx'; // Valid CUID format

      await expect(
        AuthService.getUserProfile(fakeId)
      ).rejects.toThrow('User not found');
    });

    it('should throw error for invalid user ID format', async () => {
      await expect(
        AuthService.getUserProfile('invalid-id')
      ).rejects.toThrow();
    });
  });

  describe('updateUserProfile', () => {
    it('should update user profile successfully', async () => {
      const user = await createTestUser({
        name: 'John Doe',
        email: 'john@example.com'
      });

      const updates = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const result = await AuthService.updateUserProfile(user.id, updates);

      expect(result).toBeDefined();
      expect(result.name).toBe(updates.name);
      expect(result.email).toBe(updates.email);
      expect(result.id).toBe(user.id);

      // Verify update in database
      const updatedUser = await prismaTest.user.findUnique({
        where: { id: user.id }
      });
      expect(updatedUser?.name).toBe(updates.name);
      expect(updatedUser?.email).toBe(updates.email);
    });

    it('should throw error when updating to existing email', async () => {
      const user1 = await createTestUser({ 
        name: 'User 1',
        email: 'user1@example.com' 
      });
      
      const user2 = await createTestUser({ 
        name: 'User 2',
        email: 'user2@example.com' 
      });

      await expect(
    AuthService.updateUserProfile(user2.id, { email: 'user1@example.com' })
  ).rejects.toThrow('Email is already taken');
  
  // Verify user1 still exists with original email
  expect(user1.email).toBe('user1@example.com');
    });

    it('should update only provided fields', async () => {
      const user = await createTestUser({
        name: 'John Doe',
        email: 'john@example.com'
      });

      // Update only name
      const result = await AuthService.updateUserProfile(user.id, { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
      expect(result.email).toBe('john@example.com'); // Should remain unchanged
    });

    it('should throw error for non-existent user', async () => {
      const fakeId = 'clxxxxxxxxxxxxxxxxxxxxxxxx'; // Valid CUID format

      await expect(
        AuthService.updateUserProfile(fakeId, { name: 'New Name' })
      ).rejects.toThrow('User not found');
    });

    it('should not return password in updated user', async () => {
      const user = await createTestUser({
        name: 'John Doe',
        email: 'john@example.com'
      });

      const result = await AuthService.updateUserProfile(user.id, { name: 'Updated Name' });

      // Password field not included in result
      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('validateEmailUnique', () => {
    it('should return true for unique email', async () => {
      const isUnique = await AuthService.validateEmailUnique('unique@example.com');
      expect(isUnique).toBe(true);
    });

    it('should return false for existing email', async () => {
      await createTestUser({ email: 'existing@example.com' });
      
      const isUnique = await AuthService.validateEmailUnique('existing@example.com');
      expect(isUnique).toBe(false);
    });
  });

  describe('changePassword', () => {
    it('should change user password successfully', async () => {
      const user = await createTestUser({
        password: 'old-hashed-password'
      });

      // Mock bcrypt methods
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockedBcrypt.hash.mockResolvedValue('new-hashed-password' as never);

      await AuthService.changePassword(user.id, 'oldPassword', 'newPassword');

      // Verify new password was hashed and saved
      const updatedUser = await prismaTest.user.findUnique({
        where: { id: user.id },
        select: { password: true }
      });

      expect(updatedUser?.password).toBe('new-hashed-password');
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('oldPassword', 'old-hashed-password');
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('newPassword', expect.any(Number));
    });

    it('should throw error for incorrect old password', async () => {
      const user = await createTestUser({
        password: 'old-hashed-password'
      });

      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        AuthService.changePassword(user.id, 'wrongOldPassword', 'newPassword')
      ).rejects.toThrow('Current password is incorrect');
    });
  });
});
