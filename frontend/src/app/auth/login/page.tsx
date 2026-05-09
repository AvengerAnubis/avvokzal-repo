'use client';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Ошибка входа');
      }
    } catch {
      setError('Произошла ошибка. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <i className="pi pi-spin pi-spinner text-4xl "></i>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <div className="text-center mb-6">
          <i className="pi pi-sign-in text-4xl  mb-4"></i>
          <h1 className="text-2xl font-bold">Вход в систему</h1>
          <p className="">АВ-Вокзал</p>
        </div>

        {error && (
          <div className=" border  px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <InputText
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Введите email"
              className="w-full"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Пароль</label>
            <Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Введите пароль"
              className="w-full"
              feedback={false}
              toggleMask
              autoComplete="current-password"
            />
          </div>

          <Button
            label={isSubmitting ? 'Вход...' : 'Войти'}
            icon={isSubmitting ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'}
            className="w-full"
            onClick={handleLogin}
            disabled={isSubmitting}
          />

          <div className="text-center">
            <a href="/auth/register" className="hover:underline text-sm">
              Нет аккаунта? Зарегистрироваться
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
