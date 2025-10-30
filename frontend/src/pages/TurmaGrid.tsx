import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Edit, Trash2, AlertCircle, Calendar, Users, BookOpen } from 'lucide-react';
import { turmasAPI, treinamentosAPI } from '../services/api';
import type { Turma, Treinamento } from '../types';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useConfirm } from '../hooks/useConfirm';
import { extractAndTranslateError } from '../utils/errorMessages';
import { includesIgnoreCase } from '../utils/string';
import { isValidId } from '../utils/string';

interface TreinamentoFormData {
  nome: string;
  descricao?: string;
  categoria: string;
  duracao_horas: number;
  nivel: 'iniciante' | 'intermediario' | 'avancado';
}

export const TurmaGrid: React.FC = () => {
  const { turmaId } = useParams<{ turmaId: string }>();
  const navigate = useNavigate();
  const { notifySuccess, notifyError, notifyWarning } = useNotificationStore();
  const { confirm, ConfirmComponent } = useConfirm();
  const { isAdmin, isAuthenticated } = useAuthStore();

  // Estados
  const [turma, setTurma] = useState<Turma | null>(null);
  const [treinamentos, setTreinamentos] = useState<Treinamento[]>([]);
  const [allTreinamentos, setAllTreinamentos] = useState<Treinamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTreinamento, setEditingTreinamento] = useState<Treinamento | null>(null);
  const [formData, setFormData] = useState<TreinamentoFormData>({
    nome: '',
    descricao: '',
    categoria: '',
    duracao_horas: 0,
    nivel: 'iniciante',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Validar se turmaId é um ID válido antes de carregar dados
    if (turmaId && isValidId(turmaId)) {
      loadData();
    } else if (turmaId) {
      console.error('ID da turma inválido:', turmaId);
      setError('ID da turma inválido');
      navigate('/dashboard');
    }
  }, [turmaId, searchTerm]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [turmaData, allTreinamentosData] = await Promise.all([
        turmasAPI.get(turmaId!),
        treinamentosAPI.list()
      ]);
      
      setTurma(turmaData);
      setAllTreinamentos(allTreinamentosData);
      
      // Filtrar treinamentos da turma específica
      const turmatreinamentos = allTreinamentosData.filter(t => 
        t.turmas?.some(turmaRef => turmaRef.id === turmaId)
      );
      setTreinamentos(turmatreinamentos);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados da turma');
      notifyError('Erro ao carregar dados da turma');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleOpenModal = (treinamento?: Treinamento) => {
    if (treinamento) {
      setEditingTreinamento(treinamento);
      setFormData({
        nome: treinamento.nome,
        descricao: treinamento.descricao || '',
        categoria: treinamento.categoria || '',
        duracao_horas: treinamento.duracao_horas || 0,
        nivel: treinamento.nivel || 'iniciante',
      });
    } else {
      setEditingTreinamento(null);
      setFormData({
        nome: '',
        descricao: '',
        categoria: '',
        duracao_horas: 0,
        nivel: 'iniciante',
      });
    }
    setError(null);
    setShowModal(true);
  };

  const handleOpenAddModal = () => {
    setError(null);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowAddModal(false);
    setEditingTreinamento(null);
    setFormData({
      nome: '',
      descricao: '',
      categoria: '',
      duracao_horas: 0,
      nivel: 'iniciante',
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !isAdmin) {
      setError('Você não tem permissão para realizar esta ação');
      notifyError('Você não tem permissão para realizar esta ação', 'Acesso negado');
      return;
    }
    
    if (!formData.nome.trim() || !formData.categoria.trim() || formData.duracao_horas <= 0) {
      setError('Todos os campos obrigatórios devem ser preenchidos');
      notifyWarning('Todos os campos obrigatórios devem ser preenchidos', 'Campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = {
        nome: formData.nome.trim(),
        descricao: formData.descricao?.trim() || '',
        categoria: formData.categoria.trim(),
        duracao_horas: formData.duracao_horas,
        nivel: formData.nivel,
      };

      if (editingTreinamento) {
        await treinamentosAPI.update(editingTreinamento.id, submitData);
        notifySuccess('Treinamento atualizado com sucesso');
      } else {
        await treinamentosAPI.create(submitData);
        notifySuccess('Treinamento criado com sucesso');
      }
      
      handleCloseModal();
      loadData();
    } catch (error: any) {
      const errorMessage = extractAndTranslateError(error, 'Erro ao salvar treinamento');
      setError(errorMessage);
      notifyError(errorMessage, 'Erro ao salvar treinamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddExistingTreinamento = async (treinamentoId: string) => {
    if (!isAuthenticated || !isAdmin) {
      notifyError('Você não tem permissão para realizar esta ação', 'Acesso negado');
      return;
    }

    try {
      // TODO: Implementar lógica para associar treinamento existente à turma
      // usando treinamentoId quando a API backend estiver disponível
      console.log('Associando treinamento ID:', treinamentoId, 'à turma ID:', turmaId);
      notifySuccess('Treinamento adicionado à turma com sucesso');
      handleCloseModal();
      loadData();
    } catch (error: any) {
      const errorMessage = extractAndTranslateError(error, 'Erro ao adicionar treinamento à turma');
      notifyError(errorMessage, 'Erro ao adicionar treinamento');
    }
  };

  const handleDelete = async (treinamento: Treinamento) => {
    if (!isAuthenticated || !isAdmin) {
      notifyError('Você não tem permissão para realizar esta ação', 'Acesso negado');
      return;
    }

    const confirmed = await confirm({
      title: 'Confirmar exclusão',
      message: `Tem certeza que deseja excluir o treinamento "${treinamento.nome}"?`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      try {
        await treinamentosAPI.delete(treinamento.id);
        notifySuccess('Treinamento excluído com sucesso');
        loadData();
      } catch (error: any) {
        const errorMessage = extractAndTranslateError(error, 'Erro ao excluir treinamento');
        notifyError(errorMessage, 'Erro ao excluir treinamento');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getNivelBadge = (nivel: string) => {
    const badges = {
      iniciante: 'bg-green-100 text-green-800',
      intermediario: 'bg-yellow-100 text-yellow-800',
      avancado: 'bg-red-100 text-red-800',
    };
    return badges[nivel as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const filteredTreinamentos = treinamentos.filter((treinamento) =>
    includesIgnoreCase(treinamento?.nome, searchTerm) ||
    includesIgnoreCase(treinamento?.categoria, searchTerm)
  );

  const availableTreinamentos = allTreinamentos.filter(t => 
    !treinamentos.some(existing => existing.id === t.id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!turma) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Turma não encontrada</h3>
          <p className="mt-1 text-sm text-gray-500">A turma solicitada não foi encontrada.</p>
          <div className="mt-6">
            <button
              onClick={handleBack}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BookOpen className="mr-2" size={28} />
              {turma.nome}
            </h1>
            <p className="text-gray-600 mt-1">
              Treinamentos da turma • {turma.treinamento_nome}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Adicionar Existente
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Novo Treinamento
          </button>
        </div>
      </div>

      {/* Informações da Turma */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-500">Período</p>
              <p className="font-medium">
                {formatDate(turma.data_inicio)} - {formatDate(turma.data_conclusao)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-500">Total de Alunos</p>
              <p className="font-medium">{turma.total_alunos}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <BookOpen className="text-gray-400" size={20} />
            <div>
              <p className="text-sm text-gray-500">Treinamentos</p>
              <p className="font-medium">{treinamentos.length}</p>
            </div>
          </div>
        </div>
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredTreinamentos.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? 'Nenhum treinamento encontrado' : 'Nenhum treinamento cadastrado'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Tente ajustar os termos de busca.' 
                : 'Comece criando um novo treinamento para esta turma.'
              }
            </p>
            {!searchTerm && isAdmin && (
              <button
                onClick={() => handleOpenModal()}
                className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duração
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nível
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Turmas
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
                      {treinamento.descricao && (
                        <div className="text-sm text-gray-500">{treinamento.descricao}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{treinamento.categoria}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {treinamento.duracao_horas}h
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getNivelBadge(treinamento.nivel || 'iniciante')}`}>
                        {treinamento.nivel || 'Não definido'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {treinamento.turmas?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {isAdmin && (
                          <>
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
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para Criar/Editar Treinamento */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingTreinamento ? 'Editar Treinamento' : 'Novo Treinamento'}
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
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <input
                    id="categoria"
                    type="text"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="duracao_horas" className="block text-sm font-medium text-gray-700 mb-1">
                      Duração (horas) *
                    </label>
                    <input
                      id="duracao_horas"
                      type="number"
                      min="1"
                      value={formData.duracao_horas}
                      onChange={(e) => setFormData({ ...formData, duracao_horas: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="nivel" className="block text-sm font-medium text-gray-700 mb-1">
                      Nível *
                    </label>
                    <select
                      id="nivel"
                      value={formData.nivel}
                      onChange={(e) => setFormData({ ...formData, nivel: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required
                      disabled={isSubmitting}
                    >
                      <option value="iniciante">Iniciante</option>
                      <option value="intermediario">Intermediário</option>
                      <option value="avancado">Avançado</option>
                    </select>
                  </div>
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
                    placeholder="Digite a descrição do treinamento"
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
                    className="btn-primary px-4 py-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Salvando...' : (editingTreinamento ? 'Atualizar' : 'Criar')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Adicionar Treinamento Existente */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Adicionar Treinamento Existente
              </h2>

              <div className="space-y-4">
                {availableTreinamentos.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Nenhum treinamento disponível
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Todos os treinamentos já estão associados a esta turma.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {availableTreinamentos.map((treinamento) => (
                      <div
                        key={treinamento.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleAddExistingTreinamento(treinamento.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-gray-900">{treinamento.nome}</h3>
                            <p className="text-sm text-gray-500">{treinamento.categoria}</p>
                            {treinamento.descricao && (
                              <p className="text-sm text-gray-600 mt-1">{treinamento.descricao}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getNivelBadge(treinamento.nivel || 'iniciante')}`}>
                              {treinamento.nivel || 'Não definido'}
                            </span>
                            <p className="text-sm text-gray-500 mt-1">{treinamento.duracao_horas}h</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={handleCloseModal}
                  className="btn-secondary px-4 py-2"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmComponent />
    </div>
  );
};

export default TurmaGrid;