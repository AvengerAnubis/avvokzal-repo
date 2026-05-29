'use client';

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { tripsApi, routesApi } from '@/lib/api';

export default function SchedulePage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30_000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [tripsRes, routesRes] = await Promise.all([tripsApi.getAll(), routesApi.getAll()]);
      setTrips(tripsRes.data || []);
      setRoutes(routesRes.data || []);
    } catch {
      setTrips([]);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusSeverity = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'success';
      case 'DELAYED': return 'warning';
      case 'IN_PROGRESS': return 'info';
      case 'COMPLETED': return 'info';
      case 'CANCELLED': return 'danger';
      default: return 'info';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'В ожидании';
      case 'DELAYED': return 'Задержка';
      case 'IN_PROGRESS': return 'В пути';
      case 'COMPLETED': return 'Завершён';
      case 'CANCELLED': return 'Отменён';
      default: return status;
    }
  };

  const routeTemplate = (rowData: any) => {
    const route = routes.find(r => r.id === rowData.routeId);
    return route ? `${route.origin} → ${route.destination}` : '-';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Расписание рейсов</h1>

      <Card>
        <DataTable value={trips} loading={loading} responsiveLayout="scroll" paginator rows={10} sortField="departureTime" sortOrder={1}>
          <Column header="Рейс №" field="id" sortable />
          <Column header="Маршрут" body={routeTemplate} />
          <Column header="Автобус" field="busNumber" sortable />
          <Column header="Отправление" field="departureTime" sortable body={(row) => new Date(row.departureTime).toLocaleString('ru-RU')} />
          <Column header="Прибытие" field="arrivalTime" sortable body={(row) => new Date(row.arrivalTime).toLocaleString('ru-RU')} />
          <Column header="Статус" body={(row) => <Tag severity={getStatusSeverity(row.status)} value={getStatusLabel(row.status)} />} />
        </DataTable>
      </Card>
    </div>
  );
}