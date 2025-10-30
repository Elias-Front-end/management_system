import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, BookOpen } from 'lucide-react';
import { treinamentosAPI } from '../services/api';
import { useNotificationStore } from '../store/notificationStore';
import { useConfirm } from '../hooks/useConfirm';
import { includesIgnoreCase } from '../utils/string';
import type { Treinamento } from '../types';
import { TreinamentoModal } from '../components/modals/TreinamentoModal';

export const Treinamentos: React.FC = () => {
  const { notifySuccess, notifyError } = useNotificationStore();
  const { confirm, ConfirmComponent } = useConfirm();
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTreinamento, setEditingTreinamento] = useState<Treinamento | null>(null);

  useEffect(() => {
    loadTreinamentos();
  }, [searchTerm]);

  const loadTreinamentos = async () => {
    try {
      setIsLoading(true);
      const data = await treinamentosAPI.list(searchTerm || undefined);
      setTreinamentos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar treinamentos:', error);
      notifyError('Erro ao carregar treinamentos');
      setTreinamentos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (treinamento?: Treinamento) => {
    setEditingTreinamento(treinamento || null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTreinamento(null);
  };

  const handleSuccess = () => {
    loadTreinamentos();
  };

  const handleDelete = async (treinamento: Treinamento) => {
    const confirmed = await confirm({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o treinamento "${treinamento.nome}"?`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (!confirmed) {
      return;
    }

    try {
      await treinamentosAPI.delete(treinamento.id);
      notifySuccess('Treinamento excluído com sucesso');
      loadTreinamentos();
    } catch (error) {
      console.error('Erro ao excluir treinamento:', error);
      notifyError('Erro ao excluir treinamento');
    }
  };

  const filteredTreinamentos = Array.isArray(treinamentos) ? treinamentos.filter((treinamento) =>
    includesIgnoreCase(treinamento?.nome, searchTerm) ||
    includesIgnoreCase(treinamento?.descricao, searchTerm)
  ) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <BookOpen className="mr-2" size={28} />
            Treinamentos
          </h1>
          <p className="text-gray-600 mt-1">Gerencie os treinamentos disponíveis</p>
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Novo Treinamento
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar treinamentos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredTreinamentos.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Nenhum treinamento encontrado' : 'Nenhum treinamento cadastrado'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca'
                  : 'Comece criando seu primeiro treinamento'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => handleOpenModal()}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus size={20} className="mr-2" />
                  Criar Treinamento
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criado em
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTreinamentos.map((treinamento) => (
                    <tr key={treinamento.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{treinamento.nome}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-600 max-w-xs truncate">
                          {treinamento.descricao || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {new Date(treinamento.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenModal(treinamento)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(treinamento)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <TreinamentoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        treinamento={editingTreinamento}
      />
      
      <ConfirmComponent />
    </div>
  );
};