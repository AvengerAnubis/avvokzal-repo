'use client';

import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Button } from 'primereact/button';
import { tripsApi, chatApi, routesApi } from '@/lib/api';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';

export default function DriverPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'routes' | 'chat'>('routes');
  const [trips, setTrips] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user || (user.role !== 'DRIVER' && user.role !== 'ADMIN')) {
      router.push('/auth/login');
      return;
    }
    loadData();
  }, [isAuthenticated, user, isLoading]);

  useEffect(() => {
    // Scroll to bottom of chat when messages change
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (!user) return;

      const [tripsRes, routesRes] = await Promise.all([
        tripsApi.getByDriver(user.id),
        routesApi.getAll(),
      ]);
      setTrips(tripsRes.data || []);
      setRoutes(routesRes.data || []);

      // Load chat messages
      const messagesRes = await chatApi.getMessages(user.id);
      setMessages(messagesRes.data || []);
    } catch (error) {
      console.error('Error loading driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  const routeTemplate = (rowData: any) => {
    // Backend returns trip with included route
    if (rowData.route) {
      return `${rowData.route.origin} → ${rowData.route.destination}`;
    }
    const route = routes.find(r => r.id === rowData.routeId);
    return route ? `${route.origin} → ${route.destination}` : '-';
  };

  const statusTemplate = (rowData: any) => {
    const colors: Record<string, string> = {
      SCHEDULED: 'bg-green-100 text-green-800',
      DELAYED: 'bg-yellow-100 text-yellow-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    const labels: Record<string, string> = {
      SCHEDULED: 'В ожидании',
      DELAYED: 'Задержка',
      IN_PROGRESS: 'В пути',
      COMPLETED: 'Завершён',
      CANCELLED: 'Отменён',
    };
    return (
      <span className={`px-2 py-1 rounded text-sm ${colors[rowData.status] || 'bg-gray-100'}`}>
        {labels[rowData.status] || rowData.status}
      </span>
    );
  };

  const sendMessage = async () => {
    if (!message.trim() || !user) return;
    try {
      setSending(true);
      const res = await chatApi.sendMessage(user.id, message);
      setMessages(prev => [...prev, res.data]);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Ошибка при отправке сообщения');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Водитель</h1>
        <Button label="Обновить" icon="pi pi-refresh" className="p-button-outlined" onClick={loadData} />
      </div>

      <div className="flex gap-4 mb-4">
        <Button
          label="Мои рейсы"
          icon="pi pi-car"
          className={activeTab === 'routes' ? '' : 'p-button-outlined'}
          onClick={() => setActiveTab('routes')}
        />
        <Button
          label="Чат с оператором"
          icon="pi pi-comments"
          className={activeTab === 'chat' ? '' : 'p-button-outlined'}
          onClick={() => setActiveTab('chat')}
        />
      </div>

      {activeTab === 'routes' && (
        <Card>
          <DataTable value={trips} loading={loading} responsiveLayout="scroll" paginator rows={10} sortField="departureTime" sortOrder={1}>
            <Column header="Рейс" body={(row) => `#${row.id.slice(0, 8)}`} sortable />
            <Column header="Маршрут" body={routeTemplate} sortable />
            <Column header="Автобус" field="busNumber" sortable />
            <Column header="Отправление" body={(row) => new Date(row.departureTime).toLocaleString('ru-RU')} sortable />
            <Column header="Прибытие" body={(row) => new Date(row.arrivalTime).toLocaleString('ru-RU')} sortable />
            <Column header="Статус" body={statusTemplate} sortable />
          </DataTable>
        </Card>
      )}

      {activeTab === 'chat' && (
        <div className="space-y-4">
          <Card className="max-h-96 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-center text-muted-color py-8">Нет сообщений</p>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div className="flex">
                    <div className={`p-3 rounded max-w-[75%] ${msg.isRead ? 'bg-gray-700' : 'bg-gray-600'}`}>
                      <div className="text-sm text-white">{msg.content}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(msg.createdAt).toLocaleString('ru-RU')}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
          </Card>

          <Card>
            <div className="flex gap-2">
              <InputTextarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Введите сообщение..."
                className="flex-1"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button icon="pi pi-send" onClick={sendMessage} loading={sending} disabled={!message.trim()} />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}