import { ApiResponse, RequestConfig } from '../types/api.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
const REQUEST_TIMEOUT = 10000;

let isBackendAvailable = true;

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async safeParseResponse(response: Response) {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { method = 'GET', body, headers = {}, requiresAuth = false } = config;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    };

    if (requiresAuth) {
      const token = this.getToken();
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: requestHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      isBackendAvailable = true;

      const data = await this.safeParseResponse(response);

      return {
        data: response.ok ? (data as T) : null,
        error: response.ok ? null : data,
        status: response.status,
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      isBackendAvailable = false;

      if (error?.name === 'AbortError') {
        return {
          data: null,
          error: { code: 'TIMEOUT', message: 'Request timed out. Please start the backend server.' },
          status: 0,
          timestamp: new Date().toISOString(),
        };
      }

      return {
        data: null,
        error: { code: 'NETWORK_ERROR', message: error?.message || 'Backend server is not running.' },
        status: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async checkBackendHealth(): Promise<boolean> {
    const result = await this.request('/health', { method: 'GET', requiresAuth: false });
    isBackendAvailable = result.status === 200;
    return isBackendAvailable;
  }

  get<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'POST', body });
  }

  put<T>(endpoint: string, body?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body });
  }

  delete<T>(endpoint: string, config?: Omit<RequestConfig, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();