import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AccountProvider } from './contexts/AccountContext';
import UIComponentsTest from './pages/UIComponentsTest';
import LoginPage from './modules/auth/pages/LoginPage';
import LoginTestPage from './pages/LoginTestPage';
import SignupPage from './modules/auth/pages/SignupPage';
import SignupTestPage from './pages/SignupTestPage';
import { InvitationTestPage } from './modules/accounts/pages/InvitationTestPage';
import AccountSelectionPage from './pages/AccountSelectionPage';
import AccountSettingsPage from './pages/AccountSettingsPage';
import Dashboard from './pages/Dashboard';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AccountProvider>
        <Router>
          <Routes>
            <Route path="/" element={<UIComponentsTest />} />
            <Route path="/ui-test" element={<UIComponentsTest />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login-test" element={<LoginTestPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/signup-test" element={<SignupTestPage />} />
            <Route path="/invitation-test" element={<InvitationTestPage />} />
            <Route path="/accounts" element={<AccountSelectionPage />} />
            <Route path="/account-settings" element={<AccountSettingsPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Router>
      </AccountProvider>
    </AuthProvider>
  );
};

export default App; 