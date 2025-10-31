import { AuthService } from '../../services/authService';
import { prismaTest, createTestUser } from '../setup';
import * as bcrypt from 'bcryptjs';

// Mock bcrypt for consistent testing
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: `john-${Date.now()}@example.com`, // Unique email
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
      
      // Verify user was saved to database
      const savedUser = await prismaTest.user.findUnique({
        where: { email: userData.email }
      });
      expect(savedUser).toBeDefined();
      expect(savedUser?.name).toBe(userData.name);
    });

    it('should throw error when email already exists', async () => {
      const email = `existing-${Date.now()}@example.com`;
      
      // Create existing user
      await createTestUser({ email });

      await expect(
        AuthService.register('New User', email, 'password123')
      ).rejects.toThrow('User with this email already exists');
    });

    it('should hash password before saving', async () => {
      const userData = {
        name: 'John Doe',
        email: `hash-test-${Date.now()}@example.com`,
        password: 'password123'
      };

      // Don't mock bcrypt for this test - let it hash naturally
      jest.unmock('bcryptjs');
      
      await AuthService.register(userData.name, userData.email, userData.password);

      const savedUser = await prismaTest.user.findUnique({
        where: { email: userData.email },
        select: { password: true }
      });

      expect(savedUser?.password).not.toBe(userData.password);
      expect(savedUser?.password).toBeDefined();
      
      // Re-mock bcrypt for other tests
      jest.mock('bcryptjs');
    });

    it('should validate required fields', async () => {
      await expect(
        AuthService.register('', 'john@example.com', 'password123')
      ).rejects.toThrow('Name is required');

      await expect(
        AuthService.register('John Doe', '', 'password123')
      ).rejects.toThrow('Invalid email format');

      await expect(
        AuthService.register('John Doe', 'john@example.com', '')
      ).rejects.toThrow('Password must be at least 6 characters');
    });
  });

  describe('login', () => {
    it('should login user with correct credentials', async () => {
      const email = `login-test-${Date.now()}@example.com`;
      const plainPassword = 'password123';
      
      // Create user with real hashed password
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      const user = await createTestUser({
        name: 'John Doe',
        email,
        password: hashedPassword
      });

      // Don't mock bcrypt for this test - use real comparison
      jest.unmock('bcryptjs');
      
      const result = await AuthService.login(email, plainPassword);

      expect(result).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(result.user.id).toBe(user.id);
      
      // Re-mock bcrypt
      jest.mock('bcryptjs');
    });

    it('should throw error with incorrect email', async () => {
      await expect(
        AuthService.login('nonexistent@example.com', 'password123')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error with incorrect password', async () => {
      const email = `wrong-pwd-${Date.now()}@example.com`;
      await createTestUser({
        name: 'John Doe',
        email,
        password: 'hashed-password'
      });

      // Mock bcrypt compare to return false
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        AuthService.login(email, 'wrongpassword')
      ).rejects.toThrow('Invalid email or password');
    });

    it('should return user without password field', async () => {
      const email = `no-pwd-field-${Date.now()}@example.com`;
      await createTestUser({
        name: 'John Doe',
        email,
        password: 'hashed-password'
      });
      
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await AuthService.login(email, 'password123');

      expect(result.user.name).toBe('John Doe');
      expect(result.user.email).toBe(email);
      expect((result.user as any).password).toBeUndefined();
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile by ID', async () => {
      const user = await createTestUser({
        name: 'John Doe',
        email: `profile-${Date.now()}@example.com`
      });

      const result = await AuthService.getUserProfile(user.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(user.id);
      expect(result.name).toBe(user.name);
      expect(result.email).toBe(user.email);
    });

    it('should throw error for non-existent user ID', async () => {
      const fakeId = 'cm12345678901234567890123';

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
        email: `update-${Date.now()}@example.com`
      });

      const updates = {
        name: 'Updated Name',
        email: `updated-${Date.now()}@example.com`
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
        email: `user1-${Date.now()}@example.com`
      });
      
      const user2 = await createTestUser({ 
        name: 'User 2',
        email: `user2-${Date.now()}@example.com`
      });

      await expect(
        AuthService.updateUserProfile(user2.id, { email: user1.email })
      ).rejects.toThrow('Email is already taken');
    });

    it('should update only provided fields', async () => {
      const originalEmail = `only-name-${Date.now()}@example.com`;
      const user = await createTestUser({
        name: 'John Doe',
        email: originalEmail
      });

      // Update only name
      const result = await AuthService.updateUserProfile(user.id, { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
      expect(result.email).toBe(originalEmail); // Should remain unchanged
    });

    it('should throw error for non-existent user', async () => {
      const fakeId = 'cm12345678901234567890123';

      await expect(
        AuthService.updateUserProfile(fakeId, { name: 'New Name' })
      ).rejects.toThrow('User not found');
    });

    it('should not return password in updated user', async () => {
      const user = await createTestUser({
        name: 'John Doe',
        email: `no-pwd-return-${Date.now()}@example.com`
      });

      const result = await AuthService.updateUserProfile(user.id, { name: 'Updated Name' });

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated Name');
      expect((result as any).password).toBeUndefined();
    });
  });

  describe('validateEmailUnique', () => {
    it('should return true for unique email', async () => {
      const uniqueEmail = `unique-${Date.now()}@example.com`;
      const isUnique = await AuthService.validateEmailUnique(uniqueEmail);
      expect(isUnique).toBe(true);
    });

    it('should return false for existing email', async () => {
      const existingEmail = `existing-${Date.now()}@example.com`;
      await createTestUser({ email: existingEmail });
      
      const isUnique = await AuthService.validateEmailUnique(existingEmail);
      expect(isUnique).toBe(false);
    });
  });

  describe('changePassword', () => {
    it('should change user password successfully', async () => {
      const oldPassword = 'oldPassword123';
      const newPassword = 'newPassword123';
      
      // Create user with real hashed password
      const hashedOldPassword = await bcrypt.hash(oldPassword, 10);
      const user = await createTestUser({
        email: `change-pwd-${Date.now()}@example.com`,
        password: hashedOldPassword
      });

      // Don't mock bcrypt - use real hashing
      jest.unmock('bcryptjs');
      
      await AuthService.changePassword(user.id, oldPassword, newPassword);

      // Verify new password was saved
      const updatedUser = await prismaTest.user.findUnique({
        where: { id: user.id },
        select: { password: true }
      });

      expect(updatedUser?.password).toBeDefined();
      expect(updatedUser?.password).not.toBe(hashedOldPassword);
      
      // Verify new password works
      const passwordMatches = await bcrypt.compare(newPassword, updatedUser!.password);
      expect(passwordMatches).toBe(true);
      
      // Re-mock bcrypt
      jest.mock('bcryptjs');
    });

    it('should throw error for incorrect old password', async () => {
      const user = await createTestUser({
        email: `wrong-old-pwd-${Date.now()}@example.com`,
        password: 'old-hashed-password'
      });

      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        AuthService.changePassword(user.id, 'wrongOldPassword', 'newPassword')
      ).rejects.toThrow('Current password is incorrect');
    });
  });
});
