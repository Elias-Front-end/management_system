import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, FileText, AlertCircle, Eye, EyeOff, Upload } from 'lucide-react';
import { recursosAPI, turmasAPI } from '../services/api';
import { extractAndTranslateError } from '../utils/errorMessages';
import { useNotificationStore } from '../store/notificationStore';
import { useConfirm } from '../hooks/useConfirm';
import { includesIgnoreCase } from '../utils/string';
import type { Recurso, Turma } from '../types';

interface RecursoFormData {
  nome: string;
  descricao: string;
  // Tipos suportados pelo backend: vídeo, PDF e ZIP
  tipo: 'video' | 'arquivo_pdf' | 'arquivo_zip';
  arquivo: File | null;
  turma: string | '';
  acesso_previo: boolean;
  is_draft: boolean;
}

export const Recursos: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { notifySuccess, notifyError, notifyWarning } = useNotificationStore();
  const { confirm, ConfirmComponent } = useConfirm();
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingRecurso, setEditingRecurso] = useState<Recurso | null>(null);
  const [formData, setFormData] = useState<RecursoFormData>({
    nome: '',
    descricao: '',
    tipo: 'video',
    arquivo: null,
    turma: '',
    acesso_previo: false,
    is_draft: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [recursosData, turmasData] = await Promise.all([
        recursosAPI.list(undefined, undefined, searchTerm || undefined),
        turmasAPI.list()
      ]);
      setRecursos(recursosData);
      setTurmas(turmasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados');
      notifyError('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, notifyError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenModal = (recurso?: Recurso) => {
    if (recurso) {
      setEditingRecurso(recurso);
      setFormData({
        nome: recurso.nome_recurso ?? recurso.titulo ?? '',
        descricao: recurso.descricao ?? recurso.descricao_recurso ?? '',
        // Mantém qualquer valor que vier do backend, suportando tipos antigos
        tipo: (recurso.tipo_recurso ?? recurso.tipo ?? 'video') as 'video' | 'arquivo_pdf' | 'arquivo_zip',
        arquivo: null,
        turma: recurso.turma ?? '',
        acesso_previo: recurso.acesso_previo ?? false,
        is_draft: recurso.draft ?? false,
      });
    } else {
      setEditingRecurso(null);
      setFormData({
        nome: '',
        descricao: '',
        tipo: 'video',
        arquivo: null,
        turma: '',
        acesso_previo: false,
        is_draft: false,
      });
    }
    setError(null);
    setShowModal(true);
  };

  const handleCloseModal = (navigateToDashboard?: boolean) => {
    setShowModal(false);
    setEditingRecurso(null);
    setFormData({
      nome: '',
      descricao: '',
      tipo: 'video',
      arquivo: null,
      turma: '',
      acesso_previo: false,
      is_draft: false,
    });
    setError(null);

    // Se foi solicitado para navegar de volta ao dashboard OU se veio do dashboard
    const fromDashboard = searchParams.get('from') === 'dashboard';
    if (navigateToDashboard || fromDashboard) {
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Nome e turma são obrigatórios sempre. Arquivo é obrigatório apenas na criação
    if (!formData.nome.trim() || !formData.turma || (!editingRecurso && !formData.arquivo)) {
      setError(editingRecurso ? 'Nome e Turma são obrigatórios' : 'Nome, Turma e Arquivo são obrigatórios');
      notifyWarning(editingRecurso ? 'Nome e Turma são obrigatórios' : 'Nome, Turma e Arquivo são obrigatórios', 'Campos obrigatórios');
      return;
    }

    // Validação: Recurso não pode ter acesso prévio e ser rascunho ao mesmo tempo
    if (formData.acesso_previo && formData.is_draft) {
      setError('Um recurso não pode ter "Acesso prévio" e ser "Rascunho" ao mesmo tempo');
      notifyWarning('Um recurso não pode ter "Acesso prévio" e ser "Rascunho" ao mesmo tempo', 'Regra de negócio');
      return;
    }

    // Validação: Se a turma já iniciou, recursos com acesso prévio devem estar finalizados
    const turmaSelecionada = turmas.find(t => String(t.id) === String(formData.turma));
    if (turmaSelecionada && formData.acesso_previo && formData.is_draft) {
      const dataInicio = new Date(turmaSelecionada.data_inicio);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      dataInicio.setHours(0, 0, 0, 0);

      if (hoje >= dataInicio) {
        setError('Após o início da turma, recursos com "Acesso prévio" não podem ser rascunhos');
        notifyWarning('Após o início da turma, recursos com "Acesso prévio" não podem ser rascunhos', 'Regra de negócio');
        return;
      }
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = new FormData();
      submitData.append('nome_recurso', formData.nome);
      // O serializer usa 'descricao'; o modelo tem 'descricao_recurso'. Mantemos 'descricao'
      submitData.append('descricao_recurso', formData.descricao);
      submitData.append('tipo_recurso', formData.tipo);
      if (formData.arquivo) {
        submitData.append('arquivo', formData.arquivo);
      }
      submitData.append('turma', String(formData.turma));
      submitData.append('acesso_previo', String(formData.acesso_previo));
      submitData.append('draft', String(formData.is_draft));

      if (editingRecurso) {
        await recursosAPI.update(editingRecurso.id, submitData);
      } else {
        await recursosAPI.create(submitData);
      }

      notifySuccess(editingRecurso ? 'Recurso atualizado com sucesso' : 'Recurso criado com sucesso');
      handleCloseModal();
      loadData();
    } catch (error: unknown) {
      const errorMessage = extractAndTranslateError(error, 'Erro ao salvar recurso');
      setError(errorMessage);
      notifyError(errorMessage, 'Erro ao salvar recurso');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (recurso: Recurso) => {
    const nomeDisplay = recurso.nome_recurso ?? recurso.titulo ?? 'recurso';
    const confirmed = await confirm({
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o recurso "${nomeDisplay}"?`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (!confirmed) {
      return;
    }

    try {
      await recursosAPI.delete(recurso.id);
      notifySuccess('Recurso excluído com sucesso');
      loadData();
    } catch (error) {
      console.error('Erro ao excluir recurso:', error);
      notifyError('Erro ao excluir recurso');
    }
  };

  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'video':
        return '🎥';
      case 'arquivo_pdf':
        return '📄';
      case 'arquivo_zip':
        return '🗜️';
      default:
        return '📁';
    }
  };

  const getTypeBadge = (tipo: string) => {
    const colors: Record<string, string> = {
      video: 'bg-blue-100 text-blue-800',
      arquivo_pdf: 'bg-green-100 text-green-800',
      arquivo_zip: 'bg-yellow-100 text-yellow-800',
    };
    const labels: Record<string, string> = {
      video: 'Vídeo',
      arquivo_pdf: 'PDF',
      arquivo_zip: 'ZIP',
    };
    const color = colors[tipo] ?? 'bg-gray-100 text-gray-800';
    const label = labels[tipo] ?? tipo;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
        {label}
      </span>
    );
  };

  const filteredRecursos = recursos.filter((recurso) => {
    const nome = recurso.nome_recurso ?? recurso.titulo;
    const treinamentoNome = recurso.turma_nome;
    return (
      includesIgnoreCase(nome, searchTerm) ||
      includesIgnoreCase(treinamentoNome, searchTerm) ||
      includesIgnoreCase(recurso.descricao_recurso ?? recurso.descricao, searchTerm)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="mr-2" size={28} />
            Recursos
          </h1>
          <p className="text-gray-600 mt-1">Gerencie os recursos dos treinamentos</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Novo Recurso
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Buscar recursos..."
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
          {filteredRecursos.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Nenhum recurso encontrado' : 'Nenhum recurso cadastrado'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? 'Tente ajustar os termos de busca'
                  : 'Comece criando seu primeiro recurso'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => handleOpenModal()}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus size={20} className="mr-2" />
                  Criar Recurso
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recurso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Treinamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acesso Prévio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criado em
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecursos.map((recurso) => (
                    <tr key={recurso.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenModal(recurso)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(recurso)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg mr-3">{getTypeIcon(recurso.tipo_recurso ?? recurso.tipo ?? 'video')}</span>
                          <div>
                            <div className="font-medium text-gray-900">{recurso.nome_recurso ?? recurso.titulo}</div>
                            {recurso.descricao_recurso && (
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {recurso.descricao_recurso}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{recurso.turma_nome}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(recurso.tipo_recurso ?? recurso.tipo ?? 'video')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {recurso.acesso_previo ? (
                            <>
                              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                Acesso Prévio
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 bg-gray-300 rounded-full mr-2"></span>
                              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                Padrão
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {recurso.draft ? (
                            <>
                              <EyeOff size={16} className="text-orange-500 mr-1" />
                              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                Rascunho
                              </span>
                            </>
                          ) : (
                            <>
                              <Eye size={16} className="text-green-500 mr-1" />
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                Publicado
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {new Date(recurso.created_at).toLocaleDateString('pt-BR')}
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
                {editingRecurso ? 'Editar Recurso' : 'Novo Recurso'}
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
                    placeholder="Digite o nome do recurso"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="turma" className="block text-sm font-medium text-gray-700 mb-1">
                    Turma *
                  </label>
                  <select
                    id="turma"
                    value={formData.turma === '' ? '' : String(formData.turma)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        turma: e.target.value === '' ? '' : e.target.value
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Selecione uma turma</option>
                    {turmas.map((turma) => (
                      <option key={String(turma.id)} value={String(turma.id)}>
                        {turma.nome} — {turma.treinamento_nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo *
                  </label>
                  <select
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'video' | 'arquivo_pdf' | 'arquivo_zip', arquivo: null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="video">Vídeo</option>
                    <option value="arquivo_pdf">Arquivo PDF</option>
                    <option value="arquivo_zip">Arquivo ZIP</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="arquivo" className="block text-sm font-medium text-gray-700 mb-1">
                    Arquivo *
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="inline-flex items-center px-3 py-2 bg-primary-50 text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-100 cursor-pointer">
                      <Upload size={16} className="mr-2" /> Selecionar arquivo
                      <input
                        id="arquivo"
                        type="file"
                        accept={formData.tipo === 'video' ? '.mp4,.avi,.mov' : formData.tipo === 'arquivo_pdf' ? '.pdf' : '.zip'}
                        className="hidden"
                        onChange={(e) => setFormData({ ...formData, arquivo: e.target.files?.[0] ?? null })}
                        disabled={isSubmitting}
                      />
                    </label>
                    <span className="text-sm text-gray-600">
                      {formData.arquivo ? formData.arquivo.name : 'Nenhum arquivo selecionado'}
                    </span>
                  </div>
                  {editingRecurso && editingRecurso.arquivo_url && (
                    <p className="mt-2 text-sm text-gray-500">Arquivo atual: <a target="_blank" rel="noopener noreferrer" className="text-primary-600 underline" href={editingRecurso.arquivo_url}>abrir</a></p>
                  )}
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
                    placeholder="Digite a descrição do recurso"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Checkboxes de configuração */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="acesso_previo"
                      type="checkbox"
                      checked={formData.acesso_previo}
                      onChange={(e) => setFormData({ ...formData, acesso_previo: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="acesso_previo" className="ml-2 block text-sm text-gray-700">
                      Acesso prévio (disponível antes do início da turma)
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="is_draft"
                      type="checkbox"
                      checked={formData.is_draft}
                      onChange={(e) => setFormData({ ...formData, is_draft: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      disabled={isSubmitting}
                    />
                    <label htmlFor="is_draft" className="ml-2 block text-sm text-gray-700">
                      Salvar como rascunho
                    </label>
                  </div>

                  {/* Informações sobre a turma selecionada */}
                  {formData.turma && (() => {
                    const turmaSelecionada = turmas.find(t => String(t.id) === String(formData.turma));
                    if (!turmaSelecionada) return null;

                    const dataInicio = new Date(turmaSelecionada.data_inicio);
                    const hoje = new Date();
                    hoje.setHours(0, 0, 0, 0);
                    dataInicio.setHours(0, 0, 0, 0);

                    const turmaJaIniciou = hoje >= dataInicio;

                    return (
                      <div className={`border rounded-lg p-3 ${turmaJaIniciou ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${turmaJaIniciou ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                          <span className="text-sm font-medium text-gray-700">
                            Turma: {turmaSelecionada.nome}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">
                          Início: {new Date(turmaSelecionada.data_inicio).toLocaleDateString('pt-BR')}
                        </p>

                        {turmaJaIniciou ? (
                          <div className="text-xs text-blue-700">
                            <strong>Turma já iniciada:</strong>
                            <ul className="mt-1 ml-4 list-disc space-y-1">
                              <li>Alunos podem acessar recursos não marcados como "Rascunho"</li>
                              <li>Recursos com "Acesso prévio" devem estar finalizados</li>
                            </ul>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-600">
                            <strong>Turma ainda não iniciou:</strong>
                            <ul className="mt-1 ml-4 list-disc space-y-1">
                              <li>Alunos só podem acessar recursos com "Acesso prévio"</li>
                              <li>Recursos podem ser salvos como rascunho</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Aviso sobre as regras */}
                  {formData.acesso_previo && formData.is_draft && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start space-x-2">
                      <AlertCircle className="text-yellow-500 flex-shrink-0 mt-0.5" size={16} />
                      <p className="text-yellow-800 text-sm">
                        <strong>Atenção:</strong> Um recurso não pode ter "Acesso prévio" e ser "Rascunho" ao mesmo tempo.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => handleCloseModal()}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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