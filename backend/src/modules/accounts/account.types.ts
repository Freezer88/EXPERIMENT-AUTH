export interface CreateAccountRequest {
  name: string;
}

export interface Account {
  id: string;
  name: string;
  description?: string;
  ownerUserId: string;
  createdAt: Date;
  updatedAt: Date;
  settings?: AccountSettings;
}

export interface AccountMember {
  accountId: string;
  userId: string;
  role: AccountRole;
  invitedBy?: string;
  joinedAt: Date;
}

export type AccountRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'legal_advisor' | 'financial_advisor';

export interface AccountWithMembers extends Account {
  members: AccountMember[];
}

export interface CreateAccountResponse {
  success: boolean;
  account: Account;
  message?: string;
}

export interface GetAccountsResponse {
  success: boolean;
  accounts: Array<{
    id: string;
    name: string;
    role: AccountRole;
  }>;
}

export interface UpdateAccountRequest {
  name?: string;
}

export interface InviteMemberRequest {
  email: string;
  role: AccountRole;
}

export interface UpdateMemberRoleRequest {
  role: AccountRole;
}

export interface AccountSettings {
  name?: string;
  description?: string;
  notifications?: {
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    weeklyReports?: boolean;
    monthlyReports?: boolean;
  };
  privacy?: {
    allowMemberInvites?: boolean;
    allowPublicSharing?: boolean;
    requireApprovalForChanges?: boolean;
  };
  preferences?: {
    defaultCurrency?: string;
    timezone?: string;
    language?: string;
    dateFormat?: string;
  };
}

export interface UpdateAccountSettingsRequest {
  settings: Partial<AccountSettings>;
}

export interface AccountSettingsResponse {
  success: boolean;
  account: Account & {
    settings?: AccountSettings;
  };
  message?: string;
}

// Future access control for specialized roles
export interface AccountMemberPermissions {
  accountId: string;
  userId: string;
  role: AccountRole;
  accessPermissions?: {
    households?: string[]; // Array of household IDs this user can access
    documents?: string[]; // Array of document IDs this user can access
    inventory?: string[]; // Array of inventory item IDs this user can access
    policies?: string[]; // Array of policy IDs this user can access
    claims?: string[]; // Array of claim IDs this user can access
  };
} 