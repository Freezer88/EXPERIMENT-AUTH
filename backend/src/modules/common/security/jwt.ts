import jwt from 'jsonwebtoken';
import { JWT_CONFIG, isTokenBlacklisted } from '../../../config/security';

// JWT Payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  accountId?: string | undefined;
  role?: string | undefined;
  permissions?: string[] | undefined;
  iat?: number;
  exp?: number;
}

// JWT Token types
export type TokenType = 'access' | 'refresh';

// Generate JWT token
export const generateToken = (
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  type: TokenType = 'access'
): string => {
  const secret = type === 'access' 
    ? JWT_CONFIG.ACCESS_TOKEN_SECRET 
    : JWT_CONFIG.REFRESH_TOKEN_SECRET;
  
  const expiresIn = type === 'access' 
    ? JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN 
    : JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN;
  
  return jwt.sign(payload, secret, {
    expiresIn,
    algorithm: 'HS256',
  } as jwt.SignOptions);
};

// Generate access token
export const generateAccessToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return generateToken(payload, 'access');
};

// Generate refresh token
export const generateRefreshToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  return generateToken(payload, 'refresh');
};

// Verify JWT token
export const verifyToken = (
  token: string,
  type: TokenType = 'access'
): JWTPayload => {
  const secret = type === 'access' 
    ? JWT_CONFIG.ACCESS_TOKEN_SECRET 
    : JWT_CONFIG.REFRESH_TOKEN_SECRET;
  
  try {
    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      throw new Error('Token has been revoked');
    }
    
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
    }) as JWTPayload;
    
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else if (error instanceof jwt.NotBeforeError) {
      throw new Error('Token not active');
    } else {
      throw error;
    }
  }
};

// Verify access token
export const verifyAccessToken = (token: string): JWTPayload => {
  return verifyToken(token, 'access');
};

// Verify refresh token
export const verifyRefreshToken = (token: string): JWTPayload => {
  return verifyToken(token, 'refresh');
};

// Decode token without verification (for debugging)
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch (error) {
    return null;
  }
};

// Get token expiration time
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded.exp ? new Date(decoded.exp * 1000) : null;
  } catch (error) {
    return null;
  }
};

// Check if token is expired
export const isTokenExpired = (token: string): boolean => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  return expiration < new Date();
};

// Get token payload without verification
export const getTokenPayload = (token: string): Partial<JWTPayload> | null => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
      accountId: decoded.accountId || undefined,
      role: decoded.role || undefined,
      permissions: decoded.permissions || undefined,
    };
  } catch (error) {
    return null;
  }
};

// Generate token pair (access + refresh)
export const generateTokenPair = (payload: Omit<JWTPayload, 'iat' | 'exp'>): {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
} => {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  return {
    accessToken,
    refreshToken,
    accessTokenExpiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
    refreshTokenExpiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
  };
};

// Refresh token pair
export const refreshTokenPair = (refreshToken: string): {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: string;
  refreshTokenExpiresIn: string;
} => {
  const payload = verifyRefreshToken(refreshToken);
  
  // Remove iat and exp from payload for new tokens
  const { iat, exp, ...tokenPayload } = payload;
  
  return generateTokenPair(tokenPayload);
};

// Extract token from authorization header
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1] || null;
};

// Validate token format
export const validateTokenFormat = (token: string): boolean => {
  // Basic JWT format validation (3 parts separated by dots)
  const parts = token.split('.');
  return parts.length === 3;
};

// Get token type (access or refresh) based on expiration
export const getTokenType = (token: string): TokenType => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return 'access';
  
  const now = new Date();
  const timeDiff = expiration.getTime() - now.getTime();
  const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
  
  // If token expires in more than 1 day, it's likely a refresh token
  return daysDiff > 1 ? 'refresh' : 'access';
};

// Token utilities for middleware
export const tokenUtils = {
  // Extract and verify token from request
  extractAndVerifyToken: (authHeader: string | undefined, type: TokenType = 'access'): JWTPayload => {
    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      throw new Error('No token provided');
    }
    
    if (!validateTokenFormat(token)) {
      throw new Error('Invalid token format');
    }
    
    return verifyToken(token, type);
  },
  
  // Check if token is valid (not expired and not blacklisted)
  isTokenValid: (token: string, type: TokenType = 'access'): boolean => {
    try {
      verifyToken(token, type);
      return true;
    } catch (error) {
      return false;
    }
  },
  
  // Get token info for debugging
  getTokenInfo: (token: string): {
    type: TokenType;
    payload: Partial<JWTPayload> | null;
    isExpired: boolean;
    isBlacklisted: boolean;
    expiration: Date | null;
  } => {
    const type = getTokenType(token);
    const payload = getTokenPayload(token);
    const isExpired = isTokenExpired(token);
    const isBlacklisted = isTokenBlacklisted(token);
    const expiration = getTokenExpiration(token);
    
    return {
      type,
      payload,
      isExpired,
      isBlacklisted,
      expiration,
    };
  },
}; 