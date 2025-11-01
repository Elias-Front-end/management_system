import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Users, GraduationCap, FileText,
  UserCheck, ArrowUpRight
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { treinamentosAPI, turmasAPI, alunosAPI, recursosAPI, matriculasAPI } from '../services/api';
import { CardTurma, CardTreinamento } from '../components/cards';
import { RecursoModal } from '../components/modals';
import { AlunosTurmasModal } from '../components/modals/AlunosTurmasModal';
import MetricCard from '../components/MetricCard';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import type { Turma, Treinamento, Recurso, Aluno } from '../types';
import { useNotificationStore } from '../store/notificationStore';
import { useConfirm } from '../hooks/useConfirm';

interface DashboardStats {
  treinamentos: number;
  turmas: number;
  alunos: number;
  recursos: number;
  matriculas: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotificationStore();
  const { confirm, ConfirmComponent } = useConfirm();

  const [stats, setStats] = useState<DashboardStats>({
    treinamentos: 0,
    turmas: 0,
    alunos: 0,
    recursos: 0,
    matriculas: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [alunosLista, setAlunosLista] = useState<Aluno[]>([]);
  const [turmasLista, setTurmasLista] = useState<Turma[]>([]);
  const [treinamentosLista, setTreinamentosLista] = useState<Treinamento[]>([]);

  // Estados para modal de recursos
  const [showRecursoModal, setShowRecursoModal] = useState(false);
  const [editingRecurso, setEditingRecurso] = useState<Recurso | null>(null);
  const [selectedTreinamentoId, setSelectedTreinamentoId] = useState<string>('');
  const [selectedTurmaId, setSelectedTurmaId] = useState<string>('');

  // Estados para modal de alunos/turmas
  const [showAlunosTurmasModal, setShowAlunosTurmasModal] = useState(false);
  const [modalType, setModalType] = useState<'alunos' | 'turmas'>('alunos');
  const [selectedTreinamento, setSelectedTreinamento] = useState<Treinamento | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.is_staff) {
        setIsLoading(false);
        return;
      }

      try {
        const [treinamentos, turmas, alunos, recursos, matriculas] = await Promise.all([
          treinamentosAPI.list(),
          turmasAPI.list(),
          alunosAPI.list(),
          recursosAPI.list(),
          matriculasAPI.list(),
        ]);

        setStats({
          treinamentos: treinamentos.length,
          turmas: turmas.length,
          alunos: alunos.length,
          recursos: recursos.length,
          matriculas: matriculas.length,
        });
        setAlunosLista(alunos || []);
        setTurmasLista(turmas || []);
        setTreinamentosLista(treinamentos || []);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [user]);

  // Funções para gerenciar recursos
  const handleRecursoEdit = (recurso: Recurso) => {
    setEditingRecurso(recurso);
    setSelectedTreinamentoId('');
    setShowRecursoModal(true);
  };

  const handleRecursoDelete = async (recurso: Recurso) => {
    const confirmed = await confirm({
      title: 'Confirmar exclusão',
      message: `Tem certeza que deseja excluir o recurso "${recurso.nome_recurso}"?`,
      type: 'danger'
    });

    if (confirmed) {
      try {
        await recursosAPI.delete(recurso.id);
        notifySuccess('Recurso excluído com sucesso!');
        // Recarregar dados se necessário
      } catch (error) {
        console.error('Erro ao excluir recurso:', error);
        notifyError('Erro ao excluir recurso');
      }
    }
  };

  const handleRecursoModalClose = () => {
    setShowRecursoModal(false);
    setEditingRecurso(null);
    setSelectedTreinamentoId('');
    setSelectedTurmaId('');
  };

  const handleRecursoModalSuccess = () => {
    // Recarregar dados se necessário
    // Como os recursos são carregados dinamicamente nos cards, não precisamos recarregar aqui
  };

  // Funções para gerenciar modal de alunos/turmas
  const handleAlunosClick = (treinamento: Treinamento) => {
    setSelectedTreinamento(treinamento);
    setModalType('alunos');
    setShowAlunosTurmasModal(true);
  };

  const handleTurmasClick = (treinamento: Treinamento) => {
    setSelectedTreinamento(treinamento);
    setModalType('turmas');
    setShowAlunosTurmasModal(true);
  };

  const handleAlunosTurmasModalClose = () => {
    setShowAlunosTurmasModal(false);
    setSelectedTreinamento(null);
  };

  // Métricas calculadas usando hook customizado
  const metrics = useDashboardMetrics(alunosLista, turmasLista, stats);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Modal de Recurso */}
      {showRecursoModal && (
        <RecursoModal
          isOpen={showRecursoModal}
          onClose={handleRecursoModalClose}
          onSuccess={handleRecursoModalSuccess}
          recurso={editingRecurso}
          turmaId={selectedTurmaId}
          treinamentoId={selectedTreinamentoId}
          turmasLista={turmasLista}
        />
      )}

      {/* Componente de Confirmação */}
      <ConfirmComponent />
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="w-full max-w-none mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded"></div>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Olá, {user?.first_name || user?.username}!
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-full sm:max-w-2xl mx-auto px-4">
              {user?.is_staff
                ? 'Gerencie seu sistema educacional com insights em tempo real e ações rápidas'
                : 'Acompanhe seu progresso e acesse seus recursos de aprendizado'
              }
            </p>
          </div>

