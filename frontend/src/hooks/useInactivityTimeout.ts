import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

interface UseInactivityTimeoutProps {
  timeout: number; // Tempo em milissegundos
  warningTime: number; // Tempo de aviso antes do logout
  onTimeout?: () => void;
  onWarning?: () => void;
}

export const useInactivityTimeout = ({ timeout, warningTime, onTimeout, onWarning }: UseInactivityTimeoutProps) => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();
  const { notifyError, notifyWarning } = useNotificationStore();
  
  const timeoutRef = useRef<number | null>(null);
  const warningTimeoutRef = useRef<number | null>(null);
  const isWarningShownRef = useRef(false);

  // Eventos que resetam o timer
  const events = useMemo(() => [
    'mousemove',
    'keydown',
    'touchstart',
    'click'
  ], []);

  // Função para limpar todos os timeouts
  const clearTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    isWarningShownRef.current = false;
  }, []);

  // Função para realizar logout por inatividade
  const handleTimeout = useCallback(async () => {
    try {
      await logout();
      notifyError(
        'Sessão Encerrada',
        'Sua sessão foi encerrada por inatividade. Faça login novamente para continuar.'
      );
      navigate('/login', { replace: true });
      onTimeout?.();
    } catch (error) {
      console.error('Erro ao fazer logout por inatividade:', error);
      // Mesmo com erro, redireciona para login
      navigate('/login', { replace: true });
    }
  }, [logout, navigate, onTimeout, notifyError]);

  // Função para mostrar aviso de timeout
  const handleWarning = useCallback(() => {
    if (!isWarningShownRef.current) {
      isWarningShownRef.current = true;
      const minutes = Math.floor(warningTime / 60000);
      notifyWarning(
        'Sessão Expirando',
        `Sua sessão será encerrada em ${minutes} minutos por inatividade. Mova o mouse ou pressione uma tecla para continuar.`
      );
      onWarning?.();
    }
  }, [warningTime, onWarning, notifyWarning]);

  // Função para resetar o timer
  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;

    clearTimeouts();

    // Configurar aviso antes do timeout
    warningTimeoutRef.current = setTimeout(() => {
      handleWarning();
    }, timeout - warningTime);

    // Configurar timeout final
    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, timeout);
  }, [isAuthenticated, timeout, warningTime, handleWarning, handleTimeout, clearTimeouts]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearTimeouts();
      return;
    }

    // Inicializar timer
    resetTimer();

    // Adicionar event listeners
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach((event: string) => {
      document.addEventListener(event, handleActivity, true);
    });

    // Cleanup
    return () => {
      clearTimeouts();
      events.forEach((event: string) => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isAuthenticated, resetTimer, clearTimeouts, events]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      clearTimeouts();
    };
  }, [clearTimeouts]);

  return {
    resetTimer,
    clearTimeouts,
  };
};