import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth, User } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';

// Mock authApi
jest.mock('@/lib/api', () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    validate: jest.fn(),
  },
}));

import { authApi } from '@/lib/api';

// Test component that uses the auth context
function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="isAuthenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="isLoading">{String(auth.isLoading)}</span>
      <span data-testid="user">{auth.user ? JSON.stringify(auth.user) : 'null'}</span>
      <span data-testid="hasRoleAdmin">{String(auth.hasRole('ADMIN'))}</span>
      <span data-testid="hasRoleUser">{String(auth.hasRole('USER'))}</span>
      <button data-testid="logoutBtn" onClick={auth.logout}>Logout</button>
    </div>
  );
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

describe('Auth Context', () => {
  const mockUser: User = {
    id: 'user-1',
    email: 'test@test.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'USER',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(), replace: jest.fn(), prefetch: jest.fn(), back: jest.fn(), forward: jest.fn(),
    });
  });

  describe('initial state', () => {
    it('should start with isAuthenticated=false and user=null when no token', async () => {
      renderWithAuth();

      // useEffect runs synchronously in jsdom, so isLoading transitions quickly
      await waitFor(() => {
        expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
        expect(screen.getByTestId('user').textContent).toBe('null');
        expect(screen.getByTestId('isLoading').textContent).toBe('false');
      });
    });
  });

  describe('login', () => {
    it('should return success on successful login', async () => {
      (authApi.login as jest.Mock).mockResolvedValue({
        data: { access_token: 'token123', user: mockUser },
      });

      function LoginTest() {
        const { login } = useAuth();
        const [result, setResult] = React.useState<string>('pending');
        React.useEffect(() => {
          login('test@test.com', 'password').then(r => setResult(r.success ? 'success' : 'failed'));
        }, []);
        return <span data-testid="loginResult">{result}</span>;
      }

      render(
        <AuthProvider>
          <LoginTest />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loginResult').textContent).toBe('success');
      });

      expect(authApi.login).toHaveBeenCalledWith('test@test.com', 'password');
    });

    it('should return error on login failure (no token)', async () => {
      (authApi.login as jest.Mock).mockResolvedValue({
        data: { message: 'Invalid credentials' },
      });

      function LoginTest() {
        const { login } = useAuth();
        const [result, setResult] = React.useState<string>('pending');
        React.useEffect(() => {
          login('test@test.com', 'wrong').then(r => setResult(r.success ? 'success' : 'failed'));
        }, []);
        return <span data-testid="loginResult">{result}</span>;
      }

      render(
        <AuthProvider>
          <LoginTest />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loginResult').textContent).toBe('failed');
      });
    });

    it('should return error on network failure', async () => {
      (authApi.login as jest.Mock).mockRejectedValue(new Error('Network error'));

      function LoginTest() {
        const { login } = useAuth();
        const [result, setResult] = React.useState<string>('pending');
        React.useEffect(() => {
          login('test@test.com', 'password').then(r => setResult(r.success ? 'success' : 'failed'));
        }, []);
        return <span data-testid="loginResult">{result}</span>;
      }

      render(
        <AuthProvider>
          <LoginTest />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loginResult').textContent).toBe('failed');
      });
    });
  });

  describe('register', () => {
    it('should return success on successful registration', async () => {
      (authApi.register as jest.Mock).mockResolvedValue({
        data: { access_token: 'token123', user: mockUser },
      });

      function RegisterTest() {
        const { register } = useAuth();
        const [result, setResult] = React.useState<string>('pending');
        React.useEffect(() => {
          register({ email: 'new@test.com', password: 'pass', firstName: 'Jane', lastName: 'Doe' })
            .then(r => setResult(r.success ? 'success' : 'failed'));
        }, []);
        return <span data-testid="registerResult">{result}</span>;
      }

      render(
        <AuthProvider>
          <RegisterTest />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('registerResult').textContent).toBe('success');
      });
    });

    it('should return error on registration failure', async () => {
      (authApi.register as jest.Mock).mockResolvedValue({
        data: { message: 'Email already exists' },
      });

      function RegisterTest() {
        const { register } = useAuth();
        const [result, setResult] = React.useState<string>('pending');
        React.useEffect(() => {
          register({ email: 'taken@test.com', password: 'pass', firstName: 'Jane', lastName: 'Doe' })
            .then(r => setResult(r.success ? 'success' : 'failed'));
        }, []);
        return <span data-testid="registerResult">{result}</span>;
      }

      render(
        <AuthProvider>
          <RegisterTest />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('registerResult').textContent).toBe('failed');
      });
    });
  });

  describe('logout', () => {
    it('should clear localStorage and reset state', async () => {
      renderWithAuth();

      await act(async () => {
        screen.getByTestId('logoutBtn').click();
      });

      expect(window.localStorage.removeItem).toHaveBeenCalledWith('access_token');
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('user');
      expect(screen.getByTestId('isAuthenticated').textContent).toBe('false');
      expect(screen.getByTestId('user').textContent).toBe('null');
    });
  });

  describe('validateToken', () => {
    it('should return false when no token', async () => {
      function ValidateTest() {
        const { validateToken } = useAuth();
        const [result, setResult] = React.useState<string>('pending');
        React.useEffect(() => {
          validateToken().then(v => setResult(v ? 'valid' : 'invalid'));
        }, []);
        return <span data-testid="validateResult">{result}</span>;
      }

      render(
        <AuthProvider>
          <ValidateTest />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('validateResult').textContent).toBe('invalid');
      });
    });

    it('should return true when token is valid', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('token123');
      (authApi.validate as jest.Mock).mockResolvedValue({ data: { valid: true } });

      function ValidateTest() {
        const { validateToken } = useAuth();
        const [result, setResult] = React.useState<string>('pending');
        React.useEffect(() => {
          validateToken().then(v => setResult(v ? 'valid' : 'invalid'));
        }, []);
        return <span data-testid="validateResult">{result}</span>;
      }

      render(
        <AuthProvider>
          <ValidateTest />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('validateResult').textContent).toBe('valid');
      });
    });

    it('should return false when validation fails', async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue('expired-token');
      (authApi.validate as jest.Mock).mockRejectedValue(new Error('Unauthorized'));

      function ValidateTest() {
        const { validateToken } = useAuth();
        const [result, setResult] = React.useState<string>('pending');
        React.useEffect(() => {
          validateToken().then(v => setResult(v ? 'valid' : 'invalid'));
        }, []);
        return <span data-testid="validateResult">{result}</span>;
      }

      render(
        <AuthProvider>
          <ValidateTest />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('validateResult').textContent).toBe('invalid');
      });
    });
  });

  describe('hasRole', () => {
    it('should return true when user has the role', async () => {
      (window.localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'access_token') return 'token123';
        if (key === 'user') return JSON.stringify(mockUser);
        return null;
      });
      (authApi.validate as jest.Mock).mockResolvedValue({
        data: { valid: true, user: { sub: 'user-1', email: 'test@test.com', role: 'USER' } },
      });

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByTestId('hasRoleUser').textContent).toBe('true');
      });
    });

    it('should return false when user does not have the role', async () => {
      (window.localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === 'access_token') return 'token123';
        if (key === 'user') return JSON.stringify(mockUser);
        return null;
      });
      (authApi.validate as jest.Mock).mockResolvedValue({
        data: { valid: true, user: { sub: 'user-1', email: 'test@test.com', role: 'USER' } },
      });

      renderWithAuth();

      await waitFor(() => {
        expect(screen.getByTestId('hasRoleAdmin').textContent).toBe('false');
      });
    });
  });

  describe('useAuth hook', () => {
    it('should throw when used outside AuthProvider', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => render(<TestConsumer />)).toThrow('useAuth must be used within an AuthProvider');

      consoleError.mockRestore();
    });
  });
});
