import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Edit, Trash2, Users, Calendar, AlertCircle, BookOpen, FileText, Video, Archive } from 'lucide-react';
import { treinamentosAPI, turmasAPI, recursosAPI } from '../services/api';
import { extractAndTranslateError } from '../utils/errorMessages';
import { useNotificationStore } from '../store/notificationStore';
import { useConfirm } from '../hooks/useConfirm';
import { includesIgnoreCase } from '../utils/string';
import { useAuthStore } from '../store/authStore';
import type { Treinamento, Turma, Recurso } from '../types';
import { isValidId } from '../utils/string';

interface TurmaFormData {
  nome: string;
  descricao?: string;
  data_inicio: string;
  data_conclusao: string;
  link_acesso?: string;
}

interface RecursoFormData {
  titulo: string;
  descricao?: string;
  tipo: 'video' | 'documento' | 'link' | 'arquivo';
  url?: string;
  arquivo?: File | null;
}

export const TreinamentoGrid: React.FC = () => {
  const { treinamentoId } = useParams<{ treinamentoId: string }>();
  const navigate = useNavigate();
  const { notifySuccess, notifyError, notifyWarning } = useNotificationStore();
  const { confirm, ConfirmComponent } = useConfirm();
  const { isAdmin, isAuthenticated } = useAuthStore();

  // Estados
  const [treinamento, setTreinamento] = useState<Treinamento | null>(null);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'turmas' | 'recursos'>('turmas');

  // Modais
  const [showTurmaModal, setShowTurmaModal] = useState(false);
  const [showRecursoModal, setShowRecursoModal] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [editingRecurso, setEditingRecurso] = useState<Recurso | null>(null);

  // Form data
  const [turmaFormData, setTurmaFormData] = useState<TurmaFormData>({
    nome: '',
    descricao: '',
    data_inicio: '',
    data_conclusao: '',
    link_acesso: '',
  });

  const [recursoFormData, setRecursoFormData] = useState<RecursoFormData>({
    titulo: '',
    descricao: '',
    tipo: 'documento',
    url: '',
    arquivo: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!treinamentoId) {
      console.error('ID do treinamento inválido:', treinamentoId);
      setError('ID do treinamento inválido');
      notifyError('ID do treinamento inválido');
      navigate('/dashboard');
      return;
    }
    try {
      setIsLoading(true);
      const [treinamentoData, allRecursosData, allTurmasData] = await Promise.all([
        treinamentosAPI.get(treinamentoId!),
        recursosAPI.list(),
        turmasAPI.list()
      ]);

      setTreinamento(treinamentoData);

      // Filtrar recursos relacionados ao treinamento
      const relatedRecursos = allRecursosData.filter(recurso =>
        recurso.treinamento === treinamentoId ||
        recurso.treinamento?.toString() === treinamentoId
      );
      setRecursos(relatedRecursos);

      // Filtrar turmas relacionadas ao treinamento
      const relatedTurmas = allTurmasData.filter(turma => turma.treinamento === treinamentoId);
      setTurmas(relatedTurmas);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados do treinamento');
      notifyError('Erro ao carregar dados do treinamento');
    } finally {
      setIsLoading(false);
    }
  }, [treinamentoId, setIsLoading, setTreinamento, setRecursos, setTurmas, setError, notifyError, navigate]);

  useEffect(() => {
    // Validar se treinamentoId é um ID válido antes de carregar dados
    if (treinamentoId && isValidId(treinamentoId)) {
      loadData();
    } else if (treinamentoId) {
      console.error('ID do treinamento inválido:', treinamentoId);
      setError('ID do treinamento inválido');
      navigate('/dashboard');
    }
  }, [treinamentoId, searchTerm, loadData, navigate]);

  const handleBack = () => {
    navigate('/dashboard');
  };

  // Funções para Turmas
  const handleOpenTurmaModal = (turma?: Turma) => {
    if (turma) {
      setEditingTurma(turma);
      setTurmaFormData({
        nome: turma.nome,
        descricao: '',
        data_inicio: turma.data_inicio,
        data_conclusao: turma.data_conclusao,
        link_acesso: turma.link_acesso || '',
      });
    } else {
      setEditingTurma(null);
      setTurmaFormData({
        nome: '',
        descricao: '',
        data_inicio: '',
        data_conclusao: '',
        link_acesso: '',
      });
    }
    setError(null);
    setShowTurmaModal(true);
  };

  const handleSubmitTurma = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !isAdmin) {
      setError('Você não tem permissão para realizar esta ação');
      notifyError('Você não tem permissão para realizar esta ação', 'Acesso negado');
      return;
    }

    if (!turmaFormData.nome.trim() || !turmaFormData.data_inicio || !turmaFormData.data_conclusao) {
      setError('Todos os campos obrigatórios devem ser preenchidos');
      notifyWarning('Todos os campos obrigatórios devem ser preenchidos', 'Campos obrigatórios');
      return;
    }

    if (new Date(turmaFormData.data_inicio) >= new Date(turmaFormData.data_conclusao)) {
      setError('A data de início deve ser anterior à data de fim');
      notifyWarning('A data de início deve ser anterior à data de fim', 'Validação');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = {
        nome: turmaFormData.nome.trim(),
        treinamento: treinamentoId,
        data_inicio: turmaFormData.data_inicio,
        data_conclusao: turmaFormData.data_conclusao,
        link_acesso: turmaFormData.link_acesso?.trim() || null,
      };

      if (editingTurma) {
        await turmasAPI.update(editingTurma.id, submitData);
        notifySuccess('Turma atualizada com sucesso');
      } else {
        await turmasAPI.create(submitData);
        notifySuccess('Turma criada com sucesso');
      }

      handleCloseTurmaModal();
      loadData();
    } catch (error: unknown) {
      const errorMessage = extractAndTranslateError(error, 'Erro ao salvar turma');
      setError(errorMessage);
      notifyError(errorMessage, 'Erro ao salvar turma');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTurma = async (turma: Turma) => {
    if (!isAuthenticated || !isAdmin) {
      notifyError('Você não tem permissão para realizar esta ação', 'Acesso negado');
      return;
    }

    const confirmed = await confirm({
      title: 'Confirmar exclusão',
      message: `Tem certeza que deseja excluir a turma "${turma.nome}"?`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      try {
        await turmasAPI.delete(turma.id);
        notifySuccess('Turma excluída com sucesso');
        loadData();
      } catch (error: unknown) {
        const errorMessage = extractAndTranslateError(error, 'Erro ao excluir turma');
        notifyError(errorMessage, 'Erro ao excluir turma');
      }
    }
  };

  // Funções para Recursos
  const handleOpenRecursoModal = (recurso?: Recurso) => {
    if (recurso) {
      setEditingRecurso(recurso);
      setRecursoFormData({
        titulo: recurso.titulo || recurso.nome_recurso,
        descricao: recurso.descricao || recurso.descricao_recurso || '',
        tipo: (recurso.tipo === 'arquivo_pdf' || recurso.tipo === 'arquivo_zip' ? 'arquivo' : recurso.tipo) || 'documento',
        url: recurso.url || recurso.arquivo_url || '',
        arquivo: null,
      });
    } else {
      setEditingRecurso(null);
      setRecursoFormData({
        titulo: '',
        descricao: '',
        tipo: 'documento',
        url: '',
        arquivo: null,
      });
    }
    setError(null);
    setShowRecursoModal(true);
  };

  const handleSubmitRecurso = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !isAdmin) {
      setError('Você não tem permissão para realizar esta ação');
      notifyError('Você não tem permissão para realizar esta ação', 'Acesso negado');
      return;
    }

    if (!recursoFormData.titulo.trim()) {
      setError('O título é obrigatório');
      notifyWarning('O título é obrigatório', 'Campo obrigatório');
      return;
    }

    if (recursoFormData.tipo === 'link' && !recursoFormData.url?.trim()) {
      setError('A URL é obrigatória para recursos do tipo link');
      notifyWarning('A URL é obrigatória para recursos do tipo link', 'Campo obrigatório');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('titulo', recursoFormData.titulo.trim());
      formData.append('descricao', recursoFormData.descricao?.trim() || '');
      formData.append('tipo', recursoFormData.tipo);
      formData.append('treinamento', treinamentoId!);

      if (recursoFormData.url?.trim()) {
        formData.append('url', recursoFormData.url.trim());
      }

      if (recursoFormData.arquivo) {
        formData.append('arquivo', recursoFormData.arquivo);
      }

      if (editingRecurso) {
        await recursosAPI.update(editingRecurso.id, formData);
        notifySuccess('Recurso atualizado com sucesso');
      } else {
        await recursosAPI.create(formData);
        notifySuccess('Recurso criado com sucesso');
      }

      handleCloseRecursoModal();
      loadData();
    } catch (error: unknown) {
      const errorMessage = extractAndTranslateError(error, 'Erro ao salvar recurso');
      setError(errorMessage);
      notifyError(errorMessage, 'Erro ao salvar recurso');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRecurso = async (recurso: Recurso) => {
    if (!isAuthenticated || !isAdmin) {
      notifyError('Você não tem permissão para realizar esta ação', 'Acesso negado');
      return;
    }

    const confirmed = await confirm({
      title: 'Confirmar exclusão',
      message: `Tem certeza que deseja excluir o recurso "${recurso.titulo || recurso.nome_recurso}"?`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      try {
        await recursosAPI.delete(recurso.id);
        notifySuccess('Recurso excluído com sucesso');
        loadData();
      } catch (error: unknown) {
        const errorMessage = extractAndTranslateError(error, 'Erro ao excluir recurso');
        notifyError(errorMessage, 'Erro ao excluir recurso');
      }
    }
  };

  // Funções de fechamento de modais
  const handleCloseTurmaModal = () => {
    setShowTurmaModal(false);
    setEditingTurma(null);
    setTurmaFormData({
      nome: '',
      descricao: '',
      data_inicio: '',
      data_conclusao: '',
      link_acesso: '',
    });
    setError(null);
  };

  const handleCloseRecursoModal = () => {
    setShowRecursoModal(false);
    setEditingRecurso(null);
    setRecursoFormData({
      titulo: '',
      descricao: '',
      tipo: 'documento',
      url: '',
      arquivo: null,
    });
    setError(null);
  };

  // Funções utilitárias
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

  const getStatusBadge = (turma: Turma) => {
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

  const getRecursoIcon = (tipo: string) => {
    switch (tipo) {
      case 'video':
        return <Video size={16} className="text-red-500" />;
      case 'documento':
        return <FileText size={16} className="text-blue-500" />;
      case 'arquivo':
        return <Archive size={16} className="text-gray-500" />;
      default:
        return <BookOpen size={16} className="text-green-500" />;
    }
  };

  // Filtros
  const filteredTurmas = turmas.filter((turma) =>
    includesIgnoreCase(turma?.nome, searchTerm)
  );

  const filteredRecursos = recursos.filter((recurso) =>
    includesIgnoreCase(recurso?.titulo, searchTerm) ||
    includesIgnoreCase(recurso?.tipo, searchTerm)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!treinamento) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Treinamento não encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">O treinamento solicitado não foi encontrado.</p>
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
              {treinamento.nome}
            </h1>
            <p className="text-gray-600 mt-1">
              {treinamento.categoria} • {treinamento.duracao_horas}h
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => handleOpenTurmaModal()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Nova Turma
          </button>
          <button
            onClick={() => handleOpenRecursoModal()}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus size={20} className="mr-2" />
            Novo Recurso
          </button>
        </div>
      </div>

      {/* Informações do Treinamento */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Categoria</p>
            <p className="font-medium">{treinamento.categoria}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duração</p>
            <p className="font-medium">{treinamento.duracao_horas}h</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Nível</p>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getNivelBadge(treinamento.nivel || 'iniciante')}`}>
              {treinamento.nivel || 'Não definido'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500">Turmas</p>
            <p className="font-medium">{turmas.length}</p>
          </div>
        </div>
        {treinamento.descricao && (
          <div className="mt-4">
            <p className="text-sm text-gray-500">Descrição</p>
            <p className="text-gray-700">{treinamento.descricao}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('turmas')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'turmas'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Turmas ({turmas.length})
          </button>
          <button
            onClick={() => setActiveTab('recursos')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'recursos'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Recursos ({recursos.length})
          </button>
        </nav>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder={`Buscar ${activeTab}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {activeTab === 'turmas' ? (
          // Turmas Tab
          filteredTurmas.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'Nenhuma turma encontrada' : 'Nenhuma turma cadastrada'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? 'Tente ajustar os termos de busca.'
                  : 'Comece criando uma nova turma para este treinamento.'
                }
              </p>
              {!searchTerm && isAdmin && (
                <button
                  onClick={() => handleOpenTurmaModal()}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
                      Ações
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTurmas.map((turma) => (
                    <tr key={turma.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        <div className="flex justify-start space-x-2">
                          {isAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenTurmaModal(turma)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteTurma(turma)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Excluir"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{turma.nome}</div>
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
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Acessar
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          // Recursos Tab
          filteredRecursos.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm ? 'Nenhum recurso encontrado' : 'Nenhum recurso cadastrado'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? 'Tente ajustar os termos de busca.'
                  : 'Comece criando um novo recurso para este treinamento.'
                }
              </p>
              {!searchTerm && isAdmin && (
                <button
                  onClick={() => handleOpenRecursoModal()}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus size={20} className="mr-2" />
                  Criar Recurso
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 p-6">
              {filteredRecursos.map((recurso) => (
                <div key={recurso.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start space-x-3">
                      {getRecursoIcon(recurso.tipo || 'documento')}
                      <div>
                        <h3 className="font-medium text-gray-900">{recurso.titulo || recurso.nome_recurso}</h3>
                        {recurso.descricao && (
                          <p className="text-sm text-gray-600 mt-1">{recurso.descricao}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500 capitalize">{recurso.tipo}</span>
                          {recurso.url && (
                            <a
                              href={recurso.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary-600 hover:text-primary-900"
                            >
                              Acessar
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleOpenRecursoModal(recurso)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteRecurso(recurso)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Modal para Turmas */}
      {showTurmaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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

              <form onSubmit={handleSubmitTurma} className="space-y-4">
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    id="nome"
                    type="text"
                    value={turmaFormData.nome}
                    onChange={(e) => setTurmaFormData({ ...turmaFormData, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="data_inicio" className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Início *
                    </label>
                    <input
                      id="data_inicio"
                      type="date"
                      value={turmaFormData.data_inicio}
                      onChange={(e) => setTurmaFormData({ ...turmaFormData, data_inicio: e.target.value })}
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
                      value={turmaFormData.data_conclusao}
                      onChange={(e) => setTurmaFormData({ ...turmaFormData, data_conclusao: e.target.value })}
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
                    value={turmaFormData.link_acesso}
                    onChange={(e) => setTurmaFormData({ ...turmaFormData, link_acesso: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://exemplo.com/link-da-turma"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseTurmaModal}
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
                    {isSubmitting ? 'Salvando...' : (editingTurma ? 'Atualizar' : 'Criar')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Recursos */}
      {showRecursoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingRecurso ? 'Editar Recurso' : 'Novo Recurso'}
              </h2>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                  <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmitRecurso} className="space-y-4">
                <div>
                  <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    id="titulo"
                    type="text"
                    value={recursoFormData.titulo}
                    onChange={(e) => setRecursoFormData({ ...recursoFormData, titulo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo *
                  </label>
                  <select
                    id="tipo"
                    value={recursoFormData.tipo}
                    onChange={(e) => setRecursoFormData({ ...recursoFormData, tipo: e.target.value as 'video' | 'documento' | 'arquivo' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="arquivo_pdf">Documento PDF</option>
                    <option value="video">Vídeo</option>
                    <option value="arquivo_zip">Arquivo ZIP</option>
                  </select>
                </div>

                {recursoFormData.tipo === 'video' && (
                  <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                      URL *
                    </label>
                    <input
                      id="url"
                      type="url"
                      value={recursoFormData.url}
                      onChange={(e) => setRecursoFormData({ ...recursoFormData, url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required={recursoFormData.tipo === 'video'}

                      disabled={isSubmitting}
                    />
                  </div>
                )}

                {(recursoFormData.tipo === 'documento' || recursoFormData.tipo === 'arquivo') && (
                  <div>
                    <label htmlFor="arquivo" className="block text-sm font-medium text-gray-700 mb-1">
                      Arquivo {!editingRecurso && '*'}
                    </label>
                    <input
                      id="arquivo"
                      type="file"
                      onChange={(e) => setRecursoFormData({ ...recursoFormData, arquivo: e.target.files?.[0] || null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      required={!editingRecurso}
                      disabled={isSubmitting}
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    id="descricao"
                    value={recursoFormData.descricao}
                    onChange={(e) => setRecursoFormData({ ...recursoFormData, descricao: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Digite a descrição do recurso"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseRecursoModal}
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
                    {isSubmitting ? 'Salvando...' : (editingRecurso ? 'Atualizar' : 'Criar')}
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

export default TreinamentoGrid;