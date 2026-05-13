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
  const { user, isAuthenticated, isLoading } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return; // Wait for auth to initialize
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
  }, [isLoading, isAuthenticated]);

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
        <div className="flex flex-col items-center justify-center p-4 bg-slate-100 rounded-lg">
          <QRCodeSVG 
            value={generateQRData()}
            size={140}
            level="H"
            includeMargin
          />
          <div className="text-sm mt-3 text-slate-600 text-center">
            С QR-кодом или без, покажите этот билет при посадке
          </div>
        </div>

        {/* Детали билета */}
        <Card title="Информация о билете">
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-600">Статус</span>
              <Tag severity={getStatusSeverity(booking.status)} value="Подтверждено" />
            </div>

            <div className="text-center py-2">
              <div className="text-xl font-bold text-slate-800">
                {booking.trip?.route?.origin}
              </div>
              <div className="text-slate-400 text-lg my-1">
                <i className="pi pi-arrow-down"></i>
              </div>
              <div className="text-xl font-bold text-slate-800">
                {booking.trip?.route?.destination}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-500 mb-1">Дата и время</div>
                <div className="font-medium">
                  {new Date(booking.trip?.departureTime).toLocaleDateString('ru-RU')}
                </div>
                <div className="text-slate-500">
                  {new Date(booking.trip?.departureTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">Автобус</div>
                <div className="font-medium">{booking.trip?.busNumber || 'Не назначен'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-500 mb-1">Пассажир</div>
                <div className="font-medium">{booking.passengerName || 'Не указано'}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1">Количество мест</div>
                <div className="font-medium">{booking.seats}</div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <span className="font-bold text-lg text-slate-700">Оплачено</span>
              <span className="font-bold text-xl text-green-600">{Number(booking.totalPrice)} ₽</span>
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
          <div className="text-center py-3">
            <i className="pi pi-qrcode text-blue-600 text-3xl mb-2 block"></i>
            <div className="font-bold mb-1">Покажите QR-код</div>
            <div className="text-sm text-slate-500">Отсканируйте QR-код на турникете при посадке</div>
          </div>
          <div className="text-center py-3">
            <i className="pi pi-id-card text-blue-600 text-3xl mb-2 block"></i>
            <div className="font-bold mb-1">Или покажите номер</div>
            <div className="text-sm text-slate-500">Назовите номер бронирования водителю</div>
          </div>
          <div className="text-center py-3">
            <i className="pi pi-check-circle text-blue-600 text-3xl mb-2 block"></i>
            <div className="font-bold mb-1">Садитесь в автобус</div>
            <div className="text-sm text-slate-500">Занимайте указанное количество мест</div>
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