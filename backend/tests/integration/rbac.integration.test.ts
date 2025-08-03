import request from 'supertest';
import { app } from '../../src/app';
import { accountService } from '../../src/modules/accounts/account.service';

// Mock the account service
jest.mock('../../src/modules/accounts/account.service', () => ({
  accountService: {
    createAccount: jest.fn(),
    getAccountsForUser: jest.fn(),
    getAccountById: jest.fn(),
    updateAccount: jest.fn(),
    deleteAccount: jest.fn(),
    inviteMember: jest.fn(),
    updateMemberRole: jest.fn(),
    removeMember: jest.fn(),
    getAccountMembers: jest.fn(),
    updateAccountSettings: jest.fn(),
  },
}));

describe('RBAC Integration Tests', () => {
  const mockAccountService = accountService as jest.Mocked<typeof accountService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Account Access Control', () => {
    it('should allow owner to access all account endpoints', async () => {
      // Mock owner permissions
      mockAccountService.getAccountMembers.mockResolvedValue([
        { userId: 'owner-user', role: 'owner' }
      ]);

      const token = 'valid-owner-token'; // In real test, this would be a valid JWT

      // Test account creation
      mockAccountService.createAccount.mockResolvedValue({
        id: 'account-1',
        name: 'Test Account',
        ownerUserId: 'owner-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const createResponse = await request(app)
        .post('/api/accounts')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test Account' });

      expect(createResponse.status).toBe(201);

      // Test account settings update
      mockAccountService.updateAccountSettings.mockResolvedValue({
        id: 'account-1',
        name: 'Updated Account',
        ownerUserId: 'owner-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const settingsResponse = await request(app)
        .put('/api/accounts/account-1/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ settings: { name: 'Updated Account' } });

      expect(settingsResponse.status).toBe(200);

      // Test member management
      mockAccountService.inviteMember.mockResolvedValue(undefined);

      const inviteResponse = await request(app)
        .post('/api/accounts/account-1/members/invite')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'test@example.com', role: 'viewer' });

      expect(inviteResponse.status).toBe(200);
    });

    it('should allow admin to access most account endpoints', async () => {
      // Mock admin permissions
      mockAccountService.getAccountMembers.mockResolvedValue([
        { userId: 'admin-user', role: 'admin' }
      ]);

      const token = 'valid-admin-token';

      // Test account settings update (admin should have access)
      mockAccountService.updateAccountSettings.mockResolvedValue({
        id: 'account-1',
        name: 'Updated Account',
        ownerUserId: 'owner-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const settingsResponse = await request(app)
        .put('/api/accounts/account-1/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ settings: { name: 'Updated Account' } });

      expect(settingsResponse.status).toBe(200);

      // Test member management (admin should have access)
      mockAccountService.inviteMember.mockResolvedValue(undefined);

      const inviteResponse = await request(app)
        .post('/api/accounts/account-1/members/invite')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'test@example.com', role: 'viewer' });

      expect(inviteResponse.status).toBe(200);
    });

    it('should deny viewer access to management endpoints', async () => {
      // Mock viewer permissions
      mockAccountService.getAccountMembers.mockResolvedValue([
        { userId: 'viewer-user', role: 'viewer' }
      ]);

      const token = 'valid-viewer-token';

      // Test account settings update (viewer should be denied)
      const settingsResponse = await request(app)
        .put('/api/accounts/account-1/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({ settings: { name: 'Updated Account' } });

      expect(settingsResponse.status).toBe(403);

      // Test member invitation (viewer should be denied)
      const inviteResponse = await request(app)
        .post('/api/accounts/account-1/members/invite')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'test@example.com', role: 'viewer' });

      expect(inviteResponse.status).toBe(403);
    });

    it('should allow viewer to access read-only endpoints', async () => {
      // Mock viewer permissions
      mockAccountService.getAccountMembers.mockResolvedValue([
        { userId: 'viewer-user', role: 'viewer' }
      ]);

      const token = 'valid-viewer-token';

      // Test account details access (viewer should have access)
      mockAccountService.getAccountById.mockResolvedValue({
        id: 'account-1',
        name: 'Test Account',
        ownerUserId: 'owner-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const accountResponse = await request(app)
        .get('/api/accounts/account-1')
        .set('Authorization', `Bearer ${token}`);

      expect(accountResponse.status).toBe(200);

      // Test member list access (viewer should have access)
      mockAccountService.getAccountMembers.mockResolvedValue([
        { userId: 'owner-user', role: 'owner' },
        { userId: 'viewer-user', role: 'viewer' }
      ]);

      const membersResponse = await request(app)
        .get('/api/accounts/account-1/members')
        .set('Authorization', `Bearer ${token}`);

      expect(membersResponse.status).toBe(200);
    });
  });

  describe('Member Management Access Control', () => {
    it('should allow owner to manage all members', async () => {
      mockAccountService.getAccountMembers.mockResolvedValue([
        { userId: 'owner-user', role: 'owner' }
      ]);

      const token = 'valid-owner-token';

      // Test member role update
      mockAccountService.updateMemberRole.mockResolvedValue(undefined);

      const updateRoleResponse = await request(app)
        .put('/api/accounts/account-1/members/member-user/role')
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'admin' });

      expect(updateRoleResponse.status).toBe(200);

      // Test member removal
      mockAccountService.removeMember.mockResolvedValue(undefined);

      const removeResponse = await request(app)
        .delete('/api/accounts/account-1/members/member-user')
        .set('Authorization', `Bearer ${token}`);

      expect(removeResponse.status).toBe(200);
    });

    it('should allow admin to manage members', async () => {
      mockAccountService.getAccountMembers.mockResolvedValue([
        { userId: 'admin-user', role: 'admin' }
      ]);

      const token = 'valid-admin-token';

      // Test member role update
      mockAccountService.updateMemberRole.mockResolvedValue(undefined);

      const updateRoleResponse = await request(app)
        .put('/api/accounts/account-1/members/member-user/role')
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'editor' });

      expect(updateRoleResponse.status).toBe(200);

      // Test member removal
      mockAccountService.removeMember.mockResolvedValue(undefined);

      const removeResponse = await request(app)
        .delete('/api/accounts/account-1/members/member-user')
        .set('Authorization', `Bearer ${token}`);

      expect(removeResponse.status).toBe(200);
    });

    it('should deny editor access to member management', async () => {
      mockAccountService.getAccountMembers.mockResolvedValue([
        { userId: 'editor-user', role: 'editor' }
      ]);

      const token = 'valid-editor-token';

      // Test member role update (editor should be denied)
      const updateRoleResponse = await request(app)
        .put('/api/accounts/account-1/members/member-user/role')
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'viewer' });

      expect(updateRoleResponse.status).toBe(403);

      // Test member removal (editor should be denied)
      const removeResponse = await request(app)
        .delete('/api/accounts/account-1/members/member-user')
        .set('Authorization', `Bearer ${token}`);

      expect(removeResponse.status).toBe(403);
    });
  });

  describe('Account Settings Access Control', () => {
    it('should allow owner to update all settings', async () => {
      mockAccountService.getAccountMembers.mockResolvedValue([
        { userId: 'owner-user', role: 'owner' }
      ]);

      const token = 'valid-owner-token';

      mockAccountService.updateAccountSettings.mockResolvedValue({
        id: 'account-1',
        name: 'Updated Account',
        ownerUserId: 'owner-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .put('/api/accounts/account-1/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          settings: {
            name: 'Updated Account',
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
        });

      expect(response.status).toBe(200);
    });

    it('should allow admin to update settings', async () => {
      mockAccountService.getAccountMembers.mockResolvedValue([
        { userId: 'admin-user', role: 'admin' }
      ]);

      const token = 'valid-admin-token';

      mockAccountService.updateAccountSettings.mockResolvedValue({
        id: 'account-1',
        name: 'Updated Account',
        ownerUserId: 'owner-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .put('/api/accounts/account-1/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          settings: {
            notifications: {
              emailNotifications: true,
            },
          },
        });

      expect(response.status).toBe(200);
    });

    it('should deny editor access to settings', async () => {
      mockAccountService.getAccountMembers.mockResolvedValue([
        { userId: 'editor-user', role: 'editor' }
      ]);

      const token = 'valid-editor-token';

      const response = await request(app)
        .put('/api/accounts/account-1/settings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          settings: {
            name: 'Updated Account',
          },
        });

      expect(response.status).toBe(403);
    });
  });

  describe('Specialized Role Access Control', () => {
    it('should allow legal advisor to access legal documents', async () => {
      mockAccountService.getAccountMembers.mockResolvedValue([
        { userId: 'legal-user', role: 'legal_advisor' }
      ]);

      const token = 'valid-legal-token';

      // Legal advisors should have read access to account details
      mockAccountService.getAccountById.mockResolvedValue({
        id: 'account-1',
        name: 'Test Account',
        ownerUserId: 'owner-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .get('/api/accounts/account-1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it('should allow financial advisor to access financial documents', async () => {
      mockAccountService.getAccountMembers.mockResolvedValue([
        { userId: 'financial-user', role: 'financial_advisor' }
      ]);

      const token = 'valid-financial-token';

      // Financial advisors should have read access to account details
      mockAccountService.getAccountById.mockResolvedValue({
        id: 'account-1',
        name: 'Test Account',
        ownerUserId: 'owner-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await request(app)
        .get('/api/accounts/account-1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });

    it('should deny specialized roles access to management functions', async () => {
      // Test legal advisor
      mockAccountService.getAccountMembers.mockResolvedValue([
        { userId: 'legal-user', role: 'legal_advisor' }
      ]);

      const legalToken = 'valid-legal-token';

      const legalSettingsResponse = await request(app)
        .put('/api/accounts/account-1/settings')
        .set('Authorization', `Bearer ${legalToken}`)
        .send({ settings: { name: 'Updated Account' } });

      expect(legalSettingsResponse.status).toBe(403);

      // Test financial advisor
      mockAccountService.getAccountMembers.mockResolvedValue([
        { userId: 'financial-user', role: 'financial_advisor' }
      ]);

      const financialToken = 'valid-financial-token';

      const financialInviteResponse = await request(app)
        .post('/api/accounts/account-1/members/invite')
        .set('Authorization', `Bearer ${financialToken}`)
        .send({ email: 'test@example.com', role: 'viewer' });

      expect(financialInviteResponse.status).toBe(403);
    });
  });

  describe('Permission Inheritance', () => {
    it('should ensure higher roles inherit lower role permissions', async () => {
      const token = 'valid-admin-token';

      // Admin should have all permissions that viewer has
      mockAccountService.getAccountMembers.mockResolvedValue([
        { userId: 'admin-user', role: 'admin' }
      ]);

      // Test read access (inherited from viewer)
      mockAccountService.getAccountById.mockResolvedValue({
        id: 'account-1',
        name: 'Test Account',
        ownerUserId: 'owner-user',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const readResponse = await request(app)
        .get('/api/accounts/account-1')
        .set('Authorization', `Bearer ${token}`);

      expect(readResponse.status).toBe(200);

      // Test management access (admin-specific)
      mockAccountService.inviteMember.mockResolvedValue(undefined);

      const manageResponse = await request(app)
        .post('/api/accounts/account-1/members/invite')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'test@example.com', role: 'viewer' });

      expect(manageResponse.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing authentication token', async () => {
      const response = await request(app)
        .get('/api/accounts/account-1')
        .send();

      expect(response.status).toBe(401);
    });

    it('should handle invalid authentication token', async () => {
      const response = await request(app)
        .get('/api/accounts/account-1')
        .set('Authorization', 'Bearer invalid-token')
        .send();

      expect(response.status).toBe(401);
    });

    it('should handle user not found in account', async () => {
      mockAccountService.getAccountMembers.mockResolvedValue([]);

      const token = 'valid-token';

      const response = await request(app)
        .get('/api/accounts/account-1')
        .set('Authorization', `Bearer ${token}`)
        .send();

      expect(response.status).toBe(403);
    });
  });
}); 