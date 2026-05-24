'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { useAuth } from '@/lib/auth/context';
import { chatApi } from '@/lib/api';

export default function OperatorChatsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [availableChats, setAvailableChats] = useState<any[]>([]);
  const [activeChats, setActiveChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user || (user.role !== 'OPERATOR' && user.role !== 'ADMIN')) {
      router.push('/auth/login');
      return;
    }
    loadChats();
    const interval = setInterval(loadChats, 15_000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user, isLoading]);

  const loadChats = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [availableRes, activeRes] = await Promise.all([
        chatApi.getAvailable(),
        chatApi.getActiveByOperator(user.id),
      ]);
      setAvailableChats(availableRes.data || []);
      setActiveChats(activeRes.data || []);
    } catch {
      console.error('Error loading chats');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (chatId: string) => {
    if (!user) return;
    try {
      setAssigningId(chatId);
      await chatApi.assign(chatId, user.id);
      router.push(`/operator/chats/${chatId}`);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Не удалось подключиться к чату');
    } finally {
      setAssigningId(null);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleString('ru-RU');
  };

  if (loading && availableChats.length === 0 && activeChats.length === 0) {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Чат-поддержка</h1>
        <Button icon="pi pi-refresh" className="p-button-outlined" onClick={loadChats} label="Обновить" />
      </div>

      {/* Available chats */}
      <Card title={`Ожидают оператора (${availableChats.length})`}>
        {availableChats.length === 0 ? (
          <p className="text-muted-color py-4 text-center">Нет запросов от водителей</p>
        ) : (
          <div className="space-y-3">
            {availableChats.map((chat) => (
              <div key={chat.id} className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-lg">
                <div className="flex-1">
                  <div className="font-bold">{chat.driver.firstName} {chat.driver.lastName}</div>
                  <div className="text-sm text-muted-color">{chat.driver.email}</div>
                  {chat.messages?.[0] && (
                    <div className="text-sm text-muted-color mt-1 truncate max-w-md">
                      {chat.messages[0].text}
                    </div>
                  )}
                  <div className="text-xs text-muted-color mt-1">Создан: {formatTime(chat.createdAt)}</div>
                </div>
                <Button
                  label="Взять чат"
                  icon="pi pi-comments"
                  loading={assigningId === chat.id}
                  onClick={() => handleAssign(chat.id)}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Active chats */}
      <Card title={`Активные чаты (${activeChats.length})`}>
        {activeChats.length === 0 ? (
          <p className="text-muted-color py-4 text-center">Нет активных чатов</p>
        ) : (
          <div className="space-y-3">
            {activeChats.map((chat) => (
              <div
                key={chat.id}
                className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50"
                onClick={() => router.push(`/operator/chats/${chat.id}`)}
              >
                <div className="flex-1">
                  <div className="font-bold">{chat.driver.firstName} {chat.driver.lastName}</div>
                  <div className="text-sm text-muted-color">{chat.driver.email}</div>
                  {chat.messages?.[0] && (
                    <div className="text-sm text-muted-color mt-1 truncate max-w-md">
                      {chat.messages[0].text}
                    </div>
                  )}
                  <div className="text-xs text-muted-color mt-1">
                    Сообщений: {chat._count?.messages || '-'}
                  </div>
                </div>
                <Tag value="Активен" severity="info" />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}