import React from 'react';
import { clsx } from 'clsx';
import { useForm, Controller, FieldError } from 'react-hook-form';
import { Input } from './Input';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { Radio } from './Radio';

export interface FormField {
  name: string;
  label?: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'checkbox' | 'radio' | 'select';
  placeholder?: string;
  required?: boolean;
  validation?: {
    required?: string;
    minLength?: { value: number; message: string };
    maxLength?: { value: number; message: string };
    pattern?: { value: RegExp; message: string };
    validate?: (value: any) => string | true;
  };
  options?: Array<{ label: string; value: string }>;
  helperText?: string;
}

export interface FormProps {
  fields: FormField[];
  onSubmit: (data: any) => void;
  submitLabel?: string;
  loading?: boolean;
  className?: string;
  defaultValues?: Record<string, any>;
}

const Form: React.FC<FormProps> = ({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  loading = false,
  className,
  defaultValues = {},
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues,
  });

  const renderField = (field: FormField) => {
    const error = errors[field.name] as FieldError | undefined;

    switch (field.type) {
      case 'textarea':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={field.validation}
            render={({ field: { onChange, value } }) => {
              const textareaId = `textarea-${Math.random().toString(36).substr(2, 9)}`;
              return (
                <div className="space-y-2">
                  {field.label && (
                    <label htmlFor={textareaId} className="text-sm font-medium leading-none">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </label>
                  )}
                  <textarea
                    id={textareaId}
                    className={clsx(
                      'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                      error && 'border-destructive focus-visible:ring-destructive'
                    )}
                    placeholder={field.placeholder}
                    value={value || ''}
                    onChange={onChange}
                    rows={4}
                  />
                  {error && (
                    <p className="text-sm text-destructive">{error.message}</p>
                  )}
                  {field.helperText && !error && (
                    <p className="text-sm text-muted-foreground">{field.helperText}</p>
                  )}
                </div>
              );
            }}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={field.validation}
            render={({ field: { onChange, value } }) => {
              const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;
              return (
                <div className="space-y-2">
                  {field.label && (
                    <label htmlFor={selectId} className="text-sm font-medium leading-none">
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </label>
                  )}
                  <select
                    id={selectId}
                    className={clsx(
                      'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                      error && 'border-destructive focus-visible:ring-destructive'
                    )}
                    value={value || ''}
                    onChange={onChange}
                  >
                    <option value="">Select an option</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {error && (
                    <p className="text-sm text-destructive">{error.message}</p>
                  )}
                  {field.helperText && !error && (
                    <p className="text-sm text-muted-foreground">{field.helperText}</p>
                  )}
                </div>
              );
            }}
          />
        );

      case 'checkbox':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={field.validation}
            render={({ field: { onChange, value } }) => (
              <Checkbox
                label={field.label}
                checked={value || false}
                onChange={onChange}
                error={error?.message}
                helperText={field.helperText}
              />
            )}
          />
        );

      case 'radio':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={field.validation}
            render={({ field: { onChange, value } }) => (
              <div className="space-y-2">
                {field.label && (
                  <label className="text-sm font-medium leading-none">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </label>
                )}
                <div className="space-y-2">
                  {field.options?.map((option) => (
                    <Radio
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      checked={value === option.value}
                      onChange={onChange}
                    />
                  ))}
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error.message}</p>
                )}
                {field.helperText && !error && (
                  <p className="text-sm text-muted-foreground">{field.helperText}</p>
                )}
              </div>
            )}
          />
        );

      default:
        return (
          <Controller
            name={field.name}
            control={control}
            rules={field.validation}
            render={({ field: { onChange, value, onBlur } }) => (
              <Input
                type={field.type}
                label={field.label}
                placeholder={field.placeholder}
                value={value || ''}
                onChange={onChange}
                onBlur={onBlur}
                error={error?.message}
                helperText={field.helperText}
                required={field.required}
              />
            )}
          />
        );
    }
  };

  const onSubmitHandler = (data: any) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className={clsx('space-y-6', className)}>
      {fields.map((field) => (
        <div key={field.name}>
          {renderField(field)}
        </div>
      ))}
      
      <Button type="submit" loading={loading} className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
};

export { Form }; 