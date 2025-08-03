import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResetPasswordForm from '../ResetPasswordForm';

// Mock the PasswordStrengthMeter component
jest.mock('../../../../components/ui/PasswordStrengthMeter', () => ({
  PasswordStrengthMeter: function MockPasswordStrengthMeter({ password }: { password: string }) {
    return <div data-testid="password-strength-meter">Strength: {password.length}</div>;
  }
}));

describe('ResetPasswordForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnBackToLogin = jest.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    token: 'test-token-123',
    onBackToLogin: mockOnBackToLogin,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      render(<ResetPasswordForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<ResetPasswordForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument();
    });

    it('should render back to login link', () => {
      render(<ResetPasswordForm {...defaultProps} />);
      expect(screen.getByText(/remember your password/i)).toBeInTheDocument();
      expect(screen.getByText(/back to login/i)).toBeInTheDocument();
    });

    it('should render form title and description', () => {
      render(<ResetPasswordForm {...defaultProps} />);
      expect(screen.getByText(/reset your password/i)).toBeInTheDocument();
      expect(screen.getByText(/enter your new password below/i)).toBeInTheDocument();
    });

    it('should show password strength meter when password is entered', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm {...defaultProps} />);
      
      const passwordInput = screen.getByLabelText(/new password/i);
      await user.type(passwordInput, 'test');
      
      expect(screen.getByTestId('password-strength-meter')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty password', async () => {
      const { container } = render(<ResetPasswordForm {...defaultProps} />);
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for weak password', async () => {
      const user = userEvent.setup();
      const { container } = render(<ResetPasswordForm {...defaultProps} />);
      
      const passwordInput = screen.getByLabelText(/new password/i);
      await user.type(passwordInput, 'weak');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/password must contain:/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty confirm password', async () => {
      const user = userEvent.setup();
      const { container } = render(<ResetPasswordForm {...defaultProps} />);
      
      const passwordInput = screen.getByLabelText(/new password/i);
      await user.type(passwordInput, 'ValidPass123!');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
      });
    });

    it('should show error for mismatched passwords', async () => {
      const user = userEvent.setup();
      const { container } = render(<ResetPasswordForm {...defaultProps} />);
      
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      
      await user.type(passwordInput, 'ValidPass123!');
      await user.type(confirmPasswordInput, 'DifferentPass123!');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should accept valid password format', async () => {
      const user = userEvent.setup();
      const { container } = render(<ResetPasswordForm {...defaultProps} />);
      
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      
      await user.type(passwordInput, 'ValidPass123!');
      await user.type(confirmPasswordInput, 'ValidPass123!');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          token: 'test-token-123',
          newPassword: 'ValidPass123!'
        });
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with correct data when form is valid', async () => {
      const user = userEvent.setup();
      const { container } = render(<ResetPasswordForm {...defaultProps} />);
      
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      
      await user.type(passwordInput, 'ValidPass123!');
      await user.type(confirmPasswordInput, 'ValidPass123!');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          token: 'test-token-123',
          newPassword: 'ValidPass123!'
        });
      });
    });

    it('should not submit when form is invalid', async () => {
      const { container } = render(<ResetPasswordForm {...defaultProps} />);
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should show loading state during submission', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      const user = userEvent.setup();
      const { container } = render(<ResetPasswordForm {...defaultProps} />);
      
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      
      await user.type(passwordInput, 'ValidPass123!');
      await user.type(confirmPasswordInput, 'ValidPass123!');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      expect(screen.getByText(/updating password/i)).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should show success message after successful submission', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      
      const user = userEvent.setup();
      const { container } = render(<ResetPasswordForm {...defaultProps} />);
      
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      
      await user.type(passwordInput, 'ValidPass123!');
      await user.type(confirmPasswordInput, 'ValidPass123!');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/password reset successfully/i)).toBeInTheDocument();
        expect(screen.getByText(/your password has been updated/i)).toBeInTheDocument();
      });
    });

    it('should show continue to login button in success state', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      
      const user = userEvent.setup();
      const { container } = render(<ResetPasswordForm {...defaultProps} />);
      
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      
      await user.type(passwordInput, 'ValidPass123!');
      await user.type(confirmPasswordInput, 'ValidPass123!');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/continue to login/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display general error message', async () => {
      mockOnSubmit.mockRejectedValue(new Error('Invalid token'));
      
      const user = userEvent.setup();
      const { container } = render(<ResetPasswordForm {...defaultProps} />);
      
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      
      await user.type(passwordInput, 'ValidPass123!');
      await user.type(confirmPasswordInput, 'ValidPass123!');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/invalid token/i)).toBeInTheDocument();
      });
    });

    it('should display error prop when provided', () => {
      render(<ResetPasswordForm {...defaultProps} error="Custom error message" />);
      
      expect(screen.getByText(/custom error message/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should call onBackToLogin when back to login link is clicked', async () => {
      const user = userEvent.setup();
      render(<ResetPasswordForm {...defaultProps} />);
      
      const backToLoginButton = screen.getByText(/back to login/i);
      await user.click(backToLoginButton);
      
      expect(mockOnBackToLogin).toHaveBeenCalled();
    });

    it('should call onBackToLogin when continue to login button is clicked in success state', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      
      const user = userEvent.setup();
      const { container } = render(<ResetPasswordForm {...defaultProps} />);
      
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      
      await user.type(passwordInput, 'ValidPass123!');
      await user.type(confirmPasswordInput, 'ValidPass123!');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/password reset successfully/i)).toBeInTheDocument();
      });
      
      const continueToLoginButton = screen.getByText(/continue to login/i);
      await user.click(continueToLoginButton);
      
      expect(mockOnBackToLogin).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should disable form when loading', () => {
      render(<ResetPasswordForm {...defaultProps} isLoading={true} />);
      
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      const submitButton = screen.getByRole('button', { name: /update password/i });
      
      expect(passwordInput).toBeDisabled();
      expect(confirmPasswordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    it('should show loading text on submit button when submitting', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      const user = userEvent.setup();
      const { container } = render(<ResetPasswordForm {...defaultProps} />);
      
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      
      await user.type(passwordInput, 'ValidPass123!');
      await user.type(confirmPasswordInput, 'ValidPass123!');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      expect(screen.getByText(/updating password/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form fields', () => {
      render(<ResetPasswordForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm new password/i)).toBeInTheDocument();
    });

    it('should have required attributes on required fields', () => {
      render(<ResetPasswordForm {...defaultProps} />);
      
      const passwordInput = screen.getByLabelText(/new password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm new password/i);
      
      expect(passwordInput).toHaveAttribute('required');
      expect(confirmPasswordInput).toHaveAttribute('required');
    });
  });
}); 