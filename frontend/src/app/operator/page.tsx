'use client';

import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { tripsApi, delaysApi, routesApi, usersApi } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';

export default function OperatorPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [delays, setDelays] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Trip dialog state
  const [showTripDialog, setShowTripDialog] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [newDeparture, setNewDeparture] = useState('');
  const [newArrival, setNewArrival] = useState('');
  const [saving, setSaving] = useState(false);

  // Create trip dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    routeId: '',
    departureTime: '',
    arrivalTime: '',
    busNumber: '',
    driverId: '',
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user || (user.role !== 'OPERATOR' && user.role !== 'ADMIN')) {
      router.push('/auth/login');
      return;
    }
    loadData();
  }, [isAuthenticated, user, isLoading]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tripsRes, delaysRes, routesRes, driversRes] = await Promise.all([
        tripsApi.getAll(),
        delaysApi.getAll(),
        routesApi.getAll(),
        usersApi.getDrivers(),
      ]);
      setTrips(tripsRes.data || []);
      setDelays(delaysRes.data || []);
      setRoutes(routesRes.data || []);
      setDrivers(driversRes.data || []);
    } catch (error) {
      console.error('Error loading operator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const routeTemplate = (rowData: any) => {
    if (rowData.route) {
      return `${rowData.route.origin} → ${rowData.route.destination}`;
    }
    const route = routes.find(r => r.id === rowData.routeId);
    return route ? `${route.origin} → ${route.destination}` : '-';
  };

  const statusTemplate = (rowData: any) => {
    const severityMap: Record<string, 'success' | 'warning' | 'info' | 'secondary' | 'danger'> = {
      SCHEDULED: 'success',
      DELAYED: 'warning',
      IN_PROGRESS: 'info',
      COMPLETED: 'secondary',
      CANCELLED: 'danger',
    };
    const labelMap: Record<string, string> = {
      SCHEDULED: 'В ожидании',
      DELAYED: 'Задержка',
      IN_PROGRESS: 'В пути',
      COMPLETED: 'Завершён',
      CANCELLED: 'Отменён',
    };
    return <Tag severity={severityMap[rowData.status] || 'info'} value={labelMap[rowData.status] || rowData.status} />;
  };

  const openTimeDialog = (trip: any) => {
    setSelectedTrip(trip);
    setNewDeparture(new Date(trip.departureTime).toISOString().slice(0, 16));
    setNewArrival(new Date(trip.arrivalTime).toISOString().slice(0, 16));
    setShowTripDialog(true);
  };

  const saveTime = async () => {
    if (!selectedTrip || !user) return;
    try {
      setSaving(true);
      await tripsApi.updateTime(
        selectedTrip.id,
        new Date(newDeparture).toISOString(),
        new Date(newArrival).toISOString(),
        user.id,
      );
      setShowTripDialog(false);
      loadData();
    } catch (error) {
      console.error('Error updating trip time:', error);
      alert('Ошибка при обновлении времени рейса');
    } finally {
      setSaving(false);
    }
  };

  const openCreateDialog = () => {
    setCreateForm({ routeId: '', departureTime: '', arrivalTime: '', busNumber: '', driverId: '' });
    setShowCreateDialog(true);
  };

  const handleCreateTrip = async () => {
    if (!createForm.routeId || !createForm.departureTime || !createForm.arrivalTime) {
      alert('Заполните обязательные поля: маршрут, время отправления и прибытия');
      return;
    }
    try {
      setCreating(true);
      await tripsApi.create({
        routeId: createForm.routeId,
        departureTime: new Date(createForm.departureTime).toISOString(),
        arrivalTime: new Date(createForm.arrivalTime).toISOString(),
        busNumber: createForm.busNumber || undefined,
        driverId: createForm.driverId || undefined,
      });
      setShowCreateDialog(false);
      loadData();
    } catch (error) {
      console.error('Error creating trip:', error);
      alert('Ошибка при создании рейса');
    } finally {
      setCreating(false);
    }
  };

  const routeOptions = routes.filter((r: any) => r.isActive).map((r: any) => ({
    label: `${r.origin} → ${r.destination}`,
    value: r.id,
  }));

  const driverOptions = [
    { label: 'Без водителя', value: '' },
    ...drivers.map((d: any) => ({
      label: `${d.firstName} ${d.lastName}`,
      value: d.id,
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Оператор</h1>
        <div className="flex gap-2">
          <Button label="Добавить рейс" icon="pi pi-plus" onClick={openCreateDialog} />
          <Button label="Обновить" icon="pi pi-refresh" className="p-button-outlined" onClick={loadData} />
        </div>
      </div>

      {/* Задержки */}
      <Card title="Задержки рейсов">
        <DataTable value={delays} loading={loading} responsiveLayout="scroll" paginator rows={10} sortField="createdAt" sortOrder={-1}>
          <Column header="Рейс" body={(row) => {
            const trip = row.trip || trips.find(t => t.id === row.tripId);
            const route = trip?.route;
            return route ? `${route.origin} → ${route.destination} (#${row.tripId.slice(0, 8)})` : `#${row.tripId.slice(0, 8)}`;
          }} sortable />
          <Column header="Причина" field="reason" sortable />
          <Column header="Задержка (мин)" body={(row) => `+${row.delayMinutes} мин`} sortable />
          <Column header="Время создания" body={(row) => new Date(row.createdAt).toLocaleString('ru-RU')} sortable />
        </DataTable>
      </Card>

      {/* Все рейсы */}
      <Card title="Управление рейсами">
        <div className="mb-4">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText placeholder="Поиск рейсов..." className="w-64" />
          </span>
        </div>

        <DataTable value={trips} loading={loading} responsiveLayout="scroll" paginator rows={10} sortField="departureTime" sortOrder={1}>
          <Column header="Рейс" body={(row) => `#${row.id.slice(0, 8)}`} sortable />
          <Column header="Маршрут" body={routeTemplate} sortable />
          <Column header="Автобус" field="busNumber" sortable />
          <Column header="Отправление" body={(row) => new Date(row.departureTime).toLocaleString('ru-RU')} sortable />
          <Column header="Прибытие" body={(row) => new Date(row.arrivalTime).toLocaleString('ru-RU')} sortable />
          <Column header="Статус" body={statusTemplate} />
          <Column
            header="Действия"
            body={(row) => (
              <Button
                label="Изменить время"
                icon="pi pi-clock"
                className="p-button-sm"
                onClick={() => openTimeDialog(row)}
              />
            )}
          />
        </DataTable>
      </Card>

      {/* Dialog: корректировка времени */}
      <Dialog
        header="Корректировка времени рейса"
        visible={showTripDialog}
        onHide={() => setShowTripDialog(false)}
        style={{ width: '400px' }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Новое время отправления</label>
            <InputText
              type="datetime-local"
              value={newDeparture}
              onChange={(e) => setNewDeparture(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Новое время прибытия</label>
            <InputText
              type="datetime-local"
              value={newArrival}
              onChange={(e) => setNewArrival(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button label="Отмена" className="p-button-text" onClick={() => setShowTripDialog(false)} />
            <Button label="Сохранить" icon="pi pi-check" onClick={saveTime} loading={saving} />
          </div>
        </div>
      </Dialog>

      {/* Dialog: создание рейса */}
      <Dialog
        header="Создание рейса"
        visible={showCreateDialog}
        onHide={() => setShowCreateDialog(false)}
        style={{ width: '500px' }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Маршрут *</label>
            <Dropdown
              className="w-full"
              options={routeOptions}
              value={createForm.routeId}
              onChange={(e) => setCreateForm({ ...createForm, routeId: e.value })}
              placeholder="Выберите маршрут"
              filter
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Время отправления *</label>
              <InputText
                type="datetime-local"
                value={createForm.departureTime}
                onChange={(e) => setCreateForm({ ...createForm, departureTime: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Время прибытия *</label>
              <InputText
                type="datetime-local"
                value={createForm.arrivalTime}
                onChange={(e) => setCreateForm({ ...createForm, arrivalTime: e.target.value })}
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Номер автобуса</label>
            <InputText
              value={createForm.busNumber}
              onChange={(e) => setCreateForm({ ...createForm, busNumber: e.target.value })}
              className="w-full"
              placeholder="АА 1234 РФ"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Водитель</label>
            <Dropdown
              className="w-full"
              options={driverOptions}
              value={createForm.driverId}
              onChange={(e) => setCreateForm({ ...createForm, driverId: e.value })}
              placeholder="Выберите водителя"
              showClear
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button label="Отмена" className="p-button-text" onClick={() => setShowCreateDialog(false)} />
            <Button
              label="Создать рейс"
              icon="pi pi-plus"
              onClick={handleCreateTrip}
              loading={creating}
              disabled={!createForm.routeId || !createForm.departureTime || !createForm.arrivalTime}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
