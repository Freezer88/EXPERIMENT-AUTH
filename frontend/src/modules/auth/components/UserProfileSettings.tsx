import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import ProfileForm from './ProfileForm';
import ChangePasswordForm from './ChangePasswordForm';

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  marketingConsent: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface UserProfileSettingsProps {
  profile: UserProfile;
  onUpdateProfile: (data: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    marketingConsent: boolean;
  }) => Promise<void>;
  onChangePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({
  profile,
  onUpdateProfile,
  onChangePassword,
  isLoading = false,
  error,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleUpdateProfile = async (data: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    marketingConsent: boolean;
  }) => {
    await onUpdateProfile(data);
    setSuccessMessage('Profile updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleChangePassword = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    await onChangePassword(data);
    setSuccessMessage('Password changed successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-primary-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">
            Profile Settings
          </h1>
          <p className="text-primary-600">
            Manage your account information and security settings
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-success-700 font-medium">
                {successMessage}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Information Card */}
          <div className="lg:col-span-1">
            <Card className="shadow-elevated-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-primary-900">
                  Account Information
                </CardTitle>
                <CardDescription className="text-primary-600">
                  Your account details and status
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary-700">Email</label>
                  <div className="flex items-center space-x-2">
                    <span className="text-primary-900">{profile.email}</span>
                    {profile.isEmailVerified ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Unverified
                      </span>
                    )}
                  </div>
                </div>

                {/* Member Since */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary-700">Member since</label>
                  <span className="text-primary-900">{formatDate(profile.createdAt)}</span>
                </div>

                {/* Last Login */}
                {profile.lastLoginAt && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-primary-700">Last login</label>
                    <span className="text-primary-900">{formatDate(profile.lastLoginAt)}</span>
                  </div>
                )}

                {/* Account Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary-700">Account status</label>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Active
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'password'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50'
                }`}
              >
                Change Password
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'profile' ? (
              <ProfileForm
                onSubmit={handleUpdateProfile}
                initialData={{
                  firstName: profile.firstName,
                  lastName: profile.lastName,
                  phoneNumber: profile.phoneNumber,
                  marketingConsent: profile.marketingConsent,
                }}
                isLoading={isLoading}
                error={error}
              />
            ) : (
              <ChangePasswordForm
                onSubmit={handleChangePassword}
                isLoading={isLoading}
                error={error}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileSettings; 