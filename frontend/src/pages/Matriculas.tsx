import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, GraduationCap, Calendar, AlertCircle } from 'lucide-react';
import { matriculasAPI, alunosAPI, turmasAPI } from '../services/api';
import { extractAndTranslateError } from '../utils/errorMessages';
import { useNotificationStore } from '../store/notificationStore';
import { useConfirm } from '../hooks/useConfirm';
import { includesIgnoreCase } from '../utils/string';
import type { Matricula, Aluno, Turma } from '../types';

interface MatriculaFormData {
  aluno: string | '';
  turma: string | '';
}

export const Matriculas: React.FC = () => {
  const { notifySuccess, notifyError, notifyWarning } = useNotificationStore();
  const { confirm, ConfirmComponent } = useConfirm();
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMatricula, setEditingMatricula] = useState<Matricula | null>(null);
  const [formData, setFormData] = useState<MatriculaFormData>({
    aluno: '',
    turma: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [matriculasData, alunosData, turmasData] = await Promise.all([
        matriculasAPI.list(),
        alunosAPI.list(),
        turmasAPI.list()
      ]);
      setMatriculas(matriculasData);
      setAlunos(alunosData);
      setTurmas(turmasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados');
      notifyError('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }, [notifyError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenModal = (matricula?: Matricula) => {
    if (matricula) {
      setEditingMatricula(matricula);
      setFormData({
        aluno: matricula.aluno,
        turma: matricula.turma,
      });
    } else {
      setEditingMatricula(null);
      setFormData({
        aluno: '',
        turma: '',
      });
    }
    setError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMatricula(null);
    setFormData({
      aluno: '',
      turma: '',
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.aluno || !formData.turma) {
      setError('Todos os campos são obrigatórios');
      notifyWarning('Todos os campos são obrigatórios', 'Campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = {
        aluno: formData.aluno,
        turma: formData.turma,
      };

      if (editingMatricula) {
        await matriculasAPI.update(editingMatricula.id, submitData);
      } else {
        await matriculasAPI.create(submitData);
      }

      notifySuccess(editingMatricula ? 'Matrícula atualizada com sucesso' : 'Matrícula criada com sucesso');
      handleCloseModal();
      loadData();
    } catch (error: unknown) {
      console.error('Erro na chamada da API:', error);
      const errorMessage = extractAndTranslateError(error, 'Erro ao salvar matrícula');
      setError(errorMessage);
      notifyError(errorMessage, 'Erro ao salvar matrícula');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (matricula: Matricula) => {
    const confirmed = await confirm({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir a matrícula de "${matricula.aluno_nome}" na turma "${matricula.turma_nome}"?`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (!confirmed) {
      return;
    }

    try {
      await matriculasAPI.delete(matricula.id);
      notifySuccess('Matrícula excluída com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir matrícula:', error);
      notifyError('Erro ao excluir matrícula');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (turma?: Turma) => {
    if (!turma) {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">—</span>;
    }
    const now = new Date();
    const inicio = new Date(turma.data_inicio);
    const fim = new Date(turma.data_conclusao);

    if (now < inicio) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Aguardando</span>;
    } else if (now >= inicio && now <= fim) {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Em Andamento</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Finalizada</span>;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    const initials = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
    return initials.toUpperCase();
  };

  const filteredMatriculas = matriculas.filter((matricula) =>
    includesIgnoreCase(matricula.aluno_nome, searchTerm) ||
    includesIgnoreCase(matricula.turma_nome, searchTerm) ||
    includesIgnoreCase(matricula.treinamento_nome, searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <GraduationCap className="mr-2" size={28} />
            Matrículas
          </h1>
          <p className="text-gray-600 mt-1">Gerencie as matrículas dos alunos nas turmas</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Nova Matrícula
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar matrículas..."
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
          {filteredMatriculas.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Nenhuma matrícula encontrada' : 'Nenhuma matrícula cadastrada'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? 'Tente ajustar os termos de busca'
                  : 'Comece criando sua primeira matrícula'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => handleOpenModal()}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus size={20} className="mr-2" />
                  Criar Matrícula
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aluno
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Turma
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Treinamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matrícula
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMatriculas.map((matricula) => (
                    <tr key={matricula.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="flex items-center justify-start space-x-2">
                          <button
                            onClick={() => handleOpenModal(matricula)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(matricula)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary-600">
                                {getInitials(matricula.aluno_nome)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {matricula.aluno_nome}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{matricula.turma_nome}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{matricula.treinamento_nome}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-gray-600">
                          <Calendar size={16} className="mr-1" />
                          <span className="text-sm">
                            {(() => {
                              const turmaObj = turmas.find((t) => t.id === matricula.turma);
                              return turmaObj ? `${formatDate(turmaObj.data_inicio)} - ${formatDate(turmaObj.data_conclusao)}` : '—';
                            })()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(turmas.find((t) => t.id === matricula.turma))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(matricula.data_matricula)}
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
                {editingMatricula ? 'Editar Matrícula' : 'Nova Matrícula'}
              </h2>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="aluno" className="block text-sm font-medium text-gray-700 mb-1">
                    Aluno *
                  </label>
                  <select
                    id="aluno"
                    value={formData.aluno}
                    onChange={(e) => {
                      const value = e.target.value ? e.target.value : '';
                      setFormData({ ...formData, aluno: value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Selecione um aluno</option>
                    {alunos.map((aluno) => (
                      <option key={aluno.id} value={aluno.id}>
                        {aluno.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="turma" className="block text-sm font-medium text-gray-700 mb-1">
                    Turma *
                  </label>
                  <select
                    id="turma"
                    value={formData.turma}
                    onChange={(e) => {
                      const value = e.target.value ? e.target.value : '';
                      setFormData({ ...formData, turma: value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Selecione uma turma</option>
                    {turmas.map((turma) => (
                      <option key={turma.id} value={turma.id}>
                        {turma.nome} - {turma.treinamento_nome}
                      </option>
                    ))}
                  </select>
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