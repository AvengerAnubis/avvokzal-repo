'use client';

import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';

export default function ProfileSettingsPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
    setLoading(false);
  }, []);

  const handleSave = async () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return;
      const currentUser = JSON.parse(userStr);
      
      await usersApi.update(currentUser.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      
      // Update localStorage with the new data
      const updatedUser = { ...currentUser, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      alert('Профиль успешно обновлён');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Ошибка при обновлении профиля');
    }
  };

  if (loading) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Настройки профиля</h1>

      <Card>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-2">Имя</label>
            <InputText 
              value={formData.firstName} 
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} 
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Фамилия</label>
            <InputText 
              value={formData.lastName} 
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} 
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <InputText 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Телефон</label>
            <InputText 
              value={formData.phone} 
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
              className="w-full"
            />
          </div>

          <Button label="Сохранить" icon="pi pi-save" onClick={handleSave} />
        </div>
      </Card>
    </div>
  );
}