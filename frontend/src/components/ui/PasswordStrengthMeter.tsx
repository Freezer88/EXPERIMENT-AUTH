import React from 'react';
import { Checkbox } from './Checkbox';

export interface PasswordStrengthMeterProps {
  password: string;
  className?: string;
}

export interface PasswordRequirement {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

const requirements: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (password) => password.length >= 8,
  },
  {
    id: 'uppercase',
    label: 'At least one uppercase letter (A-Z)',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'lowercase',
    label: 'At least one lowercase letter (a-z)',
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: 'number',
    label: 'At least one number (0-9)',
    test: (password) => /\d/.test(password),
  },
  {
    id: 'special',
    label: 'At least one special character (!@#$%^&*)',
    test: (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  },
];

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({
  password,
  className = '',
}) => {
  // Calculate strength score (0-100)
  const calculateStrength = (password: string): number => {
    if (!password) return 0;
    
    let score = 0;
    
    // Base score for length
    score += Math.min(password.length * 2, 20);
    
    // Character variety bonus
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (hasUppercase) score += 15;
    if (hasLowercase) score += 15;
    if (hasNumber) score += 15;
    if (hasSpecial) score += 15;
    
    // Bonus for meeting all requirements
    if (password.length >= 8 && hasUppercase && hasLowercase && hasNumber && hasSpecial) {
      score += 20;
    }
    
    return Math.min(score, 100);
  };

  const strength = calculateStrength(password);
  
  // Determine strength level and color
  const getStrengthLevel = (score: number) => {
    if (score === 0) return { level: 'None', color: 'bg-secondary-200', textColor: 'text-secondary-600' };
    if (score < 30) return { level: 'Weak', color: 'bg-error-500', textColor: 'text-error-600' };
    if (score < 50) return { level: 'Fair', color: 'bg-warning-500', textColor: 'text-warning-600' };
    if (score < 70) return { level: 'Good', color: 'bg-primary-500', textColor: 'text-primary-600' };
    if (score < 90) return { level: 'Strong', color: 'bg-success-500', textColor: 'text-success-600' };
    return { level: 'Very Strong', color: 'bg-success-700', textColor: 'text-success-700' };
  };

  const strengthInfo = getStrengthLevel(strength);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-primary-700">Password Strength</span>
          <span className={`text-sm font-semibold ${strengthInfo.textColor}`}>
            {strengthInfo.level}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-secondary-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ease-out ${strengthInfo.color}`}
            style={{ width: `${strength}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-primary-700">Requirements</h4>
        <div className="space-y-1">
          {requirements.map((requirement) => {
            const isMet = requirement.test(password);
            return (
              <div key={requirement.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={isMet}
                  disabled
                  size="sm"
                  className="flex-shrink-0"
                />
                <span className={`text-xs ${isMet ? 'text-success-600' : 'text-secondary-500'}`}>
                  {requirement.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strength Tips */}
      {password && strength < 70 && (
        <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
          <h5 className="text-xs font-medium text-primary-800 mb-1">💡 Tips for a stronger password:</h5>
          <ul className="text-xs text-primary-600 space-y-1">
            {!requirements.find(r => r.id === 'length')?.test(password) && (
              <li>• Make it at least 8 characters long</li>
            )}
            {!requirements.find(r => r.id === 'uppercase')?.test(password) && (
              <li>• Add uppercase letters (A-Z)</li>
            )}
            {!requirements.find(r => r.id === 'lowercase')?.test(password) && (
              <li>• Add lowercase letters (a-z)</li>
            )}
            {!requirements.find(r => r.id === 'number')?.test(password) && (
              <li>• Include numbers (0-9)</li>
            )}
            {!requirements.find(r => r.id === 'special')?.test(password) && (
              <li>• Use special characters (!@#$%^&*)</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}; 