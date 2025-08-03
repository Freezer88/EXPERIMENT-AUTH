import React, { useState } from 'react';
import { useAccount } from '../contexts/AccountContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Form } from './ui/Form';

interface AccountCreationFormData {
  name: string;
  description?: string;
}

interface AccountCreationFormProps {
  onSuccess?: (account: any) => void;
  onCancel?: () => void;
  className?: string;
}

export function AccountCreationForm({ 
  onSuccess, 
  onCancel, 
  className = '' 
}: AccountCreationFormProps) {
  const { createAccount } = useAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: AccountCreationFormData) => {
    try {
      setLoading(true);
      setError(null);

      const newAccount = await createAccount(data.name);
      
      if (onSuccess) {
        onSuccess(newAccount);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`account-creation-form ${className}`}>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Create New Account
          </h2>
          <p className="text-gray-600">
            Create a new account to organize your insurance information and collaborate with team members.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <Form
          onSubmit={handleSubmit}
          defaultValues={{
            name: '',
            description: '',
          }}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Account Name *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter account name"
                required
                maxLength={255}
                disabled={loading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Choose a descriptive name for your account (max 255 characters)
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Optional description of the account"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                maxLength={1000}
                disabled={loading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Optional description to help identify the account (max 1000 characters)
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </div>
          </div>
        </Form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            What happens when you create an account?
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• You'll be set as the owner of the account</li>
            <li>• You can invite team members with different roles</li>
            <li>• You can organize insurance information and documents</li>
            <li>• You can manage account settings and permissions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AccountCreationForm; 