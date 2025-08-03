import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountSwitcher } from '../AccountSwitcher';
import { AccountProvider } from '../../contexts/AccountContext';

// Mock the account context
jest.mock('../../contexts/AccountContext', () => ({
  useAccount: jest.fn(),
}));

const mockUseAccount = require('../../contexts/AccountContext').useAccount;

const mockUserAccounts = [
  {
    account: {
      id: 'account-1',
      name: 'Test Account 1',
      ownerUserId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    role: 'owner' as const,
  },
  {
    account: {
      id: 'account-2',
      name: 'Test Account 2',
      ownerUserId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    role: 'admin' as const,
  },
  {
    account: {
      id: 'account-3',
      name: 'Test Account 3',
      ownerUserId: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    role: 'viewer' as const,
  },
];

describe('AccountSwitcher', () => {
  const mockSwitchAccount = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAccount.mockReturnValue({
      state: {
        activeAccount: mockUserAccounts[0].account,
        userAccounts: mockUserAccounts,
        loading: false,
        error: null,
        currentUserRole: 'owner',
      },
      switchAccount: mockSwitchAccount,
    });
  });

  it('should not render when user has only one account', () => {
    mockUseAccount.mockReturnValue({
      state: {
        activeAccount: mockUserAccounts[0].account,
        userAccounts: [mockUserAccounts[0]],
        loading: false,
        error: null,
        currentUserRole: 'owner',
      },
      switchAccount: mockSwitchAccount,
    });

    const { container } = render(<AccountSwitcher />);
    expect(container.firstChild).toBeNull();
  });

  describe('Dropdown variant', () => {
    it('should render dropdown with accounts', () => {
      render(<AccountSwitcher variant="dropdown" />);

      expect(screen.getByLabelText('Account')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Account 1 (owner)')).toBeInTheDocument();
    });

    it('should not show label when showLabel is false', () => {
      render(<AccountSwitcher variant="dropdown" showLabel={false} />);

      expect(screen.queryByLabelText('Account')).not.toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Account 1 (owner)')).toBeInTheDocument();
    });

    it('should call switchAccount when selection changes', async () => {
      const user = userEvent.setup();
      render(<AccountSwitcher variant="dropdown" />);

      const select = screen.getByDisplayValue('Test Account 1 (owner)');
      await user.selectOptions(select, 'account-2');

      expect(mockSwitchAccount).toHaveBeenCalledWith('account-2');
    });

    it('should not call switchAccount when selecting the same account', async () => {
      const user = userEvent.setup();
      render(<AccountSwitcher variant="dropdown" />);

      const select = screen.getByDisplayValue('Test Account 1 (owner)');
      await user.selectOptions(select, 'account-1');

      expect(mockSwitchAccount).not.toHaveBeenCalled();
    });

    it('should show loading state', () => {
      mockUseAccount.mockReturnValue({
        state: {
          activeAccount: mockUserAccounts[0].account,
          userAccounts: mockUserAccounts,
          loading: true,
          error: null,
          currentUserRole: 'owner',
        },
        switchAccount: mockSwitchAccount,
      });

      render(<AccountSwitcher variant="dropdown" />);

      const select = screen.getByDisplayValue('Test Account 1 (owner)');
      expect(select).toBeDisabled();
    });

    it('should handle switch account error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockSwitchAccount.mockRejectedValueOnce(new Error('Switch failed'));

      const user = userEvent.setup();
      render(<AccountSwitcher variant="dropdown" />);

      const select = screen.getByDisplayValue('Test Account 1 (owner)');
      await user.selectOptions(select, 'account-2');

      expect(consoleSpy).toHaveBeenCalledWith('Failed to switch account:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('Tabs variant', () => {
    it('should render tabs with accounts', () => {
      render(<AccountSwitcher variant="tabs" />);

      expect(screen.getByText('Accounts')).toBeInTheDocument();
      expect(screen.getByText('Test Account 1')).toBeInTheDocument();
      expect(screen.getByText('Test Account 2')).toBeInTheDocument();
      expect(screen.getByText('Test Account 3')).toBeInTheDocument();
    });

    it('should not show label when showLabel is false', () => {
      render(<AccountSwitcher variant="tabs" showLabel={false} />);

      expect(screen.queryByText('Accounts')).not.toBeInTheDocument();
      expect(screen.getByText('Test Account 1')).toBeInTheDocument();
    });

    it('should call switchAccount when tab is clicked', async () => {
      const user = userEvent.setup();
      render(<AccountSwitcher variant="tabs" />);

      const tab2 = screen.getByText('Test Account 2');
      await user.click(tab2);

      expect(mockSwitchAccount).toHaveBeenCalledWith('account-2');
    });

    it('should not call switchAccount when clicking the same tab', async () => {
      const user = userEvent.setup();
      render(<AccountSwitcher variant="tabs" />);

      const tab1 = screen.getByText('Test Account 1');
      await user.click(tab1);

      expect(mockSwitchAccount).not.toHaveBeenCalled();
    });

    it('should show role badges with correct colors', () => {
      render(<AccountSwitcher variant="tabs" />);

      const ownerBadge = screen.getByText('owner');
      const adminBadge = screen.getByText('admin');
      const viewerBadge = screen.getByText('viewer');

      expect(ownerBadge).toHaveClass('bg-red-100', 'text-red-800');
      expect(adminBadge).toHaveClass('bg-orange-100', 'text-orange-800');
      expect(viewerBadge).toHaveClass('bg-gray-100', 'text-gray-800');
    });

    it('should show loading state', () => {
      mockUseAccount.mockReturnValue({
        state: {
          activeAccount: mockUserAccounts[0].account,
          userAccounts: mockUserAccounts,
          loading: true,
          error: null,
          currentUserRole: 'owner',
        },
        switchAccount: mockSwitchAccount,
      });

      render(<AccountSwitcher variant="tabs" />);

      const tabs = screen.getAllByRole('button');
      tabs.forEach(tab => {
        expect(tab).toBeDisabled();
      });
    });

    it('should show active tab styling', () => {
      render(<AccountSwitcher variant="tabs" />);

      const activeTab = screen.getByText('Test Account 1').closest('button');
      expect(activeTab).toHaveClass('border-blue-500', 'text-blue-600', 'bg-blue-50');
    });

    it('should show loading message during switch', async () => {
      mockSwitchAccount.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      const user = userEvent.setup();
      render(<AccountSwitcher variant="tabs" />);

      const tab2 = screen.getByText('Test Account 2');
      await user.click(tab2);

      expect(screen.getByText('Switching account...')).toBeInTheDocument();
    });
  });

  it('should apply custom className', () => {
    render(<AccountSwitcher className="custom-class" />);

    const container = screen.getByDisplayValue('Test Account 1 (owner)').closest('.account-switcher');
    expect(container).toHaveClass('custom-class');
  });

  it('should apply custom className for tabs variant', () => {
    render(<AccountSwitcher variant="tabs" className="custom-class" />);

    const container = screen.getByText('Test Account 1').closest('.account-switcher-tabs');
    expect(container).toHaveClass('custom-class');
  });
}); 