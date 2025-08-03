import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberInvitationModal } from '../MemberInvitationModal';

describe('MemberInvitationModal', () => {
  const mockOnInvite = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    render(
      <MemberInvitationModal
        isOpen={false}
        onClose={mockOnClose}
        onInvite={mockOnInvite}
      />
    );

    expect(screen.queryByText('Invite Team Member')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <MemberInvitationModal
        isOpen={true}
        onClose={mockOnClose}
        onInvite={mockOnInvite}
      />
    );

    expect(screen.getByText('Invite Team Member')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address *')).toBeInTheDocument();
    expect(screen.getByLabelText('Role *')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <MemberInvitationModal
        isOpen={true}
        onClose={mockOnClose}
        onInvite={mockOnInvite}
      />
    );

    const closeButton = screen.getByRole('button', { name: '' });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onInvite when form is submitted successfully', async () => {
    const user = userEvent.setup();
    mockOnInvite.mockResolvedValue({ success: true });

    render(
      <MemberInvitationModal
        isOpen={true}
        onClose={mockOnClose}
        onInvite={mockOnInvite}
      />
    );

    const emailInput = screen.getByLabelText('Email Address *');
    const roleSelect = screen.getByLabelText('Role *');
    const submitButton = screen.getByRole('button', { name: 'Send Invitation' });

    await user.type(emailInput, 'test@example.com');
    await user.selectOptions(roleSelect, 'admin');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnInvite).toHaveBeenCalledWith({
        email: 'test@example.com',
        role: 'admin',
      });
    });
  });

  it('should call onClose when invitation is successful', async () => {
    const user = userEvent.setup();
    mockOnInvite.mockResolvedValue({ success: true });

    render(
      <MemberInvitationModal
        isOpen={true}
        onClose={mockOnClose}
        onInvite={mockOnInvite}
      />
    );

    const emailInput = screen.getByLabelText('Email Address *');
    const submitButton = screen.getByRole('button', { name: 'Send Invitation' });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('should show error when invitation fails', async () => {
    const user = userEvent.setup();
    mockOnInvite.mockRejectedValue(new Error('Email already invited'));

    render(
      <MemberInvitationModal
        isOpen={true}
        onClose={mockOnClose}
        onInvite={mockOnInvite}
      />
    );

    const emailInput = screen.getByLabelText('Email Address *');
    const submitButton = screen.getByRole('button', { name: 'Send Invitation' });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email already invited')).toBeInTheDocument();
    });
  });

  it('should show loading state during submission', async () => {
    const user = userEvent.setup();
    mockOnInvite.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <MemberInvitationModal
        isOpen={true}
        onClose={mockOnClose}
        onInvite={mockOnInvite}
      />
    );

    const emailInput = screen.getByLabelText('Email Address *');
    const submitButton = screen.getByRole('button', { name: 'Send Invitation' });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    expect(screen.getByText('Sending Invitation...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('should disable form fields during submission', async () => {
    const user = userEvent.setup();
    mockOnInvite.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <MemberInvitationModal
        isOpen={true}
        onClose={mockOnClose}
        onInvite={mockOnInvite}
      />
    );

    const emailInput = screen.getByLabelText('Email Address *');
    const roleSelect = screen.getByLabelText('Role *');
    const submitButton = screen.getByRole('button', { name: 'Send Invitation' });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    expect(emailInput).toBeDisabled();
    expect(roleSelect).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('should show role descriptions', () => {
    render(
      <MemberInvitationModal
        isOpen={true}
        onClose={mockOnClose}
        onInvite={mockOnInvite}
      />
    );

    expect(screen.getByText('Role Permissions:')).toBeInTheDocument();
    expect(screen.getByText('Viewer:')).toBeInTheDocument();
    expect(screen.getByText('Read-only access to content')).toBeInTheDocument();
    expect(screen.getByText('Editor:')).toBeInTheDocument();
    expect(screen.getByText('Can edit content and documents')).toBeInTheDocument();
  });

  it('should show all role options', () => {
    render(
      <MemberInvitationModal
        isOpen={true}
        onClose={mockOnClose}
        onInvite={mockOnInvite}
      />
    );

    const roleSelect = screen.getByLabelText('Role *');
    expect(roleSelect).toHaveValue('viewer');

    const options = roleSelect.querySelectorAll('option');
    expect(options).toHaveLength(5);
    expect(options[0]).toHaveValue('viewer');
    expect(options[1]).toHaveValue('editor');
    expect(options[2]).toHaveValue('admin');
    expect(options[3]).toHaveValue('legal_advisor');
    expect(options[4]).toHaveValue('financial_advisor');
  });

  it('should show custom account name', () => {
    render(
      <MemberInvitationModal
        isOpen={true}
        onClose={mockOnClose}
        onInvite={mockOnInvite}
        accountName="My Insurance Account"
      />
    );

    expect(screen.getByText(/Invite someone to join My Insurance Account/)).toBeInTheDocument();
  });

  it('should show default account name when not provided', () => {
    render(
      <MemberInvitationModal
        isOpen={true}
        onClose={mockOnClose}
        onInvite={mockOnInvite}
      />
    );

    expect(screen.getByText(/Invite someone to join this account/)).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <MemberInvitationModal
        isOpen={true}
        onClose={mockOnClose}
        onInvite={mockOnInvite}
      />
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show help information', () => {
    render(
      <MemberInvitationModal
        isOpen={true}
        onClose={mockOnClose}
        onInvite={mockOnInvite}
      />
    );

    expect(screen.getByText(/The invited person will receive an email/)).toBeInTheDocument();
    expect(screen.getByText(/They'll need to create an account/)).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();

    render(
      <MemberInvitationModal
        isOpen={true}
        onClose={mockOnClose}
        onInvite={mockOnInvite}
      />
    );

    const submitButton = screen.getByRole('button', { name: 'Send Invitation' });
    await user.click(submitButton);

    // The form should prevent submission without required fields
    expect(mockOnInvite).not.toHaveBeenCalled();
  });

  it('should handle different role selections', async () => {
    const user = userEvent.setup();
    mockOnInvite.mockResolvedValue({ success: true });

    render(
      <MemberInvitationModal
        isOpen={true}
        onClose={mockOnClose}
        onInvite={mockOnInvite}
      />
    );

    const emailInput = screen.getByLabelText('Email Address *');
    const roleSelect = screen.getByLabelText('Role *');
    const submitButton = screen.getByRole('button', { name: 'Send Invitation' });

    await user.type(emailInput, 'test@example.com');
    await user.selectOptions(roleSelect, 'legal_advisor');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnInvite).toHaveBeenCalledWith({
        email: 'test@example.com',
        role: 'legal_advisor',
      });
    });
  });
}); 