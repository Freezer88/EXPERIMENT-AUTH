import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card';

interface ForgotPasswordFormProps {
  onSubmit: (data: { email: string }) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  onBackToLogin?: () => void;
}

interface FormData {
  email: string;
}

interface FormErrors {
  email?: string;
  general?: string;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  onBackToLogin,
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
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
        email: formData.email,
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

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

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
                Check your email
              </CardTitle>
              <CardDescription className="text-primary-600">
                We've sent a password reset link to {formData.email}
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center">
              <div className="p-4 bg-success-50 border border-success-200 rounded-lg mb-6">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-5 h-5 text-success-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-success-700">
                    Reset link sent successfully
                  </span>
                </div>
              </div>

              <p className="text-sm text-primary-600 mb-6">
                Didn't receive the email? Check your spam folder or try again.
              </p>

              <Button
                type="button"
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => {
                  setIsSuccess(false);
                  setFormData({ email: '' });
                  setErrors({});
                }}
                className="mb-4"
              >
                Try again
              </Button>

              {onBackToLogin && (
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  fullWidth
                  onClick={onBackToLogin}
                >
                  Back to login
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
              Forgot your password?
            </CardTitle>
            <CardDescription className="text-primary-600">
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  required
                  disabled={isLoading || isSubmitting}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
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
                {isLoading || isSubmitting ? 'Sending reset link...' : 'Send reset link'}
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

export default ForgotPasswordForm; 