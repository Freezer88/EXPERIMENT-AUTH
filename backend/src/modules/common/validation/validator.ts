import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data?: any;
}

// Validate request data against a Joi schema
export const validateRequest = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationErrors: ValidationError[] = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      res.status(400).json({
        error: 'Validation Error',
        message: 'Request validation failed',
        details: validationErrors,
      });
      return;
    }

    // Replace request body with validated data
    req.body = value;
    next();
  };
};

// Validate query parameters against a Joi schema
export const validateQuery = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationErrors: ValidationError[] = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      res.status(400).json({
        error: 'Validation Error',
        message: 'Query parameter validation failed',
        details: validationErrors,
      });
      return;
    }

    // Replace request query with validated data
    req.query = value;
    next();
  };
};

// Validate path parameters against a Joi schema
export const validateParams = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const validationErrors: ValidationError[] = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      res.status(400).json({
        error: 'Validation Error',
        message: 'Path parameter validation failed',
        details: validationErrors,
      });
      return;
    }

    // Replace request params with validated data
    req.params = value;
    next();
  };
};

// Generic validation function
export const validate = (schema: Schema, data: any): ValidationResult => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const validationErrors: ValidationError[] = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));

    return {
      isValid: false,
      errors: validationErrors,
    };
  }

  return {
    isValid: true,
    errors: [],
    data: value,
  };
};

// Sanitize and validate email
export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

// Sanitize and validate phone number
export const sanitizePhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters except +
  return phoneNumber.replace(/[^\d+]/g, '');
};

// Validate password strength
export const validatePasswordStrength = (password: string): ValidationResult => {
  const errors: ValidationError[] = [];

  if (password.length < 8) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters long',
    });
  }

  if (password.length > 128) {
    errors.push({
      field: 'password',
      message: 'Password must be no more than 128 characters long',
    });
  }

  if (!/[a-z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one lowercase letter',
    });
  }

  if (!/[A-Z]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one uppercase letter',
    });
  }

  if (!/\d/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one number',
    });
  }

  if (!/[@$!%*?&]/.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must contain at least one special character (@$!%*?&)',
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}; 