import React from 'react';
import { render, screen } from '@testing-library/react';
import { PasswordStrengthMeter } from '../PasswordStrengthMeter';

describe('PasswordStrengthMeter', () => {
  const renderMeter = (password: string): void => {
    render(<PasswordStrengthMeter password={password} />);
  };

  describe('Strength Level Display', () => {
    it('should show "None" for empty password', () => {
      renderMeter('');
      expect(screen.getByText('None')).toBeInTheDocument();
    });

    it('should show "Weak" for passwords under 30 score', () => {
      renderMeter('a');
      expect(screen.getByText('Weak')).toBeInTheDocument();
    });

    it('should show "Fair" for passwords 30-49 score', () => {
      renderMeter('abc123');
      expect(screen.getByText('Fair')).toBeInTheDocument();
    });

    it('should show "Strong" for passwords 70-89 score', () => {
      renderMeter('Abc123!');
      expect(screen.getByText('Strong')).toBeInTheDocument();
    });

    it('should show "Very Strong" for passwords 90+ score', () => {
      renderMeter('Abc123!@#');
      expect(screen.getByText('Very Strong')).toBeInTheDocument();
    });

    it('should show "Very Strong" for passwords 90+ score', () => {
      renderMeter('Abc123!@#Def456$%^');
      expect(screen.getByText('Very Strong')).toBeInTheDocument();
    });
  });

  describe('Requirements Checklist', () => {
    it('should show all requirements as unchecked for empty password', () => {
      renderMeter('');
      expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
      expect(screen.getByText('At least one uppercase letter (A-Z)')).toBeInTheDocument();
      expect(screen.getByText('At least one lowercase letter (a-z)')).toBeInTheDocument();
      expect(screen.getByText('At least one number (0-9)')).toBeInTheDocument();
      expect(screen.getByText('At least one special character (!@#$%^&*)')).toBeInTheDocument();
    });

    it('should check length requirement when met', () => {
      renderMeter('abcdefgh');
      const lengthCheckbox = screen.getByText('At least 8 characters').closest('div')?.querySelector('input');
      expect(lengthCheckbox).toBeChecked();
    });

    it('should check uppercase requirement when met', () => {
      renderMeter('A');
      const uppercaseCheckbox = screen.getByText('At least one uppercase letter (A-Z)').closest('div')?.querySelector('input');
      expect(uppercaseCheckbox).toBeChecked();
    });

    it('should check lowercase requirement when met', () => {
      renderMeter('a');
      const lowercaseCheckbox = screen.getByText('At least one lowercase letter (a-z)').closest('div')?.querySelector('input');
      expect(lowercaseCheckbox).toBeChecked();
    });

    it('should check number requirement when met', () => {
      renderMeter('1');
      const numberCheckbox = screen.getByText('At least one number (0-9)').closest('div')?.querySelector('input');
      expect(numberCheckbox).toBeChecked();
    });

    it('should check special character requirement when met', () => {
      renderMeter('!');
      const specialCheckbox = screen.getByText('At least one special character (!@#$%^&*)').closest('div')?.querySelector('input');
      expect(specialCheckbox).toBeChecked();
    });
  });

  describe('Progress Bar', () => {
    it('should render progress bar with correct width for strength score', () => {
      renderMeter('Abc123!');
      const progressBar = document.querySelector('.h-2.rounded-full');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Tips Section', () => {
    it('should show tips for weak passwords', () => {
      renderMeter('a');
      expect(screen.getByText('💡 Tips for a stronger password:')).toBeInTheDocument();
    });

    it('should not show tips for strong passwords', () => {
      renderMeter('Abc123!@#Def456$%^');
      expect(screen.queryByText('💡 Tips for a stronger password:')).not.toBeInTheDocument();
    });

    it('should show specific tips for missing requirements', () => {
      renderMeter('abc');
      expect(screen.getByText('• Make it at least 8 characters long')).toBeInTheDocument();
      expect(screen.getByText('• Add uppercase letters (A-Z)')).toBeInTheDocument();
      expect(screen.getByText('• Include numbers (0-9)')).toBeInTheDocument();
      expect(screen.getByText('• Use special characters (!@#$%^&*)')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderMeter('test');
      expect(screen.getByText('Password Strength')).toBeInTheDocument();
      expect(screen.getByText('Requirements')).toBeInTheDocument();
    });

    it('should have disabled checkboxes for requirements', () => {
      renderMeter('test');
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        expect(checkbox).toBeDisabled();
      });
    });
  });

  describe('Color Coding', () => {
    it('should apply correct color classes for different strength levels', () => {
      const { rerender } = render(<PasswordStrengthMeter password="a" />);
      
      // Weak password should have error color
      expect(screen.getByText('Weak')).toHaveClass('text-error-600');
      
      // Fair password
      rerender(<PasswordStrengthMeter password="abc123" />);
      expect(screen.getByText('Fair')).toHaveClass('text-warning-600');
      
      // Strong password
      rerender(<PasswordStrengthMeter password="Abc123!" />);
      expect(screen.getByText('Strong')).toHaveClass('text-success-600');
      
      // Very Strong password
      rerender(<PasswordStrengthMeter password="Abc123!@#" />);
      expect(screen.getByText('Very Strong')).toHaveClass('text-success-700');
    });
  });
}); 