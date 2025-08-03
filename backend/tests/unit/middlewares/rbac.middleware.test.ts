import { Request, Response, NextFunction } from 'express';
import {
  requireRole,
  requireAnyRole,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  requireAccountAccess,
  requireAccountOwnershipOrAdmin,
  requireAccountOwnership
} from '../../../src/middlewares/rbac.middleware';
import { PERMISSIONS } from '../../../src/modules/common/security/permissions';

// Mock the account service
jest.mock('../../../src/modules/accounts/account.service', () => ({
  accountService: {
    getAccountMembers: jest.fn(),
  },
}));

import { accountService } from '../../../src/modules/accounts/account.service';

describe('RBAC Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      user: {
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'owner',
        accountId: 'test-account-id'
      },
      params: {
        accountId: 'test-account-id'
      }
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('requireRole', () => {
    it('should allow access when user has the required role', () => {
      mockRequest.user!.role = 'owner';
      
      const middleware = requireRole('owner');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access when user does not have the required role', () => {
      mockRequest.user!.role = 'viewer';
      
      const middleware = requireRole('owner');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: "Role 'owner' is required"
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      mockRequest.user = undefined;
      
      const middleware = requireRole('owner');
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAnyRole', () => {
    it('should allow access when user has any of the required roles', () => {
      mockRequest.user!.role = 'admin';
      
      const middleware = requireAnyRole(['owner', 'admin']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access when user does not have any of the required roles', () => {
      mockRequest.user!.role = 'viewer';
      
      const middleware = requireAnyRole(['owner', 'admin']);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'One of the following roles is required: owner, admin'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requirePermission', () => {
    it('should allow access when user has the required permission', () => {
      mockRequest.user!.role = 'owner';
      
      const middleware = requirePermission(PERMISSIONS.ACCOUNT_READ);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access when user does not have the required permission', () => {
      mockRequest.user!.role = 'viewer';
      
      const middleware = requirePermission(PERMISSIONS.ACCOUNT_DELETE);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: `Permission '${PERMISSIONS.ACCOUNT_DELETE}' is required`
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAnyPermission', () => {
    it('should allow access when user has any of the required permissions', () => {
      mockRequest.user!.role = 'owner';
      
      const middleware = requireAnyPermission([PERMISSIONS.ACCOUNT_READ, PERMISSIONS.ACCOUNT_DELETE]);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access when user does not have any of the required permissions', () => {
      mockRequest.user!.role = 'viewer';
      
      const middleware = requireAnyPermission([PERMISSIONS.ACCOUNT_DELETE, PERMISSIONS.ACCOUNT_MANAGE_MEMBERS]);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: `One of the following permissions is required: ${PERMISSIONS.ACCOUNT_DELETE}, ${PERMISSIONS.ACCOUNT_MANAGE_MEMBERS}`
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAllPermissions', () => {
    it('should allow access when user has all required permissions', () => {
      mockRequest.user!.role = 'owner';
      
      const middleware = requireAllPermissions([PERMISSIONS.ACCOUNT_READ, PERMISSIONS.ACCOUNT_WRITE]);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access when user does not have all required permissions', () => {
      mockRequest.user!.role = 'viewer';
      
      const middleware = requireAllPermissions([PERMISSIONS.ACCOUNT_READ, PERMISSIONS.ACCOUNT_DELETE]);
      middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: `All of the following permissions are required: ${PERMISSIONS.ACCOUNT_READ}, ${PERMISSIONS.ACCOUNT_DELETE}`
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAccountAccess', () => {
    it('should allow access when user is a member of the account', async () => {
      const mockMembers = [
        { userId: 'test-user-id', role: 'owner' }
      ];
      (accountService.getAccountMembers as jest.Mock).mockResolvedValue(mockMembers);
      
      const middleware = requireAccountAccess();
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(accountService.getAccountMembers).toHaveBeenCalledWith('test-account-id', 'test-user-id');
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      
      // Check that user role was updated
      expect(mockRequest.user!.role).toBe('owner');
    });

    it('should deny access when user is not a member of the account', async () => {
      const mockMembers = [
        { userId: 'other-user-id', role: 'owner' }
      ];
      (accountService.getAccountMembers as jest.Mock).mockResolvedValue(mockMembers);
      
      const middleware = requireAccountAccess();
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Access to this account is denied'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 400 when accountId is missing', async () => {
      mockRequest.params = {};
      
      const middleware = requireAccountAccess();
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Account ID is required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAccountOwnershipOrAdmin', () => {
    it('should allow access when user is owner', async () => {
      const mockMembers = [
        { userId: 'test-user-id', role: 'owner' }
      ];
      (accountService.getAccountMembers as jest.Mock).mockResolvedValue(mockMembers);
      
      const middleware = requireAccountOwnershipOrAdmin();
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should allow access when user is admin', async () => {
      const mockMembers = [
        { userId: 'test-user-id', role: 'admin' }
      ];
      (accountService.getAccountMembers as jest.Mock).mockResolvedValue(mockMembers);
      
      const middleware = requireAccountOwnershipOrAdmin();
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access when user is not owner or admin', async () => {
      const mockMembers = [
        { userId: 'test-user-id', role: 'viewer' }
      ];
      (accountService.getAccountMembers as jest.Mock).mockResolvedValue(mockMembers);
      
      const middleware = requireAccountOwnershipOrAdmin();
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Owner or admin role is required for this action'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAccountOwnership', () => {
    it('should allow access when user is owner', async () => {
      const mockMembers = [
        { userId: 'test-user-id', role: 'owner' }
      ];
      (accountService.getAccountMembers as jest.Mock).mockResolvedValue(mockMembers);
      
      const middleware = requireAccountOwnership();
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should deny access when user is admin but not owner', async () => {
      const mockMembers = [
        { userId: 'test-user-id', role: 'admin' }
      ];
      (accountService.getAccountMembers as jest.Mock).mockResolvedValue(mockMembers);
      
      const middleware = requireAccountOwnership();
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Owner role is required for this action'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should deny access when user is not owner', async () => {
      const mockMembers = [
        { userId: 'test-user-id', role: 'viewer' }
      ];
      (accountService.getAccountMembers as jest.Mock).mockResolvedValue(mockMembers);
      
      const middleware = requireAccountOwnership();
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Forbidden',
        message: 'Owner role is required for this action'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should handle errors gracefully', async () => {
      (accountService.getAccountMembers as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      const middleware = requireAccountAccess();
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Error checking account access'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 