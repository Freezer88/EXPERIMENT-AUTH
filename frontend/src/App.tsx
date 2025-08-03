import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import UIComponentsTest from './pages/UIComponentsTest';
import LoginPage from './modules/auth/pages/LoginPage';
import LoginTestPage from './pages/LoginTestPage';
import SignupPage from './modules/auth/pages/SignupPage';
import SignupTestPage from './pages/SignupTestPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<UIComponentsTest />} />
          <Route path="/ui-test" element={<UIComponentsTest />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/login-test" element={<LoginTestPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/signup-test" element={<SignupTestPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App; 