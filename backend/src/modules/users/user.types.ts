export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | undefined;
  passwordHash: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string | undefined;
  emailVerificationExpires?: Date | undefined;
  passwordResetToken?: string | undefined;
  passwordResetExpires?: Date | undefined;
  lastLoginAt?: Date | undefined;
  isActive: boolean;
  marketingConsent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  acceptTerms: boolean;
  marketingConsent?: boolean;
}

export interface CreateUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | undefined;
  isEmailVerified: boolean;
  marketingConsent: boolean;
  createdAt: Date;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  marketingConsent?: boolean;
}

export interface UpdateUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | undefined;
  isEmailVerified: boolean;
  marketingConsent: boolean;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | undefined;
  isEmailVerified: boolean;
  marketingConsent: boolean;
  lastLoginAt?: Date | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface EmailVerificationRequest {
  token: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  newUsersThisMonth: number;
}

export interface UserSearchFilters {
  email?: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  createdAt?: {
    from?: Date;
    to?: Date;
  };
}

export interface UserListResponse {
  users: UserProfile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
} 