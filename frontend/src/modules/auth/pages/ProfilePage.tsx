import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import UserProfileSettings from '../components/UserProfileSettings';

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

const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user) {
      // Convert user data to UserProfile format
      setProfile({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        isEmailVerified: user.isEmailVerified,
        marketingConsent: user.marketingConsent,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    }
  }, [user]);

  const handleUpdateProfile = async (data: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    marketingConsent: boolean;
  }) => {
    setIsLoading(true);
    setError('');

    try {
      await updateProfile(data);
      // Update local profile state
      if (profile) {
        setProfile({
          ...profile,
          ...data,
          updatedAt: new Date(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    setIsLoading(true);
    setError('');

    try {
      await changePassword(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-primary-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <UserProfileSettings
      profile={profile}
      onUpdateProfile={handleUpdateProfile}
      onChangePassword={handleChangePassword}
      isLoading={isLoading}
      error={error}
    />
  );
};

export default ProfilePage; 