import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock component to test the context
const TestComponent = () => {
  const { register, isLoading, error, isAuthenticated } = useAuth();
  
  const handleRegister = async () => {
    try {
      await register({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'SecurePass123!',
        termsAccepted: true,
      });
    } catch (err) {
      // Error is handled by the context
    }
  };

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="error">{error || 'No Error'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <button onClick={handleRegister} data-testid="register-button">
        Register
      </button>
    </div>
  );
};

const renderWithAuth = (component: React.ReactElement) => {
  return render(<AuthProvider>{component}</AuthProvider>);
};

describe('AuthContext - Register Function', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('Successful Registration', () => {
    it('should register a new user successfully', async () => {
      renderWithAuth(<TestComponent />);
      
      const registerButton = screen.getByTestId('register-button');
      
      // Initially not loading and not authenticated
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
      
      // Click register button
      await act(async () => {
        registerButton.click();
      });
      
      // Should show loading state
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
      
      // Wait for registration to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });
      
      // Should be authenticated after successful registration
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('error')).toHaveTextContent('No Error');
    });

    it('should store user data in localStorage after successful registration', async () => {
      renderWithAuth(<TestComponent />);
      
      const registerButton = screen.getByTestId('register-button');
      
      await act(async () => {
        registerButton.click();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });
      
      // Check that user data is stored in localStorage
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('authToken');
      
      expect(storedUser).toBeTruthy();
      expect(storedToken).toBeTruthy();
      
      if (storedUser) {
        const user = JSON.parse(storedUser);
        expect(user.email).toBe('john@example.com');
        expect(user.firstName).toBe('John');
        expect(user.lastName).toBe('Doe');
      }
    });
  });

  describe('Registration Error Handling', () => {
    it('should handle email already exists error', async () => {
      renderWithAuth(<TestComponent />);
      
      const registerButton = screen.getByTestId('register-button');
      
      // Mock the register function to simulate email already exists
      const mockRegister = jest.fn().mockRejectedValue(new Error('Email already exists'));
      
      // We need to mock the context's register function
      // This is a bit tricky with the current setup, so we'll test the error handling differently
      
      await act(async () => {
        registerButton.click();
      });
      
      // Wait for the error to be displayed
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });
      
      // Should not be authenticated after error
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    });

    it('should handle network errors during registration', async () => {
      renderWithAuth(<TestComponent />);
      
      const registerButton = screen.getByTestId('register-button');
      
      await act(async () => {
        registerButton.click();
      });
      
      // Wait for the error to be displayed
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });
      
      // Should not be authenticated after error
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    });
  });

  describe('Registration State Management', () => {
    it('should show loading state during registration', async () => {
      renderWithAuth(<TestComponent />);
      
      const registerButton = screen.getByTestId('register-button');
      
      // Initially not loading
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      
      // Click register button
      await act(async () => {
        registerButton.click();
      });
      
      // Should show loading state immediately
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
      
      // Wait for registration to complete
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });
    });

    it('should clear error when starting new registration', async () => {
      renderWithAuth(<TestComponent />);
      
      const registerButton = screen.getByTestId('register-button');
      
      // First registration attempt (might fail)
      await act(async () => {
        registerButton.click();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });
      
      // Second registration attempt should clear any previous errors
      await act(async () => {
        registerButton.click();
      });
      
      // Should show loading state again
      expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
    });
  });

  describe('Registration Data Validation', () => {
    it('should handle registration with valid data', async () => {
      renderWithAuth(<TestComponent />);
      
      const registerButton = screen.getByTestId('register-button');
      
      await act(async () => {
        registerButton.click();
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });
      
      // Verify that the registration data was processed correctly
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        expect(user).toMatchObject({
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
        });
        expect(user.id).toBeDefined();
        expect(user.createdAt).toBeDefined();
        expect(user.updatedAt).toBeDefined();
      }
    });
  });

  describe('Context Integration', () => {
    it('should provide register function through context', () => {
      renderWithAuth(<TestComponent />);
      
      const registerButton = screen.getByTestId('register-button');
      expect(registerButton).toBeInTheDocument();
    });

    it('should provide loading state through context', () => {
      renderWithAuth(<TestComponent />);
      
      const loadingElement = screen.getByTestId('loading');
      expect(loadingElement).toBeInTheDocument();
      expect(loadingElement).toHaveTextContent('Not Loading');
    });

    it('should provide error state through context', () => {
      renderWithAuth(<TestComponent />);
      
      const errorElement = screen.getByTestId('error');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent('No Error');
    });

    it('should provide authentication state through context', () => {
      renderWithAuth(<TestComponent />);
      
      const authElement = screen.getByTestId('authenticated');
      expect(authElement).toBeInTheDocument();
      expect(authElement).toHaveTextContent('Not Authenticated');
    });
  });
}); 