import React, { useState, useEffect, useCallback } from 'react';
import { X, BookOpen, Calendar } from 'lucide-react';
import { treinamentosAPI, turmasAPI } from '../../services/api';
import type { Treinamento, Turma } from '../../types';

interface TreinamentosTurmaModalProps {
  isOpen: boolean;
  onClose: () => void;
  turma: Turma;
}

interface TreinamentoComDetalhes extends Treinamento {
  turmasCount: number;
  alunosCount: number;
}

export const TreinamentosTurmaModal: React.FC<TreinamentosTurmaModalProps> = ({
  isOpen,
  onClose,
  turma
}) => {
  const [treinamentos, setTreinamentos] = useState<TreinamentoComDetalhes[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTreinamentos = useCallback(async () => {
    if (!turma) return;
    
    setLoading(true);
    try {
      // Buscar o treinamento específico da turma
      const allTreinamentos = await treinamentosAPI.list();
      const allTurmas = await turmasAPI.list();
      
      // Filtrar apenas o treinamento relacionado à turma
      const treinamentoRelacionado = allTreinamentos.find(t => t.id === turma.treinamento);
      
      if (treinamentoRelacionado) {
        // Contar quantas turmas existem para este treinamento
        const turmasDoTreinamento = allTurmas.filter(t => t.treinamento === treinamentoRelacionado.id);
        
        const treinamentoComDetalhes: TreinamentoComDetalhes = {
          ...treinamentoRelacionado,
          turmasCount: turmasDoTreinamento.length,
          alunosCount: 0 // Será calculado se necessário
        };
        
        setTreinamentos([treinamentoComDetalhes]);
      }
    } catch (error) {
      console.error('Erro ao carregar treinamentos:', error);
      setTreinamentos([]);
    } finally {
      setLoading(false);
    }
  }, [turma]);

  useEffect(() => {
    if (isOpen && turma) {
      loadTreinamentos();
    }
  }, [isOpen, turma, loadTreinamentos]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getNivelBadge = (nivel: string) => {
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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Treinamento da Turma
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {turma.nome} - {formatDate(turma.data_inicio)} a {formatDate(turma.data_conclusao)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando treinamento...</span>
            </div>
          ) : treinamentos.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Nenhum treinamento encontrado para esta turma.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {treinamentos.map((treinamento) => {
                const nivelBadge = getNivelBadge(treinamento.nivel || 'iniciante');
                
                return (
                  <div
                    key={treinamento.id}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600"
                  >
                    {/* Header do Treinamento */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                          <BookOpen size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {treinamento.nome}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {treinamento.descricao || 'Sem descrição'}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${nivelBadge.className}`}>
                        {nivelBadge.text}
                      </span>
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar size={16} className="text-blue-500" />
                        <div>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">Criado em</span>
                          <span className="font-medium text-gray-900 dark:text-white">{formatDate(treinamento.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                        treinamento.turmasCount > 0
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300'
                      }`}>
                        {treinamento.turmasCount > 0 ? 'Ativo' : 'Sem turmas'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default TreinamentosTurmaModal;