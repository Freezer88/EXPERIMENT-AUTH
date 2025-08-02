import jwt from 'jsonwebtoken';
import {
  generateToken,
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  getTokenExpiration,
  isTokenExpired,
  getTokenPayload,
  generateTokenPair,
  refreshTokenPair,
  extractTokenFromHeader,
  validateTokenFormat,
  getTokenType,
  tokenUtils,
} from '../../../../../src/modules/common/security/jwt';
import { JWT_CONFIG } from '../../../../../src/config/security';

// Mock the security config
jest.mock('../../../../../src/config/security', () => ({
  JWT_CONFIG: {
    ACCESS_TOKEN_SECRET: 'test-access-secret',
    REFRESH_TOKEN_SECRET: 'test-refresh-secret',
    ACCESS_TOKEN_EXPIRES_IN: '15m',
    REFRESH_TOKEN_EXPIRES_IN: '7d',
    ISSUER: 'test-issuer',
    AUDIENCE: 'test-audience',
  },
  isTokenBlacklisted: jest.fn().mockReturnValue(false),
}));

describe('JWT Utilities', () => {
  const mockPayload = {
    userId: 'user123',
    email: 'test@example.com',
    accountId: 'account123',
    role: 'user',
    permissions: ['read', 'write'],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate an access token with correct payload', () => {
      const token = generateToken(mockPayload, 'access');
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decoded = jwt.decode(token) as any;
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.accountId).toBe(mockPayload.accountId);
      expect(decoded.role).toBe(mockPayload.role);
      expect(decoded.permissions).toEqual(mockPayload.permissions);
    });

    it('should generate a refresh token with correct payload', () => {
      const token = generateToken(mockPayload, 'refresh');
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decoded = jwt.decode(token) as any;
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
    });
  });

  describe('generateAccessToken', () => {
    it('should generate an access token', () => {
      const token = generateAccessToken(mockPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decoded = jwt.decode(token) as any;
      expect(decoded.userId).toBe(mockPayload.userId);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token', () => {
      const token = generateRefreshToken(mockPayload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      const decoded = jwt.decode(token) as any;
      expect(decoded.userId).toBe(mockPayload.userId);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken(mockPayload);
      const payload = verifyToken(token, 'access');
      
      expect(payload.userId).toBe(mockPayload.userId);
      expect(payload.email).toBe(mockPayload.email);
    });

    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(mockPayload);
      const payload = verifyToken(token, 'refresh');
      
      expect(payload.userId).toBe(mockPayload.userId);
      expect(payload.email).toBe(mockPayload.email);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        verifyToken('invalid-token', 'access');
      }).toThrow('Invalid token');
    });

    it('should throw error for expired token', () => {
      const expiredToken = jwt.sign(
        { ...mockPayload },
        JWT_CONFIG.ACCESS_TOKEN_SECRET,
        { expiresIn: '1s' }
      );
      
      // Wait for token to expire
      setTimeout(() => {
        expect(() => {
          verifyToken(expiredToken, 'access');
        }).toThrow('Token has expired');
      }, 1100);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const token = generateAccessToken(mockPayload);
      const payload = verifyAccessToken(token);
      
      expect(payload.userId).toBe(mockPayload.userId);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', () => {
      const token = generateRefreshToken(mockPayload);
      const payload = verifyRefreshToken(token);
      
      expect(payload.userId).toBe(mockPayload.userId);
    });
  });

  describe('decodeToken', () => {
    it('should decode a valid token', () => {
      const token = generateAccessToken(mockPayload);
      const payload = decodeToken(token);
      
      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(mockPayload.userId);
    });

    it('should return null for invalid token', () => {
      const payload = decodeToken('invalid-token');
      expect(payload).toBeNull();
    });
  });

  describe('getTokenExpiration', () => {
    it('should return expiration date for valid token', () => {
      const token = generateAccessToken(mockPayload);
      const expiration = getTokenExpiration(token);
      
      expect(expiration).toBeInstanceOf(Date);
      expect(expiration!.getTime()).toBeGreaterThan(Date.now());
    });

    it('should return null for invalid token', () => {
      const expiration = getTokenExpiration('invalid-token');
      expect(expiration).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid token', () => {
      const token = generateAccessToken(mockPayload);
      const expired = isTokenExpired(token);
      
      expect(expired).toBe(false);
    });

    it('should return true for expired token', () => {
      const expiredToken = jwt.sign(
        { ...mockPayload, exp: Math.floor(Date.now() / 1000) - 3600 },
        JWT_CONFIG.ACCESS_TOKEN_SECRET
      );
      
      const expired = isTokenExpired(expiredToken);
      expect(expired).toBe(true);
    });
  });

  describe('getTokenPayload', () => {
    it('should extract payload from valid token', () => {
      const token = generateAccessToken(mockPayload);
      const payload = getTokenPayload(token);
      
      expect(payload).toBeDefined();
      expect(payload?.userId).toBe(mockPayload.userId);
      expect(payload?.email).toBe(mockPayload.email);
      expect(payload?.accountId).toBe(mockPayload.accountId);
      expect(payload?.role).toBe(mockPayload.role);
      expect(payload?.permissions).toEqual(mockPayload.permissions);
    });

    it('should return null for invalid token', () => {
      const payload = getTokenPayload('invalid-token');
      expect(payload).toBeNull();
    });
  });

  describe('generateTokenPair', () => {
    it('should generate access and refresh tokens', () => {
      const tokenPair = generateTokenPair(mockPayload);
      
      expect(tokenPair.accessToken).toBeDefined();
      expect(tokenPair.refreshToken).toBeDefined();
      expect(tokenPair.accessTokenExpiresIn).toBe(JWT_CONFIG.ACCESS_TOKEN_EXPIRES_IN);
      expect(tokenPair.refreshTokenExpiresIn).toBe(JWT_CONFIG.REFRESH_TOKEN_EXPIRES_IN);
      
      // Verify tokens are different
      expect(tokenPair.accessToken).not.toBe(tokenPair.refreshToken);
    });
  });

  describe('refreshTokenPair', () => {
    it('should generate new token pair from refresh token', () => {
      const originalPair = generateTokenPair(mockPayload);
      const newPair = refreshTokenPair(originalPair.refreshToken);
      
      expect(newPair.accessToken).toBeDefined();
      expect(newPair.refreshToken).toBeDefined();
      
      // Verify tokens are valid
      expect(() => verifyAccessToken(newPair.accessToken)).not.toThrow();
      expect(() => verifyRefreshToken(newPair.refreshToken)).not.toThrow();
    });

    it('should throw error for invalid refresh token', () => {
      expect(() => {
        refreshTokenPair('invalid-refresh-token');
      }).toThrow();
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from valid authorization header', () => {
      const token = 'valid-token';
      const header = `Bearer ${token}`;
      
      const extracted = extractTokenFromHeader(header);
      expect(extracted).toBe(token);
    });

    it('should return null for missing authorization header', () => {
      const extracted = extractTokenFromHeader(undefined);
      expect(extracted).toBeNull();
    });

    it('should return null for invalid authorization header format', () => {
      const extracted = extractTokenFromHeader('InvalidFormat token');
      expect(extracted).toBeNull();
    });

    it('should return null for authorization header without token', () => {
      const extracted = extractTokenFromHeader('Bearer ');
      expect(extracted).toBeNull();
    });
  });

  describe('validateTokenFormat', () => {
    it('should return true for valid JWT format', () => {
      const token = generateAccessToken(mockPayload);
      const isValid = validateTokenFormat(token);
      expect(isValid).toBe(true);
    });

    it('should return false for invalid JWT format', () => {
      const isValid = validateTokenFormat('invalid-token-format');
      expect(isValid).toBe(false);
    });

    it('should return false for empty token', () => {
      const isValid = validateTokenFormat('');
      expect(isValid).toBe(false);
    });
  });

  describe('getTokenType', () => {
    it('should identify access token correctly', () => {
      const token = generateAccessToken(mockPayload);
      const type = getTokenType(token);
      expect(type).toBe('access');
    });

    it('should identify refresh token correctly', () => {
      const token = generateRefreshToken(mockPayload);
      const type = getTokenType(token);
      expect(type).toBe('refresh');
    });
  });

  describe('tokenUtils', () => {
    describe('extractAndVerifyToken', () => {
      it('should extract and verify valid token', () => {
        const token = generateAccessToken(mockPayload);
        const header = `Bearer ${token}`;
        
        const payload = tokenUtils.extractAndVerifyToken(header, 'access');
        expect(payload.userId).toBe(mockPayload.userId);
      });

      it('should throw error for missing token', () => {
        expect(() => {
          tokenUtils.extractAndVerifyToken(undefined, 'access');
        }).toThrow('No token provided');
      });

      it('should throw error for invalid token format', () => {
        expect(() => {
          tokenUtils.extractAndVerifyToken('Bearer invalid-token', 'access');
        }).toThrow('Invalid token format');
      });
    });

    describe('isTokenValid', () => {
      it('should return true for valid token', () => {
        const token = generateAccessToken(mockPayload);
        const isValid = tokenUtils.isTokenValid(token, 'access');
        expect(isValid).toBe(true);
      });

      it('should return false for invalid token', () => {
        const isValid = tokenUtils.isTokenValid('invalid-token', 'access');
        expect(isValid).toBe(false);
      });
    });

    describe('getTokenInfo', () => {
      it('should return token information', () => {
        const token = generateAccessToken(mockPayload);
        const info = tokenUtils.getTokenInfo(token);
        
        expect(info.type).toBe('access');
        expect(info.payload).toBeDefined();
        expect(info.isExpired).toBe(false);
        expect(info.isBlacklisted).toBe(false);
        expect(info.expiration).toBeInstanceOf(Date);
      });
    });
  });
}); 