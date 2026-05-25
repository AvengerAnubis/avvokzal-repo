'use client';

import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { tripsApi, delaysApi, routesApi, usersApi, busesApi } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/toast/context';

export default function OperatorPage() {
  const router = useRouter();
  const toast = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [trips, setTrips] = useState<any[]>([]);
  const [delays, setDelays] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
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
    busId: '',
    driverId: '',
    manualArrival: false,
  });
  const [creating, setCreating] = useState(false);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

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
      const [tripsRes, delaysRes, routesRes, driversRes, busesRes] = await Promise.all([
        tripsApi.getAll(),
        delaysApi.getAll(),
        routesApi.getAll(),
        usersApi.getDrivers(),
        busesApi.getAll(),
      ]);
      setTrips(tripsRes.data || []);
      setDelays(delaysRes.data || []);
      setRoutes(routesRes.data || []);
      setDrivers(driversRes.data || []);
      setBuses(busesRes.data || []);
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
      toast.error('Ошибка при обновлении времени рейса');
    } finally {
      setSaving(false);
    }
  };

  const openCreateDialog = () => {
    setCreateForm({ routeId: '', departureTime: '', arrivalTime: '', busId: '', driverId: '', manualArrival: false });
    setCreateErrors({});
    setShowCreateDialog(true);
  };

  const handleDepartureChange = (departure: string) => {
    setCreateForm(prev => ({ ...prev, departureTime: departure }));
    if (!createForm.manualArrival && createForm.routeId) {
      const route = routes.find((r: any) => r.id === createForm.routeId);
      if (route && route.duration) {
        const dep = new Date(departure);
        if (!isNaN(dep.getTime())) {
          const arr = new Date(dep.getTime() + route.duration * 60000);
          setCreateForm(prev => ({ ...prev, departureTime: departure, arrivalTime: arr.toISOString().slice(0, 16) }));
          return;
        }
      }
    }
  };

  const handleRouteChange = (routeId: string) => {
    setCreateForm(prev => ({ ...prev, routeId }));
    if (!createForm.manualArrival && createForm.departureTime) {
      const route = routes.find((r: any) => r.id === routeId);
      if (route && route.duration) {
        const dep = new Date(createForm.departureTime);
        if (!isNaN(dep.getTime())) {
          const arr = new Date(dep.getTime() + route.duration * 60000);
          setCreateForm(prev => ({ ...prev, routeId, arrivalTime: arr.toISOString().slice(0, 16) }));
          return;
        }
      }
    }
    setCreateForm(prev => ({ ...prev, routeId }));
  };

  const validateCreateForm = () => {
    const errs: Record<string, string> = {};
    if (!createForm.routeId) errs.routeId = 'Выберите маршрут';
    if (!createForm.departureTime) errs.departureTime = 'Укажите время отправления';
    else if (new Date(createForm.departureTime) <= new Date()) errs.departureTime = 'Время отправления должно быть в будущем';
    if (!createForm.arrivalTime) errs.arrivalTime = 'Укажите время прибытия';
    else if (new Date(createForm.arrivalTime) <= new Date(createForm.departureTime)) errs.arrivalTime = 'Прибытие должно быть после отправления';
    if (!createForm.busId) errs.busId = 'Выберите автобус';
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateTrip = async () => {
    if (!validateCreateForm()) return;
    try {
      setCreating(true);
      await tripsApi.create({
        routeId: createForm.routeId,
        departureTime: new Date(createForm.departureTime).toISOString(),
        arrivalTime: new Date(createForm.arrivalTime).toISOString(),
        busId: createForm.busId,
        driverId: createForm.driverId || undefined,
      });
      setShowCreateDialog(false);
      toast.success('Рейс создан');
      loadData();
    } catch (error) {
      console.error('Error creating trip:', error);
      toast.error('Ошибка при создании рейса');
    } finally {
      setCreating(false);
    }
  };

  const routeOptions = routes.filter((r: any) => r.isActive).map((r: any) => ({
    label: `${r.origin} → ${r.destination}`,
    value: r.id,
  }));

  const driverOptions = drivers.map((d: any) => ({
    label: `${d.firstName} ${d.lastName}`,
    value: d.id,
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Оператор</h1>
        <div className="flex gap-2">
          <Button label="Чат-поддержка" icon="pi pi-comments" onClick={() => router.push('/operator/chats')} />
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
        onHide={() => { setShowCreateDialog(false); setCreateErrors({}); }}
        style={{ width: '520px' }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Маршрут *</label>
            <Dropdown
              className={`w-full ${createErrors.routeId ? 'p-invalid' : ''}`}
              options={routeOptions}
              value={createForm.routeId}
              onChange={(e) => handleRouteChange(e.value)}
              placeholder="Выберите маршрут"
              filter
            />
            {createErrors.routeId && <small className="p-error">{createErrors.routeId}</small>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Отправление *</label>
              <InputText
                type="datetime-local"
                value={createForm.departureTime}
                onChange={(e) => handleDepartureChange(e.target.value)}
                className={`w-full ${createErrors.departureTime ? 'p-invalid' : ''}`}
              />
              {createErrors.departureTime && <small className="p-error">{createErrors.departureTime}</small>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Прибытие *</label>
                <label className="flex items-center gap-1 text-xs cursor-pointer">
                  <Checkbox
                    inputId="manualArrival"
                    checked={createForm.manualArrival}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, manualArrival: e.checked || false }))}
                  />
                  <span>Вручную</span>
                </label>
              </div>
              <InputText
                type="datetime-local"
                value={createForm.arrivalTime}
                onChange={(e) => setCreateForm(prev => ({ ...prev, arrivalTime: e.target.value, manualArrival: true }))}
                className={`w-full ${createErrors.arrivalTime ? 'p-invalid' : ''}`}
                disabled={!createForm.manualArrival && !!createForm.routeId}
              />
              {!createForm.manualArrival && createForm.routeId && (
                <small className="text-muted-color">Рассчитывается автоматически из длительности маршрута</small>
              )}
              {createErrors.arrivalTime && <small className="p-error">{createErrors.arrivalTime}</small>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Автобус *</label>
            <Dropdown
              className={`w-full ${createErrors.busId ? 'p-invalid' : ''}`}
              options={buses.filter((b: any) => b.isActive).map((b: any) => ({
                label: `${b.plateNumber} (${b.totalSeats} мест)${b.model ? ' - ' + b.model : ''}`,
                value: b.id,
              }))}
              value={createForm.busId}
              onChange={(e) => setCreateForm({ ...createForm, busId: e.value })}
              placeholder="Выберите автобус"
              filter
            />
            {createErrors.busId && <small className="p-error">{createErrors.busId}</small>}
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

          {createForm.busId && (
            <div className="p-3 bg-primary-100 border-round text-sm">
              Выбран автобус: {(() => {
                const b = buses.find((x: any) => x.id === createForm.busId);
                return b ? `${b.plateNumber} — ${b.totalSeats} мест` : '';
              })()}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button label="Отмена" className="p-button-text" onClick={() => { setShowCreateDialog(false); setCreateErrors({}); }} />
            <Button label="Создать рейс" icon="pi pi-plus" onClick={handleCreateTrip} loading={creating} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
