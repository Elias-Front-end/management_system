import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, User, Mail, AlertCircle } from 'lucide-react';
import { alunosAPI } from '../services/api';
import { extractAndTranslateError } from '../utils/errorMessages';
import { useNotificationStore } from '../store/notificationStore';
import { useConfirm } from '../hooks/useConfirm';
import { includesIgnoreCase } from '../utils/string';
import type { Aluno } from '../types';

interface AlunoFormData {
  nome: string;
  email: string;
  telefone: string;
  password?: string;
}

export const Alunos: React.FC = () => {
  const { notifySuccess, notifyError, notifyWarning } = useNotificationStore();
  const { confirm, ConfirmComponent } = useConfirm();
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [formData, setFormData] = useState<AlunoFormData>({
    nome: '',
    email: '',
    telefone: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAlunos();
  }, [searchTerm]);

  const loadAlunos = async () => {
    try {
      setIsLoading(true);
      const data = await alunosAPI.list(searchTerm || undefined);
      setAlunos(data);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      setError('Erro ao carregar alunos');
      notifyError('Erro ao carregar alunos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (aluno?: Aluno) => {
    if (aluno) {
      setEditingAluno(aluno);
      setFormData({
        nome: aluno.nome,
        email: aluno.email,
        telefone: aluno.telefone || '',
        password: '',
      });
    } else {
      setEditingAluno(null);
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        password: '',
      });
    }
    setError(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAluno(null);
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      password: '',
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.email.trim()) {
      setError('Nome e Email são obrigatórios');
      notifyWarning('Nome e Email são obrigatórios', 'Campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    setError(null);

  try {
      const submitData: any = { nome: formData.nome, email: formData.email, telefone: formData.telefone };
      // Removida a lógica de username
      if (formData.password && formData.password.trim().length > 0) {
        submitData.password = formData.password.trim();
      }

      if (editingAluno) {
        await alunosAPI.update(editingAluno.id, submitData);
      } else {
        await alunosAPI.create(submitData);
      }
      
      notifySuccess(editingAluno ? 'Aluno atualizado com sucesso' : 'Aluno criado com sucesso');
      handleCloseModal();
      loadAlunos();
    } catch (error: any) {
      const errorMessage = extractAndTranslateError(error, 'Erro ao salvar aluno');
      setError(errorMessage);
      notifyError(errorMessage, 'Erro ao salvar aluno');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (aluno: Aluno) => {
    const confirmed = await confirm({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o aluno "${aluno.nome}"?`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (!confirmed) {
      return;
    }

    try {
      await alunosAPI.delete(aluno.id);
      notifySuccess('Aluno excluído com sucesso');
      loadAlunos();
    } catch (error) {
      console.error('Erro ao excluir aluno:', error);
      notifyError('Erro ao excluir aluno');
    }
  };

  const filteredAlunos = alunos.filter((aluno) =>
    includesIgnoreCase(aluno?.nome, searchTerm) ||
    includesIgnoreCase(aluno?.email, searchTerm) ||
    includesIgnoreCase(aluno?.telefone ?? '', searchTerm)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl mb-4">
          <User className="text-white" size={28} />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Gerenciar Alunos
        </h1>
        <p className="text-gray-600 text-lg">Cadastre e gerencie alunos do sistema</p>
      </div>

      {/* Actions Bar */}
      <div className="card-modern p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar alunos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-modern pl-12"
            />
          </div>
          
          {/* Add Button */}
          <button
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center space-x-2 px-6 py-3"
          >
            <Plus size={20} />
            <span>Novo Aluno</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="card-modern p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Carregando alunos...</p>
          </div>
        </div>
      ) : (
        <div className="card-modern overflow-hidden">
          {filteredAlunos.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <User className="text-purple-600" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca para encontrar o aluno desejado'
                  : 'Comece criando seu primeiro aluno para gerenciar o sistema'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => handleOpenModal()}
                  className="btn-primary inline-flex items-center space-x-2 px-6 py-3"
                >
                  <Plus size={20} />
                  <span>Criar Primeiro Aluno</span>
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th className="text-left">Aluno</th>
                    <th className="text-left">Telefone</th>
                    <th className="text-left">Email</th>
                    <th className="text-left">Cadastrado em</th>
                    <th className="text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlunos.map((aluno, index) => (
                    <tr key={aluno.id} style={{ animationDelay: `${index * 50}ms` }}>
                      <td>
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg mr-4">
                            <User className="text-white" size={20} />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800 dark:text-gray-200">
                              {aluno.nome}
                            </div>
                            <div className="text-sm text-gray-500">
                              {aluno.total_matriculas || 0} matrículas
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded-lg">
                          {aluno.telefone || '—'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center text-gray-700">
                          <Mail size={16} className="mr-2 text-gray-400" />
                          {aluno.email}
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-gray-600">
                          {new Date(aluno.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenModal(aluno)}
                            className="btn-icon btn-icon-blue"
                            title="Editar aluno"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(aluno)}
                            className="btn-icon btn-icon-red"
                            title="Excluir aluno"
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
        <div className="modal-backdrop">
          <div className="modal-modern max-w-4xl">
            {/* Header */}
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg mr-4">
                <User className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {editingAluno ? 'Editar Aluno' : 'Novo Aluno'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {editingAluno ? 'Atualize as informações do aluno' : 'Preencha os dados para criar um novo aluno'}
                </p>
              </div>
            </div>

            {error && (
              <div className="alert-error mb-6">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="nome" className="label-modern">
                    Nome *
                  </label>
                  <input
                    id="nome"
                    type="text"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="input-modern"
                    placeholder="Digite o nome do aluno"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="label-modern">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-modern"
                    placeholder="Digite o email"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="telefone" className="label-modern">
                    Telefone
                  </label>
                  <input
                    id="telefone"
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                    className="input-modern"
                    placeholder="Digite o telefone (opcional)"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="label-modern">
                    Senha (opcional)
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-modern"
                    placeholder="Deixe em branco para não alterar"
                  />
                </div>
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                <p>
                  <span className="font-semibold">Atenção:</span> Se você não definir um nome de usuário, o sistema irá gerá-lo automaticamente.
                </p>
                <p className="mt-1">
                  Dica: se usuário e senha não forem definidos, o aluno não conseguirá fazer login.
                </p>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary px-6 py-3"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary px-6 py-3 disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Salvando...</span>
                    </div>
                  ) : (
                    editingAluno ? 'Atualizar Aluno' : 'Criar Aluno'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <ConfirmComponent />
    </div>
  );
};