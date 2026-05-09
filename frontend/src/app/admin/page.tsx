'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { useAuth } from '@/lib/auth/context';
import { bookingsApi, routesApi, tripsApi, usersApi } from '@/lib/api';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
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
    busNumber: '',
    driverId: '',
  });
  const [creating, setCreating] = useState(false);

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
      const [bookingsRes, routesRes, driversRes] = await Promise.all([
        bookingsApi.getAll(),
        routesApi.getAll(),
        usersApi.getDrivers(),
      ]);

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
      loadDashboardData();
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
          <div className="space-y-3">
            <Link href="/admin/routes">
              <Button
                label="Маршруты"
                icon="pi pi-map"
                className="w-full justify-start"
              />
            </Link>
            <Link href="/admin/users">
              <Button
                label="Пользователи"
                icon="pi pi-users"
                className="w-full justify-start"
              />
            </Link>
            <Link href="/admin/bookings">
              <Button
                label="Все бронирования"
                icon="pi pi-ticket"
                className="w-full justify-start"
              />
            </Link>
            <Link href="/schedule">
              <Button
                label="Расписание"
                icon="pi pi-calendar"
                className="w-full justify-start p-button-outlined"
              />
            </Link>
          </div>
        </Card>
      </div>

      {/* Последние бронирования */}
      <Card title="Последние бронирования">
        <div className="space-y-3">
          {recentBookings.length === 0 ? (
            <p className="text-center text-muted-color py-4">Нет бронирований</p>
          ) : (
            recentBookings.map((booking) => (
              <div key={booking.id} className="flex justify-between items-center p-3 border-bottom-1 border-200">
                <div>
                  <div className="font-bold">{booking.passengerName || 'Без имени'}</div>
                  <div className="text-sm text-muted-color">
                    {booking.trip?.route?.origin} → {booking.trip?.route?.destination}
                  </div>
                </div>
                <div className="text-right">
                  <Tag severity={getStatusSeverity(booking.status)} value={booking.status === 'CONFIRMED' ? 'Подтверждено' : booking.status === 'PENDING' ? 'Ожидает' : 'Отменено'} />
                  <div className="text-sm mt-1">{Number(booking.totalPrice)} ₽</div>
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
