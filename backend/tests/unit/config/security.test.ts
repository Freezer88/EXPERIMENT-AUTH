import {
  JWT_CONFIG,
  RATE_LIMIT_CONFIG,
  SPEED_LIMIT_CONFIG,
  SECURITY_HEADERS,
  PASSWORD_POLICY,
  SESSION_CONFIG,
  createRateLimiters,
  createSpeedLimiters,
  securityMiddleware,
  validatePassword,
  tokenBlacklist,
  blacklistToken,
  isTokenBlacklisted,
  cleanupTokenBlacklist,
} from '../../../../src/config/security';

describe('Security Configuration', () => {
  describe('JWT Configuration', () => {
    it('should have required JWT configuration properties', () => {
      expect(JWT_CONFIG).toHaveProperty('ACCESS_TOKEN_SECRET');
      expect(JWT_CONFIG).toHaveProperty('REFRESH_TOKEN_SECRET');
      expect(JWT_CONFIG).toHaveProperty('ACCESS_TOKEN_EXPIRES_IN');
      expect(JWT_CONFIG).toHaveProperty('REFRESH_TOKEN_EXPIRES_IN');
      expect(JWT_CONFIG).toHaveProperty('ISSUER');
      expect(JWT_CONFIG).toHaveProperty('AUDIENCE');
    });

    it('should have default values when environment variables are not set', () => {
      expect(JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN).toBe('15m');
      expect(JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN).toBe('7d');
      expect(JWT_CONFIG.ISSUER).toBe('homeowners-insurance-ai');
      expect(JWT_CONFIG.AUDIENCE).toBe('homeowners-insurance-ai-users');
    });
  });

  describe('Rate Limiting Configuration', () => {
    it('should have general rate limiting configuration', () => {
      expect(RATE_LIMIT_CONFIG.GENERAL).toHaveProperty('windowMs');
      expect(RATE_LIMIT_CONFIG.GENERAL).toHaveProperty('max');
      expect(RATE_LIMIT_CONFIG.GENERAL).toHaveProperty('message');
    });

    it('should have authentication rate limiting configuration', () => {
      expect(RATE_LIMIT_CONFIG.AUTH).toHaveProperty('windowMs');
      expect(RATE_LIMIT_CONFIG.AUTH).toHaveProperty('max');
      expect(RATE_LIMIT_CONFIG.AUTH.max).toBe(5);
    });

    it('should have password reset rate limiting configuration', () => {
      expect(RATE_LIMIT_CONFIG.PASSWORD_RESET).toHaveProperty('windowMs');
      expect(RATE_LIMIT_CONFIG.PASSWORD_RESET).toHaveProperty('max');
      expect(RATE_LIMIT_CONFIG.PASSWORD_RESET.max).toBe(3);
    });

    it('should have file upload rate limiting configuration', () => {
      expect(RATE_LIMIT_CONFIG.FILE_UPLOAD).toHaveProperty('windowMs');
      expect(RATE_LIMIT_CONFIG.FILE_UPLOAD).toHaveProperty('max');
      expect(RATE_LIMIT_CONFIG.FILE_UPLOAD.max).toBe(20);
    });
  });

  describe('Speed Limiting Configuration', () => {
    it('should have general speed limiting configuration', () => {
      expect(SPEED_LIMIT_CONFIG.GENERAL).toHaveProperty('windowMs');
      expect(SPEED_LIMIT_CONFIG.GENERAL).toHaveProperty('delayAfter');
      expect(SPEED_LIMIT_CONFIG.GENERAL).toHaveProperty('delayMs');
    });

    it('should have authentication speed limiting configuration', () => {
      expect(SPEED_LIMIT_CONFIG.AUTH).toHaveProperty('windowMs');
      expect(SPEED_LIMIT_CONFIG.AUTH).toHaveProperty('delayAfter');
      expect(SPEED_LIMIT_CONFIG.AUTH).toHaveProperty('delayMs');
    });
  });

  describe('Security Headers Configuration', () => {
    it('should have Content Security Policy configuration', () => {
      expect(SECURITY_HEADERS.CONTENT_SECURITY_POLICY).toHaveProperty('default-src');
      expect(SECURITY_HEADERS.CONTENT_SECURITY_POLICY).toHaveProperty('script-src');
      expect(SECURITY_HEADERS.CONTENT_SECURITY_POLICY).toHaveProperty('style-src');
    });

    it('should have CORS configuration', () => {
      expect(SECURITY_HEADERS.CORS).toHaveProperty('origin');
      expect(SECURITY_HEADERS.CORS).toHaveProperty('credentials');
      expect(SECURITY_HEADERS.CORS).toHaveProperty('methods');
      expect(SECURITY_HEADERS.CORS).toHaveProperty('allowedHeaders');
    });
  });

  describe('Password Policy Configuration', () => {
    it('should have minimum length requirement', () => {
      expect(PASSWORD_POLICY.MIN_LENGTH).toBe(8);
    });

    it('should have maximum length requirement', () => {
      expect(PASSWORD_POLICY.MAX_LENGTH).toBe(128);
    });

    it('should require uppercase letters', () => {
      expect(PASSWORD_POLICY.REQUIRE_UPPERCASE).toBe(true);
    });

    it('should require lowercase letters', () => {
      expect(PASSWORD_POLICY.REQUIRE_LOWERCASE).toBe(true);
    });

    it('should require numbers', () => {
      expect(PASSWORD_POLICY.REQUIRE_NUMBERS).toBe(true);
    });

    it('should require special characters', () => {
      expect(PASSWORD_POLICY.REQUIRE_SPECIAL_CHARS).toBe(true);
    });

    it('should have allowed special characters', () => {
      expect(PASSWORD_POLICY.ALLOWED_SPECIAL_CHARS).toBeDefined();
      expect(PASSWORD_POLICY.ALLOWED_SPECIAL_CHARS.length).toBeGreaterThan(0);
    });

    it('should have disallowed words list', () => {
      expect(PASSWORD_POLICY.DISALLOWED_WORDS).toBeInstanceOf(Array);
      expect(PASSWORD_POLICY.DISALLOWED_WORDS.length).toBeGreaterThan(0);
    });
  });

  describe('Session Configuration', () => {
    it('should have session secret', () => {
      expect(SESSION_CONFIG).toHaveProperty('SECRET');
    });

    it('should have cookie secure setting', () => {
      expect(SESSION_CONFIG).toHaveProperty('COOKIE_SECURE');
    });

    it('should have cookie http only setting', () => {
      expect(SESSION_CONFIG.COKIE_HTTP_ONLY).toBe(true);
    });

    it('should have cookie same site setting', () => {
      expect(SESSION_CONFIG.COKIE_SAME_SITE).toBe('strict');
    });

    it('should have cookie max age', () => {
      expect(SESSION_CONFIG.COKIE_MAX_AGE).toBe(24 * 60 * 60 * 1000);
    });
  });

  describe('Rate Limiters', () => {
    it('should create rate limiters', () => {
      const limiters = createRateLimiters();
      
      expect(limiters).toHaveProperty('general');
      expect(limiters).toHaveProperty('auth');
      expect(limiters).toHaveProperty('passwordReset');
      expect(limiters).toHaveProperty('fileUpload');
    });
  });

  describe('Speed Limiters', () => {
    it('should create speed limiters', () => {
      const limiters = createSpeedLimiters();
      
      expect(limiters).toHaveProperty('general');
      expect(limiters).toHaveProperty('auth');
    });
  });

  describe('Security Middleware', () => {
    let mockRequest: any;
    let mockResponse: any;
    let mockNext: any;

    beforeEach(() => {
      mockRequest = {
        headers: {},
        body: {},
      };
      mockResponse = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        setHeader: jest.fn(),
      };
      mockNext = jest.fn();
    });

    describe('validateTokenFormat', () => {
      it('should continue when no authorization header', () => {
        securityMiddleware.validateTokenFormat(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalled();
      });

      it('should continue when valid token format', () => {
        mockRequest.headers.authorization = 'Bearer valid.token.format';
        securityMiddleware.validateTokenFormat(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalled();
      });

      it('should return error for invalid token format', () => {
        mockRequest.headers.authorization = 'Bearer invalid-token-format';
        securityMiddleware.validateTokenFormat(mockRequest, mockResponse, mockNext);
        
        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({
          error: 'Invalid token format',
          message: 'Token must be provided in format: Bearer <token>',
        });
      });
    });

    describe('validateOrigin', () => {
      it('should continue when origin is allowed', () => {
        mockRequest.headers.origin = 'http://localhost:3000';
        securityMiddleware.validateOrigin(mockRequest, mockResponse, mockNext);
        expect(mockNext).toHaveBeenCalled();
      });

      it('should return error for disallowed origin', () => {
        mockRequest.headers.origin = 'http://malicious-site.com';
        securityMiddleware.validateOrigin(mockRequest, mockResponse, mockNext);
        
        expect(mockResponse.status).toHaveBeenCalledWith(403);
        expect(mockResponse.json).toHaveBeenCalledWith({
          error: 'Forbidden',
          message: 'Invalid request origin',
        });
      });
    });

    describe('sanitizeBody', () => {
      it('should remove dangerous properties from request body', () => {
        mockRequest.body = {
          normal: 'value',
          __proto__: 'dangerous',
          constructor: 'dangerous',
          prototype: 'dangerous',
        };
        
        securityMiddleware.sanitizeBody(mockRequest, mockResponse, mockNext);
        
        expect(mockRequest.body.__proto__).toBeUndefined();
        expect(mockRequest.body.constructor).toBeUndefined();
        expect(mockRequest.body.prototype).toBeUndefined();
        expect(mockRequest.body.normal).toBe('value');
        expect(mockNext).toHaveBeenCalled();
      });
    });

    describe('addSecurityHeaders', () => {
      it('should add security headers to response', () => {
        securityMiddleware.addSecurityHeaders(mockRequest, mockResponse, mockNext);
        
        expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
        expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
        expect(mockResponse.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
        expect(mockResponse.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
        expect(mockResponse.setHeader).toHaveBeenCalledWith(
          'Permissions-Policy',
          'camera=(), microphone=(), geolocation=(), payment=()'
        );
        expect(mockNext).toHaveBeenCalled();
      });
    });
  });

  describe('Password Validation', () => {
    it('should validate strong password', () => {
      const result = validatePassword('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password that is too short', () => {
      const result = validatePassword('Short1!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password that is too long', () => {
      const longPassword = 'a'.repeat(129);
      const result = validatePassword(longPassword);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be no more than 128 characters long');
    });

    it('should reject password without uppercase', () => {
      const result = validatePassword('lowercase123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase', () => {
      const result = validatePassword('UPPERCASE123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without numbers', () => {
      const result = validatePassword('NoNumbers!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special characters', () => {
      const result = validatePassword('NoSpecialChars123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should reject password with disallowed words', () => {
      const result = validatePassword('MyPassword123!');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password cannot contain common words like "password"');
    });

    it('should reject multiple password policy violations', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('Token Blacklist', () => {
    beforeEach(() => {
      // Clear the blacklist before each test
      tokenBlacklist.clear();
    });

    it('should add token to blacklist', () => {
      const token = 'test-token';
      blacklistToken(token);
      expect(tokenBlacklist.has(token)).toBe(true);
    });

    it('should check if token is blacklisted', () => {
      const token = 'test-token';
      expect(isTokenBlacklisted(token)).toBe(false);
      
      blacklistToken(token);
      expect(isTokenBlacklisted(token)).toBe(true);
    });

    it('should clean up token blacklist', () => {
      const token1 = 'token1';
      const token2 = 'token2';
      
      blacklistToken(token1);
      blacklistToken(token2);
      
      expect(tokenBlacklist.size).toBe(2);
      
      cleanupTokenBlacklist();
      
      expect(tokenBlacklist.size).toBe(0);
    });
  });
}); 