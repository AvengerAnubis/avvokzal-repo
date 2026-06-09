'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string | null;
}

export interface AuthState {
  user: User | null;
  access_token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  validateToken: () => Promise<boolean>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    access_token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Helper to set cookies (client-side)
  const setCookies = (token: string, user: User) => {
    if (typeof document !== 'undefined') {
      // Set cookie that expires in 7 days
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `access_token=${token};path=/;expires=${expires.toUTCString()}`;
      document.cookie = `user=${JSON.stringify(user)};path=/;expires=${expires.toUTCString()}`;
    }
  };

  // Helper to clear cookies
  const clearCookies = () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'access_token=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'user=;path=/;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  };

  // Background token validation (runs after mount, doesn't change isLoading)
  useEffect(() => {
    const validateToken = async () => {
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('access_token');
      if (!token) {
        // No token - stay logged out
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }
      try {
        const res = await authApi.validate(token);
        const data = res.data;
        if (data.valid && data.user) {
          const storedUser = localStorage.getItem('user');
          const user = storedUser ? JSON.parse(storedUser) : { id: data.user.sub, email: data.user.email, role: data.user.role };
          setAuthState({ user, access_token: token, isLoading: false, isAuthenticated: true });
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          setAuthState({ user: null, access_token: null, isLoading: false, isAuthenticated: false });
        }
      } catch {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };
    validateToken();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await authApi.login(email, password);
      const data = res.data;
      if (!data.access_token) {
        return { success: false, error: data.message || 'Ошибка входа' };
      }
      // Set cookies for middleware
      setCookies(data.access_token, data.user);
      // Also keep in localStorage for client-side use
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setAuthState({
        user: data.user,
        access_token: data.access_token,
        isLoading: false,
        isAuthenticated: true,
      });
      return { success: true };
    } catch (error: any) {
      const message = error?.response?.data?.message
        || error?.response?.data?.error
        || 'Ошибка подключения к серверу';
      return { success: false, error: message };
    }
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await authApi.register(data);
      const response = res.data;
      if (!response.access_token) {
        return { success: false, error: response.message || 'Ошибка регистрации' };
      }
      // Set cookies for middleware
      setCookies(response.access_token, response.user);
      // Also keep in localStorage for client-side use
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setAuthState({
        user: response.user,
        access_token: response.access_token,
        isLoading: false,
        isAuthenticated: true,
      });
      return { success: true };
    } catch (error: any) {
      const message = error?.response?.data?.message
        || error?.response?.data?.error
        || 'Ошибка подключения к серверу';
      return { success: false, error: message };
    }
  };

  const logout = useCallback(() => {
    clearCookies();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      access_token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  const validateToken = async (): Promise<boolean> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) return false;
    try {
      const res = await authApi.validate(token);
      return res.data.valid === true;
    } catch {
      return false;
    }
  };

  const hasRole = (role: string): boolean => {
    return authState.user?.role === role;
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, register, logout, validateToken, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}