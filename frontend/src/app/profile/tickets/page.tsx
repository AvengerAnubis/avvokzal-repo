'use client';

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { bookingsApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ProfileTicketsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('user');
    if (userId) {
      const user = JSON.parse(userId);
      bookingsApi.getByUser(user.id)
        .then(res => setBookings(res.data || []))
        .catch(() => setBookings([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const statusTemplate = (rowData: any) => {
    const severity = rowData.status === 'CONFIRMED' ? 'success' : rowData.status === 'PENDING' ? 'warning' : 'danger';
    const label = rowData.status === 'CONFIRMED' ? 'Подтверждено' : rowData.status === 'PENDING' ? 'Ожидает' : 'Отменено';
    return <Tag severity={severity} value={label} />;
  };

  const dateTemplate = (rowData: any) => {
    return new Date(rowData.createdAt).toLocaleDateString('ru-RU');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Мои билеты</h1>

      <Card>
        <DataTable value={bookings} loading={loading} responsiveLayout="scroll" paginator rows={10} sortField="id" sortOrder={-1}>
          <Column header="№" body={(row) => `#${row.id}`} sortable />
          <Column header="Рейс" body={(row) => `Рейс #${row.tripId}`} sortable />
          <Column header="Дата бронирования" body={dateTemplate} sortable />
          <Column header="Мест" field="seats" sortable />
          <Column header="Сумма" body={(row) => `${row.totalPrice} ₽`} sortable />
          <Column header="Статус" body={statusTemplate} sortable />
          <Column 
            header="Билет"
            body={(row) => (
              row.status === 'PENDING' ? (
                <Button 
                  label="Оплатить"
                  icon="pi pi-credit-card"
                  size="small"
                  severity="success"
                  onClick={() => router.push(`/payment?bookingId=${row.id}`)}
                />
              ) : (
                <Button 
                  label="Скачать"
                  icon="pi pi-download"
                  size="small"
                  outlined
                  onClick={() => router.push(`/ticket?id=${row.id}`)}
                />
              )
            )}
          />
        </DataTable>
      </Card>
    </div>
  );
}