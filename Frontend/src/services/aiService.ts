import { apiClient } from './apiClient';

interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  username: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
    role?: string;
  };
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:4000' : 'https://api.codemaster.com');

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const res = await apiClient.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: data,
      requiresAuth: false,
    });

    if (res.error) {
      throw new Error(res.error.message || 'Registration failed');
    }

    return res.data!;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const res = await apiClient.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: data,
      requiresAuth: false,
    });

    if (res.error) {
      throw new Error(res.error.message || 'Login failed');
    }

    return res.data!;
  },

  logout() {
    localStorage.removeItem('persist_session');
    sessionStorage.removeItem('session_only');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // GitHub OAuth: redirect to backend OAuth endpoint
  async loginWithGithub() {
    const redirectUrl = `${API_BASE_URL}/auth/github`;
    window.location.href = redirectUrl;
  },

  // Google OAuth: redirect to backend OAuth endpoint
  async loginWithGoogle() {
    const redirectUrl = `${API_BASE_URL}/auth/google`;
    window.location.href = redirectUrl;
  },

  async getCurrentUser() {
    const res = await apiClient.get<AuthResponse>('/auth/me');
    if (res.error) {
      throw new Error(res.error.message || 'Failed to get current user');
    }
    return res.data;
  },

  async forgotPassword(email: string) {
    const res = await apiClient.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      requiresAuth: false,
    });

    if (res.error) {
      throw new Error(res.error.message || 'Password reset failed');
    }

    return res.data;
  },

  async resetPassword(token: string, newPassword: string) {
    const res = await apiClient.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: { token, password: newPassword },
      requiresAuth: false,
    });

    if (res.error) {
      throw new Error(res.error.message || 'Password reset failed');
    }

    return res.data;
  },
};