import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration: number; // ms
  createdAt: number;
}

interface NotificationState {
  notifications: NotificationItem[];
  add: (payload: { message: string; type?: NotificationType; title?: string; duration?: number }) => string;
  remove: (id: string) => void;
  clear: () => void;
  notifySuccess: (message: string, title?: string, duration?: number) => string;
  notifyError: (message: string, title?: string, duration?: number) => string;
  notifyWarning: (message: string, title?: string, duration?: number) => string;
  notifyInfo: (message: string, title?: string, duration?: number) => string;
}

const genId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  add: ({ message, type = 'info', title, duration = 5000 }) => {
    const id = genId();
    const item: NotificationItem = {
      id,
      type,
      title,
      message,
      duration,
      createdAt: Date.now(),
    };
    set((state) => ({ notifications: [item, ...state.notifications] }));
    return id;
  },
  remove: (id: string) => set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) })),
  clear: () => set({ notifications: [] }),

  notifySuccess: (message, title = 'Sucesso', duration) => get().add({ message, type: 'success', title, duration }),
  notifyError:   (message, title = 'Erro', duration)    => get().add({ message, type: 'error', title, duration }),
  notifyWarning: (message, title = 'Atenção', duration) => get().add({ message, type: 'warning', title, duration }),
  notifyInfo:    (message, title = 'Informação', duration) => get().add({ message, type: 'info', title, duration }),
}));