import { Account, CreateAccountRequest, AccountMember, AccountRole } from './account.types';

// Mock database for now - will be replaced with Prisma
class AccountService {
  private accounts: Account[] = [];
  private accountMembers: AccountMember[] = [];

  async createAccount(request: CreateAccountRequest, ownerUserId: string): Promise<Account> {
    // Validate account name
    if (!request.name || request.name.trim().length === 0) {
      throw new Error('Account name is required');
    }

    if (request.name.length > 255) {
      throw new Error('Account name must be less than 255 characters');
    }

    // Check if user already owns an account with this name
    const existingAccount = this.accounts.find(
      account => account.ownerUserId === ownerUserId && account.name === request.name
    );

    if (existingAccount) {
      throw new Error('You already have an account with this name');
    }

    // Create new account
    const newAccount: Account = {
      id: this.generateId(),
      name: request.name.trim(),
      ownerUserId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.accounts.push(newAccount);

    // Add owner as first member with 'owner' role
    const ownerMember: AccountMember = {
      accountId: newAccount.id,
      userId: ownerUserId,
      role: 'owner',
      joinedAt: new Date(),
    };

    this.accountMembers.push(ownerMember);

    return newAccount;
  }

  async getAccountsForUser(
    userId: string, 
    filters?: {
      name?: string;
      role?: AccountRole;
    },
    pagination?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{
    accounts: Array<{ account: Account; role: AccountRole }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const userMemberships = this.accountMembers.filter(member => member.userId === userId);
    
    // Get accounts with user's role
    let accountsWithRoles = userMemberships.map(membership => {
      const account = this.accounts.find(acc => acc.id === membership.accountId);
      if (!account) {
        throw new Error(`Account ${membership.accountId} not found`);
      }
      return {
        account,
        role: membership.role,
      };
    });

    // Apply filters
    if (filters) {
      if (filters.name) {
        const nameFilter = filters.name.toLowerCase();
        accountsWithRoles = accountsWithRoles.filter(item => 
          item.account.name.toLowerCase().includes(nameFilter)
        );
      }

      if (filters.role) {
        accountsWithRoles = accountsWithRoles.filter(item => 
          item.role === filters.role
        );
      }
    }

    // Apply pagination
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 10;
    const total = accountsWithRoles.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedAccounts = accountsWithRoles.slice(startIndex, endIndex);

    return {
      accounts: paginatedAccounts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async getAccountById(accountId: string): Promise<Account | null> {
    return this.accounts.find(account => account.id === accountId) || null;
  }

  async updateAccount(accountId: string, updates: { name?: string }, userId: string): Promise<Account> {
    const account = this.accounts.find(acc => acc.id === accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    // Check if user has permission to update account (owner or admin)
    const membership = this.accountMembers.find(
      member => member.accountId === accountId && member.userId === userId
    );

    if (!membership || (membership.role !== 'owner' && membership.role !== 'admin')) {
      throw new Error('Insufficient permissions to update account');
    }

    // Update account
    if (updates.name) {
      if (updates.name.trim().length === 0) {
        throw new Error('Account name cannot be empty');
      }
      if (updates.name.length > 255) {
        throw new Error('Account name must be less than 255 characters');
      }
      account.name = updates.name.trim();
    }

    account.updatedAt = new Date();
    return account;
  }

  async deleteAccount(accountId: string, userId: string): Promise<void> {
    const account = this.accounts.find(acc => acc.id === accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    // Only owner can delete account
    if (account.ownerUserId !== userId) {
      throw new Error('Only the account owner can delete the account');
    }

    // Remove account and all memberships
    this.accounts = this.accounts.filter(acc => acc.id !== accountId);
    this.accountMembers = this.accountMembers.filter(member => member.accountId !== accountId);
  }

  async inviteMember(accountId: string, email: string, role: AccountRole, invitedBy: string): Promise<void> {
    const account = this.accounts.find(acc => acc.id === accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    // Check if inviter has permission (owner or admin)
    const inviterMembership = this.accountMembers.find(
      member => member.accountId === accountId && member.userId === invitedBy
    );

    if (!inviterMembership || (inviterMembership.role !== 'owner' && inviterMembership.role !== 'admin')) {
      throw new Error('Insufficient permissions to invite members');
    }

    // Validate role
    if (!this.isValidRole(role)) {
      throw new Error('Invalid role specified');
    }

    // For now, we'll just log the invitation
    // In a real implementation, this would send an email and create a pending invitation
    console.log(`Invitation sent to ${email} for role ${role} in account ${accountId}`);
  }

  async updateMemberRole(accountId: string, memberUserId: string, newRole: AccountRole, updatedBy: string): Promise<void> {
    const account = this.accounts.find(acc => acc.id === accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    // Check if updater has permission (owner or admin)
    const updaterMembership = this.accountMembers.find(
      member => member.accountId === accountId && member.userId === updatedBy
    );
    if (!updaterMembership || (updaterMembership.role !== 'owner' && updaterMembership.role !== 'admin')) {
      throw new Error('Insufficient permissions to update member roles');
    }

    // Find the member to update
    const memberIndex = this.accountMembers.findIndex(
      member => member.accountId === accountId && member.userId === memberUserId
    );
    if (memberIndex === -1) {
      throw new Error('Member not found');
    }

    // Prevent demoting the only owner
    const member = this.accountMembers[memberIndex];
    if (member.role === 'owner' && newRole !== 'owner') {
      const ownerCount = this.accountMembers.filter(m => m.accountId === accountId && m.role === 'owner').length;
      if (ownerCount === 1) {
        throw new Error('Cannot demote the only owner of the account');
      }
    }

    // Validate role
    if (!this.isValidRole(newRole)) {
      throw new Error('Invalid role specified');
    }

    // Update the role
    this.accountMembers[memberIndex].role = newRole;
    this.accountMembers[memberIndex].updatedAt = new Date();
    console.log(`[AUDIT] User ${updatedBy} updated role of member ${memberUserId} to ${newRole} in account ${accountId}`);
  }

  async removeMember(accountId: string, memberUserId: string, removedBy: string): Promise<void> {
    const account = this.accounts.find(acc => acc.id === accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    // Check if remover has permission (owner or admin)
    const removerMembership = this.accountMembers.find(
      member => member.accountId === accountId && member.userId === removedBy
    );
    if (!removerMembership || (removerMembership.role !== 'owner' && removerMembership.role !== 'admin')) {
      throw new Error('Insufficient permissions to remove members');
    }

    // Prevent removing the owner (or the only owner)
    const member = this.accountMembers.find(
      member => member.accountId === accountId && member.userId === memberUserId
    );
    if (!member) {
      throw new Error('Member not found');
    }
    if (member.role === 'owner') {
      const ownerCount = this.accountMembers.filter(m => m.accountId === accountId && m.role === 'owner').length;
      if (ownerCount === 1) {
        throw new Error('Cannot remove the only owner of the account');
      }
    }
    // Prevent removing yourself if you are the only owner
    if (removedBy === memberUserId && member.role === 'owner') {
      const ownerCount = this.accountMembers.filter(m => m.accountId === accountId && m.role === 'owner').length;
      if (ownerCount === 1) {
        throw new Error('Cannot remove yourself as the only owner');
      }
    }

    // Remove the member
    this.accountMembers = this.accountMembers.filter(
      member => !(member.accountId === accountId && member.userId === memberUserId)
    );
    console.log(`[AUDIT] User ${removedBy} removed member ${memberUserId} from account ${accountId}`);
  }

  async getAccountMembers(accountId: string, userId: string): Promise<AccountMember[]> {
    const account = this.accounts.find(acc => acc.id === accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    // Check if user has access to this account
    const userMembership = this.accountMembers.find(
      member => member.accountId === accountId && member.userId === userId
    );

    if (!userMembership) {
      throw new Error('Access denied to account');
    }

    return this.accountMembers.filter(member => member.accountId === accountId);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
  }

  async updateAccountSettings(accountId: string, settings: Partial<AccountSettings>, userId: string): Promise<Account> {
    const account = this.accounts.find(acc => acc.id === accountId);
    if (!account) {
      throw new Error('Account not found');
    }

    // Check if user has permission to update settings (owner or admin)
    const userMembership = this.accountMembers.find(
      member => member.accountId === accountId && member.userId === userId
    );
    if (!userMembership || (userMembership.role !== 'owner' && userMembership.role !== 'admin')) {
      throw new Error('Insufficient permissions to update account settings');
    }

    // Validate and update settings
    if (settings.name !== undefined) {
      if (settings.name.trim().length === 0) {
        throw new Error('Account name cannot be empty');
      }
      if (settings.name.length > 255) {
        throw new Error('Account name must be less than 255 characters');
      }
      account.name = settings.name.trim();
    }

    if (settings.description !== undefined) {
      if (settings.description.length > 1000) {
        throw new Error('Account description must be less than 1000 characters');
      }
      account.description = settings.description;
    }

    // Initialize settings if not exists
    if (!account.settings) {
      account.settings = {};
    }

    // Update notification settings
    if (settings.notifications) {
      account.settings.notifications = {
        ...account.settings.notifications,
        ...settings.notifications,
      };
    }

    // Update privacy settings
    if (settings.privacy) {
      account.settings.privacy = {
        ...account.settings.privacy,
        ...settings.privacy,
      };
    }

    // Update preferences
    if (settings.preferences) {
      account.settings.preferences = {
        ...account.settings.preferences,
        ...settings.preferences,
      };
    }

    account.updatedAt = new Date();
    console.log(`[AUDIT] User ${userId} updated settings for account ${accountId}`);

    return account;
  }

  private isValidRole(role: string): role is AccountRole {
    const validRoles: AccountRole[] = ['owner', 'admin', 'editor', 'viewer', 'legal_advisor', 'financial_advisor'];
    return validRoles.includes(role as AccountRole);
  }
}

export const accountService = new AccountService(); 