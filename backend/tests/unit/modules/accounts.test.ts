import request from 'supertest';
import app from '../../../src/app';

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
    createAccount: jest.fn(),
    getAccountsForUser: jest.fn(),
    getAccountById: jest.fn(),
    updateAccount: jest.fn(),
    deleteAccount: jest.fn(),
    inviteMember: jest.fn(),
    updateMemberRole: jest.fn(),
    removeMember: jest.fn(),
    getAccountMembers: jest.fn().mockResolvedValue([
      { userId: 'test-user-id', role: 'owner' }
    ]),
    updateAccountSettings: jest.fn(),
  },
}));

import { accountService } from '../../../src/modules/accounts/account.service';

describe('Account Management', () => {
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

  describe('POST /api/accounts', () => {
    it('should create a new account successfully', async () => {
      const accountData = {
        name: 'Test Account',
      };

      const mockAccount = {
        id: 'test-account-id',
        name: 'Test Account',
        ownerUserId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (accountService.createAccount as jest.Mock).mockResolvedValue(mockAccount);

      const response = await request(app)
        .post('/api/accounts')
        .send(accountData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.account).toBeDefined();
      expect(response.body.account.name).toBe('Test Account');
      expect(response.body.account.ownerUserId).toBe('test-user-id');
      expect(response.body.message).toBe('Account created successfully');
      expect(accountService.createAccount).toHaveBeenCalledWith(accountData, 'test-user-id');
    });

    it('should return 400 when account name is missing', async () => {
      (accountService.createAccount as jest.Mock).mockRejectedValue(new Error('Account name is required'));

      const response = await request(app)
        .post('/api/accounts')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account name is required');
    });

    it('should return 400 when account name is empty', async () => {
      (accountService.createAccount as jest.Mock).mockRejectedValue(new Error('Account name is required'));

      const response = await request(app)
        .post('/api/accounts')
        .send({ name: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account name is required');
    });

    it('should return 400 when account name is too long', async () => {
      (accountService.createAccount as jest.Mock).mockRejectedValue(new Error('Account name must be less than 255 characters'));

      const longName = 'a'.repeat(256);
      const response = await request(app)
        .post('/api/accounts')
        .send({ name: longName })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account name must be less than 255 characters');
    });

    it('should return 400 when user already has an account with the same name', async () => {
      (accountService.createAccount as jest.Mock).mockRejectedValue(new Error('You already have an account with this name'));

      const response = await request(app)
        .post('/api/accounts')
        .send({ name: 'Test Account' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('You already have an account with this name');
    });

    it('should trim whitespace from account name', async () => {
      const mockAccount = {
        id: 'test-account-id',
        name: 'Test Account',
        ownerUserId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (accountService.createAccount as jest.Mock).mockResolvedValue(mockAccount);

      const response = await request(app)
        .post('/api/accounts')
        .send({ name: '  Test Account  ' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.account.name).toBe('Test Account');
      expect(accountService.createAccount).toHaveBeenCalledWith({ name: '  Test Account  ' }, 'test-user-id');
    });
  });

  describe('GET /api/accounts', () => {
    it('should return user accounts successfully', async () => {
      const mockAccounts = [
        {
          account: {
            id: 'test-account-id',
            name: 'Test Account',
            ownerUserId: 'test-user-id',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          role: 'owner' as const,
        },
      ];

      (accountService.getAccountsForUser as jest.Mock).mockResolvedValue({
        accounts: mockAccounts,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });

      const response = await request(app)
        .get('/api/accounts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.accounts).toBeDefined();
      expect(response.body.accounts).toHaveLength(1);
      expect(response.body.accounts[0].name).toBe('Test Account');
      expect(response.body.accounts[0].role).toBe('owner');
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(1);
      expect(accountService.getAccountsForUser).toHaveBeenCalledWith('test-user-id', { name: undefined, role: undefined }, { page: 1, limit: 10 });
    });

    it('should return empty array when user has no accounts', async () => {
      (accountService.getAccountsForUser as jest.Mock).mockResolvedValue({
        accounts: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      });

      const response = await request(app)
        .get('/api/accounts')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.accounts).toBeDefined();
      expect(response.body.accounts).toHaveLength(0);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(0);
      expect(accountService.getAccountsForUser).toHaveBeenCalledWith('test-user-id', { name: undefined, role: undefined }, { page: 1, limit: 10 });
    });

    it('should filter accounts by name', async () => {
      const mockAccounts = [
        {
          account: {
            id: 'test-account-id',
            name: 'Test Account',
            ownerUserId: 'test-user-id',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          role: 'owner' as const,
        },
      ];

      (accountService.getAccountsForUser as jest.Mock).mockResolvedValue({
        accounts: mockAccounts,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });

      const response = await request(app)
        .get('/api/accounts?name=Test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.accounts).toHaveLength(1);
      expect(accountService.getAccountsForUser).toHaveBeenCalledWith('test-user-id', { name: 'Test', role: undefined }, { page: 1, limit: 10 });
    });

    it('should filter accounts by role', async () => {
      const mockAccounts = [
        {
          account: {
            id: 'test-account-id',
            name: 'Test Account',
            ownerUserId: 'test-user-id',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          role: 'owner' as const,
        },
      ];

      (accountService.getAccountsForUser as jest.Mock).mockResolvedValue({
        accounts: mockAccounts,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      });

      const response = await request(app)
        .get('/api/accounts?role=owner')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.accounts).toHaveLength(1);
      expect(accountService.getAccountsForUser).toHaveBeenCalledWith('test-user-id', { name: undefined, role: 'owner' }, { page: 1, limit: 10 });
    });

    it('should apply pagination correctly', async () => {
      const mockAccounts = [
        {
          account: {
            id: 'test-account-id',
            name: 'Test Account',
            ownerUserId: 'test-user-id',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          role: 'owner' as const,
        },
      ];

      (accountService.getAccountsForUser as jest.Mock).mockResolvedValue({
        accounts: mockAccounts,
        pagination: {
          page: 2,
          limit: 5,
          total: 10,
          totalPages: 2,
        },
      });

      const response = await request(app)
        .get('/api/accounts?page=2&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.total).toBe(10);
      expect(response.body.pagination.totalPages).toBe(2);
      expect(accountService.getAccountsForUser).toHaveBeenCalledWith('test-user-id', { name: undefined, role: undefined }, { page: 2, limit: 5 });
    });

    it('should return 400 for invalid page number', async () => {
      const response = await request(app)
        .get('/api/accounts?page=0')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Page number must be greater than 0');
    });

    it('should return 400 for invalid limit (too low)', async () => {
      const response = await request(app)
        .get('/api/accounts?limit=0')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Limit must be between 1 and 100');
    });

    it('should return 400 for invalid limit (too high)', async () => {
      const response = await request(app)
        .get('/api/accounts?limit=101')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Limit must be between 1 and 100');
    });

    it('should combine filters and pagination', async () => {
      const mockAccounts = [
        {
          account: {
            id: 'test-account-id',
            name: 'Test Account',
            ownerUserId: 'test-user-id',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          role: 'owner' as const,
        },
      ];

      (accountService.getAccountsForUser as jest.Mock).mockResolvedValue({
        accounts: mockAccounts,
        pagination: {
          page: 1,
          limit: 5,
          total: 1,
          totalPages: 1,
        },
      });

      const response = await request(app)
        .get('/api/accounts?name=Test&role=owner&page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(accountService.getAccountsForUser).toHaveBeenCalledWith(
        'test-user-id', 
        { name: 'Test', role: 'owner' }, 
        { page: 1, limit: 5 }
      );
    });
  });

  describe('GET /api/accounts/:accountId', () => {
    it('should return account details successfully', async () => {
      const mockAccount = {
        id: 'test-account-id',
        name: 'Test Account',
        ownerUserId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (accountService.getAccountById as jest.Mock).mockResolvedValue(mockAccount);

      const response = await request(app)
        .get('/api/accounts/test-account-id')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.account).toBeDefined();
      expect(response.body.account.id).toBe('test-account-id');
      expect(response.body.account.name).toBe('Test Account');
      expect(accountService.getAccountById).toHaveBeenCalledWith('test-account-id');
    });

    it('should return 404 when account not found', async () => {
      (accountService.getAccountById as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/accounts/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account not found');
      expect(accountService.getAccountById).toHaveBeenCalledWith('non-existent-id');
    });
  });

  describe('PUT /api/accounts/:accountId', () => {
    it('should update account name successfully', async () => {
      const mockUpdatedAccount = {
        id: 'test-account-id',
        name: 'Updated Account Name',
        ownerUserId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (accountService.updateAccount as jest.Mock).mockResolvedValue(mockUpdatedAccount);

      const response = await request(app)
        .put('/api/accounts/test-account-id')
        .send({ name: 'Updated Account Name' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.account.name).toBe('Updated Account Name');
      expect(response.body.message).toBe('Account updated successfully');
      expect(accountService.updateAccount).toHaveBeenCalledWith('test-account-id', { name: 'Updated Account Name' }, 'test-user-id');
    });

    it('should return 400 when account name is empty', async () => {
      (accountService.updateAccount as jest.Mock).mockRejectedValue(new Error('Account name cannot be empty'));

      const response = await request(app)
        .put('/api/accounts/test-account-id')
        .send({ name: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account name cannot be empty');
    });

    it('should return 400 when account name is too long', async () => {
      (accountService.updateAccount as jest.Mock).mockRejectedValue(new Error('Account name must be less than 255 characters'));

      const longName = 'a'.repeat(256);
      const response = await request(app)
        .put('/api/accounts/test-account-id')
        .send({ name: longName })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account name must be less than 255 characters');
    });
  });

  describe('PUT /api/accounts/:accountId/members/:userId/role', () => {
    it('should update member role successfully', async () => {
      (accountService.updateMemberRole as jest.Mock).mockResolvedValue(undefined);
      const response = await request(app)
        .put('/api/accounts/test-account-id/members/member-id/role')
        .send({ role: 'admin' })
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Member role updated successfully');
      expect(accountService.updateMemberRole).toHaveBeenCalledWith('test-account-id', 'member-id', 'admin', 'test-user-id');
    });
    it('should return 400 for insufficient permissions', async () => {
      // Mock the account service to return a viewer role (insufficient permissions)
      (accountService.getAccountMembers as jest.Mock).mockResolvedValue([
        { userId: 'test-user-id', role: 'viewer' }
      ]);
      (accountService.updateMemberRole as jest.Mock).mockRejectedValue(new Error('Insufficient permissions to update member roles'));
      const response = await request(app)
        .put('/api/accounts/test-account-id/members/member-id/role')
        .send({ role: 'admin' })
        .expect(403);
      expect(response.body.error).toBe('Forbidden');
      expect(response.body.message).toBe('Owner or admin role is required for this action');
    });
    it('should return 400 for invalid role', async () => {
      (accountService.updateMemberRole as jest.Mock).mockRejectedValue(new Error('Invalid role specified'));
      const response = await request(app)
        .put('/api/accounts/test-account-id/members/member-id/role')
        .send({ role: 'invalid-role' })
        .expect(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid role specified');
    });
    it('should return 400 for demoting only owner', async () => {
      (accountService.updateMemberRole as jest.Mock).mockRejectedValue(new Error('Cannot demote the only owner of the account'));
      const response = await request(app)
        .put('/api/accounts/test-account-id/members/member-id/role')
        .send({ role: 'admin' })
        .expect(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot demote the only owner of the account');
    });
  });
  describe('DELETE /api/accounts/:accountId/members/:userId', () => {
    it('should remove member successfully', async () => {
      (accountService.removeMember as jest.Mock).mockResolvedValue(undefined);
      const response = await request(app)
        .delete('/api/accounts/test-account-id/members/member-id')
        .expect(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Member removed successfully');
      expect(accountService.removeMember).toHaveBeenCalledWith('test-account-id', 'member-id', 'test-user-id');
    });
    it('should return 400 for insufficient permissions', async () => {
      // Mock the account service to return a viewer role (insufficient permissions)
      (accountService.getAccountMembers as jest.Mock).mockResolvedValue([
        { userId: 'test-user-id', role: 'viewer' }
      ]);
      (accountService.removeMember as jest.Mock).mockRejectedValue(new Error('Insufficient permissions to remove members'));
      const response = await request(app)
        .delete('/api/accounts/test-account-id/members/member-id')
        .expect(403);
      expect(response.body.error).toBe('Forbidden');
      expect(response.body.message).toBe('Owner or admin role is required for this action');
    });
    it('should return 400 for removing only owner', async () => {
      (accountService.removeMember as jest.Mock).mockRejectedValue(new Error('Cannot remove the only owner of the account'));
      const response = await request(app)
        .delete('/api/accounts/test-account-id/members/member-id')
        .expect(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot remove the only owner of the account');
    });
    it('should return 400 for removing yourself as only owner', async () => {
      (accountService.removeMember as jest.Mock).mockRejectedValue(new Error('Cannot remove yourself as the only owner'));
      const response = await request(app)
        .delete('/api/accounts/test-account-id/members/test-user-id')
        .expect(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot remove yourself as the only owner');
    });
  });

  describe('DELETE /api/accounts/:accountId', () => {
    it('should delete account successfully', async () => {
      (accountService.deleteAccount as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app)
        .delete('/api/accounts/test-account-id')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Account deleted successfully');
      expect(accountService.deleteAccount).toHaveBeenCalledWith('test-account-id', 'test-user-id');
    });
  });

  describe('PUT /api/accounts/:accountId/settings', () => {
    it('should update account settings successfully', async () => {
      const mockUpdatedAccount = {
        id: 'test-account-id',
        name: 'Updated Account Name',
        description: 'Updated description',
        ownerUserId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          notifications: {
            emailNotifications: true,
            pushNotifications: false,
          },
          privacy: {
            allowMemberInvites: true,
            allowPublicSharing: false,
          },
          preferences: {
            defaultCurrency: 'USD',
            timezone: 'UTC',
          },
        },
      };

      (accountService.updateAccountSettings as jest.Mock).mockResolvedValue(mockUpdatedAccount);

      const settingsUpdate = {
        settings: {
          name: 'Updated Account Name',
          description: 'Updated description',
          notifications: {
            emailNotifications: true,
            pushNotifications: false,
          },
          privacy: {
            allowMemberInvites: true,
            allowPublicSharing: false,
          },
          preferences: {
            defaultCurrency: 'USD',
            timezone: 'UTC',
          },
        },
      };

      const response = await request(app)
        .put('/api/accounts/test-account-id/settings')
        .send(settingsUpdate)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Account settings updated successfully');
      expect(response.body.account.name).toBe('Updated Account Name');
      expect(response.body.account.description).toBe('Updated description');
      expect(accountService.updateAccountSettings).toHaveBeenCalledWith('test-account-id', settingsUpdate.settings, 'test-user-id');
    });

    it('should return 400 when settings object is missing', async () => {
      const response = await request(app)
        .put('/api/accounts/test-account-id/settings')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Settings object is required');
    });

    it('should return 400 when settings object is empty', async () => {
      const response = await request(app)
        .put('/api/accounts/test-account-id/settings')
        .send({ settings: {} })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Settings object is required');
    });

    it('should return 400 for insufficient permissions', async () => {
      // Mock the account service to return a viewer role (insufficient permissions)
      (accountService.getAccountMembers as jest.Mock).mockResolvedValue([
        { userId: 'test-user-id', role: 'viewer' }
      ]);
      (accountService.updateAccountSettings as jest.Mock).mockRejectedValue(new Error('Insufficient permissions to update account settings'));
      
      const response = await request(app)
        .put('/api/accounts/test-account-id/settings')
        .send({ settings: { name: 'New Name' } })
        .expect(403);

      expect(response.body.error).toBe('Forbidden');
      expect(response.body.message).toBe('Owner or admin role is required for this action');
    });

    it('should return 400 for invalid account name', async () => {
      (accountService.updateAccountSettings as jest.Mock).mockRejectedValue(new Error('Account name cannot be empty'));
      
      const response = await request(app)
        .put('/api/accounts/test-account-id/settings')
        .send({ settings: { name: '' } })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account name cannot be empty');
    });

    it('should return 400 for account name too long', async () => {
      (accountService.updateAccountSettings as jest.Mock).mockRejectedValue(new Error('Account name must be less than 255 characters'));
      
      const longName = 'a'.repeat(256);
      const response = await request(app)
        .put('/api/accounts/test-account-id/settings')
        .send({ settings: { name: longName } })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account name must be less than 255 characters');
    });

    it('should return 400 for description too long', async () => {
      (accountService.updateAccountSettings as jest.Mock).mockRejectedValue(new Error('Account description must be less than 1000 characters'));
      
      const longDescription = 'a'.repeat(1001);
      const response = await request(app)
        .put('/api/accounts/test-account-id/settings')
        .send({ settings: { description: longDescription } })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account description must be less than 1000 characters');
    });

    it('should update only notification settings', async () => {
      const mockUpdatedAccount = {
        id: 'test-account-id',
        name: 'Test Account',
        ownerUserId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          notifications: {
            emailNotifications: true,
            pushNotifications: false,
          },
        },
      };

      (accountService.updateAccountSettings as jest.Mock).mockResolvedValue(mockUpdatedAccount);

      const response = await request(app)
        .put('/api/accounts/test-account-id/settings')
        .send({ 
          settings: { 
            notifications: {
              emailNotifications: true,
              pushNotifications: false,
            }
          } 
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.account.settings.notifications.emailNotifications).toBe(true);
      expect(response.body.account.settings.notifications.pushNotifications).toBe(false);
    });

    it('should update only privacy settings', async () => {
      const mockUpdatedAccount = {
        id: 'test-account-id',
        name: 'Test Account',
        ownerUserId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          privacy: {
            allowMemberInvites: true,
            allowPublicSharing: false,
            requireApprovalForChanges: true,
          },
        },
      };

      (accountService.updateAccountSettings as jest.Mock).mockResolvedValue(mockUpdatedAccount);

      const response = await request(app)
        .put('/api/accounts/test-account-id/settings')
        .send({ 
          settings: { 
            privacy: {
              allowMemberInvites: true,
              allowPublicSharing: false,
              requireApprovalForChanges: true,
            }
          } 
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.account.settings.privacy.allowMemberInvites).toBe(true);
      expect(response.body.account.settings.privacy.allowPublicSharing).toBe(false);
      expect(response.body.account.settings.privacy.requireApprovalForChanges).toBe(true);
    });

    it('should update only preferences', async () => {
      const mockUpdatedAccount = {
        id: 'test-account-id',
        name: 'Test Account',
        ownerUserId: 'test-user-id',
        createdAt: new Date(),
        updatedAt: new Date(),
        settings: {
          preferences: {
            defaultCurrency: 'EUR',
            timezone: 'Europe/London',
            language: 'en',
            dateFormat: 'DD/MM/YYYY',
          },
        },
      };

      (accountService.updateAccountSettings as jest.Mock).mockResolvedValue(mockUpdatedAccount);

      const response = await request(app)
        .put('/api/accounts/test-account-id/settings')
        .send({ 
          settings: { 
            preferences: {
              defaultCurrency: 'EUR',
              timezone: 'Europe/London',
              language: 'en',
              dateFormat: 'DD/MM/YYYY',
            }
          } 
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.account.settings.preferences.defaultCurrency).toBe('EUR');
      expect(response.body.account.settings.preferences.timezone).toBe('Europe/London');
      expect(response.body.account.settings.preferences.language).toBe('en');
      expect(response.body.account.settings.preferences.dateFormat).toBe('DD/MM/YYYY');
    });
  });
}); 