import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupForm from '../SignupForm';

// Mock the PasswordStrengthMeter component
jest.mock('../../../../components/ui/PasswordStrengthMeter', () => ({
  PasswordStrengthMeter: function MockPasswordStrengthMeter({ password }: { password: string }) {
    return <div data-testid="password-strength-meter">Strength: {password.length}</div>;
  }
}));

describe('SignupForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnLogin = jest.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onLogin: mockOnLogin,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      render(<SignupForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password\*$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<SignupForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should render login link', () => {
      render(<SignupForm {...defaultProps} />);
      expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty first name', async () => {
      render(<SignupForm {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      // Wait for validation to complete and error to appear
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show error for short first name', async () => {
      render(<SignupForm {...defaultProps} />);
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      fireEvent.change(firstNameInput, { target: { value: 'a' } });
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/first name must be at least 2 characters/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show error for empty last name', async () => {
      render(<SignupForm {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show error for invalid email', async () => {
      const user = userEvent.setup();
      const { container } = render(<SignupForm {...defaultProps} />);
      
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'invalid-email');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should show error for weak password', async () => {
      const user = userEvent.setup();
      const { container } = render(<SignupForm {...defaultProps} />);
      
      const passwordInput = screen.getByLabelText(/^password\*$/i);
      await user.type(passwordInput, 'weak');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/password must contain:/i)).toBeInTheDocument();
      });
    });

    it('should show error for mismatched passwords', async () => {
      const user = userEvent.setup();
      const { container } = render(<SignupForm {...defaultProps} />);
      
      const passwordInput = screen.getByLabelText(/^password\*$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password\*$/i);
      
      await user.type(passwordInput, 'validpassword123');
      await user.type(confirmPasswordInput, 'differentpassword');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should show error for unchecked terms', async () => {
      render(<SignupForm {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/you must accept the terms and conditions/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Password Strength Meter', () => {
    it('should show password strength meter when password is entered', () => {
      render(<SignupForm {...defaultProps} />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      fireEvent.change(passwordInput, { target: { value: 'test' } });
      
      expect(screen.getByTestId('password-strength-meter')).toBeInTheDocument();
    });

    it('should not show password strength meter when password is empty', () => {
      render(<SignupForm {...defaultProps} />);
      
      expect(screen.queryByTestId('password-strength-meter')).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with correct data when form is valid', async () => {
      const user = userEvent.setup();
      render(<SignupForm {...defaultProps} />);
      
      // Fill in all required fields
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');
      await user.click(screen.getByRole('checkbox'));
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'SecurePass123!',
          termsAccepted: true,
        });
      });
    });

    it('should not submit when form is invalid', async () => {
      const user = userEvent.setup();
      render(<SignupForm {...defaultProps} />);
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show loading state during submission', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      const user = userEvent.setup();
      render(<SignupForm {...defaultProps} />);
      
      // Fill in all required fields
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');
      await user.click(screen.getByRole('checkbox'));
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display general error message', () => {
      render(<SignupForm {...defaultProps} error="Registration failed" />);
      expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
    });

    it('should display form submission error', async () => {
      mockOnSubmit.mockRejectedValue(new Error('Network error'));
      
      const user = userEvent.setup();
      render(<SignupForm {...defaultProps} />);
      
      // Fill in all required fields
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');
      await user.click(screen.getByRole('checkbox'));
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should call onLogin when sign in link is clicked', async () => {
      const user = userEvent.setup();
      render(<SignupForm {...defaultProps} />);
      
      const signInLink = screen.getByText(/sign in/i);
      await user.click(signInLink);
      
      expect(mockOnLogin).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all form fields', () => {
      render(<SignupForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('should have required attributes on required fields', () => {
      render(<SignupForm {...defaultProps} />);
      
      const requiredInputs = [
        screen.getByLabelText(/first name/i),
        screen.getByLabelText(/last name/i),
        screen.getByLabelText(/email address/i),
        screen.getByLabelText(/password/i),
        screen.getByLabelText(/confirm password/i),
      ];
      
      requiredInputs.forEach(input => {
        expect(input).toHaveAttribute('required');
      });
    });
  });

  describe('Loading States', () => {
    it('should disable form when loading', () => {
      render(<SignupForm {...defaultProps} isLoading={true} />);
      
      const inputs = screen.getAllByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /creating account/i });
      
      inputs.forEach(input => {
        expect(input).toBeDisabled();
      });
      
      expect(submitButton).toBeDisabled();
    });

    it('should show loading text on submit button when submitting', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      const user = userEvent.setup();
      render(<SignupForm {...defaultProps} />);
      
      // Fill in all required fields
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email address/i), 'john@example.com');
      await user.type(screen.getByLabelText(/password/i), 'SecurePass123!');
      await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass123!');
      await user.click(screen.getByRole('checkbox'));
      
      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);
      
      expect(screen.getByText(/creating account/i)).toBeInTheDocument();
    });
  });
}); 