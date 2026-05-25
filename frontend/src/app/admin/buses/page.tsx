'use client';

import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { busesApi } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/lib/toast/context';

interface Bus {
  id?: string;
  plateNumber: string;
  model?: string;
  totalSeats: number;
  isActive: boolean;
}

export default function AdminBusesPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const toast = useToast();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Bus>({
    plateNumber: '',
    model: '',
    totalSeats: 40,
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user || user.role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    loadBuses();
  }, [isAuthenticated, user, isLoading]);

  const loadBuses = async () => {
    try {
      setLoading(true);
      const res = await busesApi.getAll();
      setBuses(res.data || []);
    } catch {
      toast.error('Ошибка загрузки автобусов');
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.plateNumber.trim()) errs.plateNumber = 'Госномер обязателен';
    else if (formData.plateNumber.length < 6) errs.plateNumber = 'Госномер слишком короткий';
    if (!formData.totalSeats || formData.totalSeats < 5) errs.totalSeats = 'Мин. 5 мест';
    if (formData.totalSeats > 100) errs.totalSeats = 'Макс. 100 мест';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const openDialog = (bus?: Bus) => {
    if (bus) {
      setSelectedBus(bus);
      setFormData({ ...bus });
    } else {
      setSelectedBus(null);
      setFormData({ plateNumber: '', model: '', totalSeats: 40, isActive: true });
    }
    setErrors({});
    setShowDialog(true);
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      if (selectedBus?.id) {
        await busesApi.update(selectedBus.id, formData);
        toast.success('Автобус обновлён');
      } else {
        await busesApi.create(formData);
        toast.success('Автобус добавлен');
      }
      setShowDialog(false);
      loadBuses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await busesApi.delete(id);
      toast.success('Автобус деактивирован');
      loadBuses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка');
    }
  };

  const plateTemplate = (row: Bus) => (
    <div>
      <div className="font-bold">{row.plateNumber}</div>
      {row.model && <div className="text-sm text-muted-color">{row.model}</div>}
    </div>
  );

  const statusTemplate = (row: Bus) => (
    <Tag severity={row.isActive ? 'success' : 'danger'} value={row.isActive ? 'Активен' : 'Неактивен'} />
  );

  const actionsTemplate = (row: Bus) => (
    <div className="flex gap-2">
      <Button icon="pi pi-pencil" className="p-button-text p-button-sm" onClick={() => openDialog(row)} />
      {row.isActive && (
        <Button icon="pi pi-ban" className="p-button-text p-button-warning p-button-sm" onClick={() => handleDelete(row.id!)} />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Автобусы</h1>
        <Button label="Добавить автобус" icon="pi pi-plus" onClick={() => openDialog()} />
      </div>

      <Card>
        <DataTable value={buses} loading={loading} responsiveLayout="scroll" paginator rows={10} sortField="plateNumber" sortOrder={1}>
          <Column header="Автобус" body={plateTemplate} sortable />
          <Column header="Кол-во мест" field="totalSeats" sortable />
          <Column header="Статус" body={statusTemplate} sortable />
          <Column header="Действия" body={actionsTemplate} />
        </DataTable>
      </Card>

      <Dialog
        header={selectedBus ? 'Редактирование автобуса' : 'Добавление автобуса'}
        visible={showDialog}
        onHide={() => { setShowDialog(false); setErrors({}); }}
        style={{ width: '450px' }}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Госномер *</label>
            <InputText
              className={`w-full ${errors.plateNumber ? 'p-invalid' : ''}`}
              value={formData.plateNumber}
              onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
              placeholder="АА 1234 РУ"
            />
            {errors.plateNumber && <small className="p-error">{errors.plateNumber}</small>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Модель</label>
            <InputText
              className="w-full"
              value={formData.model || ''}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="Mercedes-Benz Sprinter"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Количество мест *</label>
            <InputNumber
              className={`w-full ${errors.totalSeats ? 'p-invalid' : ''}`}
              value={formData.totalSeats}
              onValueChange={(e) => setFormData({ ...formData, totalSeats: e.value || 40 })}
              min={5}
              max={100}
              showButtons
            />
            {errors.totalSeats && <small className="p-error">{errors.totalSeats}</small>}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button label="Отмена" className="p-button-text" onClick={() => setShowDialog(false)} />
            <Button label="Сохранить" icon="pi pi-check" onClick={handleSave} loading={saving} />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
