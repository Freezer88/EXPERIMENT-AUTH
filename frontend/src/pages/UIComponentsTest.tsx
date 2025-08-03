import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Toast, ToastContainer } from '../components/ui/Toast';
import { Spinner, LoadingOverlay, LoadingButton } from '../components/ui/Spinner';
import { Checkbox } from '../components/ui/Checkbox';
import { Radio } from '../components/ui/Radio';

interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

const UIComponentsTest: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    checkbox: false,
    radio: '',
  });

  const addToast = (type: ToastItem['type'], title: string, message?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 3000);
  };

  // Convert ToastItem to ToastProps for the container
  const toastProps = toasts.map(toast => ({
    ...toast,
    onClose: () => removeToast(toast.id),
  }));

  return (
    <div className="min-h-screen bg-primary-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-900 mb-4">
            Trust & Calm UI Components
          </h1>
          <p className="text-lg text-primary-600">
            Scientifically proven colors that evoke trust and calm
          </p>
          <p className="text-sm text-primary-500 mt-2">
            Blue for trust, Green for growth, Soft grays for balance
          </p>
        </div>

        {/* Cards Section - Prominently Featured */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-primary-900 text-center">Cards</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Default Card */}
            <Card className="cursor-pointer transition-all duration-200 hover:scale-105">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>
                  Clean white background with trust-inspiring blue accents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-primary-600">
                  This card uses our calming color palette with proper hover states.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="primary">Action</Button>
              </CardFooter>
            </Card>

            {/* Elevated Card */}
            <Card variant="elevated" className="cursor-pointer transition-all duration-200 hover:scale-105">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>
                  Enhanced shadow for depth and trust
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-primary-600">
                  Notice the enhanced shadow and smooth hover animation.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="secondary">Learn More</Button>
              </CardFooter>
            </Card>

            {/* Success Card */}
            <Card className="cursor-pointer transition-all duration-200 hover:scale-105 border-success-200 hover:border-success-300">
              <CardHeader>
                <CardTitle className="text-success-700">Success Card</CardTitle>
                <CardDescription>
                  Green accents for growth and prosperity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-success-600">
                  Green represents growth, security, and prosperity.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" variant="success">Success</Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>
              Trust-inspiring button designs with calming interactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-700">Button Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="outline">Outline Button</Button>
                <Button variant="ghost">Ghost Button</Button>
                <Button variant="destructive">Destructive Button</Button>
                <Button variant="success">Success Button</Button>
                <Button variant="warning">Warning Button</Button>
                <Button variant="link">Link Button</Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-700">Button Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-700">Button States</h3>
              <div className="flex flex-wrap gap-4">
                <Button loading>Loading Button</Button>
                <Button disabled>Disabled Button</Button>
                <Button fullWidth>Full Width Button</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inputs Section */}
        <Card>
          <CardHeader>
            <CardTitle>Input Fields</CardTitle>
            <CardDescription>
              Calming input designs with gentle focus states
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Default Input"
                placeholder="Enter your text here"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
              
              <Input
                label="Input with Error"
                placeholder="This input has an error"
                error="This field is required"
              />
              
              <Input
                label="Input with Helper Text"
                placeholder="Enter your password"
                type="password"
                helperText="Must be at least 8 characters long"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              />
              
              <Input
                label="Input with Icons"
                placeholder="Search..."
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
                rightIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
              />
              
              <Input
                label="Required Input"
                placeholder="This field is required"
                required
              />
              
              <Input
                label="Disabled Input"
                placeholder="This input is disabled"
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Form Controls Section */}
        <Card>
          <CardHeader>
            <CardTitle>Form Controls</CardTitle>
            <CardDescription>
              Gentle form controls with calming interactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-700">Checkboxes</h3>
                <Checkbox
                  label="Default checkbox"
                  checked={formData.checkbox}
                  onChange={(e) => setFormData(prev => ({ ...prev, checkbox: e.target.checked }))}
                />
                <Checkbox
                  label="Checkbox with error"
                  error="This field is required"
                />
                <Checkbox
                  label="Checkbox with helper text"
                  helperText="This is some helpful information"
                />
                <Checkbox
                  label="Disabled checkbox"
                  disabled
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary-700">Radio Buttons</h3>
                <Radio
                  label="Option 1"
                  name="radio-group"
                  value="option1"
                  checked={formData.radio === 'option1'}
                  onChange={(e) => setFormData(prev => ({ ...prev, radio: e.target.value }))}
                />
                <Radio
                  label="Option 2"
                  name="radio-group"
                  value="option2"
                  checked={formData.radio === 'option2'}
                  onChange={(e) => setFormData(prev => ({ ...prev, radio: e.target.value }))}
                />
                <Radio
                  label="Option with error"
                  name="radio-group"
                  value="option3"
                  error="This field is required"
                />
                <Radio
                  label="Disabled option"
                  name="radio-group"
                  value="option4"
                  disabled
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading States Section */}
        <Card>
          <CardHeader>
            <CardTitle>Loading States</CardTitle>
            <CardDescription>
              Calming loading indicators with gentle animations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-700">Spinner Sizes</h3>
              <div className="flex items-center gap-4">
                <Spinner size="xs" />
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
                <Spinner size="xl" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-700">Spinner Colors</h3>
              <div className="flex items-center gap-4">
                <Spinner spinnerColor="primary" />
                <Spinner spinnerColor="secondary" />
                <Spinner spinnerColor="success" />
                <Spinner spinnerColor="error" />
                <Spinner spinnerColor="warning" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-700">Loading Button</h3>
              <LoadingButton loading={isLoading}>
                <Button onClick={handleLoading}>
                  {isLoading ? 'Loading...' : 'Click to Load'}
                </Button>
              </LoadingButton>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Components Section */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Components</CardTitle>
            <CardDescription>
              Trust-inspiring modals and gentle notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-700">Modal</h3>
              <Button onClick={() => setIsModalOpen(true)}>
                Open Modal
              </Button>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-primary-700">Toasts</h3>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="success"
                  onClick={() => addToast('success', 'Success!', 'Your action was completed successfully.')}
                >
                  Success Toast
                </Button>
                <Button
                  variant="error"
                  onClick={() => addToast('error', 'Error!', 'Something went wrong. Please try again.')}
                >
                  Error Toast
                </Button>
                <Button
                  variant="warning"
                  onClick={() => addToast('warning', 'Warning!', 'Please review your input before proceeding.')}
                >
                  Warning Toast
                </Button>
                <Button
                  variant="outline"
                  onClick={() => addToast('info', 'Info', 'Here is some helpful information.')}
                >
                  Info Toast
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette Section */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>
              Scientifically proven calming and trust-inspiring colors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-primary-700">Primary (Trust)</h4>
                <div className="space-y-2">
                  <div className="h-8 bg-primary-50 rounded border border-primary-100"></div>
                  <div className="h-8 bg-primary-100 rounded border border-primary-200"></div>
                  <div className="h-8 bg-primary-300 rounded border border-primary-400"></div>
                  <div className="h-8 bg-primary-500 rounded border border-primary-600"></div>
                  <div className="h-8 bg-primary-700 rounded border border-primary-800"></div>
                </div>
                <p className="text-xs text-secondary-600">Blue - Trust, reliability, calmness</p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-success-700">Success (Growth)</h4>
                <div className="space-y-2">
                  <div className="h-8 bg-success-50 rounded border border-success-100"></div>
                  <div className="h-8 bg-success-100 rounded border border-success-200"></div>
                  <div className="h-8 bg-success-300 rounded border border-success-400"></div>
                  <div className="h-8 bg-success-500 rounded border border-success-600"></div>
                  <div className="h-8 bg-success-700 rounded border border-success-800"></div>
                </div>
                <p className="text-xs text-secondary-600">Green - Growth, security, prosperity</p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-secondary-700">Secondary (Balance)</h4>
                <div className="space-y-2">
                  <div className="h-8 bg-secondary-50 rounded border border-secondary-100"></div>
                  <div className="h-8 bg-secondary-100 rounded border border-secondary-200"></div>
                  <div className="h-8 bg-secondary-300 rounded border border-secondary-400"></div>
                  <div className="h-8 bg-secondary-500 rounded border border-secondary-600"></div>
                  <div className="h-8 bg-secondary-700 rounded border border-secondary-800"></div>
                </div>
                <p className="text-xs text-secondary-600">Gray - Balance, neutrality, calm</p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-error-700">Error (Gentle)</h4>
                <div className="space-y-2">
                  <div className="h-8 bg-error-50 rounded border border-error-100"></div>
                  <div className="h-8 bg-error-100 rounded border border-error-200"></div>
                  <div className="h-8 bg-error-300 rounded border border-error-400"></div>
                  <div className="h-8 bg-error-500 rounded border border-error-600"></div>
                  <div className="h-8 bg-error-700 rounded border border-error-800"></div>
                </div>
                <p className="text-xs text-secondary-600">Red - Gentle error states</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
        description="This modal demonstrates the calming and trust-inspiring design system."
        size="md"
      >
        <div className="space-y-4">
          <p className="text-secondary-600">
            This design system uses colors and interactions that are scientifically proven 
            to evoke feelings of calm and trust. The soft blues, gentle greens, and balanced 
            grays work together to create a peaceful, reliable user experience.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast Container */}
      <ToastContainer toasts={toastProps} onClose={removeToast} position="top-right" />

      {/* Loading Overlay */}
      <LoadingOverlay isVisible={isLoading} label="Processing your request..." />
    </div>
  );
};

export default UIComponentsTest; 