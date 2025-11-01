import React, { useState } from 'react';
import { Calendar, Users, BookOpen, GraduationCap, Eye } from 'lucide-react';
import type { Turma } from '../../types';
import { TreinamentosTurmaModal } from '../modals/TreinamentosTurmaModal';

interface CardTurmaProps {
  turma: Turma;
  treinamentosCount?: number;
  className?: string;
}

export const CardTurma: React.FC<CardTurmaProps> = ({ turma, treinamentosCount = 0, className = '' }) => {
  const [showTreinamentosModal, setShowTreinamentosModal] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = () => {
    const hoje = new Date();
    const dataInicio = new Date(turma.data_inicio);
    const dataConclusao = new Date(turma.data_conclusao);

    if (hoje < dataInicio) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    } else if (hoje > dataConclusao) {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    } else {
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    }
  };

  const getStatusText = () => {
    const hoje = new Date();
    const dataInicio = new Date(turma.data_inicio);
    const dataConclusao = new Date(turma.data_conclusao);

    if (hoje < dataInicio) {
      return 'Não iniciada';
    } else if (hoje > dataConclusao) {
      return 'Concluída';
    } else {
      return 'Em andamento';
    }
  };

  const handleViewTreinamentos = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTreinamentosModal(true);
  };

  return (
    <>
      <div
        className={`
          relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700
          transition-all duration-300 hover:shadow-md
          p-6 ${className}
        `}
      >
        {/* Header do Card */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <BookOpen size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors">
                {turma.nome}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {turma.treinamento_nome}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>

        {/* Informações da Turma */}
        <div className="space-y-3 mb-4">
          {/* Período */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar size={16} className="text-blue-500" />
            <span>
              {formatDate(turma.data_inicio)} - {formatDate(turma.data_conclusao)}
            </span>
          </div>

          {/* Total de Alunos */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Users size={16} className="text-green-500" />
            <span>
              {turma.total_alunos} {turma.total_alunos === 1 ? 'aluno' : 'alunos'}
            </span>
          </div>

          {/* Quantidade de Treinamentos */}
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <GraduationCap size={16} className="text-purple-500" />
            <span>
              {treinamentosCount} {treinamentosCount === 1 ? 'treinamento' : 'treinamentos'}
            </span>
          </div>
        </div>

        {/* Botão para ver treinamentos */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleViewTreinamentos}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <Eye size={16} />
            <span>Ver Treinamentos</span>
          </button>
        </div>
      </div>

      {/* Modal de Treinamentos */}
      <TreinamentosTurmaModal
        isOpen={showTreinamentosModal}
        onClose={() => setShowTreinamentosModal(false)}
        turma={turma}
      />
    </>
  );
};

export default CardTurma;