          {/* Métricas Principais - Admin */}
          {user?.is_staff && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              <MetricCard
                title="Total de Alunos"
                value={stats.alunos}
                subtitle={`${metrics.alunosEsteMes} novos este mês`}
                icon={<Users size={24} className="text-white" />}
                trend={metrics.crescimentoAlunos > 0 ? 'up' : metrics.crescimentoAlunos < 0 ? 'down' : 'neutral'}
                trendValue={metrics.crescimentoAlunos}
                color="bg-blue-600"
                onClick={() => navigate('/alunos')}
              />
              <MetricCard
                title="Turmas Ativas"
                value={metrics.turmasAtivas}
                subtitle={`${stats.turmas} turmas no total`}
                icon={<GraduationCap size={24} className="text-white" />}
                color="bg-green-600"
                onClick={() => navigate('/turmas')}
              />
              <MetricCard
                title="Matrículas"
                value={stats.matriculas}
                subtitle="Alunos matriculados"
                icon={<UserCheck size={24} className="text-white" />}
                color="bg-indigo-600"
                onClick={() => navigate('/matriculas')}
              />
              <MetricCard
                title="Treinamentos"
                value={stats.treinamentos}
                subtitle="Programas disponíveis"
                icon={<BookOpen size={24} className="text-white" />}
                color="bg-purple-600"
                onClick={() => navigate('/treinamentos')}
              />
              <MetricCard
                title="Recursos"
                value={stats.recursos}
                subtitle={`${metrics.utilizacaoRecursos}% de utilização`}
                icon={<FileText size={24} className="text-white" />}
                color="bg-orange-600"
                onClick={() => navigate('/recursos')}
              />
            </div>
          )}

          {/* Layout Principal - Sistema de Cartões Interativos */}
          {user?.is_staff && (
            <div className="space-y-6 sm:space-y-8">
              {/* Seção de Turmas */}
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                      <GraduationCap size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        Turmas Ativas
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Clique em uma turma para gerenciar seus treinamentos
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                    {turmasLista.length} {turmasLista.length === 1 ? 'turma' : 'turmas'}
                  </span>
                </div>

                {turmasLista.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {turmasLista.slice(0, 6).map((turma) => {
                      // Cada turma tem 1 treinamento associado
                      const treinamentosCount = 1;
                      return (
                        <CardTurma
                          key={turma.id}
                          turma={turma}
                          treinamentosCount={treinamentosCount}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <GraduationCap size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Nenhuma turma encontrada
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Comece criando sua primeira turma
                    </p>
                    <button
                      onClick={() => navigate('/turmas')}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <GraduationCap size={16} className="mr-2" />
                      Criar Turma
                    </button>
                  </div>
                )}

                {turmasLista.length > 6 && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() => navigate('/turmas')}
                      className="inline-flex items-center px-6 py-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                      Ver todas as turmas ({turmasLista.length})
                      <ArrowUpRight size={16} className="ml-2" />
                    </button>
                  </div>
                )}
              </div>

              {/* Seção de Treinamentos */}
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                      <BookOpen size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                        Treinamentos Disponíveis
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Clique em um treinamento para gerenciar conteúdo e recursos
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                    {treinamentosLista.length} {treinamentosLista.length === 1 ? 'treinamento' : 'treinamentos'}
                  </span>
                </div>

                {treinamentosLista.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {treinamentosLista.slice(0, 6).map((treinamento) => {
                      // Calcular estatísticas para cada treinamento
                      const turmasDoTreinamento = turmasLista.filter(t => t.treinamento === treinamento.id);
                      const alunosDoTreinamento = turmasDoTreinamento.reduce((acc, turma) => acc + turma.total_alunos, 0);

                      return (
                        <CardTreinamento
                          key={treinamento.id}
                          treinamento={treinamento}
                          turmasCount={turmasDoTreinamento.length}
                          alunosCount={alunosDoTreinamento}
                          onRecursoEdit={handleRecursoEdit}
                          onRecursoDelete={handleRecursoDelete}
                          onAlunosClick={handleAlunosClick}
                          onTurmasClick={handleTurmasClick}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Nenhum treinamento encontrado
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Comece criando seu primeiro treinamento
                    </p>
                    <button
                      onClick={() => navigate('/treinamentos')}
                      className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <BookOpen size={16} className="mr-2" />
                      Criar Treinamento
                    </button>
                  </div>
                )}

                {treinamentosLista.length > 6 && (
                  <div className="text-center mt-6">
                    <button
                      onClick={() => navigate('/treinamentos')}
                      className="inline-flex items-center px-6 py-3 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
                    >
                      Ver todos os treinamentos ({treinamentosLista.length})
                      <ArrowUpRight size={16} className="ml-2" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modais */}
      <RecursoModal
        isOpen={showRecursoModal}
        onClose={handleRecursoModalClose}
        onSuccess={handleRecursoModalSuccess}
        recurso={editingRecurso}
        treinamentoId={selectedTreinamentoId}
        turmaId={selectedTurmaId}
      />

      {selectedTreinamento && (
        <AlunosTurmasModal
          isOpen={showAlunosTurmasModal}
          onClose={handleAlunosTurmasModalClose}
          treinamento={selectedTreinamento}
          type={modalType}
        />
      )}

      <ConfirmComponent />
    </div>
  );
};