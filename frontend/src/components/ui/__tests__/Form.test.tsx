import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from '../Form';

const mockOnSubmit = jest.fn();

const defaultFields = [
  {
    name: 'email',
    label: 'Email',
    type: 'email' as const,
    placeholder: 'Enter your email',
    required: true,
    validation: {
      required: 'Email is required',
      pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email',
      },
    },
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password' as const,
    placeholder: 'Enter your password',
    required: true,
    validation: {
      required: 'Password is required',
      minLength: {
        value: 8,
        message: 'Password must be at least 8 characters',
      },
    },
  },
  {
    name: 'agree',
    label: 'I agree to the terms',
    type: 'checkbox' as const,
    required: true,
    validation: {
      required: 'You must agree to the terms',
    },
  },
];

describe('Form Integration', () => {
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders form with all field types', () => {
    render(
      <Form
        fields={defaultFields}
        onSubmit={mockOnSubmit}
        submitLabel="Submit Form"
      />
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/agree to the terms/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit form/i })).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    
    render(
      <Form
        fields={defaultFields}
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
      />
    );

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByLabelText(/agree to the terms/i));
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        agree: true,
      });
    });
  });

  it('shows validation errors for invalid data', async () => {
    const user = userEvent.setup();
    
    render(
      <Form
        fields={defaultFields}
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
      />
    );

    // Submit without filling required fields
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/you must agree to the terms/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    
    render(
      <Form
        fields={defaultFields}
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
      />
    );

    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByLabelText(/agree to the terms/i));
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates password length', async () => {
    const user = userEvent.setup();
    
    render(
      <Form
        fields={defaultFields}
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
      />
    );

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'short');
    await user.click(screen.getByLabelText(/agree to the terms/i));
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('handles textarea fields', async () => {
    const fieldsWithTextarea = [
      {
        name: 'description',
        label: 'Description',
        type: 'textarea' as const,
        placeholder: 'Enter description',
        validation: {
          required: 'Description is required',
        },
      },
    ];

    const user = userEvent.setup();
    
    render(
      <Form
        fields={fieldsWithTextarea}
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
      />
    );

    const textarea = screen.getByLabelText(/description/i);
    await user.type(textarea, 'This is a test description');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        description: 'This is a test description',
      });
    });
  });

  it('handles select fields', async () => {
    const fieldsWithSelect = [
      {
        name: 'category',
        label: 'Category',
        type: 'select' as const,
        options: [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
        ],
        validation: {
          required: 'Please select a category',
        },
      },
    ];

    const user = userEvent.setup();
    
    render(
      <Form
        fields={fieldsWithSelect}
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
      />
    );

    const select = screen.getByLabelText(/category/i);
    await user.selectOptions(select, 'option1');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        category: 'option1',
      });
    });
  });

  it('handles radio button fields', async () => {
    const fieldsWithRadio = [
      {
        name: 'gender',
        label: 'Gender',
        type: 'radio' as const,
        options: [
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
        ],
        validation: {
          required: 'Please select a gender',
        },
      },
    ];

    const user = userEvent.setup();
    
    render(
      <Form
        fields={fieldsWithRadio}
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
      />
    );

    const maleRadio = screen.getByLabelText(/male/i);
    await user.click(maleRadio);
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        gender: 'male',
      });
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    
    render(
      <Form
        fields={defaultFields}
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
        loading={true}
      />
    );

    const submitButton = screen.getByRole('button', { name: /submit/i });
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveClass('opacity-50');
  });

  it('uses default values', async () => {
    const defaultValues = {
      email: 'default@example.com',
      password: 'defaultpass',
      agree: true,
    };

    render(
      <Form
        fields={defaultFields}
        onSubmit={mockOnSubmit}
        defaultValues={defaultValues}
        submitLabel="Submit"
      />
    );

    expect(screen.getByLabelText(/email/i)).toHaveValue('default@example.com');
    expect(screen.getByLabelText(/password/i)).toHaveValue('defaultpass');
    expect(screen.getByLabelText(/agree to the terms/i)).toBeChecked();
  });

  it('handles form reset', async () => {
    const user = userEvent.setup();
    
    render(
      <Form
        fields={defaultFields}
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
      />
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    // Reset form by unmounting and remounting
    const { unmount } = render(
      <Form
        fields={defaultFields}
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
      />
    );

    unmount();

    const { rerender } = render(
      <Form
        fields={defaultFields}
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
      />
    );

    expect(screen.getByLabelText(/email/i)).toHaveValue('');
    expect(screen.getByLabelText(/password/i)).toHaveValue('');
  });

  it('handles helper text display', () => {
    const fieldsWithHelperText = [
      {
        name: 'username',
        label: 'Username',
        type: 'text' as const,
        helperText: 'Username must be at least 3 characters long',
      },
    ];

    render(
      <Form
        fields={fieldsWithHelperText}
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
      />
    );

    expect(screen.getByText(/username must be at least 3 characters long/i)).toBeInTheDocument();
  });

  it('handles error state display', async () => {
    const user = userEvent.setup();
    
    render(
      <Form
        fields={defaultFields}
        onSubmit={mockOnSubmit}
        submitLabel="Submit"
      />
    );

    // Submit without filling required fields to trigger errors
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
    });
  });
}); 