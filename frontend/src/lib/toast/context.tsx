'use client';

import React, { createContext, useContext, useRef } from 'react';
import { Toast } from 'primereact/toast';

interface ToastShowParams {
  severity?: 'success' | 'info' | 'warn' | 'error';
  summary?: string;
  detail?: string;
  life?: number;
}

interface ToastContextType {
  show: (params: ToastShowParams) => void;
  success: (detail: string) => void;
  info: (detail: string) => void;
  warn: (detail: string) => void;
  error: (detail: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const toastRef = useRef<Toast>(null);

  const show = (params: ToastShowParams) => {
    toastRef.current?.show(params);
  };

  const success = (detail: string) => show({ severity: 'success', summary: 'Успех', detail, life: 3000 });
  const info = (detail: string) => show({ severity: 'info', summary: 'Информация', detail, life: 3000 });
  const warn = (detail: string) => show({ severity: 'warn', summary: 'Предупреждение', detail, life: 5000 });
  const error = (detail: string) => show({ severity: 'error', summary: 'Ошибка', detail, life: 5000 });

  return (
    <ToastContext.Provider value={{ show, success, info, warn, error }}>
      <Toast ref={toastRef} position="top-right" />
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
