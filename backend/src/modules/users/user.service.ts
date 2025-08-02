import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
  User,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  UserProfile,
  ChangePasswordRequest,
  UserStats,
  UserSearchFilters,
  UserListResponse,
} from './user.types';
import { validatePasswordStrength } from '../common/validation/validator';
import { sanitizeEmail, sanitizePhoneNumber } from '../common/validation/validator';

// In-memory user storage for development (will be replaced with database)
const users: Map<string, User> = new Map();

export class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  // Hash password with bcrypt
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Compare password with hash
  private async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate verification token
  private generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate reset token
  private generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Create a new user
  async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    // Validate password strength
    const passwordValidation = validatePasswordStrength(userData.password);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.map(e => e.message).join(', ')}`);
    }

    // Sanitize email and phone number
    const sanitizedEmail = sanitizeEmail(userData.email);
    const sanitizedPhoneNumber = userData.phoneNumber ? sanitizePhoneNumber(userData.phoneNumber) : undefined;

    // Check if user already exists
    const existingUser = await this.findUserByEmail(sanitizedEmail);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await this.hashPassword(userData.password);

    // Generate email verification token
    const emailVerificationToken = this.generateVerificationToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user object
    const user: User = {
      id: crypto.randomUUID(),
      email: sanitizedEmail,
      firstName: userData.firstName.trim(),
      lastName: userData.lastName.trim(),
      phoneNumber: sanitizedPhoneNumber,
      passwordHash,
      isEmailVerified: false,
      emailVerificationToken,
      emailVerificationExpires,
      isActive: true,
      marketingConsent: userData.marketingConsent || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store user
    users.set(user.id, user);

    // Return user data without sensitive information
    const response: CreateUserResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      isEmailVerified: user.isEmailVerified,
      marketingConsent: user.marketingConsent,
      createdAt: user.createdAt,
    };

    return response;
  }

  // Find user by email
  async findUserByEmail(email: string): Promise<User | null> {
    const sanitizedEmail = sanitizeEmail(email);
    for (const user of users.values()) {
      if (user.email === sanitizedEmail) {
        return user;
      }
    }
    return null;
  }

  // Find user by ID
  async findUserById(id: string): Promise<User | null> {
    return users.get(id) || null;
  }

  // Authenticate user
  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findUserByEmail(email);
    if (!user || !user.isActive) {
      return null;
    }

    const isPasswordValid = await this.comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    // Update last login
    user.lastLoginAt = new Date();
    user.updatedAt = new Date();
    users.set(user.id, user);

    return user;
  }

  // Update user profile
  async updateUser(id: string, updateData: UpdateUserRequest): Promise<UpdateUserResponse> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Update fields if provided
    if (updateData.firstName !== undefined) {
      user.firstName = updateData.firstName.trim();
    }
    if (updateData.lastName !== undefined) {
      user.lastName = updateData.lastName.trim();
    }
    if (updateData.phoneNumber !== undefined) {
      user.phoneNumber = updateData.phoneNumber ? sanitizePhoneNumber(updateData.phoneNumber) : undefined;
    }
    if (updateData.marketingConsent !== undefined) {
      user.marketingConsent = updateData.marketingConsent;
    }

    user.updatedAt = new Date();
    users.set(user.id, user);

    // Return updated user data
    const response: UpdateUserResponse = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      isEmailVerified: user.isEmailVerified,
      marketingConsent: user.marketingConsent,
      updatedAt: user.updatedAt,
    };

    return response;
  }

  // Change user password
  async changePassword(id: string, passwordData: ChangePasswordRequest): Promise<void> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await this.comparePassword(passwordData.currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(passwordData.newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.map(e => e.message).join(', ')}`);
    }

    // Check if new password is different from current
    const isNewPasswordSame = await this.comparePassword(passwordData.newPassword, user.passwordHash);
    if (isNewPasswordSame) {
      throw new Error('New password must be different from current password');
    }

    // Hash new password
    const newPasswordHash = await this.hashPassword(passwordData.newPassword);
    user.passwordHash = newPasswordHash;
    user.updatedAt = new Date();

    users.set(user.id, user);
  }

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    const user = Array.from(users.values()).find(u => 
      u.emailVerificationToken === token && 
      u.emailVerificationExpires && 
      u.emailVerificationExpires > new Date()
    );

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.updatedAt = new Date();

    users.set(user.id, user);
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      return;
    }

    const resetToken = this.generateResetToken();
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    user.updatedAt = new Date();

    users.set(user.id, user);

    // TODO: Send email with reset token
    console.log(`Password reset token for ${email}: ${resetToken}`);
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = Array.from(users.values()).find(u => 
      u.passwordResetToken === token && 
      u.passwordResetExpires && 
      u.passwordResetExpires > new Date()
    );

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.map(e => e.message).join(', ')}`);
    }

    // Hash new password
    const newPasswordHash = await this.hashPassword(newPassword);
    user.passwordHash = newPasswordHash;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.updatedAt = new Date();

    users.set(user.id, user);
  }

  // Get user profile
  async getUserProfile(id: string): Promise<UserProfile | null> {
    const user = await this.findUserById(id);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      isEmailVerified: user.isEmailVerified,
      marketingConsent: user.marketingConsent,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  // Get user statistics
  async getUserStats(): Promise<UserStats> {
    const allUsers = Array.from(users.values());
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      totalUsers: allUsers.length,
      activeUsers: allUsers.filter(u => u.isActive).length,
      verifiedUsers: allUsers.filter(u => u.isEmailVerified).length,
      newUsersThisMonth: allUsers.filter(u => u.createdAt >= thisMonth).length,
    };
  }

  // Search users
  async searchUsers(filters: UserSearchFilters, page: number = 1, limit: number = 10): Promise<UserListResponse> {
    let filteredUsers = Array.from(users.values());

    // Apply filters
    if (filters.email) {
      const sanitizedEmail = sanitizeEmail(filters.email);
      filteredUsers = filteredUsers.filter(u => u.email.includes(sanitizedEmail));
    }

    if (filters.firstName) {
      filteredUsers = filteredUsers.filter(u => 
        u.firstName.toLowerCase().includes(filters.firstName!.toLowerCase())
      );
    }

    if (filters.lastName) {
      filteredUsers = filteredUsers.filter(u => 
        u.lastName.toLowerCase().includes(filters.lastName!.toLowerCase())
      );
    }

    if (filters.isEmailVerified !== undefined) {
      filteredUsers = filteredUsers.filter(u => u.isEmailVerified === filters.isEmailVerified);
    }

    if (filters.isActive !== undefined) {
      filteredUsers = filteredUsers.filter(u => u.isActive === filters.isActive);
    }

    if (filters.createdAt) {
      if (filters.createdAt.from) {
        filteredUsers = filteredUsers.filter(u => u.createdAt >= filters.createdAt!.from!);
      }
      if (filters.createdAt.to) {
        filteredUsers = filteredUsers.filter(u => u.createdAt <= filters.createdAt!.to!);
      }
    }

    // Sort by creation date (newest first)
    filteredUsers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Pagination
    const total = filteredUsers.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    // Convert to UserProfile
    const userProfiles: UserProfile[] = paginatedUsers.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      isEmailVerified: user.isEmailVerified,
      marketingConsent: user.marketingConsent,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    return {
      users: userProfiles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  // Delete user (soft delete)
  async deleteUser(id: string): Promise<void> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = false;
    user.updatedAt = new Date();

    users.set(user.id, user);
  }

  // Reactivate user
  async reactivateUser(id: string): Promise<void> {
    const user = await this.findUserById(id);
    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = true;
    user.updatedAt = new Date();

    users.set(user.id, user);
  }
} 