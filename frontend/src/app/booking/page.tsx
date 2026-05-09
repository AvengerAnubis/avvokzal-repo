'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { useAuth } from '@/lib/auth/context';
import { tripsApi, routesApi, bookingsApi } from '@/lib/api';

interface TripWithRoute {
  id: string;
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  status: string;
  busNumber: string | null;
  driverId: string | null;
  driver?: { id: string; firstName: string; lastName: string };
  route: {
    id: string;
    name: string;
    origin: string;
    destination: string;
    distance: number;
    duration: number;
    price: number;
  };
}

export default function BookingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [trips, setTrips] = useState<TripWithRoute[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<TripWithRoute | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [seats, setSeats] = useState<number>(1);
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadData();
  }, [isAuthenticated, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripsRes, routesRes] = await Promise.all([tripsApi.getAll(), routesApi.getAll()]);
      setTrips(tripsRes.data || []);
      setRoutes(routesRes.data || []);
    } catch (error) {
      console.error('Error loading trips/routes:', error);
      setTrips([]);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusSeverity = (status: string) => {
    const map: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
      SCHEDULED: 'success',
      DELAYED: 'warning',
      IN_PROGRESS: 'info',
      COMPLETED: 'info',
      CANCELLED: 'danger',
    };
    return map[status] || 'info';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      SCHEDULED: 'В ожидании',
      DELAYED: 'Задержка',
      IN_PROGRESS: 'В пути',
      COMPLETED: 'Завершён',
      CANCELLED: 'Отменён',
    };
    return map[status] || status;
  };

  const handleBookTrip = (trip: TripWithRoute) => {
    if (trip.status !== 'SCHEDULED') return;
    setSelectedTrip(trip);
    setPassengerName(user?.firstName ? `${user.firstName} ${user.lastName}` : '');
    setPassengerPhone(user?.phone || '');
    setShowDialog(true);
  };

  const handleSubmitBooking = async () => {
    if (!selectedTrip || !user || seats < 1) return;

    try {
      const response = await tripsApi.getAvailableSeats(selectedTrip.id);
      const available = response.data.availableSeats || 40;
      
      if (seats > available) {
        alert(`Доступно только ${available} мест`);
        return;
      }

      const bookingData = {
        userId: user.id,
        tripId: selectedTrip.id,
        seats,
        passengerName,
        passengerPhone,
      };

      const bookingRes = await bookingsApi.create(bookingData);
      const newBooking = bookingRes.data;
      
      setBooking(newBooking);
      setShowDialog(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Ошибка при создании бронирования');
    }
  };

  const goToPayment = () => {
    router.push(`/payment?bookingId=${booking?.id}`);
  };

  const routeTemplate = (rowData: TripWithRoute) => {
    return (
      <div>
        <div className="font-bold">{rowData.route.origin} → {rowData.route.destination}</div>
        <div className="text-sm text-muted-color">{rowData.route.name}</div>
      </div>
    );
  };

  const priceTemplate = (rowData: TripWithRoute) => {
    return <span className="text-green-600 font-bold">{Number(rowData.route.price)} ₽</span>;
  };

  const statusTemplate = (rowData: TripWithRoute) => {
    return (
      <Tag severity={getStatusSeverity(rowData.status)} value={getStatusLabel(rowData.status)} />
    );
  };

  const actionsTemplate = (rowData: TripWithRoute) => {
    const isAvailable = rowData.status === 'SCHEDULED';
    return (
      <Button
        label="Забронировать"
        icon="pi pi-ticket"
        size="small"
        disabled={!isAvailable}
        onClick={() => handleBookTrip(rowData)}
      />
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Бронирование билетов</h1>
      </div>

      <Card>
        <DataTable 
          value={trips} 
          responsiveLayout="scroll" 
          paginator 
          rows={10}
          sortField="departureTime" 
          sortOrder={1}
          selectionMode="single"
          onRowSelect={(e) => setSelectedTrip(e.data)}
        >
          <Column header="Маршрут" body={routeTemplate} />
          <Column header="Автобус" field="busNumber" sortable />
          <Column header="Отправление" field="departureTime" sortable body={(row) => new Date(row.departureTime).toLocaleString('ru-RU')} />
          <Column header="Прибытие" field="arrivalTime" sortable body={(row) => new Date(row.arrivalTime).toLocaleString('ru-RU')} />
          <Column header="Цена" body={priceTemplate} />
          <Column header="Статус" body={statusTemplate} />
          <Column header="Действия" body={actionsTemplate} />
        </DataTable>
      </Card>

      {/* Диалог бронирования */}
      <Dialog 
        header="Бронирование билета" 
        visible={showDialog} 
        onHide={() => setShowDialog(false)}
        style={{ width: '500px' }}
      >
        {selectedTrip && (
          <div className="space-y-4">
            <div className="p-3 bg-primary-100 border-round">
              <div className="font-bold text-lg">{selectedTrip.route.origin} → {selectedTrip.route.destination}</div>
              <div className="text-sm text-muted-color">
                {new Date(selectedTrip.departureTime).toLocaleString('ru-RU')}
              </div>
              <div className="text-sm text-muted-color">
                Автобус: {selectedTrip.busNumber}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Количество мест</label>
              <InputNumber 
                value={seats} 
                onValueChange={(e) => setSeats(e.value || 1)}
                min={1} 
                max={10}
                showButtons
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Имя пассажира</label>
              <InputText 
                value={passengerName} 
                onChange={(e) => setPassengerName(e.target.value)}
                className="w-full"
                placeholder="Введите имя"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Телефон</label>
              <InputText 
                value={passengerPhone} 
                onChange={(e) => setPassengerPhone(e.target.value)}
                className="w-full"
                placeholder="+7XXXXXXXXXX"
              />
            </div>

            <div className="flex justify-between items-center p-3 bg-green-100 border-round">
              <span className="font-bold">Итого:</span>
              <span className="text-xl font-bold text-green-700">
                {Number(selectedTrip.route.price) * seats} ₽
              </span>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button 
                label="Отмена" 
                className="p-button-text" 
                onClick={() => setShowDialog(false)}
              />
              <Button 
                label="Забронировать" 
                icon="pi pi-check" 
                onClick={handleSubmitBooking}
                disabled={!passengerName || !passengerPhone}
              />
            </div>
          </div>
        )}
      </Dialog>

      {/* Диалог успешного бронирования */}
      <Dialog 
        header="Бронирование создано" 
        visible={showSuccess} 
        onHide={() => {
          setShowSuccess(false);
          setBooking(null);
          setSeats(1);
        }}
        style={{ width: '400px' }}
        modal
      >
        <div className="text-center space-y-4">
          <i className="pi pi-check-circle text-5xl text-green-500"></i>
          <p className="text-lg">Бронирование успешно создано!</p>
          <p className="text-sm text-muted-color">
            Для завершения бронирования необходимо оплатить билет.
          </p>
          <div className="flex justify-center gap-2 mt-4">
            <Button 
              label="Оплатить сейчас" 
              icon="pi pi-credit-card"
              onClick={goToPayment}
            />
            <Button 
              label="Позже" 
              className="p-button-outlined"
              onClick={() => {
                setShowSuccess(false);
                router.push('/profile/tickets');
              }}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}