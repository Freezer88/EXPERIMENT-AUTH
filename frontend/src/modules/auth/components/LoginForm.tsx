import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card';

interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  onForgotPassword?: () => void;
  onSignup?: () => void;
}

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  onForgotPassword,
  onSignup,
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required';
    
    // Security requirements for production
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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({}); // Clear previous errors

    try {
      await onSubmit(formData);
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Login failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.email && formData.password && !isSubmitting;

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-elevated-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-primary-900">
              Welcome back
            </CardTitle>
            <CardDescription className="text-primary-600">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="Enter your email"
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

              {/* Password Field */}
              <div className="space-y-2">
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
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
              </div>

              {/* Forgot Password Link */}
              {onForgotPassword && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={onForgotPassword}
                    className="text-sm text-primary-600 hover:text-primary-700 underline-offset-2 hover:underline transition-colors"
                    disabled={isLoading || isSubmitting}
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

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
                {isLoading || isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>

          {/* Sign Up Link */}
          {onSignup && (
            <CardFooter className="flex justify-center pt-6 border-t border-primary-100">
              <div className="text-center">
                <span className="text-sm text-primary-600">
                  Don't have an account?{' '}
                </span>
                <button
                  type="button"
                  onClick={onSignup}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 underline-offset-2 hover:underline transition-colors"
                  disabled={isLoading || isSubmitting}
                >
                  Sign up
                </button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default LoginForm; 