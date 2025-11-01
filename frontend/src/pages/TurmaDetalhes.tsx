import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, FileText, Video, Archive, BookOpen, Calendar, Users, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { alunosAPI } from '../services/api';
import type { Turma } from '../types';
import StudentHeader from '../components/StudentHeader';

// Interface específica para recursos retornados pela API do aluno
interface RecursoAluno {
  id: string;
  nome_recurso: string;
  descricao_recurso?: string;
  turma_nome: string;
  tipo_recurso: 'video' | 'arquivo_pdf' | 'arquivo_zip';
  arquivo_url: string;
  pode_acessar?: boolean;
  created_at: string;
  treinamento_nome?: string;
}

export const TurmaDetalhes: React.FC = () => {
  const { turmaId } = useParams<{ turmaId: string }>();
  const navigate = useNavigate();
  const { aluno: alunoFromStore } = useAuthStore();

  // Estados
  const [turma, setTurma] = useState<Turma | null>(null);
  const [recursos, setRecursos] = useState<RecursoAluno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTurmaDetalhes = async () => {
      try {
        setLoading(true);

        if (!alunoFromStore?.id || !turmaId) {
          throw new Error('Dados do aluno ou turma não encontrados');
        }

        // Buscar dados da turma e recursos
        const [turmasResponse, recursosResponse] = await Promise.all([
          alunosAPI.turmas(alunoFromStore.id),
          alunosAPI.recursosDisponiveis(alunoFromStore.id)
        ]);

        // Encontrar a turma específica
        const turmaEncontrada = turmasResponse.find(t => t.id === turmaId);
        if (!turmaEncontrada) {
          throw new Error('Turma não encontrada');
        }
        setTurma(turmaEncontrada);

        // Filtrar recursos apenas desta turma
        const recursosConvertidos: RecursoAluno[] = recursosResponse
          .filter(recurso => recurso.turma_nome === turmaEncontrada.nome)
          .map(recurso => ({
            id: recurso.id,
            nome_recurso: recurso.nome_recurso,
            descricao_recurso: recurso.descricao_recurso || undefined,
            turma_nome: recurso.turma_nome,
            tipo_recurso: recurso.tipo_recurso,
            arquivo_url: recurso.arquivo_url || '',
            pode_acessar: recurso.pode_acessar,
            created_at: recurso.created_at,
            treinamento_nome: turmaEncontrada.treinamento_nome
          }));

        setRecursos(recursosConvertidos);
      } catch (err) {
        console.error('Erro ao carregar detalhes da turma:', err);
        navigate('/area-aluno'); // Redirecionar em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchTurmaDetalhes();
  }, [turmaId, alunoFromStore, navigate]);

  const handleResourceClick = (recurso: RecursoAluno) => {
    if (recurso.arquivo_url && recurso.pode_acessar) {
      window.open(recurso.arquivo_url, '_blank', 'noopener,noreferrer');
    }
  };

  const getResourceIcon = (tipo: string) => {
    switch (tipo) {
      case 'video':
        return <Video className="w-5 h-5" />;
      case 'arquivo_pdf':
        return <FileText className="w-5 h-5" />;
      case 'arquivo_zip':
        return <Archive className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getResourceTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'video':
        return 'Vídeo';
      case 'arquivo_pdf':
        return 'PDF';
      case 'arquivo_zip':
        return 'Arquivo ZIP';
      default:
        return 'Arquivo';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <StudentHeader title="Carregando..." />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="loading-skeleton h-8 w-64 mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <div className="loading-skeleton aspect-video mb-3"></div>
                  <div className="loading-text mb-2"></div>
                  <div className="loading-text w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!turma) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <StudentHeader title="Turma não encontrada" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              A turma solicitada não foi encontrada.
            </p>
            <button
              onClick={() => navigate('/area-aluno')}
              className="flex items-center space-x-2 mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeft size={18} />
              <span>Voltar para Área do Aluno</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <StudentHeader
        title={turma.nome}
        subtitle={`Treinamento: ${turma.treinamento_nome}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Botão Voltar */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/area-aluno')}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Voltar para Minhas Turmas</span>
          </button>
        </div>

        {/* Informações da Turma */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Data de Início</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {new Date(turma.data_inicio).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Data de Conclusão</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {new Date(turma.data_conclusao).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total de Alunos</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {turma.total_alunos}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recursos da Turma */}
        <div>
          <div className="flex items-center mb-6">
            <BookOpen className="w-6 h-6 text-green-600 mr-2" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Recursos de Aprendizado
            </h2>
            <span className="ml-auto text-sm text-gray-500 dark:text-gray-400">
              {recursos.length} {recursos.length === 1 ? 'recurso' : 'recursos'}
            </span>
          </div>

          {recursos.length > 0 ? (
            <div className="responsive-resources-grid">
              {recursos.map((recurso) => (
                <div
                  key={recurso.id}
                  className="responsive-resource-card group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500 transition-all cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-opacity-50"
                  onClick={() => handleResourceClick(recurso)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleResourceClick(recurso);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-labelledby={`resource-${recurso.id}-title`}
                  aria-describedby={`resource-${recurso.id}-description`}
                >
                  {/* Thumbnail/Icon */}
                  <div className="flex items-center justify-center w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 relative overflow-hidden">
                    {recurso.tipo_recurso === 'video' ? (
                      <div className="relative w-full h-full flex items-center justify-center bg-black rounded-lg">
                        <Video className="w-8 h-8 text-white" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        {getResourceIcon(recurso.tipo_recurso)}
                        <span className="text-xs mt-2 font-medium">
                          {getResourceTypeLabel(recurso.tipo_recurso)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Informações do Recurso */}
                  <div>
                    <h3
                      id={`resource-${recurso.id}-title`}
                      className="font-semibold text-gray-900 dark:text-gray-100 text-lg mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                    >
                      {recurso.nome_recurso}
                    </h3>

                    {recurso.descricao_recurso && (
                      <p
                        id={`resource-${recurso.id}-description`}
                        className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4"
                      >
                        {recurso.descricao_recurso}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {getResourceTypeLabel(recurso.tipo_recurso)}
                      </span>

                      <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-sm font-medium">Abrir</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Nenhum recurso disponível para esta turma no momento.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TurmaDetalhes;