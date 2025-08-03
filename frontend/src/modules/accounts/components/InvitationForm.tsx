import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';

interface InvitationFormProps {
  accountId: string;
  onSubmit: (data: { email: string; role: string; message?: string }) => void;
  loading?: boolean;
}

const roleOptions = [
  { value: 'viewer', label: 'Viewer - Read-only access to Household dashboard' },
  { value: 'editor', label: 'Editor - Can create/edit inventory, policies, claims' },
  { value: 'admin', label: 'Admin - Can manage members and account settings' },
  { value: 'legal_advisor', label: 'Legal Advisor - Read-only access to Household dashboard' },
  { value: 'financial_advisor', label: 'Financial Advisor - Read-only access to Household dashboard' },
];

export const InvitationForm: React.FC<InvitationFormProps> = ({
  accountId,
  onSubmit,
  loading = false,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({
        email: email.trim(),
        role,
        message: message.trim() || undefined,
      });
      
      // Reset form
      setEmail('');
      setRole('viewer');
      setMessage('');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Invite Team Member</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="colleague@example.com"
            error={errors.email}
            required
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role *
          </label>
          <Select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            error={errors.role}
            required
          >
            {roleOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Personal Message (Optional)
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a personal message to your invitation..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full"
        >
          Send Invitation
        </Button>
      </form>

      <div className="mt-4 text-sm text-gray-600">
        <p className="mb-2">Invitation will expire in 7 days.</p>
        <p>Only account owners and admins can send invitations.</p>
      </div>
    </div>
  );
}; 