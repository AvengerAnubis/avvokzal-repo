'use client';

import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { usersApi } from '@/lib/api';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';

interface User {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'USER',
  });

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user || user.role !== 'ADMIN') {
      router.push('/auth/login');
      return;
    }
    loadUsers();
  }, [isAuthenticated, user, isLoading]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await usersApi.getAll();
      setUsers(res.data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: '',
        phone: user.phone || '',
        role: user.role,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: 'USER',
      });
    }
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      if (selectedUser?.id) {
        // Update existing
        await usersApi.update(selectedUser.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
        });
      } else {
        // Create new
        if (!formData.password) {
          alert('Пароль обязателен для нового пользователя');
          return;
        }
        await usersApi.create({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role,
        });
      }

      setShowDialog(false);
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Ошибка при сохранении пользователя');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите заблокировать этого пользователя?')) return;

    try {
      await usersApi.delete(id);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Ошибка при удалении пользователя');
    }
  };

  const roleOptions = [
    { label: 'Пользователь', value: 'USER' },
    { label: 'Администратор', value: 'ADMIN' },
    { label: 'Водитель', value: 'DRIVER' },
    { label: 'Оператор', value: 'OPERATOR' },
  ];

  const roleTemplate = (rowData: User) => {
    const labels: Record<string, string> = {
      USER: 'Пользователь',
      ADMIN: 'Администратор',
      DRIVER: 'Водитель',
      OPERATOR: 'Оператор',
    };
    const colors: Record<string, string> = {
      USER: 'bg-blue-100 text-blue-800',
      ADMIN: 'bg-purple-100 text-purple-800',
      DRIVER: 'bg-green-100 text-green-800',
      OPERATOR: 'bg-orange-100 text-orange-800',
    };
    return (
      <span className={`px-2 py-1 rounded text-sm ${colors[rowData.role] || 'bg-gray-100'}`}>
        {labels[rowData.role] || rowData.role}
      </span>
    );
  };

  const statusTemplate = (rowData: User) => {
    return (
      <span className={`px-2 py-1 rounded text-sm ${rowData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {rowData.isActive ? 'Активен' : 'Заблокирован'}
      </span>
    );
  };

  const nameTemplate = (rowData: User) => {
    return (
      <div>
        <div className="font-bold">{rowData.firstName} {rowData.lastName}</div>
        <div className="text-sm text-gray-500">{rowData.email}</div>
      </div>
    );
  };

  const filteredUsers = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Управление пользователями</h1>
        <Button label="Добавить пользователя" icon="pi pi-plus" onClick={() => openDialog()} />
      </div>

      <Card>
        <div className="mb-4">
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              placeholder="Поиск пользователей..."
              className="w-64"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </span>
        </div>

        <DataTable value={filteredUsers} loading={loading} responsiveLayout="scroll" paginator rows={10} sortField="email" sortOrder={1}>
          <Column header="Пользователь" body={nameTemplate} sortable />
          <Column header="Роль" body={roleTemplate} sortable />
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
        header={selectedUser ? 'Редактирование пользователя' : 'Добавление пользователя'}
        visible={showDialog}
        onHide={() => { setShowDialog(false); setSelectedUser(null); }}
        style={{ width: '500px' }}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Имя</label>
              <InputText
                className="w-full"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Фамилия</label>
              <InputText
                className="w-full"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <InputText
              className="w-full"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          {!selectedUser && (
            <div>
              <label className="block text-sm font-medium mb-2">Пароль</label>
              <InputText
                type="password"
                className="w-full"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-2">Роль</label>
            <Dropdown
              options={roleOptions}
              className="w-full"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.value })}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button label="Отмена" className="p-button-text" onClick={() => setShowDialog(false)} />
            <Button
              label="Сохранить"
              icon="pi pi-check"
              onClick={handleSave}
              loading={saving}
              disabled={!formData.firstName || !formData.lastName || !formData.email || (!selectedUser && !formData.password)}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
}