import React, { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Users, Settings, Eye } from 'lucide-react';
import type { Treinamento, Recurso } from '../../types';
// useNotificationStore import removed – unused

interface CardTreinamentoProps {
  treinamento: Treinamento;
  turmasCount?: number;
  alunosCount?: number;
  className?: string;
  onEdit?: (treinamento: Treinamento) => void;
  onDelete?: (treinamento: Treinamento) => void;
  showActions?: boolean;
  onRecursoEdit?: (recurso: Recurso) => void;
  onRecursoDelete?: (recurso: Recurso) => void;
  onAlunosClick?: (treinamento: Treinamento) => void;
  onTurmasClick?: (treinamento: Treinamento) => void;
}

export const CardTreinamento: React.FC<CardTreinamentoProps> = ({
  treinamento,
  turmasCount = 0,
  alunosCount = 0,
  className = '',
  onEdit,
  onDelete,
  showActions = true,
  onAlunosClick,
  onTurmasClick
}) => {
  // const { notifyError } = useNotificationStore();
  const navigate = useNavigate();

  const handleCardClick = useCallback(() => {
    // Card não navega mais, apenas exibe recursos
    return;
  }, []);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(treinamento);
  }, [onEdit, treinamento]);

  const handleAlunosClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAlunosClick?.(treinamento);
  }, [onAlunosClick, treinamento]);

  const handleTurmasClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onTurmasClick?.(treinamento);
  }, [onTurmasClick, treinamento]);

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, []);

  const truncateDescription = useCallback((text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }, []);

  // Memoizar valores computados
  const formattedDate = useMemo(() => formatDate(treinamento.created_at), [formatDate, treinamento.created_at]);
  const truncatedDescription = useMemo(() =>
    treinamento.descricao ? truncateDescription(treinamento.descricao) : 'Sem descrição',
    [truncateDescription, treinamento.descricao]
  );
  const statusBadge = useMemo(() => ({
    className: `inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
      turmasCount > 0
        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
    }`,
    text: turmasCount > 0 ? 'Ativo' : 'Sem turmas'
  }), [turmasCount]);

  const nivelBadge = useMemo(() => {
    const nivel = treinamento.nivel || 'iniciante';
    const configs = {
      iniciante: {
        className: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        text: 'Básico'
      },
      intermediario: {
        className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        text: 'Intermediário'
      },
      avancado: {
        className: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        text: 'Avançado'
      }
    };
    return configs[nivel as keyof typeof configs] || configs.iniciante;
  }, [treinamento.nivel]);

  return (
    <div
      onClick={handleCardClick}
      className={`
        group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700
        hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-600
        transition-all duration-300 cursor-pointer transform hover:-translate-y-1
        p-6 ${className}
      `}
    >
      {/* Nível do Treinamento */}
      <span className={`absolute top-4 right-4 inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${nivelBadge.className}`}>
        {nivelBadge.text}
      </span>
      {/* Header do Card */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex-shrink-0">
            <BookOpen size={20} className="text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
              {treinamento.nome}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {truncatedDescription}
            </p>
          </div>
        </div>

        {/* Actions Menu */}
        {showActions && (onEdit || onDelete) && (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="action-button p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Editar treinamento"
              >
                <Settings size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <button
          onClick={handleTurmasClick}
          className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer group"
        >
          <Calendar size={16} className="text-blue-500 group-hover:text-blue-600" />
          <div className="text-left">
            <span className="block text-xs text-gray-500 dark:text-gray-500 group-hover:text-blue-600">Turmas</span>
            <span className="font-medium group-hover:text-blue-600">{turmasCount}</span>
          </div>
        </button>

        <button
          onClick={handleAlunosClick}
          className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer group"
        >
          <Users size={16} className="text-green-500 group-hover:text-green-600" />
          <div className="text-left">
            <span className="block text-xs text-gray-500 dark:text-gray-500 group-hover:text-green-600">Alunos</span>
            <span className="font-medium group-hover:text-green-600">{alunosCount}</span>
          </div>
        </button>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        <span className={statusBadge.className}>
          {statusBadge.text}
        </span>
      </div>

      {/* Footer com botão de adicionar recurso */}
      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Criado em {formattedDate}
          </span>
          <div className="flex items-center space-x-2">
            {/* Botão para navegar para página de recursos */}
            <button
              onClick={() => navigate('/recursos?from=dashboard')}
              className="flex items-center space-x-1 text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye size={12} />
              <span>Ver Recursos</span>
            </button>

          </div>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default CardTreinamento;