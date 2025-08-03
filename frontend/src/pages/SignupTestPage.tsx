import React from 'react';
import { Link } from 'react-router-dom';
import SignupForm from '../modules/auth/components/SignupForm';

const SignupTestPage: React.FC = () => {
  const handleSignup = async (data: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    password: string; 
    termsAccepted: boolean 
  }) => {
    // Simulate signup process
    console.log('Signup attempt:', data);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo purposes, show success for test credentials
    if (data.email === 'demo@example.com') {
      const successMessage = `
🎉 Account Created Successfully!

Welcome ${data.firstName} ${data.lastName}!
Email: ${data.email}

In a real application, you would see:
• Email verification sent
• Welcome onboarding flow
• Dashboard with user profile
• Account settings access
      `;
      alert(successMessage);
    } else if (data.email === 'newuser@example.com') {
      throw new Error('Email already exists. Try a different email address.');
    } else {
      const successMessage = `
🎉 Account Created Successfully!

Welcome ${data.firstName} ${data.lastName}!
Email: ${data.email}

Your account has been created with enterprise-grade security.
      `;
      alert(successMessage);
    }
  };

  const handleLogin = () => {
    alert('Login functionality would be implemented here');
  };

  return (
    <div className="min-h-screen bg-primary-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-4">
            Signup Form Test
          </h1>
          <p className="text-primary-600 mb-4">
            Testing the signup form with password strength validation and our trust-inspiring colors
          </p>
          <div className="bg-primary-100 p-4 rounded-lg max-w-md mx-auto">
            <h3 className="font-semibold text-primary-800 mb-2">Demo Features:</h3>
            <ul className="text-sm text-primary-700 space-y-1 text-left">
              <li>• Real-time password strength meter</li>
              <li>• Comprehensive form validation</li>
              <li>• Trust-inspiring color palette</li>
              <li>• Terms & conditions checkbox</li>
              <li>• Responsive design</li>
            </ul>
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

        <SignupForm
          onSubmit={handleSignup}
          onLogin={handleLogin}
        />
      </div>
    </div>
  );
};

export default SignupTestPage; 