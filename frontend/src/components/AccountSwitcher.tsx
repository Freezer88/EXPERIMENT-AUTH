import React, { useState } from 'react';
import { useAccount } from '../contexts/AccountContext';
import { Button } from './ui/Button';
import { Select } from './ui/Select';

interface AccountSwitcherProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'dropdown' | 'tabs';
}

export function AccountSwitcher({ 
  className = '', 
  showLabel = true, 
  variant = 'dropdown' 
}: AccountSwitcherProps) {
  const { state, switchAccount } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const handleAccountSwitch = async (accountId: string) => {
    if (accountId === state.activeAccount?.id) return;
    
    setIsLoading(true);
    try {
      await switchAccount(accountId);
    } catch (error) {
      console.error('Failed to switch account:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (state.userAccounts.length <= 1) {
    return null; // Don't show switcher if user has only one account
  }

  if (variant === 'dropdown') {
    return (
      <div className={`account-switcher ${className}`}>
        {showLabel && (
          <label htmlFor="account-select" className="block text-sm font-medium text-gray-700 mb-1">
            Account
          </label>
        )}
        <Select
          id="account-select"
          value={state.activeAccount?.id || ''}
          onChange={(e) => handleAccountSwitch(e.target.value)}
          disabled={isLoading || state.loading}
          className="min-w-[200px]"
        >
          {state.userAccounts.map((userAccount) => (
            <option key={userAccount.account.id} value={userAccount.account.id}>
              {userAccount.account.name} ({userAccount.role})
            </option>
          ))}
        </Select>
        {isLoading && (
          <span className="ml-2 text-sm text-gray-500">Switching...</span>
        )}
      </div>
    );
  }

  // Tabs variant
  return (
    <div className={`account-switcher-tabs ${className}`}>
      {showLabel && (
        <div className="mb-2">
          <span className="text-sm font-medium text-gray-700">Accounts</span>
        </div>
      )}
      <div className="flex space-x-1 border-b border-gray-200">
        {state.userAccounts.map((userAccount) => (
          <button
            key={userAccount.account.id}
            onClick={() => handleAccountSwitch(userAccount.account.id)}
            disabled={isLoading || state.loading}
            className={`
              px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors
              ${state.activeAccount?.id === userAccount.account.id
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
              ${isLoading || state.loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center space-x-2">
              <span>{userAccount.account.name}</span>
              <span className={`
                px-1.5 py-0.5 text-xs rounded-full
                ${userAccount.role === 'owner' ? 'bg-red-100 text-red-800' : ''}
                ${userAccount.role === 'admin' ? 'bg-orange-100 text-orange-800' : ''}
                ${userAccount.role === 'editor' ? 'bg-blue-100 text-blue-800' : ''}
                ${userAccount.role === 'viewer' ? 'bg-gray-100 text-gray-800' : ''}
                ${userAccount.role === 'legal_advisor' ? 'bg-purple-100 text-purple-800' : ''}
                ${userAccount.role === 'financial_advisor' ? 'bg-green-100 text-green-800' : ''}
              `}>
                {userAccount.role}
              </span>
            </div>
          </button>
        ))}
      </div>
      {isLoading && (
        <div className="mt-2 text-sm text-gray-500">
          Switching account...
        </div>
      )}
    </div>
  );
}

export default AccountSwitcher; 