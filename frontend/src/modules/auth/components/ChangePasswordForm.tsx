import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../components/ui/Card';
import { PasswordStrengthMeter } from '../../../components/ui/PasswordStrengthMeter';

interface ChangePasswordFormProps {
  onSubmit: (data: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
}) => {
  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateCurrentPassword = (currentPassword: string): string | undefined => {
    if (!currentPassword) return 'Current password is required';
    return undefined;
  };

  const validateNewPassword = (newPassword: string): string | undefined => {
    if (!newPassword) return 'New password is required';
    
    // Security requirements
    const requirements = {
      minLength: newPassword.length >= 8,
      hasUpperCase: /[A-Z]/.test(newPassword),
      hasLowerCase: /[a-z]/.test(newPassword),
      hasNumber: /\d/.test(newPassword),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
    };

    const errors = [];
    if (!requirements.minLength) errors.push('at least 8 characters');
    if (!requirements.hasUpperCase) errors.push('one uppercase letter');
    if (!requirements.hasLowerCase) errors.push('one lowercase letter');
    if (!requirements.hasNumber) errors.push('one number');
    if (!requirements.hasSpecialChar) errors.push('one special character');

    if (errors.length > 0) {
      return `Password must contain: ${errors.join(', ')}`;
    }

    return undefined;
  };

  const validateConfirmPassword = (confirmPassword: string): string | undefined => {
    if (!confirmPassword) return 'Please confirm your new password';
    if (confirmPassword !== formData.newPassword) return 'Passwords do not match';
    return undefined;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setErrors({});
      // Clear form on success
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'An error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const currentPasswordError = validateCurrentPassword(formData.currentPassword);
    if (currentPasswordError) newErrors.currentPassword = currentPasswordError;

    const newPasswordError = validateNewPassword(formData.newPassword);
    if (newPasswordError) newErrors.newPassword = newPasswordError;

    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = !isSubmitting;

  return (
    <Card className="shadow-elevated-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary-900">
          Change Password
        </CardTitle>
        <CardDescription className="text-primary-600">
          Update your password to keep your account secure
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password Field */}
          <Input
            label="Current password"
            type="password"
            placeholder="Enter your current password"
            value={formData.currentPassword}
            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
            error={errors.currentPassword}
            required
            disabled={isLoading || isSubmitting}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          />

          {/* New Password Field */}
          <div className="space-y-2">
            <Input
              label="New password"
              type="password"
              placeholder="Enter your new password"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              error={errors.newPassword}
              required
              disabled={isLoading || isSubmitting}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />
            
            {/* Password Strength Meter */}
            {formData.newPassword && (
              <div className="mt-3 p-4 bg-white border border-primary-200 rounded-lg">
                <PasswordStrengthMeter password={formData.newPassword} />
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <Input
            label="Confirm new password"
            type="password"
            placeholder="Confirm your new password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            error={errors.confirmPassword}
            required
            disabled={isLoading || isSubmitting}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />

          {/* General Error */}
          {(error || errors.general) && (
            <div className="p-3 bg-error-50 border border-error-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-error-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-error-700">
                  {error || errors.general}
                </span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isLoading || isSubmitting}
            disabled={!isFormValid}
            className="mt-6"
          >
            {isLoading || isSubmitting ? 'Changing password...' : 'Change password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordForm; 