import React from 'react';
import { useInactivityTimeout } from '../hooks/useInactivityTimeout';

interface InactivityWrapperProps {
  children: React.ReactNode;
}

export const InactivityWrapper: React.FC<InactivityWrapperProps> = ({ children }) => {
  // Configurar timeout de inatividade apenas para usuários autenticados
  useInactivityTimeout({
    timeout: 10 * 60 * 1000, // 10 minutos
    warningTime: 2 * 60 * 1000, // Aviso 2 minutos antes
    onTimeout: () => {
      console.log('Sessão encerrada por inatividade');
    },
  });

  return <>{children}</>;
};

export default InactivityWrapper;