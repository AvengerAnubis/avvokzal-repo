'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { RadioButton } from 'primereact/radiobutton';
import { useAuth } from '@/lib/auth/context';
import api from '@/lib/api';

const paymentMethods = [
  { label: 'Банковская карта', value: 'card', icon: 'pi pi-credit-card' },
  { label: 'СБП (Система быстрых платежей)', value: 'sbp', icon: 'pi pi-mobile' },
  { label: 'Наличные в кассе', value: 'cash', icon: 'pi pi-wallet' },
];

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('card');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bookingId = searchParams.get('bookingId');

  useEffect(() => {
    if (isLoading) return; // Wait for auth to initialize
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (bookingId) {
      loadBooking();
    } else {
      setLoading(false);
    }
  }, [isLoading, isAuthenticated, bookingId]);

  const loadBooking = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bookings/${bookingId}`);
      setBooking(response.data);
    } catch (error) {
      console.error('Error loading booking:', error);
      setError('Бронирование не найдено');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!booking) return;

    try {
      setProcessing(true);
      setError(null);

      // Создаём платёж
      const paymentRes = await api.post('/payments', {
        bookingId: booking.id,
        amount: booking.totalPrice,
        paymentMethod: selectedMethod,
      });

      const payment = paymentRes.data;

      // Обрабатываем платёж (симуляция)
      const processRes = await api.post(`/payments/${payment.id}/process`);
      
      // Подтверждаем бронирование
      await api.put(`/bookings/${booking.id}/confirm`);

      setPaymentSuccess(true);
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.response?.data?.message || 'Ошибка при оплате');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusTag = (status: string) => {
    const map: Record<string, { severity: 'success' | 'warning' | 'danger', label: string }> = {
      PENDING: { severity: 'warning', label: 'Ожидает оплаты' },
      CONFIRMED: { severity: 'success', label: 'Подтверждено' },
      CANCELLED: { severity: 'danger', label: 'Отменено' },
    };
    return map[status] || { severity: 'info', label: status };
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>;
  }

  if (!bookingId) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            <i className="pi pi-exclamation-triangle text-5xl text-yellow-500 mb-4"></i>
            <h2 className="text-xl font-bold mb-2">Бронирование не выбрано</h2>
            <p className="text-muted-color mb-4">Выберите бронирование для оплаты</p>
            <Button 
              label="К билетам" 
              icon="pi pi-ticket"
              onClick={() => router.push('/profile/tickets')}
            />
          </div>
        </Card>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            <i className="pi pi-times-circle text-5xl text-red-500 mb-4"></i>
            <h2 className="text-xl font-bold mb-2">{error}</h2>
            <Button 
              label="К билетам" 
              icon="pi pi-ticket"
              onClick={() => router.push('/profile/tickets')}
            />
          </div>
        </Card>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            <div className="mb-4">
              <svg className="mx-auto w-24 h-24 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Оплата прошла успешно!</h2>
            <p className="text-muted-color mb-6">
              Ваш билет подтверждён. Покажите QR-код при посадке в автобус.
            </p>
            <div className="flex justify-center gap-3">
              <Button 
                label="Мои билеты" 
                icon="pi pi-ticket"
                onClick={() => router.push('/profile/tickets')}
              />
              <Button 
                label="На главную" 
                icon="pi pi-home"
                className="p-button-outlined"
                onClick={() => router.push('/')}
              />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Оплата бронирования</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Информация о бронировании */}
        <Card title="Детали бронирования">
          {booking && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-color">Статус:</span>
                <span className={`font-bold`}>
                  {getStatusTag(booking.status).label}
                </span>
              </div>
              
              <div className="p-3 bg-primary-100 border-round">
                <div className="font-bold text-lg">
                  {booking.trip?.route?.origin} → {booking.trip?.route?.destination}
                </div>
                <div className="text-sm text-muted-color mt-2">
                  <div><i className="pi pi-calendar mr-2"></i>{new Date(booking.trip?.departureTime).toLocaleString('ru-RU')}</div>
                  <div><i className="pi pi-car mr-2"></i>Автобус: {booking.trip?.busNumber}</div>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-color">Пассажир:</span>
                <span>{booking.passengerName}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-color">Количество мест:</span>
                <span>{booking.seats}</span>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">Итого к оплате:</span>
                <span className="text-2xl font-bold text-green-600">
                  {Number(booking.totalPrice)} ₽
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Выбор способа оплаты */}
        <Card title="Способ оплаты">
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.value}
                className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                  selectedMethod === method.value 
                    ? 'border-blue-600 bg-blue-900/30 shadow-md' 
                    : 'border-[var(--surface-border)] bg-[var(--surface-card)] shadow-sm hover:border-blue-500 hover:bg-[var(--surface-hover)]'
                }`}
                onClick={() => setSelectedMethod(method.value)}
              >
                <div className="flex items-center gap-3">
                  <RadioButton
                    inputId={method.value}
                    value={method.value}
                    onChange={(e) => setSelectedMethod(e.value)}
                    checked={selectedMethod === method.value}
                  />
                  <i className={`${method.icon} text-lg`} style={{ color: selectedMethod === method.value ? '#2563eb' : '#475569' }}></i>
                  <label htmlFor={method.value} className="font-medium cursor-pointer" style={{ color: selectedMethod === method.value ? '#1d4ed8' : '#334155' }}>
                    {method.label}
                  </label>
                </div>
              </div>
            ))}

            {error && (
              <div className="p-3 bg-red-100 border-round text-red-700">
                <i className="pi pi-exclamation-triangle mr-2"></i>
                {error}
              </div>
            )}

            <Button
              label={processing ? 'Обработка платежа...' : 'Оплатить'}
              icon="pi pi-credit-card"
              onClick={handlePayment}
              loading={processing}
              disabled={!booking || booking.status !== 'PENDING'}
              className="w-full mt-4"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Загрузка...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}