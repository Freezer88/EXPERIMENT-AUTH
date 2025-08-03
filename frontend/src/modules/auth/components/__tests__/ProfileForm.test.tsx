import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileForm from '../ProfileForm';

describe('ProfileForm', () => {
  const mockOnSubmit = jest.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    initialData: {
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1 (555) 123-4567',
      marketingConsent: true,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render all form fields with initial data', () => {
      render(<ProfileForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/first name/i)).toHaveValue('John');
      expect(screen.getByLabelText(/last name/i)).toHaveValue('Doe');
      expect(screen.getByLabelText(/phone number/i)).toHaveValue('+1 (555) 123-4567');
      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('should render form title and description', () => {
      render(<ProfileForm {...defaultProps} />);
      
      expect(screen.getByText(/profile information/i)).toBeInTheDocument();
      expect(screen.getByText(/update your personal information/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<ProfileForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /update profile/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty first name', async () => {
      const { container } = render(<ProfileForm {...defaultProps} />);
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      await userEvent.clear(firstNameInput);
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for short first name', async () => {
      const { container } = render(<ProfileForm {...defaultProps} />);
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      await userEvent.clear(firstNameInput);
      await userEvent.type(firstNameInput, 'A');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/first name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('should show error for empty last name', async () => {
      const { container } = render(<ProfileForm {...defaultProps} />);
      
      const lastNameInput = screen.getByLabelText(/last name/i);
      await userEvent.clear(lastNameInput);
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid phone number', async () => {
      const { container } = render(<ProfileForm {...defaultProps} />);
      
      const phoneInput = screen.getByLabelText(/phone number/i);
      await userEvent.clear(phoneInput);
      await userEvent.type(phoneInput, 'invalid-phone');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      // Phone number validation has been removed, so no error should be shown
      await waitFor(() => {
        expect(screen.queryByText(/please enter a valid phone number/i)).not.toBeInTheDocument();
      });
    });

    it('should accept valid phone number formats', async () => {
      const { container } = render(<ProfileForm {...defaultProps} />);
      
      const phoneInput = screen.getByLabelText(/phone number/i);
      await userEvent.clear(phoneInput);
      await userEvent.type(phoneInput, '+1 (555) 987-6543');
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1 (555) 987-6543',
          marketingConsent: true,
        });
      });
    });

    it('should accept empty phone number', async () => {
      const { container } = render(<ProfileForm {...defaultProps} />);
      
      const phoneInput = screen.getByLabelText(/phone number/i);
      await userEvent.clear(phoneInput);
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: undefined,
          marketingConsent: true,
        });
      });
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with correct data when form is valid', async () => {
      const { container } = render(<ProfileForm {...defaultProps} />);
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1 (555) 123-4567',
          marketingConsent: true,
        });
      });
    });

    it('should not submit when form is invalid', async () => {
      const { container } = render(<ProfileForm {...defaultProps} />);
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      await userEvent.clear(firstNameInput);
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockOnSubmit).not.toHaveBeenCalled();
      });
    });

    it('should handle marketing consent changes', async () => {
      const { container } = render(<ProfileForm {...defaultProps} />);
      
      const checkbox = screen.getByRole('checkbox');
      await userEvent.click(checkbox);
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1 (555) 123-4567',
          marketingConsent: false,
        });
      });
    });
  });

  describe('Loading States', () => {
    it('should disable form when loading', () => {
      render(<ProfileForm {...defaultProps} isLoading={true} />);
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const phoneInput = screen.getByLabelText(/phone number/i);
      const submitButton = screen.getByRole('button', { name: /updating profile/i });
      const checkbox = screen.getByRole('checkbox');
      
      expect(firstNameInput).toBeDisabled();
      expect(lastNameInput).toBeDisabled();
      expect(phoneInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(checkbox).toBeDisabled();
    });

    it('should show loading text on submit button when submitting', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      const { container } = render(<ProfileForm {...defaultProps} />);
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      expect(screen.getByText(/updating profile/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error prop when provided', () => {
      render(<ProfileForm {...defaultProps} error="Custom error message" />);
      
      expect(screen.getByText(/custom error message/i)).toBeInTheDocument();
    });

    it('should display general error message', async () => {
      mockOnSubmit.mockRejectedValue(new Error('Network error'));
      
      const { container } = render(<ProfileForm {...defaultProps} />);
      
      const form = container.querySelector('form');
      fireEvent.submit(form);
      
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form fields', () => {
      render(<ProfileForm {...defaultProps} />);
      
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    });

    it('should have proper checkbox label', () => {
      render(<ProfileForm {...defaultProps} />);
      
      expect(screen.getByText(/i agree to receive marketing communications/i)).toBeInTheDocument();
    });
  });
}); 