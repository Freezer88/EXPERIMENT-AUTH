import { Request, Response, NextFunction } from 'express';
import {
  authenticateToken,
  optionalAuth,
  requireRole,
  requirePermission,
  requireAccountAccess,
  requireAdmin,
  requireOwner,
  authenticateRefreshToken,
  validateToken,
  logAuthAttempt,
} from '../../../src/middlewares/auth.middleware';
import { generateAccessToken, generateRefreshToken } from '../../../src/modules/common/security/jwt';

// Mock the JWT utilities
jest.mock('../../../src/modules/common/security/jwt', () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyAccessToken: jest.fn(),
  extractTokenFromHeader: jest.fn(),
}));

// Mock the security config
jest.mock('../../../src/config/security', () => ({
  isTokenBlacklisted: jest.fn().mockReturnValue(false),
}));

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const mockPayload = {
    userId: 'user123',
    email: 'test@example.com',
    accountId: 'account123',
    role: 'user',
    permissions: ['read', 'write'],
  };

  beforeEach(() => {
    mockRequest = {
      headers: {},
      params: {},
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token and attach user to request', () => {
      const token = 'valid-token';
      mockRequest.headers = { authorization: `Bearer ${token}` };
      
      const { verifyAccessToken } = require('../../../src/modules/common/security/jwt');
      verifyAccessToken.mockReturnValue(mockPayload);

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual(mockPayload);
      expect(mockRequest.token).toBe(token);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when no authorization header', () => {
      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Access token is required',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is blacklisted', () => {
      const token = 'blacklisted-token';
      mockRequest.headers = { authorization: `Bearer ${token}` };
      
      const { isTokenBlacklisted } = require('../../../src/config/security');
      isTokenBlacklisted.mockReturnValue(true);

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Token has been revoked',
      });
    });

    it('should return 401 when token verification fails', () => {
      const token = 'invalid-token';
      mockRequest.headers = { authorization: `Bearer ${token}` };
      
      const { verifyAccessToken } = require('../../../../src/modules/common/security/jwt');
      verifyAccessToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      authenticateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    });
  });

  describe('optionalAuth', () => {
    it('should continue without authentication when no token provided', () => {
      optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
    });

    it('should authenticate when valid token provided', () => {
      const token = 'valid-token';
      mockRequest.headers = { authorization: `Bearer ${token}` };
      
      const { verifyAccessToken } = require('../../../../src/modules/common/security/jwt');
      verifyAccessToken.mockReturnValue(mockPayload);

      optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should continue without authentication when token verification fails', () => {
      const token = 'invalid-token';
      mockRequest.headers = { authorization: `Bearer ${token}` };
      
      const { verifyAccessToken } = require('../../../../src/modules/common/security/jwt');
      verifyAccessToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      optionalAuth(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
    });
  });

  describe('requireRole', () => {
    beforeEach(() => {
      mockRequest.user = mockPayload;
    });

    it('should allow access when user has required role', () => {
      const middleware = requireRole('user');
      
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow access when user has one of multiple required roles', () => {
      const middleware = requireRole(['user', 'admin']);
      
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when no user is authenticated', () => {
      delete mockRequest.user;
      const middleware = requireRole('user');
      
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    });

    it('should return 403 when user does not have required role', () => {
      const middleware = requireRole('admin');
      
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
    });
  });

  describe('requirePermission', () => {
    beforeEach(() => {
      mockRequest.user = mockPayload;
    });

    it('should allow access when user has required permission', () => {
      const middleware = requirePermission('read');
      
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should allow access when user has all required permissions', () => {
      const middleware = requirePermission(['read', 'write']);
      
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when no user is authenticated', () => {
      delete mockRequest.user;
      const middleware = requirePermission('read');
      
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    });

    it('should return 403 when user does not have required permission', () => {
      const middleware = requirePermission('delete');
      
      middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
    });
  });

  describe('requireAccountAccess', () => {
    beforeEach(() => {
      mockRequest.user = mockPayload;
    });

    it('should allow access when user has access to account', () => {
      mockRequest.params = { accountId: 'account123' };
      
      requireAccountAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when no user is authenticated', () => {
      delete mockRequest.user;
      mockRequest.params = { accountId: 'account123' };
      
      requireAccountAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    });

    it('should return 400 when no account ID provided', () => {
      requireAccountAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Account ID is required',
      });
    });

    it('should return 403 when user does not have access to account', () => {
      mockRequest.params = { accountId: 'different-account' };
      
      requireAccountAccess(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Access denied to this account',
      });
    });
  });

  describe('requireAdmin', () => {
    beforeEach(() => {
      mockRequest.user = mockPayload;
    });

    it('should allow access when user is admin', () => {
      mockRequest.user!.role = 'admin';
      
      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when no user is authenticated', () => {
      delete mockRequest.user;
      
      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    });

    it('should return 403 when user is not admin', () => {
      requireAdmin(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Admin access required',
      });
    });
  });

  describe('requireOwner', () => {
    beforeEach(() => {
      mockRequest.user = mockPayload;
    });

    it('should allow access when user is owner', () => {
      mockRequest.user!.role = 'owner';
      
      requireOwner(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when no user is authenticated', () => {
      delete mockRequest.user;
      
      requireOwner(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    });

    it('should return 403 when user is not owner', () => {
      requireOwner(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Owner access required',
      });
    });
  });

  describe('authenticateRefreshToken', () => {
    it('should authenticate valid refresh token', () => {
      const refreshToken = 'valid-refresh-token';
      mockRequest.body = { refreshToken };
      
      const { verifyAccessToken } = require('../../../../src/modules/common/security/jwt');
      verifyAccessToken.mockReturnValue(mockPayload);

      authenticateRefreshToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.user).toEqual(mockPayload);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when no refresh token provided', () => {
      authenticateRefreshToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Refresh token is required',
      });
    });

    it('should return 401 when refresh token is blacklisted', () => {
      const refreshToken = 'blacklisted-refresh-token';
      mockRequest.body = { refreshToken };
      
      const { isTokenBlacklisted } = require('../../../../src/config/security');
      isTokenBlacklisted.mockReturnValue(true);

      authenticateRefreshToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Refresh token has been revoked',
      });
    });
  });

  describe('validateToken', () => {
    it('should validate token format', () => {
      mockRequest.headers = { authorization: 'Bearer valid.token.format' };
      
      validateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 401 when no token provided', () => {
      validateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Token is required',
      });
    });

    it('should return 401 when token format is invalid', () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token-format' };
      
      validateToken(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid token format',
      });
    });
  });

  describe('logAuthAttempt', () => {
    it('should log authentication attempt', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      mockRequest.method = 'POST';
      (mockRequest as any).path = '/auth/login';
      (mockRequest as any).ip = '127.0.0.1';
      mockRequest.get = jest.fn().mockReturnValue('Test User Agent');
      
      logAuthAttempt(mockRequest as Request, mockResponse as Response, mockNext);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Auth attempt: POST /auth/login from 127.0.0.1 - Test User Agent'
      );
      expect(mockNext).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
}); 