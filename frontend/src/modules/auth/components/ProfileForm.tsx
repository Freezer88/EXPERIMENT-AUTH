import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../../components/ui/Card';

interface ProfileFormProps {
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    marketingConsent: boolean;
  }) => Promise<void>;
  initialData: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    marketingConsent: boolean;
  };
  isLoading?: boolean;
  error?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  marketingConsent: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  general?: string;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
  error,
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: initialData.firstName,
    lastName: initialData.lastName,
    phoneNumber: initialData.phoneNumber || '',
    marketingConsent: initialData.marketingConsent,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateFirstName = (firstName: string): string | undefined => {
    if (!firstName.trim()) return 'First name is required';
    if (firstName.trim().length < 2) return 'First name must be at least 2 characters';
    if (firstName.trim().length > 50) return 'First name must be less than 50 characters';
    return undefined;
  };

  const validateLastName = (lastName: string): string | undefined => {
    if (!lastName.trim()) return 'Last name is required';
    if (lastName.trim().length < 2) return 'Last name must be at least 2 characters';
    if (lastName.trim().length > 50) return 'Last name must be less than 50 characters';
    return undefined;
  };

  const validatePhoneNumber = (phoneNumber: string): string | undefined => {
    // Phone number validation removed for now
    return undefined;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user starts typing
    if (errors[field as keyof FormErrors]) {
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
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber.trim() || undefined,
        marketingConsent: formData.marketingConsent,
      });
      setErrors({});
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : 'An error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const firstNameError = validateFirstName(formData.firstName);
    if (firstNameError) newErrors.firstName = firstNameError;

    const lastNameError = validateLastName(formData.lastName);
    if (lastNameError) newErrors.lastName = lastNameError;

    const phoneNumberError = validatePhoneNumber(formData.phoneNumber);
    if (phoneNumberError) newErrors.phoneNumber = phoneNumberError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormValid = !isSubmitting;

  return (
    <Card className="shadow-elevated-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary-900">
          Profile Information
        </CardTitle>
        <CardDescription className="text-primary-600">
          Update your personal information and preferences
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Phone Number Field */}
          <Input
            label="Phone number"
            type="tel"
            placeholder="Enter your phone number (optional)"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            error={errors.phoneNumber}
            disabled={isLoading || isSubmitting}
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
          />

          {/* Marketing Consent */}
          <div className="space-y-3">
            <Checkbox
              id="marketing-consent"
              checked={formData.marketingConsent}
              onChange={(e) => handleInputChange('marketingConsent', e.target.checked)}
              disabled={isLoading || isSubmitting}
              label="I agree to receive marketing communications and updates"
            />
            <p className="text-sm text-primary-600">
              You can unsubscribe from marketing emails at any time. We'll still send you important account-related communications.
            </p>
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
            {isLoading || isSubmitting ? 'Updating profile...' : 'Update profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfileForm; 