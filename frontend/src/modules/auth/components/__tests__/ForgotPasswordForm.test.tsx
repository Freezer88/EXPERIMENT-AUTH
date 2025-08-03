import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ForgotPasswordForm from '../ForgotPasswordForm';

describe('ForgotPasswordForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnBackToLogin = jest.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onBackToLogin: mockOnBackToLogin,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      render(<ForgotPasswordForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<ForgotPasswordForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    });

    it('should render back to login link', () => {
      render(<ForgotPasswordForm {...defaultProps} />);
      expect(screen.getByText(/remember your password/i)).toBeInTheDocument();
      expect(screen.getByText(/back to login/i)).toBeInTheDocument();
    });

    it('should render form title and description', () => {
      render(<ForgotPasswordForm {...defaultProps} />);
      expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
      expect(screen.getByText(/enter your email address/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty email', async () => {
      const { container } = render(<ForgotPasswordForm {...defaultProps} />);
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid email', async () => {
      const user = userEvent.setup();
      const { container } = render(<ForgotPasswordForm {...defaultProps} />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'invalid-email');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should accept valid email format', async () => {
      const user = userEvent.setup();
      const { container } = render(<ForgotPasswordForm {...defaultProps} />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with correct data when form is valid', async () => {
      const user = userEvent.setup();
      const { container } = render(<ForgotPasswordForm {...defaultProps} />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
      });
    });

    it('should not submit when form is invalid', async () => {
      const { container } = render(<ForgotPasswordForm {...defaultProps} />);
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should show loading state during submission', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      const user = userEvent.setup();
      const { container } = render(<ForgotPasswordForm {...defaultProps} />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      expect(screen.getByText(/sending reset link/i)).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should show success message after successful submission', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      
      const user = userEvent.setup();
      const { container } = render(<ForgotPasswordForm {...defaultProps} />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
        expect(screen.getByText(/we've sent a password reset link/i)).toBeInTheDocument();
        expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
      });
    });

    it('should show try again button in success state', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      
      const user = userEvent.setup();
      const { container } = render(<ForgotPasswordForm {...defaultProps} />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });
    });

    it('should reset form when try again is clicked', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      
      const user = userEvent.setup();
      const { container } = render(<ForgotPasswordForm {...defaultProps} />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });
      
      const tryAgainButton = screen.getByRole('button', { name: /try again/i });
      await user.click(tryAgainButton);
      
      expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toHaveValue('');
    });
  });

  describe('Error Handling', () => {
    it('should display general error message', async () => {
      mockOnSubmit.mockRejectedValue(new Error('Network error'));
      
      const user = userEvent.setup();
      const { container } = render(<ForgotPasswordForm {...defaultProps} />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should display error prop when provided', () => {
      render(<ForgotPasswordForm {...defaultProps} error="Custom error message" />);
      
      expect(screen.getByText(/custom error message/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should call onBackToLogin when back to login link is clicked', async () => {
      const user = userEvent.setup();
      render(<ForgotPasswordForm {...defaultProps} />);
      
      const backToLoginButton = screen.getByText(/back to login/i);
      await user.click(backToLoginButton);
      
      expect(mockOnBackToLogin).toHaveBeenCalled();
    });

    it('should call onBackToLogin when back to login button is clicked in success state', async () => {
      mockOnSubmit.mockResolvedValue(undefined);
      
      const user = userEvent.setup();
      const { container } = render(<ForgotPasswordForm {...defaultProps} />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });
      
      const backToLoginButton = screen.getByText(/back to login/i);
      await user.click(backToLoginButton);
      
      expect(mockOnBackToLogin).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should disable form when loading', () => {
      render(<ForgotPasswordForm {...defaultProps} isLoading={true} />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /sending reset link/i });
      
      expect(emailInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    it('should show loading text on submit button when submitting', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      const user = userEvent.setup();
      const { container } = render(<ForgotPasswordForm {...defaultProps} />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test@example.com');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      expect(screen.getByText(/sending reset link/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form fields', () => {
      render(<ForgotPasswordForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    });
  });
}); 