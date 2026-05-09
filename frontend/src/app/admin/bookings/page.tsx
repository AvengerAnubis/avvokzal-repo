'use client';

import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { bookingsApi } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';

export default function AdminBookingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user || user.role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    loadBookings();
  }, [isAuthenticated, user, isLoading]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingsApi.getAll();
      setBookings(res.data || []);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await bookingsApi.confirm(id);
      loadBookings();
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('Ошибка при подтверждении бронирования');
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Вы уверены, что хотите отменить это бронирование?')) return;
    try {
      await bookingsApi.cancel(id);
      loadBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Ошибка при отмене бронирования');
    }
  };

  const statusTemplate = (rowData: any) => {
    const severity = rowData.status === 'CONFIRMED' ? 'success' : rowData.status === 'PENDING' ? 'warning' : 'danger';
    const label = rowData.status === 'CONFIRMED' ? 'Подтверждено' : rowData.status === 'PENDING' ? 'Ожидает' : 'Отменено';
    return <Tag severity={severity} value={label} />;
  };

  const passengerTemplate = (rowData: any) => {
    return (
      <div>
        <div className="font-bold">{rowData.passengerName || rowData.user?.firstName + ' ' + rowData.user?.lastName || 'Без имени'}</div>
        <div className="text-sm text-gray-500">{rowData.passengerPhone || rowData.user?.email || '-'}</div>
      </div>
    );
  };

  const routeTemplate = (rowData: any) => {
    const route = rowData.trip?.route;
    return route ? `${route.origin} → ${route.destination}` : `Рейс #${rowData.tripId}`;
  };

  const dateTemplate = (rowData: any) => {
    return new Date(rowData.createdAt).toLocaleString('ru-RU');
  };

  const filteredBookings = bookings.filter(b =>
    `${b.passengerName || ''} ${b.user?.firstName || ''} ${b.user?.lastName || ''} ${b.user?.email || ''}`
      .toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Все бронирования</h1>

      <Card>
        <div className="mb-4">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              placeholder="Поиск бронирований..."
              className="w-64"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </span>
        </div>

        <DataTable value={filteredBookings} loading={loading} responsiveLayout="scroll" paginator rows={10} sortField="createdAt" sortOrder={-1}>
          <Column header="№" body={(row) => `#${row.id.slice(0, 8)}`} sortable />
          <Column header="Пассажир" body={passengerTemplate} sortable />
          <Column header="Маршрут" body={routeTemplate} sortable />
          <Column header="Мест" field="seats" sortable />
          <Column header="Сумма" body={(row) => `${Number(row.totalPrice)} ₽`} sortable />
          <Column header="Дата" body={dateTemplate} sortable />
          <Column header="Статус" body={statusTemplate} sortable />
          <Column
            header="Действия"
            body={(row) => (
              <div className="flex gap-2">
                {row.status === 'PENDING' && (
                  <Button
                    icon="pi pi-check"
                    className="p-button-text p-button-success p-button-sm"
                    tooltip="Подтвердить"
                    onClick={() => handleConfirm(row.id)}
                  />
                )}
                {row.status !== 'CANCELLED' && (
                  <Button
                    icon="pi pi-times"
                    className="p-button-text p-button-danger p-button-sm"
                    tooltip="Отменить"
                    onClick={() => handleCancel(row.id)}
                  />
                )}
              </div>
            )}
          />
        </DataTable>
      </Card>
    </div>
  );
}