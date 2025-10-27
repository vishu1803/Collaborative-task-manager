import request from 'supertest';
import app from '../../app';
import { TestDataFactory, TestAssertions } from '../utils/testHelpers';

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      TestAssertions.expectSuccessResponse(response, 201);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
    });

    it('should return validation error for invalid email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      TestAssertions.expectErrorResponse(response, 400);
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      TestAssertions.expectErrorResponse(response, 400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await TestDataFactory.createTestUser({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should login user with correct credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
    });

    it('should return error for incorrect credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      TestAssertions.expectErrorResponse(response, 401);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile for authenticated user', async () => {
      const user = await TestDataFactory.createTestUser();
      const token = TestDataFactory.generateAuthToken(user);

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      TestAssertions.expectSuccessResponse(response, 200);
      TestAssertions.expectValidUser(response.body.data);
    });

    it('should return error for unauthenticated user', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      TestAssertions.expectErrorResponse(response, 401);
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile successfully', async () => {
      const user = await TestDataFactory.createTestUser();
      const token = TestDataFactory.generateAuthToken(user);

      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      TestAssertions.expectSuccessResponse(response, 200);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.email).toBe(updateData.email);
    });
  });
});
