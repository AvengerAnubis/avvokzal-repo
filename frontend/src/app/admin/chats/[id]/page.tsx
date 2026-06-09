'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { ScrollPanel } from 'primereact/scrollpanel';
import { Tag } from 'primereact/tag';
import { useAuth } from '@/lib/auth/context';
import { chatApi } from '@/lib/api';
import { useToast } from '@/lib/toast/context';

export default function AdminChatDetailPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user || user.role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    loadChat();
  }, [isAuthenticated, user, isLoading, params?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChat = async () => {
    if (!user || !params?.id) return;
    try {
      const res = await chatApi.getById(params.id as string, user.id, user.role);
      setChat(res.data);
      setMessages(res.data.messages || []);
    } catch {
      router.push('/admin/chats');
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !params?.id) return;
    try {
      setSending(true);
      const res = await chatApi.sendMessage(params.id as string, user.id, 'ADMIN', message);
      setMessages((prev: any[]) => [...prev, res.data]);
      setMessage('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Ошибка при отправке');
    } finally {
      setSending(false);
    }
  };

  if (!chat) {
    return <div className="flex justify-center items-center min-h-screen">Загрузка...</div>;
  }

  const isClosed = chat.status === 'CLOSED';

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <Button icon="pi pi-arrow-left" className="p-button-text mr-2" onClick={() => router.push('/admin/chats')} />
          <span className="text-xl font-bold">
            Чат: {chat.driver?.firstName} {chat.driver?.lastName}
            {chat.operator && <> → {chat.operator.firstName} {chat.operator.lastName}</>}
          </span>
          <Tag
            severity={isClosed ? 'secondary' : chat.status === 'ACTIVE' ? 'success' : 'warning'}
            value={isClosed ? 'Закрыт' : chat.status === 'ACTIVE' ? 'Активен' : 'Ожидание'}
            className="ml-3"
          />
        </div>
      </div>

      <Card><ScrollPanel style={{ width: '100%', height: '60vh' }}>
        {messages.length === 0 ? (
          <p className="text-center text-muted-color py-8">Нет сообщений</p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg: any, i: number) => (
              <div key={msg.id || i} className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded max-w-[75%] ${
                  msg.senderRole === 'DRIVER' ? 'bg-[var(--surface-section)] text-[var(--text-color)]' :
                  msg.senderId === user?.id ? 'bg-blue-600 text-white' : 'bg-green-900/30 text-green-300'
                }`}>
                  <div className="text-xs text-muted-color mb-1">
                    {msg.sender?.firstName} {msg.sender?.lastName}
                    {msg.senderRole === 'DRIVER' ? ' (Водитель)' : msg.senderRole === 'OPERATOR' ? ' (Оператор)' : ' (Админ)'}
                  </div>
                  <div className="text-sm">{msg.text}</div>
                  <div className={`text-xs mt-1 ${msg.senderId === user?.id ? 'text-blue-300' : 'text-muted-color'}`}>
                    {new Date(msg.createdAt).toLocaleString('ru-RU')}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}
      </ScrollPanel></Card>

      {!isClosed && (
        <Card>
          <div className="flex gap-2">
            <InputText
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button icon="pi pi-send" onClick={handleSendMessage} loading={sending} disabled={!message.trim()} />
          </div>
        </Card>
      )}

      {isClosed && (
        <p className="text-center text-muted-color">Чат закрыт. Просмотр истории.</p>
      )}
    </div>
  );
}