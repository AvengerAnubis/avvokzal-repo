'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/lib/auth/context';
import api from '@/lib/api';

export default function TicketPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    // Получаем последний подтвержденный booking из URL или localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (id) {
      setBookingId(id);
      loadBooking(id);
    } else {
      loadLastBooking();
    }
  }, [isAuthenticated]);

  const loadBooking = async (id: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/bookings/${id}`);
      setBooking(response.data);
    } catch (error) {
      console.error('Error loading booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLastBooking = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/bookings/user/${user?.id}`);
      const bookings = response.data;
      const confirmedBooking = bookings.find((b: any) => b.status === 'CONFIRMED');
      if (confirmedBooking) {
        setBooking(confirmedBooking);
        setBookingId(confirmedBooking.id);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRData = () => {
    if (!booking) return '';
    return JSON.stringify({
      ticketId: booking.id,
      tripId: booking.tripId,
      passenger: booking.passengerName,
      route: `${booking.trip?.route?.origin} → ${booking.trip?.route?.destination}`,
      departure: booking.trip?.departureTime,
      seats: booking.seats,
      status: booking.status,
      timestamp: new Date().toISOString(),
    });
  };

  const getStatusSeverity = (status: string) => {
    const map: Record<string, 'success' | 'warning' | 'danger'> = {
      CONFIRMED: 'success',
      PENDING: 'warning',
      CANCELLED: 'danger',
    };
    return map[status] || 'info';
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>;
  }

  if (!booking) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-8">
            <i className="pi pi-ticket text-6xl text-muted-color mb-4"></i>
            <h2 className="text-xl font-bold mb-2">Билеты не найдены</h2>
            <p className="text-muted-color mb-4">У вас пока нет подтверждённых билетов</p>
            <Button 
              label="Забронировать билет" 
              icon="pi pi-plus"
              onClick={() => router.push('/booking')}
            />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Электронный билет</h1>
        <Button 
          icon="pi pi-print" 
          label="Печать" 
          onClick={() => window.print()}
          className="p-button-outlined"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Код */}
        <Card className="text-center">
          <div className="p-6 bg-white border-round">
            <div className="mb-4">
              <QRCodeSVG 
                value={generateQRData()}
                size={200}
                level="H"
                includeMargin
              />
            </div>
            <div className="text-sm text-muted-color">
              С QR-кодом или без, покажите этот билет при посадке
            </div>
          </div>
        </Card>

        {/* Детали билета */}
        <Card title="Информация о билете">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-bottom-1 border-200">
              <span className="text-muted-color">Статус</span>
              <Tag severity={getStatusSeverity(booking.status)} value="Подтверждено" />
            </div>

            <div className="p-4 bg-primary-50 border-round">
              <div className="text-2xl font-bold text-center mb-2">
                {booking.trip?.route?.origin}
              </div>
              <div className="text-center text-muted-color mb-2">
                <i className="pi pi-arrow-down"></i>
              </div>
              <div className="text-2xl font-bold text-center">
                {booking.trip?.route?.destination}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-color mb-1">Дата и время</div>
                <div className="font-medium">
                  {new Date(booking.trip?.departureTime).toLocaleDateString('ru-RU')}
                </div>
                <div className="text-muted-color">
                  {new Date(booking.trip?.departureTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-color mb-1">Автобус</div>
                <div className="font-medium">{booking.trip?.busNumber || 'Не назначен'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-color mb-1">Пассажир</div>
                <div className="font-medium">{booking.passengerName || 'Не указано'}</div>
              </div>
              <div>
                <div className="text-sm text-muted-color mb-1">Количество мест</div>
                <div className="font-medium">{booking.seats}</div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-top-1 border-200">
              <span className="font-bold text-lg">Оплачено</span>
              <span className="font-bold text-2xl text-green-600">{Number(booking.totalPrice)} ₽</span>
            </div>

            <div className="pt-3">
              <div className="text-sm text-muted-color mb-1">Номер бронирования</div>
              <div className="font-mono text-lg">#{booking.id.slice(0, 8).toUpperCase()}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Инструкция */}
      <Card title="Как использовать билет">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-primary-100 border-circle mx-auto mb-3 flex align-items-center justify-content-center">
              <i className="pi pi-qrcode text-primary text-xl"></i>
            </div>
            <div className="font-bold mb-2">Покажите QR-код</div>
            <div className="text-sm text-muted-color">Отсканируйте QR-код на турникете при посадке</div>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-primary-100 border-circle mx-auto mb-3 flex align-items-center justify-content-center">
              <i className="pi pi-id-card text-primary text-xl"></i>
            </div>
            <div className="font-bold mb-2">Или покажите номер</div>
            <div className="text-sm text-muted-color">Назовите номер бронирования водителю</div>
          </div>
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-primary-100 border-circle mx-auto mb-3 flex align-items-center justify-content-center">
              <i className="pi pi-check-circle text-primary text-xl"></i>
            </div>
            <div className="font-bold mb-2">Садитесь в автобус</div>
            <div className="text-sm text-muted-color">Занимайте указанное количество мест</div>
          </div>
        </div>
      </Card>

      {/* Кнопки действий */}
      <div className="flex justify-between">
        <Button 
          label="Все билеты" 
          icon="pi pi-list"
          className="p-button-outlined"
          onClick={() => router.push('/profile/tickets')}
        />
        <Button 
          label="Забронировать ещё" 
          icon="pi pi-plus"
          onClick={() => router.push('/booking')}
        />
      </div>
    </div>
  );
}