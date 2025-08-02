import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

// JWT Configuration
export const JWT_CONFIG = {
  ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key-change-in-production',
  REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
  ACCESS_TOKEN_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  REFRESH_TOKEN_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  ISSUER: process.env.JWT_ISSUER || 'homeowners-insurance-ai',
  AUDIENCE: process.env.JWT_AUDIENCE || 'homeowners-insurance-ai-users',
} as const;

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  // General API rate limiting
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // Authentication endpoints rate limiting
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // Password reset rate limiting
  PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 requests per windowMs
    message: 'Too many password reset attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  // File upload rate limiting
  FILE_UPLOAD: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 uploads per windowMs
    message: 'Too many file uploads, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
} as const;

// Speed Limiting Configuration
export const SPEED_LIMIT_CONFIG = {
  // Slow down repeated requests
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // allow 50 requests per 15 minutes, then...
    delayMs: 500, // begin adding 500ms of delay per request above 50
  },
  
  // Slow down authentication attempts
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 2, // allow 2 requests per 15 minutes, then...
    delayMs: 1000, // begin adding 1000ms of delay per request above 2
  },
} as const;

// Security Headers Configuration
export const SECURITY_HEADERS = {
  // Content Security Policy
  CONTENT_SECURITY_POLICY: {
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'"],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'https:'],
    'font-src': ["'self'", 'https:'],
    'connect-src': ["'self'", 'https:'],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
  },
  
  // CORS Configuration
  CORS: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  },
} as const;

// Password Policy Configuration
export const PASSWORD_POLICY = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
  ALLOWED_SPECIAL_CHARS: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  DISALLOWED_WORDS: ['password', '123456', 'qwerty', 'admin', 'user'],
} as const;

// Session Configuration
export const SESSION_CONFIG = {
  SECRET: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  COOKIE_SECURE: process.env.NODE_ENV === 'production',
  COOKIE_HTTP_ONLY: true,
  COOKIE_SAME_SITE: 'strict' as const,
  COOKIE_MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
} as const;

// Create rate limiters
export const createRateLimiters = () => ({
  general: rateLimit(RATE_LIMIT_CONFIG.GENERAL),
  auth: rateLimit(RATE_LIMIT_CONFIG.AUTH),
  passwordReset: rateLimit(RATE_LIMIT_CONFIG.PASSWORD_RESET),
  fileUpload: rateLimit(RATE_LIMIT_CONFIG.FILE_UPLOAD),
});

// Create speed limiters
export const createSpeedLimiters = () => ({
  general: slowDown(SPEED_LIMIT_CONFIG.GENERAL),
  auth: slowDown(SPEED_LIMIT_CONFIG.AUTH),
});

// Security middleware
export const securityMiddleware = {
  // Validate JWT token format
  validateTokenFormat: (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: 'Invalid token format',
        message: 'Token must be provided in format: Bearer <token>',
      });
    }
    
    next();
  },
  
  // Validate request origin
  validateOrigin: (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'https://homeowners-insurance-ai.replit.co',
      'https://homeowners-insurance-ai.replit.dev',
    ];
    
    if (origin && !allowedOrigins.includes(origin)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Invalid request origin',
      });
    }
    
    next();
  },
  
  // Sanitize request body
  sanitizeBody: (req: Request, res: Response, next: NextFunction) => {
    // Remove potentially dangerous properties
    if (req.body) {
      delete req.body.__proto__;
      delete req.body.constructor;
      delete req.body.prototype;
    }
    
    next();
  },
  
  // Add security headers
  addSecurityHeaders: (req: Request, res: Response, next: NextFunction) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions policy
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), payment=()'
    );
    
    next();
  },
};

// Password validation utility
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < PASSWORD_POLICY.MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_POLICY.MIN_LENGTH} characters long`);
  }
  
  if (password.length > PASSWORD_POLICY.MAX_LENGTH) {
    errors.push(`Password must be no more than ${PASSWORD_POLICY.MAX_LENGTH} characters long`);
  }
  
  if (PASSWORD_POLICY.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (PASSWORD_POLICY.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (PASSWORD_POLICY.REQUIRE_NUMBERS && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (PASSWORD_POLICY.REQUIRE_SPECIAL_CHARS) {
    const specialCharRegex = new RegExp(`[${PASSWORD_POLICY.ALLOWED_SPECIAL_CHARS.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`);
    if (!specialCharRegex.test(password)) {
      errors.push('Password must contain at least one special character');
    }
  }
  
  // Check for disallowed words
  const lowerPassword = password.toLowerCase();
  for (const word of PASSWORD_POLICY.DISALLOWED_WORDS) {
    if (lowerPassword.includes(word)) {
      errors.push(`Password cannot contain common words like "${word}"`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Token blacklist (in production, use Redis)
export const tokenBlacklist = new Set<string>();

// Add token to blacklist
export const blacklistToken = (token: string): void => {
  tokenBlacklist.add(token);
};

// Check if token is blacklisted
export const isTokenBlacklisted = (token: string): boolean => {
  return tokenBlacklist.has(token);
};

// Clean up expired tokens from blacklist (run periodically)
export const cleanupTokenBlacklist = (): void => {
  // In a real implementation, you would check token expiration
  // and remove expired tokens from the blacklist
  // For now, we'll just clear the blacklist periodically
  tokenBlacklist.clear();
}; 