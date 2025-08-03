import { Request, Response } from 'express';
import { accountService } from './account.service';
import { CreateAccountRequest, UpdateAccountRequest, InviteMemberRequest, UpdateMemberRoleRequest, UpdateAccountSettingsRequest, AccountRole } from './account.types';

export class AccountController {
  async createAccount(req: Request, res: Response): Promise<void> {
    try {
      const { name }: CreateAccountRequest = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const account = await accountService.createAccount({ name }, userId);

      res.status(201).json({
        success: true,
        account,
        message: 'Account created successfully',
      });
    } catch (error) {
      console.error('Error creating account:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create account',
      });
    }
  }

  async getAccounts(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      // Parse query parameters
      const { name, role, page, limit } = req.query;
      
      const filters = {
        name: name as string | undefined,
        role: role as string | undefined,
      };

      // Validate role if provided
      if (filters.role && !['owner', 'admin', 'editor', 'viewer', 'legal_advisor', 'financial_advisor'].includes(filters.role)) {
        res.status(400).json({
          success: false,
          message: 'Invalid role specified',
        });
        return;
      }

      // Cast role to AccountRole type after validation
      const validatedFilters = {
        name: filters.name,
        role: filters.role as AccountRole | undefined,
      };

      const pagination = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
      };

      // Validate pagination parameters
      if (pagination.page < 1) {
        res.status(400).json({
          success: false,
          message: 'Page number must be greater than 0',
        });
        return;
      }

      if (pagination.limit < 1 || pagination.limit > 100) {
        res.status(400).json({
          success: false,
          message: 'Limit must be between 1 and 100',
        });
        return;
      }

      const result = await accountService.getAccountsForUser(userId, validatedFilters, pagination);

      res.status(200).json({
        success: true,
        accounts: result.accounts.map(({ account, role }) => ({
          id: account.id,
          name: account.name,
          role,
          createdAt: account.createdAt,
          updatedAt: account.updatedAt,
        })),
        pagination: result.pagination,
      });
    } catch (error) {
      console.error('Error getting accounts:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get accounts',
      });
    }
  }

  async getAccountById(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const account = await accountService.getAccountById(accountId);

      if (!account) {
        res.status(404).json({
          success: false,
          message: 'Account not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        account,
      });
    } catch (error) {
      console.error('Error getting account:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get account',
      });
    }
  }

  async updateAccount(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.params;
      const updates: UpdateAccountRequest = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const account = await accountService.updateAccount(accountId, updates, userId);

      res.status(200).json({
        success: true,
        account,
        message: 'Account updated successfully',
      });
    } catch (error) {
      console.error('Error updating account:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update account',
      });
    }
  }

  async deleteAccount(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      await accountService.deleteAccount(accountId, userId);

      res.status(200).json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete account',
      });
    }
  }

  async inviteMember(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.params;
      const { email, role }: InviteMemberRequest = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      await accountService.inviteMember(accountId, email, role, userId);

      res.status(200).json({
        success: true,
        message: 'Invitation sent successfully',
      });
    } catch (error) {
      console.error('Error inviting member:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to invite member',
      });
    }
  }

  async updateMemberRole(req: Request, res: Response): Promise<void> {
    try {
      const { accountId, userId: memberUserId } = req.params;
      const { role }: UpdateMemberRoleRequest = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      await accountService.updateMemberRole(accountId, memberUserId, role, userId);

      res.status(200).json({
        success: true,
        message: 'Member role updated successfully',
      });
    } catch (error) {
      console.error('Error updating member role:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update member role',
      });
    }
  }

  async removeMember(req: Request, res: Response): Promise<void> {
    try {
      const { accountId, userId: memberUserId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      await accountService.removeMember(accountId, memberUserId, userId);

      res.status(200).json({
        success: true,
        message: 'Member removed successfully',
      });
    } catch (error) {
      console.error('Error removing member:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove member',
      });
    }
  }

  async getAccountMembers(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      const members = await accountService.getAccountMembers(accountId, userId);

      res.status(200).json({
        success: true,
        members,
      });
    } catch (error) {
      console.error('Error getting account members:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get account members',
      });
    }
  }

  async updateAccountSettings(req: Request, res: Response): Promise<void> {
    try {
      const { accountId } = req.params;
      const { settings }: UpdateAccountSettingsRequest = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
        });
        return;
      }

      if (!settings || Object.keys(settings).length === 0) {
        res.status(400).json({
          success: false,
          message: 'Settings object is required',
        });
        return;
      }

      const updatedAccount = await accountService.updateAccountSettings(accountId, settings, userId);

      res.status(200).json({
        success: true,
        account: updatedAccount,
        message: 'Account settings updated successfully',
      });
    } catch (error) {
      console.error('Error updating account settings:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update account settings',
      });
    }
  }
}

export const accountController = new AccountController(); 