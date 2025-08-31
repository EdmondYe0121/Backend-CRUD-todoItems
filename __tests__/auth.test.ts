import request from 'supertest';
import app from '../src/app';

describe('POST /api/auth/login', () => {
  const loginEndpoint = '/api/auth/login';

  describe('Successful Login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'user1@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post(loginEndpoint)
        .send(loginData)
        .expect(200);

      // Check response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');

      // Check user data structure
      const { user, token } = response.body.data;
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email', 'user1@example.com');
      expect(user).toHaveProperty('name', 'User One');
      expect(user).toHaveProperty('createdAt');
      expect(user).not.toHaveProperty('password'); // Password should not be returned

      // Check token is a string
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);

      // Verify JWT token format (should have 3 parts separated by dots)
      const tokenParts = token.split('.');
      expect(tokenParts).toHaveLength(3);
    });
  });

  describe('Failed Login - Invalid Credentials', () => {
    it('should return 401 for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post(loginEndpoint)
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'User not found');
    });

    it('should return 401 for wrong password', async () => {
      const loginData = {
        email: 'user1@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post(loginEndpoint)
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid password');
    });
  });

  describe('Failed Login - Validation Errors', () => {
    it('should return 400 for missing email', async () => {
      const loginData = {
        password: 'password123'
      };

      const response = await request(app)
        .post(loginEndpoint)
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });

    it('should return 400 for missing password', async () => {
      const loginData = {
        email: 'user1@example.com'
      };

      const response = await request(app)
        .post(loginEndpoint)
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });

    it('should return 400 for missing both email and password', async () => {
      const loginData = {};

      const response = await request(app)
        .post(loginEndpoint)
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });

    it('should return 400 for empty email', async () => {
      const loginData = {
        email: '',
        password: 'password123'
      };

      const response = await request(app)
        .post(loginEndpoint)
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });

    it('should return 400 for empty password', async () => {
      const loginData = {
        email: 'user1@example.com',
        password: ''
      };

      const response = await request(app)
        .post(loginEndpoint)
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Email and password are required');
    });
  });

  describe('Content Type Tests', () => {
    it('should handle JSON content type correctly', async () => {
      const loginData = {
        email: 'user1@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post(loginEndpoint)
        .set('Content-Type', 'application/json')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return JSON response', async () => {
      const loginData = {
        email: 'user1@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post(loginEndpoint)
        .send(loginData)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toBeDefined();
    });
  });

  describe('Performance Tests', () => {
    it('should respond within reasonable time', async () => {
      const startTime = Date.now();
      
      const loginData = {
        email: 'user1@example.com',
        password: 'password123'
      };

      await request(app)
        .post(loginEndpoint)
        .send(loginData)
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Should respond within 2 seconds
      expect(responseTime).toBeLessThan(2000);
    });
  });
});
