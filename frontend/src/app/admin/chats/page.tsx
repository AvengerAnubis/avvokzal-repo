'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { useAuth } from '@/lib/auth/context';
import { chatApi } from '@/lib/api';

export default function AdminChatsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user || user.role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    loadHistory();
  }, [isAuthenticated, user, isLoading]);

  const loadHistory = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await chatApi.getHistory(user.id, user.role);
      setChats(res.data || []);
    } catch {
      console.error('Error loading chat history');
    } finally {
      setLoading(false);
    }
  };

  const driverTemplate = (row: any) => (
    <span>{row.driver?.firstName} {row.driver?.lastName}<br /><span className="text-xs text-muted-color">{row.driver?.email}</span></span>
  );

  const operatorTemplate = (row: any) => (
    <span>{row.operator ? `${row.operator.firstName} ${row.operator.lastName}` : '—'}</span>
  );

  const statusTemplate = (row: any) => {
    const map: Record<string, { severity: 'success' | 'info' | 'warning'; label: string }> = {
      WAITING: { severity: 'warning', label: 'Ожидание' },
      ACTIVE: { severity: 'info', label: 'Активен' },
      CLOSED: { severity: 'success', label: 'Закрыт' },
    };
    const s = map[row.status] || { severity: 'info', label: row.status };
    return <Tag severity={s.severity} value={s.label} />;
  };

  const messagesTemplate = (row: any) => (
    <span>{row._count?.messages || 0}</span>
  );

  const lastMessageTemplate = (row: any) => (
    <div className="text-sm truncate max-w-xs">
      {row.messages?.[0]?.text || '—'}
    </div>
  );

  const actionsTemplate = (row: any) => (
    <Button
      label="Открыть"
      icon="pi pi-eye"
      size="small"
      onClick={() => router.push(`/admin/chats/${row.id}`)}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">История чатов</h1>
        <Button icon="pi pi-refresh" className="p-button-outlined" onClick={loadHistory} label="Обновить" />
      </div>

      <Card>
        <DataTable value={chats} loading={loading} responsiveLayout="scroll" paginator rows={20} sortField="closedAt" sortOrder={-1}>
          <Column header="Водитель" body={driverTemplate} />
          <Column header="Оператор" body={operatorTemplate} />
          <Column header="Статус" body={statusTemplate} />
          <Column header="Сообщений" body={messagesTemplate} />
          <Column header="Последнее" body={lastMessageTemplate} />
          <Column header="Создан" field="createdAt" body={(row) => new Date(row.createdAt).toLocaleString('ru-RU')} sortable />
          <Column header="Закрыт" field="closedAt" body={(row) => row.closedAt ? new Date(row.closedAt).toLocaleString('ru-RU') : '—'} sortable />
          <Column header="Действия" body={actionsTemplate} />
        </DataTable>
      </Card>
    </div>
  );
}