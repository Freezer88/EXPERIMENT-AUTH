import request from 'supertest';
import app from '../../../src/app';
import { invitationService } from '../../../src/modules/accounts/invitation.service';
import { accountService } from '../../../src/modules/accounts/account.service';

// Mock the auth middleware to simulate authenticated user
jest.mock('../../../src/middlewares/auth.middleware', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = { userId: 'test-user-id', email: 'test@example.com' };
    next();
  },
}));

// Mock the account service
jest.mock('../../../src/modules/accounts/account.service', () => ({
  accountService: {
    getAccountById: jest.fn(),
    getAccountMembers: jest.fn(),
    inviteMember: jest.fn(),
  },
}));

// Mock the invitation service
jest.mock('../../../src/modules/accounts/invitation.service', () => ({
  invitationService: {
    createInvitation: jest.fn(),
    getInvitationsForAccount: jest.fn(),
    getInvitationByToken: jest.fn(),
    acceptInvitation: jest.fn(),
    cancelInvitation: jest.fn(),
    resendInvitation: jest.fn(),
  },
}));

describe('Invitation Management', () => {
  // Set timeout for all tests
  jest.setTimeout(10000);

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any remaining timers or async operations
    jest.clearAllTimers();
  });

  afterAll(() => {
    // Clean up any remaining handles
    jest.clearAllMocks();
  });

  describe('POST /api/accounts/:accountId/invitations', () => {
    it('should create invitation successfully', async () => {
      const mockAccount = {
        id: 'test-account-id',
        name: 'Test Account',
        ownerUserId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockInvitation = {
        id: 'test-invitation-id',
        accountId: 'test-account-id',
        email: 'invitee@example.com',
        role: 'viewer' as const,
        invitedBy: 'test-user-id',
        token: 'test-token-123',
        status: 'pending' as const,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (accountService.getAccountById as jest.Mock).mockResolvedValue(mockAccount);
      (accountService.getAccountMembers as jest.Mock).mockResolvedValue([
        { userId: 'test-user-id', role: 'owner' }
      ]);
      (invitationService.createInvitation as jest.Mock).mockResolvedValue(mockInvitation);

      const invitationData = {
        email: 'invitee@example.com',
        role: 'viewer',
        message: 'Welcome to our account!',
      };

      const response = await request(app)
        .post('/api/accounts/test-account-id/invitations')
        .send(invitationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.invitation).toBeDefined();
      expect(response.body.invitation.email).toBe('invitee@example.com');
      expect(response.body.invitation.role).toBe('viewer');
      expect(response.body.message).toBe('Invitation sent successfully');
      expect(invitationService.createInvitation).toHaveBeenCalledWith(
        'test-account-id',
        invitationData,
        'test-user-id'
      );
    });

    it('should return 400 when email is invalid', async () => {
      (invitationService.createInvitation as jest.Mock).mockRejectedValue(new Error('Invalid email format'));

      const response = await request(app)
        .post('/api/accounts/test-account-id/invitations')
        .send({
          email: 'invalid-email',
          role: 'viewer',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email format');
    });

    it('should return 400 when role is invalid', async () => {
      (invitationService.createInvitation as jest.Mock).mockRejectedValue(new Error('Invalid role specified'));

      const response = await request(app)
        .post('/api/accounts/test-account-id/invitations')
        .send({
          email: 'valid@example.com',
          role: 'invalid-role',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid role specified');
    });

    it('should return 400 when user already exists', async () => {
      (invitationService.createInvitation as jest.Mock).mockRejectedValue(new Error('User is already a member of this account'));

      const response = await request(app)
        .post('/api/accounts/test-account-id/invitations')
        .send({
          email: 'existing@example.com',
          role: 'viewer',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User is already a member of this account');
    });

    it('should return 400 when invitation already exists', async () => {
      (invitationService.createInvitation as jest.Mock).mockRejectedValue(new Error('An invitation already exists for this email'));

      const response = await request(app)
        .post('/api/accounts/test-account-id/invitations')
        .send({
          email: 'invited@example.com',
          role: 'viewer',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('An invitation already exists for this email');
    });
  });

  describe('GET /api/accounts/:accountId/invitations', () => {
    it('should return invitations for account successfully', async () => {
      const mockInvitations = [
        {
          id: 'invitation-1',
          accountId: 'test-account-id',
          email: 'user1@example.com',
          role: 'viewer' as const,
          invitedBy: 'test-user-id',
          token: 'token-1',
          status: 'pending' as const,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'invitation-2',
          accountId: 'test-account-id',
          email: 'user2@example.com',
          role: 'editor' as const,
          invitedBy: 'test-user-id',
          token: 'token-2',
          status: 'accepted' as const,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          createdAt: new Date(),
          updatedAt: new Date(),
          acceptedAt: new Date(),
          acceptedBy: 'user2-id',
        },
      ];

      (invitationService.getInvitationsForAccount as jest.Mock).mockResolvedValue(mockInvitations);

      const response = await request(app)
        .get('/api/accounts/test-account-id/invitations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.invitations).toBeDefined();
      expect(response.body.invitations).toHaveLength(2);
      expect(response.body.invitations[0].email).toBe('user1@example.com');
      expect(response.body.invitations[1].email).toBe('user2@example.com');
      expect(invitationService.getInvitationsForAccount).toHaveBeenCalledWith('test-account-id', 'test-user-id');
    });

    it('should return empty array when no invitations exist', async () => {
      (invitationService.getInvitationsForAccount as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/accounts/test-account-id/invitations')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.invitations).toBeDefined();
      expect(response.body.invitations).toHaveLength(0);
    });
  });

  describe('GET /api/accounts/invitations/:token', () => {
    it('should return invitation details successfully', async () => {
      const mockInvitation = {
        id: 'test-invitation-id',
        accountId: 'test-account-id',
        email: 'invitee@example.com',
        role: 'viewer' as const,
        invitedBy: 'test-user-id',
        token: 'test-token-123',
        status: 'pending' as const,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (invitationService.getInvitationByToken as jest.Mock).mockResolvedValue(mockInvitation);

      const response = await request(app)
        .get('/api/accounts/invitations/test-token-123')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.invitation).toBeDefined();
      expect(response.body.invitation.email).toBe('invitee@example.com');
      expect(response.body.invitation.role).toBe('viewer');
      expect(invitationService.getInvitationByToken).toHaveBeenCalledWith('test-token-123');
    });

    it('should return 404 when invitation not found', async () => {
      (invitationService.getInvitationByToken as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/accounts/invitations/invalid-token')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invitation not found');
    });
  });

  describe('POST /api/accounts/invitations/:token/accept', () => {
    it('should accept invitation successfully', async () => {
      (invitationService.acceptInvitation as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .post('/api/accounts/invitations/test-token-123/accept')
        .send({ userId: 'new-user-id' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Invitation accepted successfully');
      expect(invitationService.acceptInvitation).toHaveBeenCalledWith('test-token-123', 'new-user-id');
    });

    it('should return 400 when user ID is missing', async () => {
      const response = await request(app)
        .post('/api/accounts/invitations/test-token-123/accept')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User ID is required');
    });

    it('should return 400 when invitation is invalid', async () => {
      (invitationService.acceptInvitation as jest.Mock).mockRejectedValue(new Error('Invalid invitation token'));

      const response = await request(app)
        .post('/api/accounts/invitations/invalid-token/accept')
        .send({ userId: 'new-user-id' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid invitation token');
    });

    it('should return 400 when invitation has expired', async () => {
      (invitationService.acceptInvitation as jest.Mock).mockRejectedValue(new Error('Invitation has expired'));

      const response = await request(app)
        .post('/api/accounts/invitations/expired-token/accept')
        .send({ userId: 'new-user-id' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invitation has expired');
    });
  });

  describe('DELETE /api/accounts/invitations/:invitationId', () => {
    it('should cancel invitation successfully', async () => {
      (invitationService.cancelInvitation as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/api/accounts/invitations/test-invitation-id')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Invitation cancelled successfully');
      expect(invitationService.cancelInvitation).toHaveBeenCalledWith('test-invitation-id', 'test-user-id');
    });

    it('should return 400 when invitation not found', async () => {
      (invitationService.cancelInvitation as jest.Mock).mockRejectedValue(new Error('Invitation not found'));

      const response = await request(app)
        .delete('/api/accounts/invitations/non-existent-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invitation not found');
    });

    it('should return 400 when insufficient permissions', async () => {
      (invitationService.cancelInvitation as jest.Mock).mockRejectedValue(new Error('Insufficient permissions to cancel invitation'));

      const response = await request(app)
        .delete('/api/accounts/invitations/test-invitation-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions to cancel invitation');
    });
  });

  describe('POST /api/accounts/invitations/:invitationId/resend', () => {
    it('should resend invitation successfully', async () => {
      const mockResentInvitation = {
        id: 'test-invitation-id',
        accountId: 'test-account-id',
        email: 'invitee@example.com',
        role: 'viewer' as const,
        invitedBy: 'test-user-id',
        token: 'new-token-456',
        status: 'pending' as const,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (invitationService.resendInvitation as jest.Mock).mockResolvedValue(mockResentInvitation);

      const response = await request(app)
        .post('/api/accounts/invitations/test-invitation-id/resend')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.invitation).toBeDefined();
      expect(response.body.message).toBe('Invitation resent successfully');
      expect(invitationService.resendInvitation).toHaveBeenCalledWith('test-invitation-id', 'test-user-id');
    });

    it('should return 400 when invitation not found', async () => {
      (invitationService.resendInvitation as jest.Mock).mockRejectedValue(new Error('Invitation not found'));

      const response = await request(app)
        .post('/api/accounts/invitations/non-existent-id/resend')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invitation not found');
    });

    it('should return 400 when insufficient permissions', async () => {
      (invitationService.resendInvitation as jest.Mock).mockRejectedValue(new Error('Insufficient permissions to resend invitation'));

      const response = await request(app)
        .post('/api/accounts/invitations/test-invitation-id/resend')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions to resend invitation');
    });
  });
}); 