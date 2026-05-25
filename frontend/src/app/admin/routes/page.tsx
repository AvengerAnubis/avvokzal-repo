'use client';

import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { routesApi } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/toast/context';
import { useConfirm } from '@/lib/confirm/context';

interface Route {
  id?: string;
  name: string;
  origin: string;
  destination: string;
  distance?: number;
  duration?: number;
  price?: number;
  isActive?: boolean;
}

export default function AdminRoutesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const toast = useToast();
  const { confirm } = useConfirm();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state (duration as hours+minutes)
  const [formData, setFormData] = useState<Route>({
    name: '',
    origin: '',
    destination: '',
    distance: 0,
    duration: 0,
    price: 0,
    isActive: true,
  });
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(0);

  useEffect(() => {
    if (isLoading) return; // Wait for auth to finish loading
    if (!isAuthenticated || !user || user.role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    loadRoutes();
  }, [isAuthenticated, user, isLoading]);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      const res = await routesApi.getAll();
      setRoutes(res.data || []);
    } catch (error) {
      console.error('Error loading routes:', error);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (route?: Route) => {
    setErrors({});
    if (route) {
      setSelectedRoute(route);
      setFormData(route);
      setDurationHours(Math.floor((route.duration || 0) / 60));
      setDurationMinutes((route.duration || 0) % 60);
    } else {
      setSelectedRoute(null);
      setFormData({
        name: '',
        origin: '',
        destination: '',
        distance: 0,
        duration: 0,
        price: 0,
        isActive: true,
      });
      setDurationHours(0);
      setDurationMinutes(0);
    }
    setShowDialog(true);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Название обязательно';
    if (!formData.origin.trim()) errs.origin = 'Укажите пункт отправления';
    if (!formData.destination.trim()) errs.destination = 'Укажите пункт назначения';
    if (durationHours === 0 && durationMinutes === 0) errs.duration = 'Укажите время в пути';
    if (durationHours > 48) errs.duration = 'Максимум 48 часов';
    if (durationMinutes > 59) errs.duration = 'Минуты должны быть от 0 до 59';
    if (!formData.price || formData.price <= 0) errs.price = 'Укажите цену';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setSaving(true);

      const routeData = {
        name: formData.name,
        origin: formData.origin,
        destination: formData.destination,
        distance: Number(formData.distance),
        duration: durationHours * 60 + durationMinutes,
        price: Number(formData.price),
        isActive: formData.isActive,
      };

      if (selectedRoute?.id) {
        await routesApi.update(selectedRoute.id, routeData);
        toast.success('Маршрут обновлён');
      } else {
        await routesApi.create(routeData);
        toast.success('Маршрут создан');
      }

      setShowDialog(false);
      loadRoutes();
    } catch (error) {
      console.error('Error saving route:', error);
      toast.error('Ошибка при сохранении маршрута');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    confirm({
      message: 'Вы уверены, что хотите удалить этот маршрут?',
      accept: async () => {
        try {
          await routesApi.delete(id);
          loadRoutes();
        } catch (error) {
          console.error('Error deleting route:', error);
          toast.error('Ошибка при удалении маршрута');
        }
      },
    });
  };

  const nameTemplate = (rowData: Route) => {
    return (
      <div>
        <div className="font-bold">{rowData.name}</div>
        <div className="text-sm text-gray-500">{rowData.origin} → {rowData.destination}</div>
      </div>
    );
  };

  const durationTemplate = (rowData: Route) => {
    if (!rowData.duration) return '—';
    const h = Math.floor(rowData.duration / 60);
    const m = rowData.duration % 60;
    return `${h} ч ${m} мин`;
  };

  const statusTemplate = (rowData: Route) => {
    return (
      <Tag severity={rowData.isActive ? 'success' : 'danger'} value={rowData.isActive ? 'Активный' : 'Неактивный'} />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Управление маршрутами</h1>
        <Button label="Добавить маршрут" icon="pi pi-plus" onClick={() => openDialog()} />
      </div>

      <Card>
        <DataTable 
          value={routes} 
          loading={loading}
          responsiveLayout="scroll" 
          paginator 
          rows={10}
          sortField="name" 
          sortOrder={1}
        >
          <Column header="Маршрут" body={nameTemplate} sortable />
          <Column header="Расстояние (км)" field="distance" sortable />
          <Column header="Время в пути" body={durationTemplate} sortable />
          <Column header="Цена (₽)" body={(row) => row.price ? `${row.price} ₽` : '-'} sortable />
          <Column header="Статус" body={statusTemplate} sortable />
          <Column 
            header="Действия"
            body={(row) => (
              <div className="flex gap-2">
                <Button 
                  icon="pi pi-pencil" 
                  className="p-button-text p-button-sm" 
                  onClick={() => openDialog(row)}
                />
                <Button 
                  icon="pi pi-trash" 
                  className="p-button-text p-button-danger p-button-sm"
                  onClick={() => handleDelete(row.id!)}
                />
              </div>
            )}
          />
        </DataTable>
      </Card>

      <Dialog 
        header={selectedRoute ? 'Редактирование маршрута' : 'Добавление маршрута'} 
        visible={showDialog} 
        onHide={() => { setShowDialog(false); setErrors({}); }}
        style={{ width: '550px' }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Название *</label>
            <InputText 
              className={`w-full ${errors.name ? 'p-invalid' : ''}`} 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Москва - Санкт-Петербург"
            />
            {errors.name && <small className="p-error">{errors.name}</small>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Откуда *</label>
              <InputText 
                className={`w-full ${errors.origin ? 'p-invalid' : ''}`} 
                value={formData.origin} 
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                placeholder="Москва"
              />
              {errors.origin && <small className="p-error">{errors.origin}</small>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Куда *</label>
              <InputText 
                className={`w-full ${errors.destination ? 'p-invalid' : ''}`} 
                value={formData.destination} 
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="Санкт-Петербург"
              />
              {errors.destination && <small className="p-error">{errors.destination}</small>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Расстояние (км)</label>
              <InputText 
                className="w-full" 
                value={String(formData.distance)} 
                onChange={(e) => setFormData({ ...formData, distance: Number(e.target.value) })}
                placeholder="700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Время в пути *</label>
              <div className="flex gap-2 items-center">
                <InputNumber
                  value={durationHours}
                  onValueChange={(e) => setDurationHours(e.value || 0)}
                  min={0}
                  max={48}
                  showButtons
                  className={`w-24 ${errors.duration ? 'p-invalid' : ''}`}
                />
                <span>ч</span>
                <InputNumber
                  value={durationMinutes}
                  onValueChange={(e) => setDurationMinutes(e.value || 0)}
                  min={0}
                  max={59}
                  showButtons
                  className="w-24"
                />
                <span>мин</span>
              </div>
              {errors.duration && <small className="p-error">{errors.duration}</small>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Цена (₽) *</label>
              <InputNumber
                className={`w-full ${errors.price ? 'p-invalid' : ''}`}
                value={formData.price}
                onValueChange={(e) => setFormData({ ...formData, price: e.value || 0 })}
                min={0}
                placeholder="2500"
                mode="currency"
                currency="RUB"
                locale="ru-RU"
              />
              {errors.price && <small className="p-error">{errors.price}</small>}
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button label="Отмена" className="p-button-text" onClick={() => { setShowDialog(false); setErrors({}); }} />
            <Button 
              label="Сохранить" 
              icon="pi pi-check" 
              onClick={handleSave}
              loading={saving}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}