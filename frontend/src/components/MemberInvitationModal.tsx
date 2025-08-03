import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Form } from './ui/Form';
import { Select } from './ui/Select';
import { AccountRole } from '../contexts/AccountContext';

interface MemberInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: { email: string; role: AccountRole }) => Promise<{ success: boolean }>;
  accountName?: string;
}

interface InvitationFormData {
  email: string;
  role: AccountRole;
}

export function MemberInvitationModal({
  isOpen,
  onClose,
  onInvite,
  accountName = 'this account'
}: MemberInvitationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: InvitationFormData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await onInvite(data);
      
      if (result.success) {
        onClose();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Invite Team Member
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          <p className="text-sm text-gray-600 mb-4">
            Invite someone to join {accountName} with a specific role and permissions.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <Form
            onSubmit={handleSubmit}
            defaultValues={{
              email: '',
              role: 'viewer' as AccountRole,
            }}
          >
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="colleague@example.com"
                  required
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  We'll send an invitation email to this address
                </p>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <Select id="role" name="role" required disabled={loading}>
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                  <option value="legal_advisor">Legal Advisor</option>
                  <option value="financial_advisor">Financial Advisor</option>
                </Select>
              </div>

              {/* Role Descriptions */}
              <div className="bg-gray-50 rounded-md p-3">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Role Permissions:</h4>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center">
                    <span className="w-16 font-medium">Viewer:</span>
                    <span>Read-only access to content</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-16 font-medium">Editor:</span>
                    <span>Can edit content and documents</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-16 font-medium">Admin:</span>
                    <span>Can manage members and settings</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-16 font-medium">Legal Advisor:</span>
                    <span>Specialized legal document access</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-16 font-medium">Financial Advisor:</span>
                    <span>Specialized financial document access</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Sending Invitation...' : 'Send Invitation'}
                </Button>
              </div>
            </div>
          </Form>
        </div>

        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-gray-600">
              The invited person will receive an email with a link to join the account. 
              They'll need to create an account if they don't have one already.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MemberInvitationModal; 