import React, { useState, useEffect } from 'react';
import { AlertCircle, X, Upload } from 'lucide-react';
import type { Recurso, Turma } from '../../types';
import { recursosAPI } from '../../services/api';
import { extractAndTranslateError } from '../../utils/errorMessages';

interface RecursoFormData {
  titulo: string;
  descricao: string;
  tipo: 'video' | 'arquivo_pdf' | 'arquivo_zip';
  url?: string;
  arquivo?: File | null;
  acesso_previo: boolean;
  draft: boolean;
  turma?: string;
  treinamento?: string;
}

interface RecursoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  recurso?: Recurso | null;
  turmaId?: string;
  treinamentoId?: string;
  turmasLista?: Turma[];
}

export const RecursoModal: React.FC<RecursoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  recurso,
  turmaId,
  treinamentoId,
  // turmasLista não é utilizada, então removemos o parâmetro
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<RecursoFormData>({
    titulo: '',
    descricao: '',
    tipo: 'arquivo_pdf',
    url: '',
    arquivo: null,
    acesso_previo: false,
    draft: false,
    turma: turmaId || '',
    treinamento: treinamentoId || ''
  });

  useEffect(() => {
    if (recurso) {
      setFormData({
        titulo: recurso.nome_recurso,
        descricao: recurso.descricao_recurso || '',
        tipo: recurso.tipo_recurso,
        url: recurso.arquivo_url || '',
        arquivo: null,
        acesso_previo: recurso.acesso_previo,
        draft: recurso.draft,
        turma: recurso.turma || '',
        treinamento: recurso.treinamento || ''
      });
    } else {
      setFormData({
        titulo: '',
        descricao: '',
        tipo: 'arquivo_pdf',
        url: '',
        arquivo: null,
        acesso_previo: false,
        draft: false,
        turma: turmaId || '',
        treinamento: treinamentoId || ''
      });
    }
    setError(null);
  }, [recurso, turmaId, treinamentoId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = new FormData();
      submitData.append('nome_recurso', formData.titulo);
      submitData.append('descricao_recurso', formData.descricao);
      submitData.append('tipo_recurso', formData.tipo);
      submitData.append('acesso_previo', formData.acesso_previo.toString());
      submitData.append('draft', formData.draft.toString());

      // Enviar treinamento ou turma dependendo do contexto
      if (formData.treinamento) {
        submitData.append('treinamento', formData.treinamento);
      } else if (formData.turma) {
        submitData.append('turma', formData.turma);
      }

      if (formData.tipo === 'video' && formData.url) {
        submitData.append('url', formData.url);
      }

      if (formData.arquivo) {
        submitData.append('arquivo', formData.arquivo);
      }

      if (recurso) {
        await recursosAPI.update(recurso.id, submitData);
      } else {
        await recursosAPI.create(submitData);
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error('Erro ao salvar recurso:', error);
      const errorMessage = extractAndTranslateError(error);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, arquivo: file });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {recurso ? 'Editar Recurso' : 'Novo Recurso'}
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
              <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título *
              </label>
              <input
                id="titulo"
                type="text"
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
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
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo *
              </label>
              <select
                id="tipo"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as 'video' | 'arquivo_pdf' | 'arquivo_zip' })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                required
                disabled={isSubmitting}
              >
                <option value="arquivo_pdf">PDF</option>
                <option value="arquivo_zip">ZIP</option>
                <option value="video">Vídeo</option>
              </select>
            </div>

            {formData.tipo === 'video' && (
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL do Vídeo
                </label>
                <input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
                  disabled={isSubmitting}
                  placeholder="https://..."
                />
              </div>
            )}

            {(formData.tipo === 'arquivo_pdf' || formData.tipo === 'arquivo_zip') && (
              <div>
                <label htmlFor="arquivo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Arquivo {!recurso && '*'}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    id="arquivo"
                    type="file"
                    onChange={handleFileChange}
                    accept={formData.tipo === 'arquivo_pdf' ? '.pdf' : '.zip'}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="arquivo"
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Upload size={16} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {formData.arquivo ? formData.arquivo.name : 'Selecionar arquivo'}
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.acesso_previo}
                  onChange={(e) => setFormData({ ...formData, acesso_previo: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Acesso Prévio</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.draft}
                  onChange={(e) => setFormData({ ...formData, draft: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  disabled={isSubmitting}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Rascunho</span>
              </label>
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
                {isSubmitting ? 'Salvando...' : (recurso ? 'Atualizar' : 'Criar')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecursoModal;