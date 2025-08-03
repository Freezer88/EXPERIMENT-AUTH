import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ChangePasswordForm from '../ChangePasswordForm';

// Mock the PasswordStrengthMeter component
jest.mock('../../../../components/ui/PasswordStrengthMeter', () => ({
  PasswordStrengthMeter: function MockPasswordStrengthMeter({ password }: { password: string }) {
    return <div data-testid="password-strength-meter">Strength: {password.length}</div>;
  }
}));

describe('ChangePasswordForm', () => {
  const mockOnSubmit = jest.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      render(<ChangePasswordForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    });

    it('should render form title and description', () => {
      render(<ChangePasswordForm {...defaultProps} />);
      
      expect(screen.getByText(/change password/i)).toBeInTheDocument();
      expect(screen.getByText(/update your password to keep your account secure/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<ChangePasswordForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /change password/i })).toBeInTheDocument();
    });

    it('should show password strength meter when new password is entered', async () => {
      const user = userEvent.setup();
      render(<ChangePasswordForm {...defaultProps} />);
      
      const newPasswordInput = screen.getByLabelText(/new password/i);
      await user.type(newPasswordInput, 'test');
      
      expect(screen.getByTestId('password-strength-meter')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty current password', async () => {
      const { container } = render(<ChangePasswordForm {...defaultProps} />);
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/current password is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty new password', async () => {
      const user = userEvent.setup();
      const { container } = render(<ChangePasswordForm {...defaultProps} />);
      
      const currentPasswordInput = screen.getByLabelText(/current password/i);
      await user.type(currentPasswordInput, 'oldpassword');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/new password is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for weak new password', async () => {
      const user = userEvent.setup();
      const { container } = render(<ChangePasswordForm {...defaultProps} />);
      
      const currentPasswordInput = screen.getByLabelText(/current password/i);
      const newPasswordInput = screen.getByLabelText(/new password/i);
      
      await user.type(currentPasswordInput, 'oldpassword');
      await user.type(newPasswordInput, 'weak');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/password must contain:/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty confirm password', async () => {
      const user = userEvent.setup();
      const { container } = render(<ChangePasswordForm {...defaultProps} />);
      
      const currentPasswordInput = screen.getByLabelText(/current password/i);
      const newPasswordInput = screen.getByLabelText(/new password/i);
      
      await user.type(currentPasswordInput, 'oldpassword');
      await user.type(newPasswordInput, 'ValidPass123!');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/please confirm your new password/i)).toBeInTheDocument();
      });
    });

    it('should show error for mismatched passwords', async () => {
      const user = userEvent.setup();
      const { container } = render(<ChangePasswordForm {...defaultProps} />);
      
      const currentPasswordInput = screen.getByLabelText(/current password/i);
      const newPasswordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      
      await user.type(currentPasswordInput, 'oldpassword');
      await user.type(newPasswordInput, 'ValidPass123!');
      await user.type(confirmPasswordInput, 'DifferentPass123!');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should accept valid password format', async () => {
      const user = userEvent.setup();
      const { container } = render(<ChangePasswordForm {...defaultProps} />);
      
      const currentPasswordInput = screen.getByLabelText(/current password/i);
      const newPasswordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      
      await user.type(currentPasswordInput, 'oldpassword');
      await user.type(newPasswordInput, 'ValidPass123!');
      await user.type(confirmPasswordInput, 'ValidPass123!');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          currentPassword: 'oldpassword',
          newPassword: 'ValidPass123!',
        });
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with correct data when form is valid', async () => {
      const user = userEvent.setup();
      const { container } = render(<ChangePasswordForm {...defaultProps} />);
      
      const currentPasswordInput = screen.getByLabelText(/current password/i);
      const newPasswordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      
      await user.type(currentPasswordInput, 'oldpassword');
      await user.type(newPasswordInput, 'ValidPass123!');
      await user.type(confirmPasswordInput, 'ValidPass123!');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          currentPassword: 'oldpassword',
          newPassword: 'ValidPass123!',
        });
      });
    });

    it('should not submit when form is invalid', async () => {
      const { container } = render(<ChangePasswordForm {...defaultProps} />);
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should clear form on successful submission', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      
      const user = userEvent.setup();
      const { container } = render(<ChangePasswordForm {...defaultProps} />);
      
      const currentPasswordInput = screen.getByLabelText(/current password/i);
      const newPasswordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      
      await user.type(currentPasswordInput, 'oldpassword');
      await user.type(newPasswordInput, 'ValidPass123!');
      await user.type(confirmPasswordInput, 'ValidPass123!');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(currentPasswordInput).toHaveValue('');
        expect(newPasswordInput).toHaveValue('');
        expect(confirmPasswordInput).toHaveValue('');
      });
    });

    it('should show loading state during submission', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      const user = userEvent.setup();
      const { container } = render(<ChangePasswordForm {...defaultProps} />);
      
      const currentPasswordInput = screen.getByLabelText(/current password/i);
      const newPasswordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      
      await user.type(currentPasswordInput, 'oldpassword');
      await user.type(newPasswordInput, 'ValidPass123!');
      await user.type(confirmPasswordInput, 'ValidPass123!');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      expect(screen.getByText(/changing password/i)).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should disable form when loading', () => {
      render(<ChangePasswordForm {...defaultProps} isLoading={true} />);
      
      const currentPasswordInput = screen.getByLabelText(/current password/i);
      const newPasswordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      const submitButton = screen.getByRole('button', { name: /change password/i });
      
      expect(currentPasswordInput).toBeDisabled();
      expect(newPasswordInput).toBeDisabled();
      expect(confirmPasswordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    it('should show loading text on submit button when submitting', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      const user = userEvent.setup();
      const { container } = render(<ChangePasswordForm {...defaultProps} />);
      
      const currentPasswordInput = screen.getByLabelText(/current password/i);
      const newPasswordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      
      await user.type(currentPasswordInput, 'oldpassword');
      await user.type(newPasswordInput, 'ValidPass123!');
      await user.type(confirmPasswordInput, 'ValidPass123!');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      expect(screen.getByText(/changing password/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error prop when provided', () => {
      render(<ChangePasswordForm {...defaultProps} error="Custom error message" />);
      
      expect(screen.getByText(/custom error message/i)).toBeInTheDocument();
    });

    it('should display general error message', async () => {
      mockOnSubmit.mockRejectedValue(new Error('Invalid current password'));
      
      const user = userEvent.setup();
      const { container } = render(<ChangePasswordForm {...defaultProps} />);
      
      const currentPasswordInput = screen.getByLabelText(/current password/i);
      const newPasswordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      
      await user.type(currentPasswordInput, 'wrongpassword');
      await user.type(newPasswordInput, 'ValidPass123!');
      await user.type(confirmPasswordInput, 'ValidPass123!');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid current password/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form fields', () => {
      render(<ChangePasswordForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/current password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    });

    it('should have required attributes on required fields', () => {
      render(<ChangePasswordForm {...defaultProps} />);
      
      const currentPasswordInput = screen.getByLabelText(/current password/i);
      const newPasswordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      
      expect(currentPasswordInput).toHaveAttribute('required');
      expect(newPasswordInput).toHaveAttribute('required');
      expect(confirmPasswordInput).toHaveAttribute('required');
    });
  });
}); 