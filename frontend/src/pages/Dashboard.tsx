import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-primary-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-900 mb-2">Dashboard</h1>
          <p className="text-primary-600">Welcome back, {user?.firstName} {user?.lastName}!</p>
        </div>

        {/* User Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Account Created:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/account-settings">Account Settings</Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link to="/accounts">Manage Accounts</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/accounts">View Accounts</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/account-settings">Account Settings</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/profile">Edit Profile</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/change-password">Change Password</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/invitation-test">Test Invitations</Link>
                </Button>
                <Button onClick={handleLogout} variant="outline" className="w-full">
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Links */}
        <Card>
          <CardHeader>
            <CardTitle>All Available Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/">Home</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/signup">Signup</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/accounts">Accounts</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/account-settings">Account Settings</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/invitation-test">Invitation Test</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/ui-test">UI Components</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link to="/login-test">Login Test</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 