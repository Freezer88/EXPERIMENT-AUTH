import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountCreationForm } from '../AccountCreationForm';

// Mock the account context
jest.mock('../../contexts/AccountContext', () => ({
  useAccount: jest.fn(),
}));

const mockUseAccount = require('../../contexts/AccountContext').useAccount;

describe('AccountCreationForm', () => {
  const mockCreateAccount = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAccount.mockReturnValue({
      createAccount: mockCreateAccount,
    });
  });

  it('should render the form with all fields', () => {
    render(<AccountCreationForm />);

    expect(screen.getByText('Create New Account')).toBeInTheDocument();
    expect(screen.getByLabelText('Account Name *')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
  });

  it('should not show cancel button when onCancel is not provided', () => {
    render(<AccountCreationForm />);

    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
  });

  it('should show cancel button when onCancel is provided', () => {
    render(<AccountCreationForm onCancel={mockOnCancel} />);

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('should call createAccount when form is submitted', async () => {
    const user = userEvent.setup();
    mockCreateAccount.mockResolvedValue({ id: 'new-account', name: 'Test Account' });

    render(<AccountCreationForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText('Account Name *');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    await user.type(nameInput, 'Test Account');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateAccount).toHaveBeenCalledWith('Test Account');
    });
  });

  it('should call onSuccess when account is created successfully', async () => {
    const user = userEvent.setup();
    const mockAccount = { id: 'new-account', name: 'Test Account' };
    mockCreateAccount.mockResolvedValue(mockAccount);

    render(<AccountCreationForm onSuccess={mockOnSuccess} />);

    const nameInput = screen.getByLabelText('Account Name *');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    await user.type(nameInput, 'Test Account');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(mockAccount);
    });
  });

  it('should show error when account creation fails', async () => {
    const user = userEvent.setup();
    mockCreateAccount.mockRejectedValue(new Error('Account name already exists'));

    render(<AccountCreationForm />);

    const nameInput = screen.getByLabelText('Account Name *');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    await user.type(nameInput, 'Test Account');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Account name already exists')).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    mockCreateAccount.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<AccountCreationForm />);

    const nameInput = screen.getByLabelText('Account Name *');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    await user.type(nameInput, 'Test Account');
    await user.click(submitButton);

    expect(screen.getByText('Creating Account...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(<AccountCreationForm onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should disable form fields during submission', async () => {
    const user = userEvent.setup();
    mockCreateAccount.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<AccountCreationForm />);

    const nameInput = screen.getByLabelText('Account Name *');
    const descriptionInput = screen.getByLabelText('Description');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    await user.type(nameInput, 'Test Account');
    await user.click(submitButton);

    expect(nameInput).toBeDisabled();
    expect(descriptionInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();

    render(<AccountCreationForm />);

    const submitButton = screen.getByRole('button', { name: 'Create Account' });
    await user.click(submitButton);

    // The form should prevent submission without required fields
    expect(mockCreateAccount).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(<AccountCreationForm className="custom-class" />);

    const container = screen.getByText('Create New Account').closest('.account-creation-form');
    expect(container).toHaveClass('custom-class');
  });

  it('should show help information', () => {
    render(<AccountCreationForm />);

    expect(screen.getByText('What happens when you create an account?')).toBeInTheDocument();
    expect(screen.getByText(/You'll be set as the owner of the account/)).toBeInTheDocument();
    expect(screen.getByText(/You can invite team members with different roles/)).toBeInTheDocument();
  });

  it('should handle description field', async () => {
    const user = userEvent.setup();
    mockCreateAccount.mockResolvedValue({ id: 'new-account', name: 'Test Account' });

    render(<AccountCreationForm />);

    const nameInput = screen.getByLabelText('Account Name *');
    const descriptionInput = screen.getByLabelText('Description');
    const submitButton = screen.getByRole('button', { name: 'Create Account' });

    await user.type(nameInput, 'Test Account');
    await user.type(descriptionInput, 'This is a test account');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateAccount).toHaveBeenCalledWith('Test Account');
    });
  });

  it('should show character limits', () => {
    render(<AccountCreationForm />);

    expect(screen.getByText(/max 255 characters/)).toBeInTheDocument();
    expect(screen.getByText(/max 1000 characters/)).toBeInTheDocument();
  });
}); 