import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface TimeoutWarningModalProps {
  isOpen: boolean;
  remainingTime: number;
  onExtendSession: () => void;
  onLogout: () => void;
}

export const TimeoutWarningModal: React.FC<TimeoutWarningModalProps> = ({
  isOpen,
  remainingTime,
  onExtendSession,
  onLogout,
}) => {
  const [timeLeft, setTimeLeft] = useState(remainingTime);

  useEffect(() => {
    if (isOpen && remainingTime > 0) {
      setTimeLeft(remainingTime);

      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1000) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, remainingTime]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Sessão Expirando
            </h3>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Sua sessão será encerrada por inatividade em:
          </p>

          <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4">
            <Clock className="h-8 w-8 text-red-500 mr-3" />
            <span className="text-3xl font-bold text-red-500">
              {formatTime(timeLeft)}
            </span>
          </div>

          <p className="text-sm text-gray-500 mt-3 text-center">
            Clique em "Continuar Sessão" para permanecer logado
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onLogout}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Sair Agora
          </button>
          <button
            onClick={onExtendSession}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Continuar Sessão
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeoutWarningModal;