import React, { useState, useCallback } from 'react';
import { ConfirmModal } from '../components/ConfirmModal';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const useConfirm = () => {
  const [confirmState, setConfirmState] = useState<ConfirmState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'danger',
    onConfirm: () => {},
    onCancel: () => {},
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      const handleConfirm = () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        resolve(true);
      };

      const handleCancel = () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        resolve(false);
      };

      setConfirmState({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        type: options.type || 'danger',
        onConfirm: handleConfirm,
        onCancel: handleCancel,
      });
    });
  }, []);

  const ConfirmComponent: React.FC = () => (
    <ConfirmModal
      isOpen={confirmState.isOpen}
      title={confirmState.title}
      message={confirmState.message}
      confirmText={confirmState.confirmText}
      cancelText={confirmState.cancelText}
      type={confirmState.type}
      onConfirm={confirmState.onConfirm}
      onCancel={confirmState.onCancel}
    />
  );

  return {
    confirm,
    ConfirmComponent,
  };
};

export default useConfirm;