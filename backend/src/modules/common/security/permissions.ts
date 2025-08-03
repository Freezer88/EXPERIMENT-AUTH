// Permission constants for the RBAC system
export const PERMISSIONS = {
  // Account-level permissions
  ACCOUNT_READ: 'account:read',
  ACCOUNT_WRITE: 'account:write',
  ACCOUNT_DELETE: 'account:delete',
  ACCOUNT_MANAGE_MEMBERS: 'account:manage_members',
  
  // Household permissions
  HOUSEHOLD_READ: 'household:read',
  HOUSEHOLD_WRITE: 'household:write',
  HOUSEHOLD_DELETE: 'household:delete',
  
  // Document permissions
  DOCUMENT_READ: 'document:read',
  DOCUMENT_WRITE: 'document:write',
  DOCUMENT_DELETE: 'document:delete',
  
  // Inventory permissions
  INVENTORY_READ: 'inventory:read',
  INVENTORY_WRITE: 'inventory:write',
  INVENTORY_DELETE: 'inventory:delete',
  
  // Policy permissions
  POLICY_READ: 'policy:read',
  POLICY_WRITE: 'policy:write',
  POLICY_DELETE: 'policy:delete',
  
  // Claim permissions
  CLAIM_READ: 'claim:read',
  CLAIM_WRITE: 'claim:write',
  CLAIM_DELETE: 'claim:delete',
  
  // AI processing permissions
  AI_PROCESS: 'ai:process',
  AI_READ_RESULTS: 'ai:read_results',
  
  // Export permissions
  EXPORT_DATA: 'export:data',
  
  // Admin permissions
  ADMIN_ALL: 'admin:all',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// Role definitions with their associated permissions
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  owner: [
    PERMISSIONS.ACCOUNT_READ,
    PERMISSIONS.ACCOUNT_WRITE,
    PERMISSIONS.ACCOUNT_DELETE,
    PERMISSIONS.ACCOUNT_MANAGE_MEMBERS,
    PERMISSIONS.HOUSEHOLD_READ,
    PERMISSIONS.HOUSEHOLD_WRITE,
    PERMISSIONS.HOUSEHOLD_DELETE,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.DOCUMENT_WRITE,
    PERMISSIONS.DOCUMENT_DELETE,
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.INVENTORY_WRITE,
    PERMISSIONS.INVENTORY_DELETE,
    PERMISSIONS.POLICY_READ,
    PERMISSIONS.POLICY_WRITE,
    PERMISSIONS.POLICY_DELETE,
    PERMISSIONS.CLAIM_READ,
    PERMISSIONS.CLAIM_WRITE,
    PERMISSIONS.CLAIM_DELETE,
    PERMISSIONS.AI_PROCESS,
    PERMISSIONS.AI_READ_RESULTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.ADMIN_ALL,
  ],
  
  admin: [
    PERMISSIONS.ACCOUNT_READ,
    PERMISSIONS.ACCOUNT_WRITE,
    PERMISSIONS.ACCOUNT_MANAGE_MEMBERS,
    PERMISSIONS.HOUSEHOLD_READ,
    PERMISSIONS.HOUSEHOLD_WRITE,
    PERMISSIONS.HOUSEHOLD_DELETE,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.DOCUMENT_WRITE,
    PERMISSIONS.DOCUMENT_DELETE,
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.INVENTORY_WRITE,
    PERMISSIONS.INVENTORY_DELETE,
    PERMISSIONS.POLICY_READ,
    PERMISSIONS.POLICY_WRITE,
    PERMISSIONS.POLICY_DELETE,
    PERMISSIONS.CLAIM_READ,
    PERMISSIONS.CLAIM_WRITE,
    PERMISSIONS.CLAIM_DELETE,
    PERMISSIONS.AI_PROCESS,
    PERMISSIONS.AI_READ_RESULTS,
    PERMISSIONS.EXPORT_DATA,
  ],
  
  editor: [
    PERMISSIONS.ACCOUNT_READ,
    PERMISSIONS.HOUSEHOLD_READ,
    PERMISSIONS.HOUSEHOLD_WRITE,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.DOCUMENT_WRITE,
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.INVENTORY_WRITE,
    PERMISSIONS.POLICY_READ,
    PERMISSIONS.POLICY_WRITE,
    PERMISSIONS.CLAIM_READ,
    PERMISSIONS.CLAIM_WRITE,
    PERMISSIONS.AI_PROCESS,
    PERMISSIONS.AI_READ_RESULTS,
  ],
  
  viewer: [
    PERMISSIONS.ACCOUNT_READ,
    PERMISSIONS.HOUSEHOLD_READ,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.POLICY_READ,
    PERMISSIONS.CLAIM_READ,
    PERMISSIONS.AI_READ_RESULTS,
  ],
  
  legal_advisor: [
    PERMISSIONS.ACCOUNT_READ,
    PERMISSIONS.HOUSEHOLD_READ,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.DOCUMENT_WRITE,
    PERMISSIONS.POLICY_READ,
    PERMISSIONS.POLICY_WRITE,
    PERMISSIONS.CLAIM_READ,
    PERMISSIONS.CLAIM_WRITE,
    PERMISSIONS.AI_READ_RESULTS,
  ],
  
  financial_advisor: [
    PERMISSIONS.ACCOUNT_READ,
    PERMISSIONS.HOUSEHOLD_READ,
    PERMISSIONS.DOCUMENT_READ,
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.POLICY_READ,
    PERMISSIONS.POLICY_WRITE,
    PERMISSIONS.CLAIM_READ,
    PERMISSIONS.CLAIM_WRITE,
    PERMISSIONS.AI_READ_RESULTS,
  ],
};

// Helper function to get permissions for a role
export function getPermissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

// Helper function to check if a role has a specific permission
export function roleHasPermission(role: string, permission: Permission): boolean {
  const rolePermissions = getPermissionsForRole(role);
  return rolePermissions.includes(permission);
}

// Helper function to check if user has any of the required permissions
export function userHasAnyPermission(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}

// Helper function to check if user has all required permissions
export function userHasAllPermissions(userPermissions: Permission[], requiredPermissions: Permission[]): boolean {
  return requiredPermissions.every(permission => userPermissions.includes(permission));
} 