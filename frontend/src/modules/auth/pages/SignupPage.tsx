import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignupForm from '../components/SignupForm';
import { useAuth } from '../../../contexts/AuthContext';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (data: { 
    firstName: string; 
    lastName: string; 
    email: string; 
    password: string; 
    termsAccepted: boolean 
  }) => {
    setIsSubmitting(true);
    try {
      await register(data);
      // Navigate to dashboard after successful signup (account is created automatically)
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the AuthContext and displayed in the form
      console.error('Signup error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <SignupForm
      onSubmit={handleSignup}
      isLoading={isLoading || isSubmitting}
      error={error || undefined}
      onLogin={handleLogin}
    />
  );
};

export default SignupPage; 