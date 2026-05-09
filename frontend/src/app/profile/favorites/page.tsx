'use client';

import { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { routesApi, favoritesApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ProfileFavoritesPage() {
  const [favoriteRoutes, setFavoriteRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    if (!userStr) {
      setLoading(false);
      return;
    }
    const userId = JSON.parse(userStr).id;

    Promise.all([
      favoritesApi.getAll(userId),
      routesApi.getAll()
    ])
      .then(([favsRes, routesRes]) => {
        const favorites = favsRes.data || [];
        const routes = routesRes.data || [];
        
        const joined = favorites.map((fav: any) => {
          const route = routes.find((r: any) => r.id === fav.routeId);
          return route ? { ...route, favoriteId: fav.id } : null;
        }).filter((r: any) => r !== null);
        
        setFavoriteRoutes(joined);
      })
      .catch(() => setFavoriteRoutes([]))
      .finally(() => setLoading(false));
  }, []);

  const priceTemplate = (rowData: any) => {
    return <span className="text-green-600 font-bold">{rowData.price} ₽</span>;
  };

  const routeTemplate = (rowData: any) => {
    return (
      <div>
        <div className="font-bold">{rowData.name}</div>
        <div className="text-sm text-gray-500">{rowData.origin} → {rowData.destination}</div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Избранные маршруты</h1>

      <Card>
        <DataTable value={favoriteRoutes} loading={loading} responsiveLayout="scroll" paginator rows={10} sortField="name" sortOrder={1}>
          <Column header="Маршрут" body={routeTemplate} sortable />
          <Column header="Расстояние" body={(row) => `${row.distance} км`} sortable />
          <Column header="Время" body={(row) => `${row.duration} мин`} sortable />
          <Column header="Цена" body={priceTemplate} sortable />
          <Column 
            header="Действия"
            body={(row) => {
              const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
              const userId = userStr ? JSON.parse(userStr).id : null;
              return (
                <div className="flex gap-2">
                  <Button 
                    label="Забронировать" 
                    icon="pi pi-ticket" 
                    className="p-button-sm" 
                    onClick={() => router.push(`/booking?routeId=${row.id}`)}
                  />
                  <Button 
                    icon="pi pi-trash" 
                    className="p-button-text p-button-danger p-button-sm"
                    onClick={async () => {
                      if (userId && confirm('Удалить из избранного?')) {
                        try {
                          await favoritesApi.remove(userId, row.id);
                          setFavoriteRoutes(prev => prev.filter(r => r.id !== row.id));
                        } catch (e) {
                          console.error(e);
                        }
                      }
                    }}
                  />
                </div>
              );
            }}
          />
        </DataTable>
      </Card>
    </div>
  );
}