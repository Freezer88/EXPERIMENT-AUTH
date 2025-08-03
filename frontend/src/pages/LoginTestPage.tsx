import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../modules/auth/components/LoginForm';

const LoginTestPage: React.FC = () => {
  const handleLogin = async (data: { email: string; password: string }) => {
    // Simulate login process
    console.log('Login attempt:', data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo purposes, show success for test credentials
    if (data.email === 'test@example.com' && data.password === 'SecurePass123!') {
      // Show success message with more details
      const successMessage = `
🎉 Login Successful!

User: ${data.email}
Welcome back! You would now be redirected to the dashboard.

In a real application, you would see:
• Dashboard with user profile
• Navigation with authenticated user info
• Access to protected features
• JWT token stored securely
      `;
      alert(successMessage);
    } else {
      throw new Error('Invalid email or password. Try test@example.com / SecurePass123!');
    }
  };

  const handleForgotPassword = () => {
    alert('Forgot password functionality would be implemented here');
  };

  const handleSignup = () => {
    alert('Sign up functionality would be implemented here');
  };

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-4">
            Login Form Test
          </h1>
          <p className="text-primary-600 mb-4">
            Testing the login form with Airbnb design standards and our trust-inspiring colors
          </p>
          <div className="bg-primary-100 p-4 rounded-lg max-w-md mx-auto">
            <h3 className="font-semibold text-primary-800 mb-2">Demo Credentials:</h3>
            <p className="text-sm text-primary-700">
              Email: <code className="bg-white px-1 rounded">test@example.com</code><br />
              Password: <code className="bg-white px-1 rounded">SecurePass123!</code>
            </p>
            <div className="mt-3 p-3 bg-success-50 border border-success-200 rounded">
              <h4 className="font-medium text-success-800 mb-2">Password Security Requirements:</h4>
              <ul className="text-xs text-success-700 space-y-1">
                <li>• Minimum 8 characters</li>
                <li>• At least one uppercase letter (A-Z)</li>
                <li>• At least one lowercase letter (a-z)</li>
                <li>• At least one number (0-9)</li>
                <li>• At least one special character (!@#$%^&*)</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mb-8">
          <Link 
            to="/ui-test" 
            className="text-primary-600 hover:text-primary-700 underline"
          >
            ← Back to UI Components Test
          </Link>
        </div>

        <LoginForm
          onSubmit={handleLogin}
          onForgotPassword={handleForgotPassword}
          onSignup={handleSignup}
        />
      </div>
    </div>
  );
};

export default LoginTestPage; 