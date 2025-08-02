import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, JWTPayload, extractTokenFromHeader } from '../modules/common/security/jwt';
import { isTokenBlacklisted } from '../config/security';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      token?: string;
    }
  }
}

// Authentication middleware
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Access token is required',
      });
      return;
    }
    
    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token has been revoked',
      });
      return;
    }
    
    // Verify and decode token
    const payload = verifyAccessToken(token);
    
    // Attach user and token to request
    req.user = payload;
    req.token = token;
    
    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({
        error: 'Unauthorized',
        message: error.message,
      });
    } else {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token',
      });
    }
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return next();
    }
    
    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      return next();
    }
    
    // Verify and decode token
    const payload = verifyAccessToken(token);
    
    // Attach user and token to request
    req.user = payload;
    req.token = token;
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Role-based access control middleware
export const requireRole = (roles: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }
    
    const userRole = req.user.role;
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!userRole || !requiredRoles.includes(userRole)) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
      return;
    }
    
    next();
  };
};

// Permission-based access control middleware
export const requirePermission = (permissions: string | string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }
    
    const userPermissions = req.user.permissions || [];
    const requiredPermissions = Array.isArray(permissions) ? permissions : [permissions];
    
    const hasAllPermissions = requiredPermissions.every(permission => 
      userPermissions.includes(permission)
    );
    
    if (!hasAllPermissions) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
      return;
    }
    
    next();
  };
};

// Account access middleware
export const requireAccountAccess = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }
  
  const accountId = req.params.accountId || req.body.accountId;
  
  if (!accountId) {
    res.status(400).json({
      error: 'Bad Request',
      message: 'Account ID is required',
    });
    return;
  }
  
  // Check if user has access to this account
  if (req.user.accountId !== accountId) {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied to this account',
    });
    return;
  }
  
  next();
};

// Admin-only middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }
  
  if (req.user.role !== 'admin') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Admin access required',
    });
    return;
  }
  
  next();
};

// Owner-only middleware
export const requireOwner = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
    return;
  }
  
  if (req.user.role !== 'owner') {
    res.status(403).json({
      error: 'Forbidden',
      message: 'Owner access required',
    });
    return;
  }
  
  next();
};

// Refresh token middleware
export const authenticateRefreshToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Refresh token is required',
      });
      return;
    }
    
    // Check if token is blacklisted
    if (isTokenBlacklisted(refreshToken)) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Refresh token has been revoked',
      });
      return;
    }
    
    // Verify refresh token
    const payload = verifyAccessToken(refreshToken);
    
    // Attach user to request
    req.user = payload;
    
    next();
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({
        error: 'Unauthorized',
        message: error.message,
      });
    } else {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid refresh token',
      });
    }
  }
};

// Token validation middleware (for debugging)
export const validateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Token is required',
    });
    return;
  }
  
  // Basic token format validation
  const parts = token.split('.');
  if (parts.length !== 3) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token format',
    });
    return;
  }
  
  next();
};

// Rate limiting for authentication endpoints
export const authRateLimit = (req: Request, res: Response, next: NextFunction): void => {
  // This would be implemented with express-rate-limit
  // For now, we'll just pass through
  next();
};

// Log authentication attempts
export const logAuthAttempt = (req: Request, res: Response, next: NextFunction): void => {
  const { method, path, ip } = req;
  const userAgent = req.get('User-Agent');
  
  console.log(`Auth attempt: ${method} ${path} from ${ip} - ${userAgent}`);
  
  next();
}; 