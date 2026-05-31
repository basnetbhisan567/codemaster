import { apiClient } from './apiClient';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  username?: string;
  phone?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    level: number;
  };
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : 'https://api.codemaster.com');

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: data,
      requiresAuth: false,
    });

    if (response.data?.access_token) {
      apiClient.setToken(response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    if (response.error) {
      throw new Error(response.error.message || 'Registration failed');
    }

    return response.data!;
  },

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await apiClient.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: data,
      requiresAuth: false,
    });

    if (response.data?.access_token) {
      apiClient.setToken(response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    if (response.error) {
      throw new Error(response.error.message || 'Login failed');
    }

    return response.data!;
  },

  async getProfile() {
    const response = await apiClient.get('/profile/', { requiresAuth: true });
    return response.data;
  },

  async updateProfile(data: any) {
    const response = await apiClient.put('/profile/', data, { requiresAuth: true });
    return response.data;
  },

  logout() {
    apiClient.clearToken();
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
  },

  isAuthenticated(): boolean {
    return !!apiClient.getToken();
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // GitHub OAuth redirect
  async loginWithGithub() {
    const redirectUrl = `${API_BASE_URL}/auth/github`;
    window.location.href = redirectUrl;
  },

  // Google OAuth redirect
  async loginWithGoogle() {
    const redirectUrl = `${API_BASE_URL}/auth/google`;
    window.location.href = redirectUrl;
  },
};