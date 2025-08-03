import request from 'supertest';
import express from 'express';
import { UserService } from '../../../../src/modules/users/user.service';
import userRoutes from '../../../../src/modules/users/user.routes';

// Mock the JWT and auth middleware
jest.mock('../../../../src/modules/common/security/jwt', () => ({
  generateTokenPair: jest.fn().mockReturnValue({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  }),
}));

jest.mock('../../../../src/middlewares/auth.middleware', () => ({
  authenticateToken: jest.fn((_req: any, _res: any, next: any) => next()),
  requireAdmin: jest.fn((_req: any, _res: any, next: any) => next()),
  requireRole: jest.fn((_req: any, _res: any, next: any) => next()),
  logAuthAttempt: jest.fn((_req: any, _res: any, next: any) => next()),
}));

describe('UserController', () => {
  let app: express.Application;
  let userService: UserService;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/users', userRoutes);
    
    userService = UserService.getInstance();
    userService.clearUsers();
  });

  describe('POST /users/register', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'StrongPass123!',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      acceptTerms: true,
      marketingConsent: false,
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/users/register')
        .send(validUserData)
        .expect(201);

      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.firstName).toBe('John');
      expect(response.body.user.lastName).toBe('Doe');
      expect(response.body.user.isEmailVerified).toBe(false);
      expect(response.body.tokens).toBeDefined();
      expect(response.body.tokens.accessToken).toBe('mock-access-token');
      expect(response.body.tokens.refreshToken).toBe('mock-refresh-token');
    });

    it('should return 409 for duplicate email', async () => {
      // Register first user
      await request(app)
        .post('/users/register')
        .send(validUserData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/users/register')
        .send(validUserData)
        .expect(409);

      expect(response.body.error).toBe('Conflict');
      expect(response.body.message).toContain('already exists');
    });

    it('should return 400 for weak password', async () => {
      const weakPasswordData = {
        ...validUserData,
        password: 'weak',
      };

      const response = await request(app)
        .post('/users/register')
        .send(weakPasswordData)
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
      expect(response.body.message).toBe('Request validation failed');
    });

    it('should return 400 for invalid email', async () => {
      const invalidEmailData = {
        ...validUserData,
        email: 'invalid-email',
      };

      const response = await request(app)
        .post('/users/register')
        .send(invalidEmailData)
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
      expect(response.body.message).toBe('Request validation failed');
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        email: 'test@example.com',
        password: 'StrongPass123!',
        // Missing firstName, lastName, acceptTerms
      };

      const response = await request(app)
        .post('/users/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
      expect(response.body.message).toBe('Request validation failed');
    });

    it('should return 400 when terms not accepted', async () => {
      const noTermsData = {
        ...validUserData,
        acceptTerms: false,
      };

      const response = await request(app)
        .post('/users/register')
        .send(noTermsData)
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
      expect(response.body.message).toBe('Request validation failed');
    });
  });

  describe('POST /users/login', () => {
    const userData = {
      email: 'test@example.com',
      password: 'StrongPass123!',
      firstName: 'John',
      lastName: 'Doe',
      acceptTerms: true,
    };

    beforeEach(async () => {
      // Register a user first
      await request(app)
        .post('/users/register')
        .send(userData)
        .expect(201);
    });

    it('should login user successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({
          email: 'test@example.com',
          password: 'StrongPass123!',
        })
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.firstName).toBe('John');
      expect(response.body.user.lastName).toBe('Doe');
      expect(response.body.tokens).toBeDefined();
      expect(response.body.tokens.accessToken).toBe('mock-access-token');
      expect(response.body.tokens.refreshToken).toBe('mock-refresh-token');
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return 401 for non-existent email', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'StrongPass123!',
        })
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
      expect(response.body.message).toBe('Invalid email or password');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({
          email: 'invalid-email',
          password: 'StrongPass123!',
        })
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
      expect(response.body.message).toBe('Request validation failed');
    });

    it('should return 400 for missing password', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({
          email: 'test@example.com',
        })
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
      expect(response.body.message).toBe('Request validation failed');
    });

    it('should handle email case insensitivity', async () => {
      const response = await request(app)
        .post('/users/login')
        .send({
          email: 'TEST@EXAMPLE.COM',
          password: 'StrongPass123!',
        })
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.user.email).toBe('test@example.com');
    });
  });

  describe('GET /users/profile', () => {
    const userData = {
      email: 'test@example.com',
      password: 'StrongPass123!',
      firstName: 'John',
      lastName: 'Doe',
      acceptTerms: true,
    };

    beforeEach(async () => {
      // Register and login to get tokens
      await request(app)
        .post('/users/register')
        .send(userData)
        .expect(201);
    });

    it('should return user profile when authenticated', async () => {
      // Get the actual user from the service
      const user = await userService.findUserByEmail('test@example.com');
      
      // Mock the authenticateToken middleware to set user with actual user ID
      const mockAuthenticateToken = require('../../../../src/middlewares/auth.middleware').authenticateToken;
      mockAuthenticateToken.mockImplementation((req: any, _res: any, next: any) => {
        req.user = {
          userId: user!.id,
          email: 'test@example.com',
        };
        next();
      });

      const response = await request(app)
        .get('/users/profile')
        .expect(200);

      expect(response.body.message).toBe('User profile retrieved successfully');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.user.firstName).toBe('John');
      expect(response.body.user.lastName).toBe('Doe');
    });

    it('should return 401 when not authenticated', async () => {
      // Mock the authenticateToken middleware to not set user
      const mockAuthenticateToken = require('../../../../src/middlewares/auth.middleware').authenticateToken;
      mockAuthenticateToken.mockImplementation((_req: any, _res: any, next: any) => {
        // Don't set req.user
        next();
      });

      const response = await request(app)
        .get('/users/profile')
        .expect(401);

      expect(response.body.error).toBe('Unauthorized');
      expect(response.body.message).toBe('User not authenticated');
    });
  });

  describe('PUT /users/profile', () => {
    const userData = {
      email: 'test@example.com',
      password: 'StrongPass123!',
      firstName: 'John',
      lastName: 'Doe',
      acceptTerms: true,
    };

    beforeEach(async () => {
      // Register a user
      await request(app)
        .post('/users/register')
        .send(userData)
        .expect(201);
    });

    it('should update user profile successfully', async () => {
      // Get the actual user from the service
      const user = await userService.findUserByEmail('test@example.com');
      
      // Mock the authenticateToken middleware
      const mockAuthenticateToken = require('../../../../src/middlewares/auth.middleware').authenticateToken;
      mockAuthenticateToken.mockImplementation((req: any, _res: any, next: any) => {
        req.user = {
          userId: user!.id,
          email: 'test@example.com',
        };
        next();
      });

      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+1987654321',
        marketingConsent: true,
      };

      const response = await request(app)
        .put('/users/profile')
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('User profile updated successfully');
      expect(response.body.user.firstName).toBe('Jane');
      expect(response.body.user.lastName).toBe('Smith');
      expect(response.body.user.phoneNumber).toBe('+1987654321');
      expect(response.body.user.marketingConsent).toBe(true);
    });

    it('should return 400 for invalid phone number', async () => {
      // Get the actual user from the service
      const user = await userService.findUserByEmail('test@example.com');
      
      // Mock the authenticateToken middleware
      const mockAuthenticateToken = require('../../../../src/middlewares/auth.middleware').authenticateToken;
      mockAuthenticateToken.mockImplementation((req: any, _res: any, next: any) => {
        req.user = {
          userId: user!.id,
          email: 'test@example.com',
        };
        next();
      });

      const updateData = {
        phoneNumber: 'invalid-phone',
      };

      const response = await request(app)
        .put('/users/profile')
        .send(updateData)
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
      expect(response.body.message).toBe('Request validation failed');
    });
  });

  describe('PUT /users/change-password', () => {
    const userData = {
      email: 'test@example.com',
      password: 'StrongPass123!',
      firstName: 'John',
      lastName: 'Doe',
      acceptTerms: true,
    };

    beforeEach(async () => {
      // Register a user
      await request(app)
        .post('/users/register')
        .send(userData)
        .expect(201);
    });

    it('should change password successfully', async () => {
      // Mock the authenticateToken middleware
      const mockAuthenticateToken = require('../../../../src/middlewares/auth.middleware').authenticateToken;
      mockAuthenticateToken.mockImplementation((req: any, _res: any, next: any) => {
        req.user = {
          userId: 'mock-user-id',
          email: 'test@example.com',
        };
        next();
      });

      const passwordData = {
        currentPassword: 'StrongPass123!',
        newPassword: 'NewStrongPass456!',
        confirmNewPassword: 'NewStrongPass456!',
      };

      const response = await request(app)
        .put('/users/change-password')
        .send(passwordData)
        .expect(200);

      expect(response.body.message).toBe('Password changed successfully');
    });

    it('should return 400 for incorrect current password', async () => {
      // Mock the authenticateToken middleware
      const mockAuthenticateToken = require('../../../../src/middlewares/auth.middleware').authenticateToken;
      mockAuthenticateToken.mockImplementation((req: any, _res: any, next: any) => {
        req.user = {
          userId: 'mock-user-id',
          email: 'test@example.com',
        };
        next();
      });

      const passwordData = {
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewStrongPass456!',
        confirmNewPassword: 'NewStrongPass456!',
      };

      const response = await request(app)
        .put('/users/change-password')
        .send(passwordData)
        .expect(400);

      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toBe('Current password is incorrect');
    });

    it('should return 400 for weak new password', async () => {
      // Mock the authenticateToken middleware
      const mockAuthenticateToken = require('../../../../src/middlewares/auth.middleware').authenticateToken;
      mockAuthenticateToken.mockImplementation((req: any, _res: any, next: any) => {
        req.user = {
          userId: 'mock-user-id',
          email: 'test@example.com',
        };
        next();
      });

      const passwordData = {
        currentPassword: 'StrongPass123!',
        newPassword: 'weak',
        confirmNewPassword: 'weak',
      };

      const response = await request(app)
        .put('/users/change-password')
        .send(passwordData)
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
      expect(response.body.message).toBe('Request validation failed');
    });
  });

  describe('GET /users/verify-email/:token', () => {
    it('should verify email successfully with valid token', async () => {
      // First register a user to get a verification token
      const userData = {
        email: 'test@example.com',
        password: 'StrongPass123!',
        firstName: 'John',
        lastName: 'Doe',
        acceptTerms: true,
      };

      await request(app)
        .post('/users/register')
        .send(userData)
        .expect(201);

      // Get the verification token from the service
      const user = await userService.findUserByEmail('test@example.com');
      const token = user!.emailVerificationToken!;

      const response = await request(app)
        .get(`/users/verify-email/${token}`)
        .expect(200);

      expect(response.body.message).toBe('Email verified successfully');
    });

    it('should return 400 for invalid token', async () => {
      const response = await request(app)
        .get('/users/verify-email/invalid-token')
        .expect(400);

      expect(response.body.error).toBe('Bad Request');
      expect(response.body.message).toBe('Invalid or expired verification token');
    });
  });

  describe('POST /users/forgot-password', () => {
    it('should always return success to prevent email enumeration', async () => {
      const response = await request(app)
        .post('/users/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.message).toBe('If an account with this email exists, a password reset link has been sent');
    });

    it('should return 400 for invalid email format', async () => {
      const response = await request(app)
        .post('/users/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.error).toBe('Validation Error');
      expect(response.body.message).toBe('Request validation failed');
    });
  });
}); 