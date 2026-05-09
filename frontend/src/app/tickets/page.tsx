'use client';

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { bookingsApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function TicketsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const fetchBookings = async () => {
      try {
        let result;
        if (userStr) {
          const user = JSON.parse(userStr);
          result = await bookingsApi.getByUser(user.id);
        } else {
          result = await bookingsApi.getAll();
        }
        setBookings(result.data || []);
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, []);
  const statusTemplate = (rowData: any) => {
    const severity = rowData.status === 'CONFIRMED' ? 'success' : rowData.status === 'PENDING' ? 'warning' : 'danger';
    const label = rowData.status === 'CONFIRMED' ? 'Подтверждено' : rowData.status === 'PENDING' ? 'Ожидает' : 'Отменено';
    return <Tag severity={severity} value={label} />;
  };

  const routeTemplate = (rowData: any) => {
    return `Рейс #${rowData.tripId}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Мои билеты</h1>

      <Card>
        <DataTable value={bookings} loading={loading} responsiveLayout="scroll" paginator rows={10} sortField="id" sortOrder={-1}>
          <Column header="Бронирование" body={(row) => `#${row.id}`} sortable />
          <Column header="Рейс" body={routeTemplate} sortable />
          <Column header="Мест" field="seats" sortable />
          <Column header="Сумма" body={(row) => `${row.totalPrice} ₽`} sortable />
          <Column header="Пассажир" field="passengerName" sortable />
          <Column header="Статус" body={statusTemplate} sortable />
          <Column 
            header="Действия"
            body={(row) => (
              <div className="flex gap-2">
                <Button 
                  icon="pi pi-qrcode" 
                  className="p-button-text p-button-sm" 
                  tooltip="QR-код" 
                  tooltipOptions={{ position: 'top' }}
                  onClick={() => router.push(`/ticket?id=${row.id}`)}
                />
              </div>
            )}
          />
        </DataTable>
      </Card>
    </div>
  );
}