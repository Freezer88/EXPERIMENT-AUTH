import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

export interface Account {
  id: string;
  name: string;
  description?: string;
  ownerUserId: string;
  createdAt: Date;
  updatedAt: Date;
  settings?: AccountSettings;
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

export interface AccountMember {
  accountId: string;
  userId: string;
  role: AccountRole;
  invitedBy?: string;
  joinedAt: Date;
}

export type AccountRole = 'owner' | 'admin' | 'editor' | 'viewer' | 'legal_advisor' | 'financial_advisor';

export interface UserAccount {
  account: Account;
  role: AccountRole;
}

interface AccountState {
  activeAccount: Account | null;
  userAccounts: UserAccount[];
  loading: boolean;
  error: string | null;
  currentUserRole: AccountRole | null;
}

type AccountAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER_ACCOUNTS'; payload: UserAccount[] }
  | { type: 'SET_ACTIVE_ACCOUNT'; payload: Account | null }
  | { type: 'SET_CURRENT_USER_ROLE'; payload: AccountRole | null }
  | { type: 'UPDATE_ACCOUNT_SETTINGS'; payload: Partial<AccountSettings> }
  | { type: 'ADD_ACCOUNT'; payload: UserAccount }
  | { type: 'REMOVE_ACCOUNT'; payload: string }
  | { type: 'UPDATE_ACCOUNT'; payload: Account };

interface AccountContextType {
  state: AccountState;
  setActiveAccount: (account: Account | null) => void;
  loadUserAccounts: () => Promise<void>;
  updateAccountSettings: (accountId: string, settings: Partial<AccountSettings>) => Promise<void>;
  createAccount: (name: string) => Promise<Account>;
  switchAccount: (accountId: string) => Promise<void>;
  refreshAccounts: () => Promise<void>;
  clearAccounts: () => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const initialState: AccountState = {
  activeAccount: null,
  userAccounts: [],
  loading: false,
  error: null,
  currentUserRole: null,
};

function accountReducer(state: AccountState, action: AccountAction): AccountState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_USER_ACCOUNTS':
      return { ...state, userAccounts: action.payload };
    case 'SET_ACTIVE_ACCOUNT':
      return { ...state, activeAccount: action.payload };
    case 'SET_CURRENT_USER_ROLE':
      return { ...state, currentUserRole: action.payload };
    case 'UPDATE_ACCOUNT_SETTINGS':
      if (!state.activeAccount) return state;
      return {
        ...state,
        activeAccount: {
          ...state.activeAccount,
          settings: {
            ...state.activeAccount.settings,
            ...action.payload,
          },
        },
      };
    case 'ADD_ACCOUNT':
      return {
        ...state,
        userAccounts: [...state.userAccounts, action.payload],
      };
    case 'REMOVE_ACCOUNT':
      return {
        ...state,
        userAccounts: state.userAccounts.filter(ua => ua.account.id !== action.payload),
        activeAccount: state.activeAccount?.id === action.payload ? null : state.activeAccount,
      };
    case 'UPDATE_ACCOUNT':
      return {
        ...state,
        userAccounts: state.userAccounts.map(ua =>
          ua.account.id === action.payload.id
            ? { ...ua, account: action.payload }
            : ua
        ),
        activeAccount: state.activeAccount?.id === action.payload.id
          ? action.payload
          : state.activeAccount,
      };
    default:
      return state;
  }
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(accountReducer, initialState);

  const setActiveAccount = (account: Account | null) => {
    dispatch({ type: 'SET_ACTIVE_ACCOUNT', payload: account });
    
    if (account) {
      const userAccount = state.userAccounts.find(ua => ua.account.id === account.id);
      if (userAccount) {
        dispatch({ type: 'SET_CURRENT_USER_ROLE', payload: userAccount.role });
      }
    } else {
      dispatch({ type: 'SET_CURRENT_USER_ROLE', payload: null });
    }
  };

  const loadUserAccounts = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/accounts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load accounts');
      }

      const data = await response.json();
      
      if (data.success) {
        const userAccounts: UserAccount[] = data.accounts.map((acc: any) => ({
          account: {
            id: acc.id,
            name: acc.name,
            ownerUserId: acc.ownerUserId,
            createdAt: new Date(acc.createdAt),
            updatedAt: new Date(acc.updatedAt),
            settings: acc.settings,
          },
          role: acc.role,
        }));

        dispatch({ type: 'SET_USER_ACCOUNTS', payload: userAccounts });

        // Set the first account as active if no active account is set
        if (userAccounts.length > 0 && !state.activeAccount) {
          setActiveAccount(userAccounts[0].account);
        }
      } else {
        throw new Error(data.message || 'Failed to load accounts');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load accounts' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateAccountSettings = async (accountId: string, settings: Partial<AccountSettings>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`/api/accounts/${accountId}/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update account settings');
      }

      const data = await response.json();
      
      if (data.success) {
        dispatch({ type: 'UPDATE_ACCOUNT_SETTINGS', payload: settings });
        
        // Update the account in the user accounts list
        const updatedAccount = data.account;
        dispatch({ type: 'UPDATE_ACCOUNT', payload: updatedAccount });
      } else {
        throw new Error(data.message || 'Failed to update account settings');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update account settings' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const createAccount = async (name: string): Promise<Account> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create account');
      }

      const data = await response.json();
      
      if (data.success) {
        const newAccount = data.account;
        const userAccount: UserAccount = {
          account: newAccount,
          role: 'owner', // New accounts are created with owner role
        };

        dispatch({ type: 'ADD_ACCOUNT', payload: userAccount });
        setActiveAccount(newAccount);
        
        return newAccount;
      } else {
        throw new Error(data.message || 'Failed to create account');
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to create account' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const switchAccount = async (accountId: string) => {
    const userAccount = state.userAccounts.find(ua => ua.account.id === accountId);
    if (userAccount) {
      setActiveAccount(userAccount.account);
    } else {
      throw new Error('Account not found');
    }
  };

  const refreshAccounts = async () => {
    await loadUserAccounts();
  };

  const clearAccounts = () => {
    dispatch({ type: 'SET_USER_ACCOUNTS', payload: [] });
    dispatch({ type: 'SET_ACTIVE_ACCOUNT', payload: null });
    dispatch({ type: 'SET_CURRENT_USER_ROLE', payload: null });
  };

  // Load accounts on mount
  useEffect(() => {
    loadUserAccounts();
  }, []);

  const value: AccountContextType = {
    state,
    setActiveAccount,
    loadUserAccounts,
    updateAccountSettings,
    createAccount,
    switchAccount,
    refreshAccounts,
    clearAccounts,
  };

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
} 