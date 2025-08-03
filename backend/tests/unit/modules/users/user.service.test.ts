import bcrypt from 'bcryptjs';
import { UserService } from '../../../../src/modules/users/user.service';
import { CreateUserRequest, ChangePasswordRequest } from '../../../../src/modules/users/user.types';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = UserService.getInstance();
    // Clear any existing users for test isolation
    userService.clearUsers();
  });

  describe('createUser', () => {
    const validUserData: CreateUserRequest = {
      email: 'test@example.com',
      password: 'StrongPass123!',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      acceptTerms: true,
      marketingConsent: false,
    };

    it('should create a new user successfully', async () => {
      const result = await userService.createUser(validUserData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.email).toBe('test@example.com');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.phoneNumber).toBe('+1234567890');
      expect(result.isEmailVerified).toBe(false);
      expect(result.marketingConsent).toBe(false);
      expect(result.createdAt).toBeInstanceOf(Date);
    });

    it('should sanitize email to lowercase', async () => {
      const userData = { ...validUserData, email: 'TEST@EXAMPLE.COM' };
      const result = await userService.createUser(userData);

      expect(result.email).toBe('test@example.com');
    });

    it('should sanitize phone number', async () => {
      const userData = { ...validUserData, phoneNumber: '(123) 456-7890' };
      const result = await userService.createUser(userData);

      expect(result.phoneNumber).toBe('1234567890');
    });

    it('should hash password securely', async () => {
      const result = await userService.createUser(validUserData);
      
      // Verify the user was created
      const user = await userService.findUserById(result.id);
      expect(user).toBeDefined();
      expect(user!.passwordHash).not.toBe(validUserData.password);
      
      // Verify password can be verified
      const isPasswordValid = await bcrypt.compare(validUserData.password, user!.passwordHash);
      expect(isPasswordValid).toBe(true);
    });

    it('should generate email verification token', async () => {
      const result = await userService.createUser(validUserData);
      
      const user = await userService.findUserById(result.id);
      expect(user!.emailVerificationToken).toBeDefined();
      expect(user!.emailVerificationExpires).toBeInstanceOf(Date);
      expect(user!.emailVerificationExpires!.getTime()).toBeGreaterThan(Date.now());
    });

    it('should throw error for duplicate email', async () => {
      await userService.createUser(validUserData);
      
      await expect(userService.createUser(validUserData)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    it('should throw error for weak password', async () => {
      const weakPasswordData = { ...validUserData, password: 'weak' };
      
      await expect(userService.createUser(weakPasswordData)).rejects.toThrow(
        'Password validation failed'
      );
    });

    it('should throw error for password without uppercase', async () => {
      const weakPasswordData = { ...validUserData, password: 'lowercase123!' };
      
      await expect(userService.createUser(weakPasswordData)).rejects.toThrow(
        'Password validation failed'
      );
    });

    it('should throw error for password without lowercase', async () => {
      const weakPasswordData = { ...validUserData, password: 'UPPERCASE123!' };
      
      await expect(userService.createUser(weakPasswordData)).rejects.toThrow(
        'Password validation failed'
      );
    });

    it('should throw error for password without numbers', async () => {
      const weakPasswordData = { ...validUserData, password: 'NoNumbers!' };
      
      await expect(userService.createUser(weakPasswordData)).rejects.toThrow(
        'Password validation failed'
      );
    });

    it('should throw error for password without special characters', async () => {
      const weakPasswordData = { ...validUserData, password: 'NoSpecialChars123' };
      
      await expect(userService.createUser(weakPasswordData)).rejects.toThrow(
        'Password validation failed'
      );
    });

    it('should throw error for password that is too short', async () => {
      const weakPasswordData = { ...validUserData, password: 'Short1!' };
      
      await expect(userService.createUser(weakPasswordData)).rejects.toThrow(
        'Password validation failed'
      );
    });

    it('should throw error for password that is too long', async () => {
      const longPassword = 'a'.repeat(129);
      const weakPasswordData = { ...validUserData, password: longPassword };
      
      await expect(userService.createUser(weakPasswordData)).rejects.toThrow(
        'Password validation failed'
      );
    });
  });

  describe('authenticateUser', () => {
    const userData: CreateUserRequest = {
      email: 'test@example.com',
      password: 'StrongPass123!',
      firstName: 'John',
      lastName: 'Doe',
      acceptTerms: true,
    };

    beforeEach(async () => {
      await userService.createUser(userData);
    });

    it('should authenticate user with correct credentials', async () => {
      const user = await userService.authenticateUser('test@example.com', 'StrongPass123!');
      
      expect(user).toBeDefined();
      expect(user!.email).toBe('test@example.com');
      expect(user!.lastLoginAt).toBeInstanceOf(Date);
    });

    it('should return null for incorrect password', async () => {
      const user = await userService.authenticateUser('test@example.com', 'WrongPassword123!');
      
      expect(user).toBeNull();
    });

    it('should return null for non-existent email', async () => {
      const user = await userService.authenticateUser('nonexistent@example.com', 'StrongPass123!');
      
      expect(user).toBeNull();
    });

    it('should return null for inactive user', async () => {
      // Create user and then deactivate
      const newUser = await userService.createUser({
        ...userData,
        email: 'inactive@example.com',
      });
      await userService.deleteUser(newUser.id);
      
      const user = await userService.authenticateUser('inactive@example.com', 'StrongPass123!');
      
      expect(user).toBeNull();
    });

    it('should handle email case insensitivity', async () => {
      const user = await userService.authenticateUser('TEST@EXAMPLE.COM', 'StrongPass123!');
      
      expect(user).toBeDefined();
      expect(user!.email).toBe('test@example.com');
    });
  });

  describe('updateUser', () => {
    let userId: string;

    beforeEach(async () => {
      const user = await userService.createUser({
        email: 'test@example.com',
        password: 'StrongPass123!',
        firstName: 'John',
        lastName: 'Doe',
        acceptTerms: true,
      });
      userId = user.id;
    });

    it('should update user profile successfully', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+1987654321',
        marketingConsent: true,
      };

      const result = await userService.updateUser(userId, updateData);

      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Smith');
      expect(result.phoneNumber).toBe('+1987654321');
      expect(result.marketingConsent).toBe(true);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should sanitize phone number during update', async () => {
      const updateData = {
        phoneNumber: '(987) 654-3210',
      };

      const result = await userService.updateUser(userId, updateData);

      expect(result.phoneNumber).toBe('9876543210');
    });

    it('should throw error for non-existent user', async () => {
      const updateData = { firstName: 'Jane' };

      await expect(userService.updateUser('non-existent-id', updateData)).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('changePassword', () => {
    let userId: string;

    beforeEach(async () => {
      const user = await userService.createUser({
        email: 'test@example.com',
        password: 'StrongPass123!',
        firstName: 'John',
        lastName: 'Doe',
        acceptTerms: true,
      });
      userId = user.id;
    });

    it('should change password successfully', async () => {
      const passwordData: ChangePasswordRequest = {
        currentPassword: 'StrongPass123!',
        newPassword: 'NewStrongPass456!',
        confirmNewPassword: 'NewStrongPass456!',
      };

      await expect(userService.changePassword(userId, passwordData)).resolves.not.toThrow();

      // Verify new password works
      const user = await userService.authenticateUser('test@example.com', 'NewStrongPass456!');
      expect(user).toBeDefined();
    });

    it('should throw error for incorrect current password', async () => {
      const passwordData: ChangePasswordRequest = {
        currentPassword: 'WrongPassword123!',
        newPassword: 'NewStrongPass456!',
        confirmNewPassword: 'NewStrongPass456!',
      };

      await expect(userService.changePassword(userId, passwordData)).rejects.toThrow(
        'Current password is incorrect'
      );
    });

    it('should throw error for weak new password', async () => {
      const passwordData: ChangePasswordRequest = {
        currentPassword: 'StrongPass123!',
        newPassword: 'weak',
        confirmNewPassword: 'weak',
      };

      await expect(userService.changePassword(userId, passwordData)).rejects.toThrow(
        'Password validation failed'
      );
    });

    it('should throw error when new password is same as current', async () => {
      const passwordData: ChangePasswordRequest = {
        currentPassword: 'StrongPass123!',
        newPassword: 'StrongPass123!',
        confirmNewPassword: 'StrongPass123!',
      };

      await expect(userService.changePassword(userId, passwordData)).rejects.toThrow(
        'New password must be different from current password'
      );
    });

    it('should throw error for non-existent user', async () => {
      const passwordData: ChangePasswordRequest = {
        currentPassword: 'StrongPass123!',
        newPassword: 'NewStrongPass456!',
        confirmNewPassword: 'NewStrongPass456!',
      };

      await expect(userService.changePassword('non-existent-id', passwordData)).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('verifyEmail', () => {
    let user: any;
    let verificationToken: string;

    beforeEach(async () => {
      const newUser = await userService.createUser({
        email: 'test@example.com',
        password: 'StrongPass123!',
        firstName: 'John',
        lastName: 'Doe',
        acceptTerms: true,
      });
      
      const fullUser = await userService.findUserById(newUser.id);
      user = fullUser;
      verificationToken = fullUser!.emailVerificationToken!;
    });

    it('should verify email successfully', async () => {
      await expect(userService.verifyEmail(verificationToken)).resolves.not.toThrow();

      const updatedUser = await userService.findUserById(user.id);
      expect(updatedUser!.isEmailVerified).toBe(true);
      expect(updatedUser!.emailVerificationToken).toBeUndefined();
      expect(updatedUser!.emailVerificationExpires).toBeUndefined();
    });

    it('should throw error for invalid token', async () => {
      await expect(userService.verifyEmail('invalid-token')).rejects.toThrow(
        'Invalid or expired verification token'
      );
    });

    it('should throw error for expired token', async () => {
      // Manually expire the token
      user.emailVerificationExpires = new Date(Date.now() - 1000);
      // Note: In a real implementation, this would be handled by the service

      await expect(userService.verifyEmail(verificationToken)).rejects.toThrow(
        'Invalid or expired verification token'
      );
    });
  });

  describe('password reset', () => {
    beforeEach(async () => {
      await userService.createUser({
        email: 'test@example.com',
        password: 'StrongPass123!',
        firstName: 'John',
        lastName: 'Doe',
        acceptTerms: true,
      });
    });

    it('should request password reset successfully', async () => {
      await expect(userService.requestPasswordReset('test@example.com')).resolves.not.toThrow();

      const user = await userService.findUserByEmail('test@example.com');
      expect(user!.passwordResetToken).toBeDefined();
      expect(user!.passwordResetExpires).toBeInstanceOf(Date);
      expect(user!.passwordResetExpires!.getTime()).toBeGreaterThan(Date.now());
    });

    it('should not reveal if email exists or not', async () => {
      await expect(userService.requestPasswordReset('nonexistent@example.com')).resolves.not.toThrow();
    });

    it('should reset password successfully with valid token', async () => {
      // Request password reset to get a token
      await userService.requestPasswordReset('test@example.com');
      
      const user = await userService.findUserByEmail('test@example.com');
      const resetToken = user!.passwordResetToken!;

      // Reset password with new password
      await expect(userService.resetPassword(resetToken, 'NewStrongPass456!')).resolves.not.toThrow();

      // Verify new password works
      const authenticatedUser = await userService.authenticateUser('test@example.com', 'NewStrongPass456!');
      expect(authenticatedUser).toBeDefined();
      expect(authenticatedUser!.email).toBe('test@example.com');

      // Verify reset token is cleared
      const updatedUser = await userService.findUserByEmail('test@example.com');
      expect(updatedUser!.passwordResetToken).toBeUndefined();
      expect(updatedUser!.passwordResetExpires).toBeUndefined();
    });

    it('should throw error for invalid reset token', async () => {
      await expect(userService.resetPassword('invalid-token', 'NewStrongPass456!')).rejects.toThrow(
        'Invalid or expired reset token'
      );
    });

    it('should throw error for expired reset token', async () => {
      // Request password reset
      await userService.requestPasswordReset('test@example.com');
      
      const user = await userService.findUserByEmail('test@example.com');
      if (!user) {
        throw new Error('User not found');
      }
      const resetToken = user.passwordResetToken!;

      // Manually expire the token
      user.passwordResetExpires = new Date(Date.now() - 1000);
      // Note: In a real implementation, this would be handled by the service

      await expect(userService.resetPassword(resetToken, 'NewStrongPass456!')).rejects.toThrow(
        'Invalid or expired reset token'
      );
    });

    it('should throw error for weak new password during reset', async () => {
      // Request password reset to get a token
      await userService.requestPasswordReset('test@example.com');
      
      const user = await userService.findUserByEmail('test@example.com');
      const resetToken = user!.passwordResetToken!;

      await expect(userService.resetPassword(resetToken, 'weak')).rejects.toThrow(
        'Password validation failed'
      );
    });

    it('should validate password strength during reset', async () => {
      // Request password reset to get a token
      await userService.requestPasswordReset('test@example.com');
      
      const user = await userService.findUserByEmail('test@example.com');
      const resetToken = user!.passwordResetToken!;

      // Test various weak passwords
      const weakPasswords = [
        'short', // too short
        'nouppercase123!', // no uppercase
        'NOLOWERCASE123!', // no lowercase
        'NoNumbers!', // no numbers
        'NoSpecialChars123', // no special characters
      ];

      for (const weakPassword of weakPasswords) {
        await expect(userService.resetPassword(resetToken, weakPassword)).rejects.toThrow(
          'Password validation failed'
        );
      }
    });
  });

  describe('getUserProfile', () => {
    let userId: string;

    beforeEach(async () => {
      const user = await userService.createUser({
        email: 'test@example.com',
        password: 'StrongPass123!',
        firstName: 'John',
        lastName: 'Doe',
        acceptTerms: true,
      });
      userId = user.id;
    });

    it('should return user profile without sensitive data', async () => {
      const profile = await userService.getUserProfile(userId);

      expect(profile).toBeDefined();
      expect(profile!.id).toBe(userId);
      expect(profile!.email).toBe('test@example.com');
      expect(profile!.firstName).toBe('John');
      expect(profile!.lastName).toBe('Doe');
      expect(profile!.isEmailVerified).toBe(false);
      expect(profile!.marketingConsent).toBe(false);
      expect(profile!.createdAt).toBeInstanceOf(Date);
      expect(profile!.updatedAt).toBeInstanceOf(Date);
      
      // Should not include sensitive data
      expect((profile as any).passwordHash).toBeUndefined();
      expect((profile as any).emailVerificationToken).toBeUndefined();
      expect((profile as any).passwordResetToken).toBeUndefined();
    });

    it('should return null for non-existent user', async () => {
      const profile = await userService.getUserProfile('non-existent-id');
      expect(profile).toBeNull();
    });
  });

  describe('getUserStats', () => {
    beforeEach(async () => {
      // Create multiple users for testing
      await userService.createUser({
        email: 'user1@example.com',
        password: 'StrongPass123!',
        firstName: 'User',
        lastName: 'One',
        acceptTerms: true,
      });

      await userService.createUser({
        email: 'user2@example.com',
        password: 'StrongPass123!',
        firstName: 'User',
        lastName: 'Two',
        acceptTerms: true,
      });

      // Verify one user's email
      const user1 = await userService.findUserByEmail('user1@example.com');
      if (user1) {
        await userService.verifyEmail(user1.emailVerificationToken!);
      }

      // Deactivate one user
      const user2 = await userService.findUserByEmail('user2@example.com');
      if (user2) {
        await userService.deleteUser(user2.id);
      }
    });

    it('should return correct user statistics', async () => {
      const stats = await userService.getUserStats();

      expect(stats.totalUsers).toBe(2);
      expect(stats.activeUsers).toBe(1);
      expect(stats.verifiedUsers).toBe(1);
      expect(stats.newUsersThisMonth).toBeGreaterThanOrEqual(2);
    });
  });

  describe('searchUsers', () => {
    beforeEach(async () => {
      // Create test users
      await userService.createUser({
        email: 'john.doe@example.com',
        password: 'StrongPass123!',
        firstName: 'John',
        lastName: 'Doe',
        acceptTerms: true,
      });

      await userService.createUser({
        email: 'jane.smith@example.com',
        password: 'StrongPass123!',
        firstName: 'Jane',
        lastName: 'Smith',
        acceptTerms: true,
      });
    });

    it('should return paginated results', async () => {
      const result = await userService.searchUsers({}, 1, 1);

      expect(result.users).toHaveLength(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(1);
      expect(result.pagination.total).toBeGreaterThanOrEqual(2);
      expect(result.pagination.totalPages).toBeGreaterThanOrEqual(2);
    });

    it('should filter by email', async () => {
      const result = await userService.searchUsers({ email: 'john' });

      expect(result.users.length).toBeGreaterThan(0);
      expect(result.users.every(user => user.email.includes('john'))).toBe(true);
    });

    it('should filter by first name', async () => {
      const result = await userService.searchUsers({ firstName: 'John' });

      expect(result.users.length).toBeGreaterThan(0);
      expect(result.users.every(user => user.firstName.includes('John'))).toBe(true);
    });

    it('should filter by last name', async () => {
      const result = await userService.searchUsers({ lastName: 'Doe' });

      expect(result.users.length).toBeGreaterThan(0);
      expect(result.users.every(user => user.lastName.includes('Doe'))).toBe(true);
    });
  });

  describe('deleteUser and reactivateUser', () => {
    let userId: string;

    beforeEach(async () => {
      const user = await userService.createUser({
        email: 'test@example.com',
        password: 'StrongPass123!',
        firstName: 'John',
        lastName: 'Doe',
        acceptTerms: true,
      });
      userId = user.id;
    });

    it('should soft delete user', async () => {
      await userService.deleteUser(userId);

      const user = await userService.findUserById(userId);
      expect(user!.isActive).toBe(false);
    });

    it('should reactivate user', async () => {
      await userService.deleteUser(userId);
      await userService.reactivateUser(userId);

      const user = await userService.findUserById(userId);
      expect(user!.isActive).toBe(true);
    });

    it('should throw error when deleting non-existent user', async () => {
      await expect(userService.deleteUser('non-existent-id')).rejects.toThrow('User not found');
    });

    it('should throw error when reactivating non-existent user', async () => {
      await expect(userService.reactivateUser('non-existent-id')).rejects.toThrow('User not found');
    });
  });
}); 