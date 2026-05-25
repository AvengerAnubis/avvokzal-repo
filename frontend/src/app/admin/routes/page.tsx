'use client';

import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
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
  
  // Form state
  const [formData, setFormData] = useState<Route>({
    name: '',
    origin: '',
    destination: '',
    distance: 0,
    duration: 0,
    price: 0,
    isActive: true,
  });

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
    if (route) {
      setSelectedRoute(route);
      setFormData(route);
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
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      const routeData = {
        name: formData.name,
        origin: formData.origin,
        destination: formData.destination,
        distance: Number(formData.distance),
        duration: Number(formData.duration),
        price: Number(formData.price),
        isActive: formData.isActive,
      };

      if (selectedRoute?.id) {
        // Update existing
        await routesApi.update(selectedRoute.id, routeData);
      } else {
        // Create new
        await routesApi.create(routeData);
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
          <Column header="Время (мин)" field="duration" sortable />
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
        onHide={() => setShowDialog(false)}
        style={{ width: '500px' }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Название</label>
            <InputText 
              className="w-full" 
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Москва - Санкт-Петербург"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Откуда</label>
              <InputText 
                className="w-full" 
                value={formData.origin} 
                onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                placeholder="Москва"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Куда</label>
              <InputText 
                className="w-full" 
                value={formData.destination} 
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="Санкт-Петербург"
              />
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
              <label className="block text-sm font-medium mb-2">Время (мин)</label>
              <InputText 
                className="w-full" 
                value={String(formData.duration)} 
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                placeholder="720"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Цена (₽)</label>
              <InputText 
                className="w-full" 
                value={String(formData.price)} 
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="2500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button label="Отмена" className="p-button-text" onClick={() => setShowDialog(false)} />
            <Button 
              label="Сохранить" 
              icon="pi pi-check" 
              onClick={handleSave}
              loading={saving}
              disabled={!formData.name || !formData.origin || !formData.destination}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}