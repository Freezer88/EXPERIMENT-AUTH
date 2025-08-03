import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card';
import { PasswordStrengthMeter } from '../../../components/ui/PasswordStrengthMeter';

interface ResetPasswordFormProps {
  onSubmit: (data: { token: string; newPassword: string }) => Promise<void>;
  token?: string;
  isLoading?: boolean;
  error?: string;
  onBackToLogin?: () => void;
}

interface FormData {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({
  onSubmit,
  token = '',
  isLoading = false,
  error,
  onBackToLogin,
}) => {
  const [formData, setFormData] = useState<FormData>({
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validation functions
  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required';
    
    // Security requirements
    const requirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
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
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== formData.password) return 'Passwords do not match';
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
        token,
        newPassword: formData.password,
      });
      setIsSuccess(true);
      setErrors({});
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'An error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = !isSubmitting;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-elevated-lg">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-bold text-primary-900">
                Password reset successfully
              </CardTitle>
              <CardDescription className="text-primary-600">
                Your password has been updated. You can now log in with your new password.
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center">
              <div className="p-4 bg-success-50 border border-success-200 rounded-lg mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-success-700">
                    Password updated successfully
                  </span>
                </div>
              </div>

              {onBackToLogin && (
                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={onBackToLogin}
                >
                  Continue to login
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-elevated-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-primary-900">
              Reset your password
            </CardTitle>
            <CardDescription className="text-primary-600">
              Enter your new password below
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Password Field */}
              <div className="space-y-2">
                <Input
                  label="New password"
                  type="password"
                  placeholder="Enter your new password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  error={errors.password}
                  required
                  disabled={isLoading || isSubmitting}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />
                
                {/* Password Strength Meter */}
                {formData.password && (
                  <div className="mt-3 p-4 bg-white border border-primary-200 rounded-lg">
                    <PasswordStrengthMeter password={formData.password} />
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
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
              </div>

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
                {isLoading || isSubmitting ? 'Updating password...' : 'Update password'}
              </Button>
            </form>
          </CardContent>

          {/* Back to Login Link */}
          {onBackToLogin && (
            <CardFooter className="flex justify-center pt-6 border-t border-primary-100">
              <div className="text-center">
                <span className="text-sm text-primary-600">
                  Remember your password?{' '}
                </span>
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 underline-offset-2 hover:underline transition-colors"
                  disabled={isLoading || isSubmitting}
                >
                  Back to login
                </button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordForm; 