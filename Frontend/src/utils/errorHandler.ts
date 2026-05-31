import { toast } from 'react-hot-toast';

export const errorHandler = {
  handle: (error: any, customMessage?: string) => {
    console.error('Error:', error);
    
    const message = customMessage || error.message || 'Something went wrong';
    toast.error(message);
    
    if (error.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
  },

  warn: (message: string) => {
    console.warn(message);
    toast(message, { icon: '⚠️' });
  },

  success: (message: string) => {
    toast.success(message);
  },
};