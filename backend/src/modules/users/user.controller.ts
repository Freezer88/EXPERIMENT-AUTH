import { Request, Response } from 'express';
import { UserService } from './user.service';
import { validateRequest } from '../common/validation/validator';
import { userRegistrationSchema, userProfileUpdateSchema, passwordChangeSchema } from '../common/validation/schemas';
import { generateTokenPair } from '../common/security/jwt';
import { logAuthAttempt } from '../../middlewares/auth.middleware';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = UserService.getInstance();
  }

  // Register a new user
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData = req.body;
      
      // Create user
      const newUser = await this.userService.createUser(userData);

      // Generate tokens
      const tokenPair = generateTokenPair({
        userId: newUser.id,
        email: newUser.email,
        accountId: undefined,
        role: 'user',
        permissions: ['read'],
      });

      // Log the registration attempt
      logAuthAttempt(req, res, () => {});

      res.status(201).json({
        message: 'User registered successfully',
        user: newUser,
        tokens: tokenPair,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          res.status(409).json({
            error: 'Conflict',
            message: error.message,
          });
        } else if (error.message.includes('Password validation failed')) {
          res.status(400).json({
            error: 'Bad Request',
            message: error.message,
          });
        } else {
          res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to register user',
          });
        }
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'An unexpected error occurred',
        });
      }
    }
  };

  // Get user profile
  getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const userProfile = await this.userService.getUserProfile(userId);
      if (!userProfile) {
        res.status(404).json({
          error: 'Not Found',
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        message: 'User profile retrieved successfully',
        user: userProfile,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve user profile',
      });
    }
  };

  // Update user profile
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const updateData = req.body;
      const updatedUser = await this.userService.updateUser(userId, updateData);

      res.status(200).json({
        message: 'User profile updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          res.status(404).json({
            error: 'Not Found',
            message: error.message,
          });
        } else {
          res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to update user profile',
          });
        }
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'An unexpected error occurred',
        });
      }
    }
  };

  // Change password
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not authenticated',
        });
        return;
      }

      const passwordData = req.body;
      await this.userService.changePassword(userId, passwordData);

      res.status(200).json({
        message: 'Password changed successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          res.status(404).json({
            error: 'Not Found',
            message: error.message,
          });
        } else if (error.message === 'Current password is incorrect') {
          res.status(400).json({
            error: 'Bad Request',
            message: error.message,
          });
        } else if (error.message.includes('Password validation failed')) {
          res.status(400).json({
            error: 'Bad Request',
            message: error.message,
          });
        } else if (error.message === 'New password must be different from current password') {
          res.status(400).json({
            error: 'Bad Request',
            message: error.message,
          });
        } else {
          res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to change password',
          });
        }
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'An unexpected error occurred',
        });
      }
    }
  };

  // Verify email
  verifyEmail = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token } = req.params;
      if (!token) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'Verification token is required',
        });
        return;
      }
      await this.userService.verifyEmail(token);

      res.status(200).json({
        message: 'Email verified successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid or expired verification token') {
          res.status(400).json({
            error: 'Bad Request',
            message: error.message,
          });
        } else {
          res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to verify email',
          });
        }
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'An unexpected error occurred',
        });
      }
    }
  };

  // Request password reset
  requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;
      await this.userService.requestPasswordReset(email);

      // Always return success to prevent email enumeration
      res.status(200).json({
        message: 'If an account with this email exists, a password reset link has been sent',
      });
    } catch (error) {
      // Always return success to prevent email enumeration
      res.status(200).json({
        message: 'If an account with this email exists, a password reset link has been sent',
      });
    }
  };

  // Reset password
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { token, password } = req.body;
      await this.userService.resetPassword(token, password);

      res.status(200).json({
        message: 'Password reset successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Invalid or expired reset token') {
          res.status(400).json({
            error: 'Bad Request',
            message: error.message,
          });
        } else if (error.message.includes('Password validation failed')) {
          res.status(400).json({
            error: 'Bad Request',
            message: error.message,
          });
        } else {
          res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to reset password',
          });
        }
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'An unexpected error occurred',
        });
      }
    }
  };

  // Get user statistics (admin only)
  getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.userService.getUserStats();

      res.status(200).json({
        message: 'User statistics retrieved successfully',
        stats,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to retrieve user statistics',
      });
    }
  };

  // Search users (admin only)
  searchUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);

      const result = await this.userService.searchUsers(filters, pageNum, limitNum);

      res.status(200).json({
        message: 'Users retrieved successfully',
        ...result,
      });
    } catch (error) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to search users',
      });
    }
  };

  // Delete user (admin only)
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'User ID is required',
        });
        return;
      }
      await this.userService.deleteUser(id);

      res.status(200).json({
        message: 'User deleted successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          res.status(404).json({
            error: 'Not Found',
            message: error.message,
          });
        } else {
          res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to delete user',
          });
        }
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'An unexpected error occurred',
        });
      }
    }
  };

  // Reactivate user (admin only)
  reactivateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          error: 'Bad Request',
          message: 'User ID is required',
        });
        return;
      }
      await this.userService.reactivateUser(id);

      res.status(200).json({
        message: 'User reactivated successfully',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          res.status(404).json({
            error: 'Not Found',
            message: error.message,
          });
        } else {
          res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to reactivate user',
          });
        }
      } else {
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'An unexpected error occurred',
        });
      }
    }
  };
} 