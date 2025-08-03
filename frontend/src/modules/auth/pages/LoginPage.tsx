import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../../../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (data: { email: string; password: string }) => {
    setIsSubmitting(true);
    try {
      await login(data);
      // Navigate to dashboard or home page after successful login
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the AuthContext and displayed in the form
      console.error('Login error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      isLoading={isLoading || isSubmitting}
      error={error}
      onForgotPassword={handleForgotPassword}
      onSignup={handleSignup}
    />
  );
};

export default LoginPage; 