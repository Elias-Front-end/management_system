import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Users, Calendar, AlertCircle } from 'lucide-react';
import { turmasAPI, treinamentosAPI } from '../services/api';
import { extractAndTranslateError } from '../utils/errorMessages';
import { useNotificationStore } from '../store/notificationStore';
import { useConfirm } from '../hooks/useConfirm';
import { includesIgnoreCase } from '../utils/string';
import { useAuthStore } from '../store/authStore';
import type { Turma, Treinamento } from '../types';

interface TurmaFormData {
  nome: string;
  descricao?: string;
  treinamento: string | '';
  data_inicio: string;
  data_conclusao: string;
  link_acesso?: string;
}

export const Turmas: React.FC = () => {
  const { notifySuccess, notifyError, notifyWarning } = useNotificationStore();
  const { confirm, ConfirmComponent } = useConfirm();
  const { isAdmin, isAuthenticated } = useAuthStore();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [formData, setFormData] = useState<TurmaFormData>({
    nome: '',
    descricao: '',
    treinamento: '',
    data_inicio: '',
    data_conclusao: '',
    link_acesso: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [searchTerm]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [turmasData, treinamentosData] = await Promise.all([
        turmasAPI.list(undefined, searchTerm || undefined),
        treinamentosAPI.list()
      ]);
      setTurmas(turmasData);
      setTreinamentos(treinamentosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados');
      notifyError('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (turma?: Turma) => {
    if (turma) {
      setEditingTurma(turma);
      setFormData({
        nome: turma.nome,
        descricao: '',
        treinamento: String((turma as any).treinamento ?? ''),
        data_inicio: turma.data_inicio,
        data_conclusao: turma.data_conclusao,
        link_acesso: turma.link_acesso || '',
      });
    } else {
      setEditingTurma(null);
      setFormData({
        nome: '',
        descricao: '',
        treinamento: '',
        data_inicio: '',
        data_conclusao: '',
        link_acesso: '',
      });
    }
    setError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTurma(null);
    setFormData({
      nome: '',
      descricao: '',
      treinamento: '',
      data_inicio: '',
      data_conclusao: '',
      link_acesso: '',
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar se o usuário é admin
    if (!isAuthenticated || !isAdmin) {
      setError('Você não tem permissão para realizar esta ação');
      notifyError('Você não tem permissão para realizar esta ação', 'Acesso negado');
      return;
    }
    
    if (!formData.nome.trim() || !formData.treinamento || !formData.data_inicio || !formData.data_conclusao) {
      setError('Todos os campos obrigatórios devem ser preenchidos');
      notifyWarning('Todos os campos obrigatórios devem ser preenchidos', 'Campos obrigatórios');
      return;
    }

    if (new Date(formData.data_inicio) >= new Date(formData.data_conclusao)) {
      setError('A data de início deve ser anterior à data de fim');
      notifyWarning('A data de início deve ser anterior à data de fim', 'Validação');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submitData: any = {
        nome: formData.nome.trim(),
        treinamento: formData.treinamento,
        data_inicio: formData.data_inicio,
        data_conclusao: formData.data_conclusao,
        link_acesso: formData.link_acesso?.trim() || null,
      };

      if (editingTurma) {
        await turmasAPI.update(editingTurma.id, submitData);
      } else {
        await turmasAPI.create(submitData);
      }
      
      notifySuccess(editingTurma ? 'Turma atualizada com sucesso' : 'Turma criada com sucesso');
      handleCloseModal();
      loadData();
    } catch (error: any) {
      const errorMessage = extractAndTranslateError(error, 'Erro ao salvar turma');
      setError(errorMessage);
      notifyError(errorMessage, 'Erro ao salvar turma');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (turma: Turma) => {
    const confirmed = await confirm({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir a turma "${turma.nome}"?`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (!confirmed) {
      return;
    }

    try {
      await turmasAPI.delete(turma.id);
      notifySuccess('Turma excluída com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir turma:', error);
      const errorMessage = extractAndTranslateError(error);
      notifyError(errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (turma: Turma) => {
    const now = new Date();
    const inicio = new Date(turma.data_inicio);
    const fim = new Date((turma as any).data_conclusao);

    if (now < inicio) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Aguardando</span>;
    } else if (now >= inicio && now <= fim) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Em Andamento</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Finalizada</span>;
    }
  };

  const filteredTurmas = turmas.filter((turma) =>
    includesIgnoreCase(turma?.nome, searchTerm) ||
    includesIgnoreCase(turma?.treinamento_nome ?? '', searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="mr-2" size={28} />
            Turmas
          </h1>
          <p className="text-gray-600 mt-1">Gerencie as turmas dos treinamentos</p>
        </div>
        
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Nova Turma
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar turmas..."
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
          {filteredTurmas.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Nenhuma turma encontrada' : 'Nenhuma turma cadastrada'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca'
                  : 'Comece criando sua primeira turma'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => handleOpenModal()}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus size={20} className="mr-2" />
                  Criar Turma
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
                      Treinamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alunos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Link de Acesso
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTurmas.map((turma) => (
                    <tr key={turma.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{turma.nome}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{turma.treinamento_nome}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-gray-600">
                          <Calendar size={16} className="mr-1" />
                          <span className="text-sm">
                            {formatDate(turma.data_inicio)} - {formatDate(turma.data_conclusao)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {turma.total_alunos}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(turma)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {turma.link_acesso ? (
                          <a
                            href={turma.link_acesso}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                            title="Abrir link de acesso"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Acessar
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenModal(turma)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(turma)}
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
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingTurma ? 'Editar Turma' : 'Nova Turma'}
              </h2>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    id="nome"
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Digite o nome da turma"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="treinamento" className="block text-sm font-medium text-gray-700 mb-1">
                    Treinamento *
                  </label>
                  <select
                    id="treinamento"
                    value={formData.treinamento}
                    onChange={(e) => setFormData({ ...formData, treinamento: e.target.value || '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Selecione um treinamento</option>
                    {treinamentos.map((treinamento) => (
                      <option key={treinamento.id} value={String(treinamento.id)}>
                        {treinamento.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="data_inicio" className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início *
                    </label>
                    <input
                      id="data_inicio"
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="data_conclusao" className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Fim *
                    </label>
                    <input
                      id="data_conclusao"
                      type="date"
                      value={formData.data_conclusao}
                      onChange={(e) => setFormData({ ...formData, data_conclusao: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="link_acesso" className="block text-sm font-medium text-gray-700 mb-1">
                    Link de Acesso
                  </label>
                  <input
                    id="link_acesso"
                    type="url"
                    value={formData.link_acesso}
                    onChange={(e) => setFormData({ ...formData, link_acesso: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://exemplo.com/link-da-turma"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Digite a descrição da turma"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="btn-secondary px-4 py-2"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <ConfirmComponent />
    </div>
  );
};