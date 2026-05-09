'use client';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';
export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { register, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, router]);

  const handleRegister = async () => {
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const result = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
      });

      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Ошибка регистрации');
      }
    } catch {
      setError('Произошла ошибка. Попробуйте позже.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
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
          <i className="pi pi-user-plus text-4xl mb-4"></i>
          <h1 className="text-2xl font-bold">Регистрация</h1>
          <p className="">Создайте аккаунт</p>
        </div>

        {error && (
          <div className="border px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Имя *</label>
              <InputText
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder="Имя"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Фамилия *</label>
              <InputText
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                placeholder="Фамилия"
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <InputText
              value={formData.email}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="email@example.com"
              className="w-full"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Телефон</label>
            <InputText
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="+7 (999) 000-00-00"
              className="w-full"
              autoComplete="tel"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Пароль *</label>
            <Password
              value={formData.password}
              onChange={(e) => updateField('password', e.target.value)}
              placeholder="Минимум 6 символов"
              className="w-full"
              toggleMask
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Подтвердите пароль *</label>
            <Password
              value={formData.confirmPassword}
              onChange={(e) => updateField('confirmPassword', e.target.value)}
              placeholder="Повторите пароль"
              className="w-full"
              feedback={false}
              toggleMask
              autoComplete="new-password"
            />
          </div>

          <Button
            label={isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
            icon={isSubmitting ? 'pi pi-spin pi-spinner' : 'pi pi-user-plus'}
            className="w-full"
            onClick={handleRegister}
            disabled={isSubmitting}
          />

          <div className="text-center">
            <a href="/auth/login" className="hover:underline text-sm">
              Уже есть аккаунт? Войти
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
