import { ApiError } from '../types/api.types';

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validators = {
  email: (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  password: (password: string): boolean => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);
  },

  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  code: (code: string, language: string): boolean => {
    return code.length > 0 && code.length < 100000;
  },
};

export const errorHandler = {
  parse(error: unknown): ApiError {
    if (error instanceof Error) {
      return {
        code: 'UNKNOWN_ERROR',
        message: error.message,
      };
    }
    if (typeof error === 'string') {
      return {
        code: 'UNKNOWN_ERROR',
        message: error,
      };
    }
    return {
      code: 'UNKNOWN_ERROR',
      message: 'An unknown error occurred',
    };
  },

  isNetworkError(error: unknown): boolean {
    return error instanceof TypeError && error.message.includes('network');
  },

  isAuthError(error: ApiError): boolean {
    return error.code.startsWith('AUTH_');
  },

  getFriendlyMessage(error: ApiError): string {
    const messages: Record<string, string> = {
      'AUTH_INVALID_CREDENTIALS': 'Invalid email or password',
      'AUTH_EMAIL_EXISTS': 'This email is already registered',
      'RATE_LIMIT_EXCEEDED': 'Too many requests. Please try again later',
      'NETWORK_ERROR': 'Network connection issue. Please check your internet',
      'VALIDATION_ERROR': 'Please check your input and try again',
    };
    return messages[error.code] || error.message;
  },
};