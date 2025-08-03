import React, { useState } from 'react';
import { InvitationForm } from '../components/InvitationForm';

export const InvitationTestPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInvitationSubmit = async (data: { email: string; role: string; message?: string }) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Simulate API call to backend
      const response = await fetch('http://localhost:3000/api/accounts/test-account-id/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token', // In real app, this would be the actual JWT token
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setResult(result);
        console.log('✅ Invitation created successfully:', result);
      } else {
        setError(result.message || 'Failed to create invitation');
        console.error('❌ Invitation creation failed:', result);
      }
    } catch (err) {
      setError('Network error. Make sure the backend server is running on port 3000.');
      console.error('❌ Network error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invitation System Test</h1>
          <p className="text-gray-600">
            This page demonstrates the invitation form functionality. 
            Make sure the backend server is running on port 3000 to test the API calls.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Invitation Form */}
          <div>
            <InvitationForm
              accountId="test-account-id"
              onSubmit={handleInvitationSubmit}
              loading={loading}
            />
          </div>

          {/* Results Display */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Instructions</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>1. Fill out the invitation form on the left</p>
                <p>2. Click "Send Invitation" to test the API call</p>
                <p>3. Check the results below</p>
                <p>4. Check the browser console for detailed logs</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Success!</h3>
                <div className="text-green-700">
                  <p><strong>Invitation ID:</strong> {result.invitation?.id}</p>
                  <p><strong>Email:</strong> {result.invitation?.email}</p>
                  <p><strong>Role:</strong> {result.invitation?.role}</p>
                  <p><strong>Status:</strong> {result.invitation?.status}</p>
                  <p><strong>Expires:</strong> {new Date(result.invitation?.expiresAt).toLocaleString()}</p>
                </div>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Backend API Endpoints</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>POST</strong> /api/accounts/:accountId/invitations</p>
                <p><strong>GET</strong> /api/accounts/:accountId/invitations</p>
                <p><strong>GET</strong> /api/accounts/invitations/:token</p>
                <p><strong>POST</strong> /api/accounts/invitations/:token/accept</p>
                <p><strong>DELETE</strong> /api/accounts/invitations/:invitationId</p>
                <p><strong>POST</strong> /api/accounts/invitations/:invitationId/resend</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 