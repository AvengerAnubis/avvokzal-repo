'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    logout();
    router.push('/');
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <i className="pi pi-spin pi-spinner text-4xl mb-4"></i>
        <p className="text-lg">Выход из системы...</p>
      </div>
    </div>
  );
}