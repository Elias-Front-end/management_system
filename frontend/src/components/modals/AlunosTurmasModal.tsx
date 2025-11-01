import React, { useEffect, useState, useCallback } from 'react';
import { X, Calendar, CheckCircle, XCircle, Users, BookOpen, Filter } from 'lucide-react';
import type { Treinamento, Turma, Aluno, Matricula } from '../../types';
import { alunosAPI, turmasAPI, matriculasAPI } from '../../services/api';

interface AlunoComTurma {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  foto?: string;
  status: 'ativo' | 'inativo';
  data_ingresso: string;
  turma?: {
    id: string;
    nome: string;
  };
}

interface TurmaComContagem {
  id: string;
  nome: string;
  data_inicio: string;
  data_conclusao: string;
  link_acesso?: string;
  alunos_count: number;
}

interface AlunosTurmasModalProps {
  isOpen: boolean;
  onClose: () => void;
  treinamento: Treinamento;
  type: 'alunos' | 'turmas';
}

export const AlunosTurmasModal: React.FC<AlunosTurmasModalProps> = ({
  isOpen,
  onClose,
  treinamento,
  type
}) => {
  const [alunos, setAlunos] = useState<AlunoComTurma[]>([]);
  const [turmas, setTurmas] = useState<TurmaComContagem[]>([]);
  const [todasTurmas, setTodasTurmas] = useState<TurmaComContagem[]>([]);
  const [turmaFiltro, setTurmaFiltro] = useState<string>('todas');
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!isOpen) return;
    
    setLoading(true);
    try {
      if (type === 'alunos') {
        // Buscar matrículas do treinamento
        const todasMatriculas = await matriculasAPI.list();
        
        // Buscar turmas do treinamento
        const todasTurmas = await turmasAPI.list();
        const turmasDoTreinamento = todasTurmas.filter(
          (turma: Turma) => turma.treinamento === treinamento.id
        );
        
        // Salvar todas as turmas para o filtro
        const turmasComContagem = turmasDoTreinamento.map((turma: Turma) => ({
          id: String(turma.id),
          nome: turma.nome,
          data_inicio: turma.data_inicio,
          data_conclusao: turma.data_conclusao,
          link_acesso: turma.link_acesso || undefined,
          alunos_count: 0 // Será calculado depois
        }));
        setTodasTurmas(turmasComContagem);
        
        // Buscar todos os alunos
        const todosAlunos = await alunosAPI.list();
        
        // Filtrar matrículas das turmas deste treinamento
        const matriculasDoTreinamento = todasMatriculas.filter((matricula: Matricula) =>
          turmasDoTreinamento.some((turma: Turma) => turma.id === matricula.turma)
        );
        
        // Mapear alunos com suas informações de matrícula
        const alunosComMatricula = matriculasDoTreinamento.map((matricula: Matricula) => {
          const aluno = todosAlunos.find((a: Aluno) => a.id === matricula.aluno);
          const turma = turmasDoTreinamento.find((t: Turma) => t.id === matricula.turma);
          
          return {
            id: String(aluno?.id || '0'),
            nome: aluno?.nome || 'Nome não encontrado',
            email: aluno?.email || 'Email não encontrado',
            telefone: aluno?.telefone,
            status: 'ativo' as const, // Assumindo que alunos matriculados estão ativos
            data_ingresso: matricula.created_at || new Date().toISOString(),
            turma: turma ? {
              id: String(turma.id),
              nome: turma.nome
            } : undefined
          };
        });
        
        setAlunos(alunosComMatricula);
      } else {
        // Buscar turmas do treinamento
        const todasTurmas = await turmasAPI.list();
        const turmasDoTreinamento = todasTurmas.filter(
          (turma: Turma) => turma.treinamento === treinamento.id
        );
        
        // Buscar matrículas para contar alunos por turma
        const todasMatriculas = await matriculasAPI.list();
        
        const turmasComContagem = turmasDoTreinamento.map((turma: Turma) => {
          const alunosDaTurma = todasMatriculas.filter(
            (matricula: Matricula) => matricula.turma === turma.id
          );
          
          return {
            id: String(turma.id),
            nome: turma.nome,
            data_inicio: turma.data_inicio,
            data_conclusao: turma.data_conclusao,
            link_acesso: turma.link_acesso || undefined,
            alunos_count: alunosDaTurma.length
          };
        });
        
        setTurmas(turmasComContagem);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [isOpen, type, treinamento.id]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  // Filtrar alunos baseado na turma selecionada
  const alunosFiltrados = type === 'alunos' 
    ? turmaFiltro === 'todas' 
      ? alunos 
      : alunos.filter(aluno => aluno.turma?.id === turmaFiltro)
    : [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl transform transition-all duration-300 scale-100">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                {type === 'alunos' ? (
                  <Users size={24} className="text-purple-600 dark:text-purple-400" />
                ) : (
                  <BookOpen size={24} className="text-purple-600 dark:text-purple-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {type === 'alunos' ? 'Alunos Matriculados' : 'Turmas Disponíveis'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {treinamento.nome}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-96 overflow-y-auto">
            {/* Filtro por turma - apenas para alunos */}
            {type === 'alunos' && todasTurmas.length > 0 && (
              <div className="mb-4 flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Filter size={16} className="text-gray-500 dark:text-gray-400" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Filtrar por turma:
                  </label>
                </div>
                <select
                  value={turmaFiltro}
                  onChange={(e) => setTurmaFiltro(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="todas">Todas as turmas</option>
                  {todasTurmas.map((turma) => (
                    <option key={turma.id} value={turma.id}>
                      {turma.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">Carregando...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {type === 'alunos' ? (
                  // Lista de Alunos Filtrados
                  alunosFiltrados.length > 0 ? (
                    alunosFiltrados.map((aluno) => (
                      <div
                        key={aluno.id}
                        className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {aluno.foto ? (
                            <img
                              src={aluno.foto}
                              alt={aluno.nome}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                                {getInitials(aluno.nome)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {aluno.nome}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              aluno.status === 'ativo'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            }`}>
                              {aluno.status === 'ativo' ? (
                                <CheckCircle size={12} className="mr-1" />
                              ) : (
                                <XCircle size={12} className="mr-1" />
                              )}
                              {aluno.status === 'ativo' ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {aluno.email}
                          </p>
                          {aluno.turma && (
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              Turma: {aluno.turma.nome}
                            </p>
                          )}
                        </div>

                        {/* Data de ingresso */}
                        <div className="flex-shrink-0 text-right">
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                            <Calendar size={12} className="mr-1" />
                            {formatDate(aluno.data_ingresso)}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Users size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        {turmaFiltro === 'todas' 
                          ? 'Nenhum aluno matriculado neste treinamento.'
                          : 'Nenhum aluno encontrado para a turma selecionada.'
                        }
                      </p>
                    </div>
                  )
                ) : (
                  // Lista de Turmas
                  turmas.length > 0 ? (
                    turmas.map((turma) => (
                      <div
                        key={turma.id}
                        className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                              {turma.nome}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600 dark:text-gray-400">
                              <div className="flex items-center">
                                <Calendar size={12} className="mr-1 text-blue-500" />
                                Início: {formatDate(turma.data_inicio)}
                              </div>
                              <div className="flex items-center">
                                <Calendar size={12} className="mr-1 text-red-500" />
                                Fim: {formatDate(turma.data_conclusao)}
                              </div>
                              <div className="flex items-center">
                                <Users size={12} className="mr-1 text-green-500" />
                                {turma.alunos_count} alunos
                              </div>
                            </div>
                            {turma.link_acesso && (
                              <div className="mt-2">
                                <a
                                  href={turma.link_acesso}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  Link de acesso
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Nenhuma turma disponível para este treinamento.
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {type === 'alunos' 
                  ? `${alunos.length} aluno(s) encontrado(s)`
                  : `${turmas.length} turma(s) encontrada(s)`
                }
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlunosTurmasModal;