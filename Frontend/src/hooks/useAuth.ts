import { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { User } from '../types/user';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = apiClient.getToken();
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await apiClient.get<User>('/auth/me');
      if (response.data) {
        setUser(response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiClient.post<{ user: User; token: string }>('/auth/login', { email, password });
    if (response.data) {
      apiClient.setToken(response.data.token);
      setUser(response.data.user);
      return true;
    }
    return false;
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
  };

  return { user, loading, login, logout, isAuthenticated: !!user };
};