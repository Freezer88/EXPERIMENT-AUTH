import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccountProvider, useAccount } from '../AccountContext';

// Mock fetch
global.fetch = jest.fn();

// Test component to use the context
function TestComponent() {
  const { state, setActiveAccount, loadUserAccounts, updateAccountSettings, createAccount, switchAccount } = useAccount();
  
  return (
    <div>
      <div data-testid="loading">{state.loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="error">{state.error || 'No Error'}</div>
      <div data-testid="active-account">{state.activeAccount?.name || 'No Active Account'}</div>
      <div data-testid="user-role">{state.currentUserRole || 'No Role'}</div>
      <div data-testid="accounts-count">{state.userAccounts.length}</div>
      
      <button onClick={() => setActiveAccount(null)}>Clear Active Account</button>
      <button onClick={loadUserAccounts}>Load Accounts</button>
      <button onClick={() => updateAccountSettings('test-id', { name: 'Updated Name' })}>Update Settings</button>
      <button onClick={() => createAccount('New Account')}>Create Account</button>
      <button onClick={() => switchAccount('test-id')}>Switch Account</button>
    </div>
  );
}

describe('AccountContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should provide initial state', () => {
    render(
      <AccountProvider>
        <TestComponent />
      </AccountProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    expect(screen.getByTestId('error')).toHaveTextContent('No Error');
    expect(screen.getByTestId('active-account')).toHaveTextContent('No Active Account');
    expect(screen.getByTestId('user-role')).toHaveTextContent('No Role');
    expect(screen.getByTestId('accounts-count')).toHaveTextContent('0');
  });

  it('should load user accounts on mount', async () => {
    const mockAccounts = [
      {
        id: 'account-1',
        name: 'Test Account 1',
        ownerUserId: 'user-1',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        role: 'owner',
      },
      {
        id: 'account-2',
        name: 'Test Account 2',
        ownerUserId: 'user-1',
        createdAt: '2023-01-02T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        role: 'admin',
      },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        accounts: mockAccounts,
      }),
    });

    localStorage.setItem('accessToken', 'test-token');

    render(
      <AccountProvider>
        <TestComponent />
      </AccountProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('accounts-count')).toHaveTextContent('2');
    });

    expect(screen.getByTestId('active-account')).toHaveTextContent('Test Account 1');
    expect(screen.getByTestId('user-role')).toHaveTextContent('owner');
  });

  it('should handle load accounts error', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    localStorage.setItem('accessToken', 'test-token');

    render(
      <AccountProvider>
        <TestComponent />
      </AccountProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Network error');
    });
  });

  it('should handle missing authentication token', async () => {
    render(
      <AccountProvider>
        <TestComponent />
      </AccountProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('No authentication token found');
    });
  });

  it('should create account successfully', async () => {
    const mockNewAccount = {
      id: 'new-account',
      name: 'New Account',
      ownerUserId: 'user-1',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
    };

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          accounts: [],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          account: mockNewAccount,
        }),
      });

    localStorage.setItem('accessToken', 'test-token');

    render(
      <AccountProvider>
        <TestComponent />
      </AccountProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('accounts-count')).toHaveTextContent('0');
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('Create Account'));

    await waitFor(() => {
      expect(screen.getByTestId('accounts-count')).toHaveTextContent('1');
    });

    expect(screen.getByTestId('active-account')).toHaveTextContent('New Account');
    expect(screen.getByTestId('user-role')).toHaveTextContent('owner');
  });

  it('should update account settings successfully', async () => {
    const mockAccounts = [
      {
        id: 'account-1',
        name: 'Test Account',
        ownerUserId: 'user-1',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        role: 'owner',
      },
    ];

    const updatedAccount = {
      id: 'account-1',
      name: 'Updated Name',
      ownerUserId: 'user-1',
      createdAt: '2023-01-01T00:00:00.000Z',
      updatedAt: '2023-01-01T00:00:00.000Z',
      settings: {
        name: 'Updated Name',
      },
    };

    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          accounts: mockAccounts,
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          account: updatedAccount,
        }),
      });

    localStorage.setItem('accessToken', 'test-token');

    render(
      <AccountProvider>
        <TestComponent />
      </AccountProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('active-account')).toHaveTextContent('Test Account');
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('Update Settings'));

    await waitFor(() => {
      expect(screen.getByTestId('active-account')).toHaveTextContent('Updated Name');
    });
  });

  it('should switch between accounts', async () => {
    const mockAccounts = [
      {
        id: 'account-1',
        name: 'Test Account 1',
        ownerUserId: 'user-1',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        role: 'owner',
      },
      {
        id: 'account-2',
        name: 'Test Account 2',
        ownerUserId: 'user-1',
        createdAt: '2023-01-02T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        role: 'admin',
      },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        accounts: mockAccounts,
      }),
    });

    localStorage.setItem('accessToken', 'test-token');

    render(
      <AccountProvider>
        <TestComponent />
      </AccountProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('active-account')).toHaveTextContent('Test Account 1');
      expect(screen.getByTestId('user-role')).toHaveTextContent('owner');
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('Switch Account'));

    await waitFor(() => {
      expect(screen.getByTestId('active-account')).toHaveTextContent('Test Account 2');
      expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
    });
  });

  it('should clear active account', async () => {
    const mockAccounts = [
      {
        id: 'account-1',
        name: 'Test Account',
        ownerUserId: 'user-1',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        role: 'owner',
      },
    ];

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        accounts: mockAccounts,
      }),
    });

    localStorage.setItem('accessToken', 'test-token');

    render(
      <AccountProvider>
        <TestComponent />
      </AccountProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('active-account')).toHaveTextContent('Test Account');
    });

    const user = userEvent.setup();
    await user.click(screen.getByText('Clear Active Account'));

    expect(screen.getByTestId('active-account')).toHaveTextContent('No Active Account');
    expect(screen.getByTestId('user-role')).toHaveTextContent('No Role');
  });

  it('should handle API errors gracefully', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        message: 'Bad request',
      }),
    });

    localStorage.setItem('accessToken', 'test-token');

    render(
      <AccountProvider>
        <TestComponent />
      </AccountProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to load accounts');
    });
  });

  it('should throw error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAccount must be used within an AccountProvider');
    
    consoleSpy.mockRestore();
  });
}); 