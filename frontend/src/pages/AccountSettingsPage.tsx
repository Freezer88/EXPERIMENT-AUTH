import React, { useState, useEffect } from 'react';
import { useAccount } from '../contexts/AccountContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Form } from '../components/ui/Form';
import { Select } from '../components/ui/Select';
import { AccountRole, AccountSettings } from '../contexts/AccountContext';

interface AccountMember {
  accountId: string;
  userId: string;
  role: AccountRole;
  invitedBy?: string;
  joinedAt: Date;
}

interface InvitationFormData {
  email: string;
  role: AccountRole;
}

interface SettingsFormData {
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

export function AccountSettingsPage() {
  const { state, updateAccountSettings } = useAccount();
  const [members, setMembers] = useState<AccountMember[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'notifications' | 'privacy' | 'preferences'>('general');

  const canManageMembers = state.currentUserRole === 'owner' || state.currentUserRole === 'admin';
  const canManageSettings = state.currentUserRole === 'owner' || state.currentUserRole === 'admin';

  useEffect(() => {
    if (state.activeAccount) {
      loadMembers();
      loadInvitations();
    }
  }, [state.activeAccount]);

  const loadMembers = async () => {
    if (!state.activeAccount) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/accounts/${state.activeAccount.id}/members`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
      } else {
        setError('Failed to load members');
      }
    } catch (error) {
      setError('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const loadInvitations = async () => {
    if (!state.activeAccount) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/accounts/${state.activeAccount.id}/invitations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations || []);
      }
    } catch (error) {
      console.error('Failed to load invitations:', error);
    }
  };

  const handleInviteMember = async (data: InvitationFormData) => {
    if (!state.activeAccount) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/accounts/${state.activeAccount.id}/members/invite`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Reload invitations
        await loadInvitations();
        return { success: true };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to invite member');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to invite member');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: AccountRole) => {
    if (!state.activeAccount) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/accounts/${state.activeAccount.id}/members/${memberId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        await loadMembers();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update member role');
      }
    } catch (error) {
      setError('Failed to update member role');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!state.activeAccount) return;

    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/accounts/${state.activeAccount.id}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadMembers();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to remove member');
      }
    } catch (error) {
      setError('Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (data: SettingsFormData) => {
    if (!state.activeAccount) return;

    try {
      setLoading(true);
      setError(null);

      await updateAccountSettings(state.activeAccount.id, data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!state.activeAccount) return;

    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/accounts/${state.activeAccount.id}/invitations/${invitationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadInvitations();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to cancel invitation');
      }
    } catch (error) {
      setError('Failed to cancel invitation');
    } finally {
      setLoading(false);
    }
  };

  if (!state.activeAccount) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Active Account</h2>
          <p className="text-gray-600">Please select an account to view settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Account Settings
        </h1>
        <p className="text-gray-600">
          Manage your account settings and members for {state.activeAccount.name}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'general', label: 'General' },
            { id: 'members', label: 'Members' },
            { id: 'notifications', label: 'Notifications' },
            { id: 'privacy', label: 'Privacy' },
            { id: 'preferences', label: 'Preferences' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                py-2 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">General Information</h3>
            <Form
              onSubmit={handleUpdateSettings}
              defaultValues={{
                name: state.activeAccount.name,
                description: state.activeAccount.description || '',
              }}
            >
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    disabled={!canManageSettings}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                    disabled={!canManageSettings}
                  />
                </div>
                {canManageSettings && (
                  <div>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </div>
            </Form>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="space-y-6">
          {/* Invite Member Form */}
          {canManageMembers && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Invite New Member</h3>
              <Form
                onSubmit={handleInviteMember}
                defaultValues={{
                  email: '',
                  role: 'viewer' as AccountRole,
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <Select id="role" name="role" required>
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                      <option value="legal_advisor">Legal Advisor</option>
                      <option value="financial_advisor">Financial Advisor</option>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Inviting...' : 'Send Invitation'}
                    </Button>
                  </div>
                </div>
              </Form>
            </div>
          )}

          {/* Current Members */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Members</h3>
            {loading ? (
              <div className="text-center py-4">Loading members...</div>
            ) : members.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No members found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Joined
                      </th>
                      {canManageMembers && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {members.map((member) => (
                      <tr key={member.userId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {member.userId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`
                            px-2 py-1 text-xs font-medium rounded-full
                            ${member.role === 'owner' ? 'bg-red-100 text-red-800' : ''}
                            ${member.role === 'admin' ? 'bg-orange-100 text-orange-800' : ''}
                            ${member.role === 'editor' ? 'bg-blue-100 text-blue-800' : ''}
                            ${member.role === 'viewer' ? 'bg-gray-100 text-gray-800' : ''}
                            ${member.role === 'legal_advisor' ? 'bg-purple-100 text-purple-800' : ''}
                            ${member.role === 'financial_advisor' ? 'bg-green-100 text-green-800' : ''}
                          `}>
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(member.joinedAt).toLocaleDateString()}
                        </td>
                        {canManageMembers && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {member.role !== 'owner' && (
                              <div className="flex space-x-2">
                                <Select
                                  value={member.role}
                                  onChange={(e) => handleUpdateMemberRole(member.userId, e.target.value as AccountRole)}
                                  className="text-xs"
                                >
                                  <option value="viewer">Viewer</option>
                                  <option value="editor">Editor</option>
                                  <option value="admin">Admin</option>
                                  <option value="legal_advisor">Legal Advisor</option>
                                  <option value="financial_advisor">Financial Advisor</option>
                                </Select>
                                <Button
                                  onClick={() => handleRemoveMember(member.userId)}
                                  variant="danger"
                                  size="sm"
                                >
                                  Remove
                                </Button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Invitations</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invited
                      </th>
                      {canManageMembers && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invitations.map((invitation) => (
                      <tr key={invitation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invitation.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            {invitation.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invitation.createdAt).toLocaleDateString()}
                        </td>
                        {canManageMembers && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button
                              onClick={() => handleCancelInvitation(invitation.id)}
                              variant="danger"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
          <Form
            onSubmit={handleUpdateSettings}
            defaultValues={{
              notifications: {
                emailNotifications: state.activeAccount.settings?.notifications?.emailNotifications ?? true,
                pushNotifications: state.activeAccount.settings?.notifications?.pushNotifications ?? false,
                weeklyReports: state.activeAccount.settings?.notifications?.weeklyReports ?? false,
                monthlyReports: state.activeAccount.settings?.notifications?.monthlyReports ?? true,
              },
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  name="notifications.emailNotifications"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={!canManageSettings}
                />
                <label htmlFor="emailNotifications" className="ml-2 block text-sm text-gray-900">
                  Email Notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="pushNotifications"
                  name="notifications.pushNotifications"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={!canManageSettings}
                />
                <label htmlFor="pushNotifications" className="ml-2 block text-sm text-gray-900">
                  Push Notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="weeklyReports"
                  name="notifications.weeklyReports"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={!canManageSettings}
                />
                <label htmlFor="weeklyReports" className="ml-2 block text-sm text-gray-900">
                  Weekly Reports
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="monthlyReports"
                  name="notifications.monthlyReports"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={!canManageSettings}
                />
                <label htmlFor="monthlyReports" className="ml-2 block text-sm text-gray-900">
                  Monthly Reports
                </label>
              </div>
              {canManageSettings && (
                <div>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              )}
            </div>
          </Form>
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy Settings</h3>
          <Form
            onSubmit={handleUpdateSettings}
            defaultValues={{
              privacy: {
                allowMemberInvites: state.activeAccount.settings?.privacy?.allowMemberInvites ?? true,
                allowPublicSharing: state.activeAccount.settings?.privacy?.allowPublicSharing ?? false,
                requireApprovalForChanges: state.activeAccount.settings?.privacy?.requireApprovalForChanges ?? false,
              },
            }}
          >
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowMemberInvites"
                  name="privacy.allowMemberInvites"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={!canManageSettings}
                />
                <label htmlFor="allowMemberInvites" className="ml-2 block text-sm text-gray-900">
                  Allow Member Invites
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowPublicSharing"
                  name="privacy.allowPublicSharing"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={!canManageSettings}
                />
                <label htmlFor="allowPublicSharing" className="ml-2 block text-sm text-gray-900">
                  Allow Public Sharing
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireApprovalForChanges"
                  name="privacy.requireApprovalForChanges"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={!canManageSettings}
                />
                <label htmlFor="requireApprovalForChanges" className="ml-2 block text-sm text-gray-900">
                  Require Approval for Changes
                </label>
              </div>
              {canManageSettings && (
                <div>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Settings'}
                  </Button>
                </div>
              )}
            </div>
          </Form>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Preferences</h3>
          <Form
            onSubmit={handleUpdateSettings}
            defaultValues={{
              preferences: {
                defaultCurrency: state.activeAccount.settings?.preferences?.defaultCurrency ?? 'USD',
                timezone: state.activeAccount.settings?.preferences?.timezone ?? 'UTC',
                language: state.activeAccount.settings?.preferences?.language ?? 'en',
                dateFormat: state.activeAccount.settings?.preferences?.dateFormat ?? 'MM/DD/YYYY',
              },
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="defaultCurrency" className="block text-sm font-medium text-gray-700 mb-1">
                  Default Currency
                </label>
                <Select id="defaultCurrency" name="preferences.defaultCurrency" disabled={!canManageSettings}>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </Select>
              </div>
              <div>
                <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone
                </label>
                <Select id="timezone" name="preferences.timezone" disabled={!canManageSettings}>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                </Select>
              </div>
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <Select id="language" name="preferences.language" disabled={!canManageSettings}>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </Select>
              </div>
              <div>
                <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-700 mb-1">
                  Date Format
                </label>
                <Select id="dateFormat" name="preferences.dateFormat" disabled={!canManageSettings}>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </Select>
              </div>
            </div>
            {canManageSettings && (
              <div className="mt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            )}
          </Form>
        </div>
      )}
    </div>
  );
}

export default AccountSettingsPage; 