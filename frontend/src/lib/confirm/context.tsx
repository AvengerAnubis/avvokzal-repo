'use client';

import React, { createContext, useContext, useRef, useState } from 'react';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';

interface ConfirmOptions {
  message: string;
  header?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  accept?: () => void;
  reject?: () => void;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => void;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const confirm = (options: ConfirmOptions) => {
    confirmDialog({
      message: options.message,
      header: options.header || 'Подтверждение',
      acceptLabel: options.acceptLabel || 'Да',
      rejectLabel: options.rejectLabel || 'Нет',
      accept: options.accept,
      reject: options.reject,
    });
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      <ConfirmDialog />
      {children}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmContextType {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}
