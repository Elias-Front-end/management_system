import React, { useState, useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import type { Treinamento } from '../../types';
import { treinamentosAPI } from '../../services/api';
import { useNotificationStore } from '../../store/notificationStore';
import { extractAndTranslateError } from '../../utils/errorMessages';

interface TreinamentoFormData {
  nome: string;
  descricao: string;
  nivel: 'iniciante' | 'intermediario' | 'avancado';
}

interface TreinamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  treinamento?: Treinamento | null;
}

export const TreinamentoModal: React.FC<TreinamentoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  treinamento
}) => {
  const { notifySuccess, notifyError } = useNotificationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TreinamentoFormData>({
    nome: '',
    descricao: '',
    nivel: 'iniciante'
  });

  useEffect(() => {
    if (treinamento) {
      setFormData({
        nome: treinamento.nome,
        descricao: treinamento.descricao || '',
        nivel: treinamento.nivel || 'iniciante'
      });
    } else {
      setFormData({
        nome: '',
        descricao: '',
        nivel: 'iniciante'
      });
    }
    setError(null);
  }, [treinamento, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = {
        nome: formData.nome,
        descricao: formData.descricao,
        nivel: formData.nivel
      };

      if (treinamento) {
        await treinamentosAPI.update(treinamento.id, submitData);
        notifySuccess('Treinamento atualizado com sucesso!');
      } else {
        await treinamentosAPI.create(submitData);
        notifySuccess('Treinamento criado com sucesso!');
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error('Erro ao salvar treinamento:', error);
      const errorMessage = extractAndTranslateError(error);
      setError(errorMessage);
      notifyError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {treinamento ? 'Editar Treinamento' : 'Novo Treinamento'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={24} />
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start space-x-2">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome *
              </label>
              <input
                id="nome"
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                placeholder="Digite o nome do treinamento"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descrição
              </label>
              <textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                rows={3}
                placeholder="Digite a descrição do treinamento"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="nivel" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nível
              </label>
              <select
                id="nivel"
                value={formData.nivel}
                onChange={(e) => setFormData({ ...formData, nivel: e.target.value as 'iniciante' | 'intermediario' | 'avancado' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                disabled={isSubmitting}
              >
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : (treinamento ? 'Atualizar' : 'Criar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TreinamentoModal;