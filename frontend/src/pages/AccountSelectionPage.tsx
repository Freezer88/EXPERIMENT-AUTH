import React, { useState } from 'react';
import { useAccount } from '../contexts/AccountContext';
import { Button } from '../components/ui/Button';
import { AccountCreationForm } from '../components/AccountCreationForm';
import { AccountRole } from '../contexts/AccountContext';

export function AccountSelectionPage() {
  const { state, switchAccount, createAccount } = useAccount();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccountSelect = async (accountId: string) => {
    try {
      setLoading(true);
      await switchAccount(accountId);
    } catch (error) {
      console.error('Failed to switch account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = async (name: string) => {
    try {
      setLoading(true);
      await createAccount(name);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create account:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: AccountRole) => {
    switch (role) {
      case 'owner':
        return 'bg-red-100 text-red-800';
      case 'admin':
        return 'bg-orange-100 text-orange-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      case 'legal_advisor':
        return 'bg-purple-100 text-purple-800';
      case 'financial_advisor':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: AccountRole) => {
    switch (role) {
      case 'owner':
        return 'Owner';
      case 'admin':
        return 'Admin';
      case 'editor':
        return 'Editor';
      case 'viewer':
        return 'Viewer';
      case 'legal_advisor':
        return 'Legal Advisor';
      case 'financial_advisor':
        return 'Financial Advisor';
      default:
        return role;
    }
  };

  if (showCreateForm) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <AccountCreationForm
          onSuccess={() => setShowCreateForm(false)}
          onCancel={() => setShowCreateForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Select an Account
        </h1>
        <p className="text-gray-600">
          Choose an account to work with or create a new one to get started.
        </p>
      </div>

      {state.loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your accounts...</p>
          </div>
        </div>
      ) : state.error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{state.error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Try Again
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Account Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.userAccounts.map((userAccount) => (
              <div
                key={userAccount.account.id}
                className={`
                  bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer
                  ${state.activeAccount?.id === userAccount.account.id
                    ? 'ring-2 ring-blue-500 border-blue-500'
                    : 'border-gray-200'
                  }
                `}
                onClick={() => handleAccountSelect(userAccount.account.id)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {userAccount.account.name}
                      </h3>
                      {userAccount.account.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {userAccount.account.description}
                        </p>
                      )}
                    </div>
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(userAccount.role)}
                    `}>
                      {getRoleLabel(userAccount.role)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>{new Date(userAccount.account.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Updated:</span>
                      <span>{new Date(userAccount.account.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAccountSelect(userAccount.account.id);
                      }}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? 'Switching...' : 'Select Account'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {/* Create New Account Card */}
            <div
              className="bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer"
              onClick={() => setShowCreateForm(true)}
            >
              <div className="p-6 text-center">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Create New Account
                </h3>
                <p className="text-sm text-gray-600">
                  Start a new account to organize your insurance information
                </p>
              </div>
            </div>
          </div>

          {/* Empty State */}
          {state.userAccounts.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Accounts Yet
              </h3>
              <p className="text-gray-600 mb-6">
                You don't have any accounts yet. Create your first account to get started.
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                Create Your First Account
              </Button>
            </div>
          )}

          {/* Help Section */}
          {state.userAccounts.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-3">
                About Accounts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <h4 className="font-medium mb-2">Account Roles:</h4>
                  <ul className="space-y-1">
                    <li>• <strong>Owner:</strong> Full control over the account</li>
                    <li>• <strong>Admin:</strong> Can manage members and settings</li>
                    <li>• <strong>Editor:</strong> Can edit content and documents</li>
                    <li>• <strong>Viewer:</strong> Read-only access</li>
                    <li>• <strong>Legal/Financial Advisors:</strong> Specialized access</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">What you can do:</h4>
                  <ul className="space-y-1">
                    <li>• Organize insurance information</li>
                    <li>• Collaborate with team members</li>
                    <li>• Manage documents and policies</li>
                    <li>• Track claims and coverage</li>
                    <li>• Control access and permissions</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AccountSelectionPage; 