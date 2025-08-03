import { Request, Response, NextFunction } from 'express';
import { JWTPayload } from '../modules/common/security/jwt';
import { 
  getPermissionsForRole, 
  roleHasPermission, 
  userHasAnyPermission, 
  userHasAllPermissions,
  Permission 
} from '../modules/common/security/permissions';
import { accountService } from '../modules/accounts/account.service';

// Extend the Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to require a specific role
 */
export function requireRole(requiredRole: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      // Check if user has the required role
      if (user.role !== requiredRole) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Role '${requiredRole}' is required`
        });
      }

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Error checking role permissions'
      });
    }
  };
}

/**
 * Middleware to require any of the specified roles
 */
export function requireAnyRole(requiredRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      // Check if user has any of the required roles
      if (!requiredRoles.includes(user.role || '')) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `One of the following roles is required: ${requiredRoles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Error checking role permissions'
      });
    }
  };
}

/**
 * Middleware to require a specific permission
 */
export function requirePermission(requiredPermission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      const userRole = user.role || '';
      
      // Check if user's role has the required permission
      if (!roleHasPermission(userRole, requiredPermission)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `Permission '${requiredPermission}' is required`
        });
      }

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Error checking permissions'
      });
    }
  };
}

/**
 * Middleware to require any of the specified permissions
 */
export function requireAnyPermission(requiredPermissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      const userRole = user.role || '';
      const userPermissions = getPermissionsForRole(userRole);
      
      // Check if user has any of the required permissions
      if (!userHasAnyPermission(userPermissions, requiredPermissions)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `One of the following permissions is required: ${requiredPermissions.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Error checking permissions'
      });
    }
  };
}

/**
 * Middleware to require all of the specified permissions
 */
export function requireAllPermissions(requiredPermissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      const userRole = user.role || '';
      const userPermissions = getPermissionsForRole(userRole);
      
      // Check if user has all of the required permissions
      if (!userHasAllPermissions(userPermissions, requiredPermissions)) {
        return res.status(403).json({
          error: 'Forbidden',
          message: `All of the following permissions are required: ${requiredPermissions.join(', ')}`
        });
      }

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Error checking permissions'
      });
    }
  };
}

/**
 * Middleware to require account access (user must be a member of the account)
 */
export function requireAccountAccess() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const accountId = req.params.accountId;
      
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      if (!accountId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Account ID is required'
        });
      }

      // Check if user is a member of the account
      const members = await accountService.getAccountMembers(accountId, user.userId);
      const userMembership = members.find(member => member.userId === user.userId);
      
      if (!userMembership) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access to this account is denied'
        });
      }

      // Add user's role in this account to the request for use in other middleware
      req.user = {
        ...user,
        role: userMembership.role
      };

      next();
    } catch (error) {
      console.error('Account access middleware error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Error checking account access'
      });
    }
  };
}

/**
 * Middleware to require account ownership or admin role
 */
export function requireAccountOwnershipOrAdmin() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const accountId = req.params.accountId;
      
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      if (!accountId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Account ID is required'
        });
      }

      // Check if user is a member of the account
      const members = await accountService.getAccountMembers(accountId, user.userId);
      const userMembership = members.find(member => member.userId === user.userId);
      
      if (!userMembership) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access to this account is denied'
        });
      }

      // Check if user is owner or admin
      if (userMembership.role !== 'owner' && userMembership.role !== 'admin') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Owner or admin role is required for this action'
        });
      }

      // Add user's role in this account to the request
      req.user = {
        ...user,
        role: userMembership.role
      };

      next();
    } catch (error) {
      console.error('Account ownership middleware error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Error checking account ownership'
      });
    }
  };
}

/**
 * Middleware to require account ownership only
 */
export function requireAccountOwnership() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const accountId = req.params.accountId;
      
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
      }

      if (!accountId) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Account ID is required'
        });
      }

      // Check if user is a member of the account
      const members = await accountService.getAccountMembers(accountId, user.userId);
      const userMembership = members.find(member => member.userId === user.userId);
      
      if (!userMembership) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Access to this account is denied'
        });
      }

      // Check if user is owner
      if (userMembership.role !== 'owner') {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Owner role is required for this action'
        });
      }

      // Add user's role in this account to the request
      req.user = {
        ...user,
        role: userMembership.role
      };

      next();
    } catch (error) {
      console.error('Account ownership middleware error:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Error checking account ownership'
      });
    }
  };
} 