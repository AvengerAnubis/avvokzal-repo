'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { useAuth } from '@/lib/auth/context';
import { bookingsApi, routesApi, tripsApi, usersApi, busesApi } from '@/lib/api';
import Link from 'next/link';
import { useToast } from '@/lib/toast/context';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalRoutes: 0,
    activeTrips: 0,
    totalUsers: 0,
    drivers: 0,
    operators: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
  const [buses, setBuses] = useState<any[]>([]);
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user || user.role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    loadDashboardData();
  }, [isAuthenticated, user, isLoading]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, routesRes, driversRes, busesRes] = await Promise.all([
        bookingsApi.getAll(),
        routesApi.getAll(),
        usersApi.getDrivers(),
        busesApi.getAll(),
      ]);
      setBuses(busesRes.data || []);

      const routes = routesRes.data;
      const drivers = driversRes.data;
      const bookings = bookingsRes.data;
      const confirmed = bookings.filter((b: any) => b.status === 'CONFIRMED').length;
      const pending = bookings.filter((b: any) => b.status === 'PENDING').length;

      setRoutes(routes);
      setDrivers(drivers);
      setStats({
        totalBookings: bookings.length,
        confirmedBookings: confirmed,
        pendingBookings: pending,
        totalRoutes: routes.length,
        activeTrips: routes.filter((t: any) => t.isActive).length,
        totalUsers: 0,
        drivers: drivers.length,
        operators: 0,
      });

      setRecentBookings(bookings.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
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
      loadDashboardData();
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

  const driverOptions = [
    { label: 'Без водителя', value: '' },
    ...drivers.map((d: any) => ({
      label: `${d.firstName} ${d.lastName}`,
      value: d.id,
    })),
  ];

  const getStatusSeverity = (status: string) => {
    const map: Record<string, 'success' | 'warning' | 'info' | 'danger'> = {
      CONFIRMED: 'success',
      PENDING: 'warning',
      CANCELLED: 'danger',
      COMPLETED: 'info',
      SCHEDULED: 'success',
      DELAYED: 'warning',
      IN_PROGRESS: 'info',
    };
    return map[status] || 'info';
  };

  const bookingChartData = {
    labels: ['Подтверждено', 'Ожидает', 'Отменено'],
    datasets: [
      {
        data: [stats.confirmedBookings, stats.pendingBookings, stats.totalBookings - stats.confirmedBookings - stats.pendingBookings],
        backgroundColor: ['#22c55e', '#f59e0b', '#ef4444'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Панель администратора</h1>
        <div className="flex gap-2">
          <Button
            label="Добавить рейс"
            icon="pi pi-plus"
            onClick={openCreateDialog}
          />
          <Button
            label="Обновить"
            icon="pi pi-refresh"
            onClick={loadDashboardData}
            className="p-button-outlined"
          />
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">{stats.totalBookings}</div>
          <div className="text-muted-color">Всего бронирований</div>
        </Card>
        <Card className="text-center">
          <div className="text-4xl font-bold text-green-600 mb-2">{stats.confirmedBookings}</div>
          <div className="text-muted-color">Подтверждённых</div>
        </Card>
        <Card className="text-center">
          <div className="text-4xl font-bold text-yellow-600 mb-2">{stats.pendingBookings}</div>
          <div className="text-muted-color">Ожидают оплаты</div>
        </Card>
        <Card className="text-center">
          <div className="text-4xl font-bold text-blue-600 mb-2">{stats.totalRoutes}</div>
          <div className="text-muted-color">Активных маршрутов</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* График бронирований */}
        <Card title="Статистика бронирований" className="lg:col-span-2">
          <div className="h-64">
            <Chart className='h-full' type="doughnut" data={bookingChartData} options={chartOptions} />
          </div>
        </Card>

        {/* Быстрые действия */}
        <Card title="Управление">
          <div className="flex flex-col gap-3">
            <Link href="/admin/routes" className="block w-full">
              <Button label="Маршруты" icon="pi pi-map" className="w-full justify-start" />
            </Link>
            <Link href="/admin/users" className="block w-full">
              <Button label="Пользователи" icon="pi pi-users" className="w-full justify-start" />
            </Link>
            <Link href="/admin/buses" className="block w-full">
              <Button label="Автобусы" icon="pi pi-bus" className="w-full justify-start" />
            </Link>
            <Link href="/admin/bookings" className="block w-full">
              <Button label="Все бронирования" icon="pi pi-ticket" className="w-full justify-start" />
            </Link>
            <Link href="/admin/chats" className="block w-full">
              <Button label="История чатов" icon="pi pi-comments" className="w-full justify-start" />
            </Link>
            <Link href="/schedule" className="block w-full">
              <Button label="Расписание" icon="pi pi-calendar" className="w-full justify-start" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Последние бронирования */}
      <Card title="Последние бронирования" className="bg-slate-800 text-white">
        <div className="space-y-2">
          {recentBookings.length === 0 ? (
            <p className="text-center text-slate-400 py-4">Нет бронирований</p>
          ) : (
            recentBookings.map((booking) => (
              <div key={booking.id} className="flex justify-between items-center px-4 py-3 bg-slate-700 rounded-lg">
                <div>
                  <div className="font-bold">{booking.passengerName || 'Без имени'}</div>
                  <div className="text-sm text-slate-400">
                    {booking.trip?.route?.origin} → {booking.trip?.route?.destination}
                  </div>
                </div>
                <div className="text-right">
                  <Tag severity={getStatusSeverity(booking.status)} value={booking.status === 'CONFIRMED' ? 'Подтверждено' : booking.status === 'PENDING' ? 'Ожидает' : 'Отменено'} />
                  <div className="text-sm mt-1 text-slate-300">{Number(booking.totalPrice)} ₽</div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

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
              options={drivers.map((d: any) => ({
                label: `${d.firstName} ${d.lastName}`,
                value: d.id,
              }))}
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
