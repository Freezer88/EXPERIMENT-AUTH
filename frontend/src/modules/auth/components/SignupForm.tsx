import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card';
import { Checkbox } from '../../../components/ui/Checkbox';
import { PasswordStrengthMeter } from '../../../components/ui/PasswordStrengthMeter';

interface SignupFormProps {
  onSubmit: (data: { firstName: string; lastName: string; email: string; password: string; termsAccepted: boolean }) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  onLogin?: () => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  termsAccepted?: string;
  general?: string;
}

const SignupForm: React.FC<SignupFormProps> = ({
  onSubmit,
  isLoading = false,
  error,
  onLogin,
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateFirstName = (firstName: string): string | undefined => {
    if (!firstName) return 'First name is required';
    if (firstName.length < 2) return 'First name must be at least 2 characters';
    return undefined;
  };

  const validateLastName = (lastName: string): string | undefined => {
    if (!lastName) return 'Last name is required';
    if (lastName.length < 2) return 'Last name must be at least 2 characters';
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return undefined;
  };

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

  const validateTerms = (termsAccepted: boolean): string | undefined => {
    if (!termsAccepted) return 'You must accept the terms and conditions';
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const firstNameError = validateFirstName(formData.firstName);
    if (firstNameError) newErrors.firstName = firstNameError;

    const lastNameError = validateLastName(formData.lastName);
    if (lastNameError) newErrors.lastName = lastNameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    const confirmPasswordError = validateConfirmPassword(formData.confirmPassword);
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    const termsError = validateTerms(formData.termsAccepted);
    if (termsError) newErrors.termsAccepted = termsError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
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
      await onSubmit({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        termsAccepted: formData.termsAccepted,
      });
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'Signup failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.firstName && formData.lastName && formData.email && 
                     formData.password && formData.confirmPassword && formData.termsAccepted && !isSubmitting;

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-elevated-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-primary-900">
              Create your account
            </CardTitle>
            <CardDescription className="text-primary-600">
              Join us to get started with your secure account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Input
                    label="First name"
                    type="text"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    error={errors.firstName}
                    required
                    disabled={isLoading || isSubmitting}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    label="Last name"
                    type="text"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    error={errors.lastName}
                    required
                    disabled={isLoading || isSubmitting}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    }
                  />
                </div>
              </div>

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
                  placeholder="Create a strong password"
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
                  label="Confirm password"
                  type="password"
                  placeholder="Confirm your password"
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

              {/* Terms and Conditions */}
              <div className="space-y-2">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    checked={formData.termsAccepted}
                    onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                    disabled={isLoading || isSubmitting}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label className="text-sm text-primary-700">
                      I agree to the{' '}
                      <button
                        type="button"
                        className="text-primary-600 hover:text-primary-700 underline"
                        disabled={isLoading || isSubmitting}
                      >
                        Terms of Service
                      </button>
                      {' '}and{' '}
                      <button
                        type="button"
                        className="text-primary-600 hover:text-primary-700 underline"
                        disabled={isLoading || isSubmitting}
                      >
                        Privacy Policy
                      </button>
                    </label>
                    {errors.termsAccepted && (
                      <p className="text-xs text-error-600 mt-1">{errors.termsAccepted}</p>
                    )}
                  </div>
                </div>
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
                {isLoading || isSubmitting ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          </CardContent>

          {/* Login Link */}
          {onLogin && (
            <CardFooter className="flex justify-center pt-6 border-t border-primary-100">
              <div className="text-center">
                <span className="text-sm text-primary-600">
                  Already have an account?{' '}
                </span>
                <button
                  type="button"
                  onClick={onLogin}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 underline-offset-2 hover:underline transition-colors"
                  disabled={isLoading || isSubmitting}
                >
                  Sign in
                </button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SignupForm; 