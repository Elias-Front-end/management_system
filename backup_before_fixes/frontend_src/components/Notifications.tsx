import React, { useEffect } from 'react';
import { X as CloseIcon, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { useNotificationStore } from '../store/notificationStore';
import type { NotificationItem } from '../store/notificationStore';

const typeStyles: Record<NotificationItem['type'], { container: string; iconClass: string; titleClass: string; barClass: string; }> = {
  success: {
    container: 'bg-green-50 border border-green-200 text-green-800',
    iconClass: 'text-green-600',
    titleClass: 'text-green-700',
    barClass: 'bg-green-500',
  },
  error: {
    container: 'bg-red-50 border border-red-200 text-red-800',
    iconClass: 'text-red-600',
    titleClass: 'text-red-700',
    barClass: 'bg-red-500',
  },
  warning: {
    container: 'bg-yellow-50 border border-yellow-200 text-yellow-900',
    iconClass: 'text-yellow-600',
    titleClass: 'text-yellow-800',
    barClass: 'bg-yellow-500',
  },
  info: {
    container: 'bg-blue-50 border border-blue-200 text-blue-900',
    iconClass: 'text-blue-600',
    titleClass: 'text-blue-800',
    barClass: 'bg-blue-500',
  },
};

const TypeIcon: React.FC<{ type: NotificationItem['type']; size?: number }> = ({ type, size = 18 }) => {
  switch (type) {
    case 'success': return <CheckCircle2 size={size} />;
    case 'error':   return <AlertCircle size={size} />;
    case 'warning': return <AlertTriangle size={size} />;
    case 'info':    return <Info size={size} />;
    default:        return <Info size={size} />;
  }
};

export const Notifications: React.FC = () => {
  const { notifications, remove } = useNotificationStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-3 w-[calc(100%-2rem)] sm:w-96 pointer-events-none">
      {notifications.map((n) => (
        <Toast key={n.id} item={n} onClose={() => remove(n.id)} />
      ))}
    </div>
  );
};

const Toast: React.FC<{ item: NotificationItem; onClose: () => void }> = ({ item, onClose }) => {
  const styles = typeStyles[item.type];
  const pct = Math.min(100, Math.max(0, (Date.now() - item.createdAt) / item.duration * 100));

  useEffect(() => {
    const timer = setTimeout(onClose, item.duration);
    return () => clearTimeout(timer);
  }, [item.duration, onClose]);

  return (
    <div className={`rounded-lg shadow-lg p-3 sm:p-4 flex items-start space-x-3 backdrop-blur-sm pointer-events-auto ${styles.container}`} role="alert" aria-live="assertive">
      <div className={`flex-shrink-0 mt-0.5 ${styles.iconClass}`}>
        <TypeIcon type={item.type} />
      </div>
      <div className="flex-1">
        {item.title && <div className={`font-semibold text-sm ${styles.titleClass}`}>{item.title}</div>}
        <div className="text-sm">{item.message}</div>
        <div className="mt-2 h-1 w-full bg-black/5 rounded-full overflow-hidden">
          <div className={`h-1 ${styles.barClass}`} style={{ width: `${100 - pct}%` }} />
        </div>
      </div>
      <button onClick={onClose} className="p-1 rounded hover:bg-black/5 transition-colors text-gray-500" aria-label="Fechar">
        <CloseIcon size={16} />
      </button>
    </div>
  );
};

export default Notifications;