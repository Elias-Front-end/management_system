import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { treinamentosAPI, turmasAPI, alunosAPI, recursosAPI } from '../services/api';
import ActivityCard, { type ActivityItem } from '../components/ActivityCard';
import QuickActions from '../components/QuickActions';
import InsightsCard from '../components/InsightsCard';

interface DashboardStats {
  treinamentos: number;
  turmas: number;
  alunos: number;
  recursos: number;
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [, setStats] = useState<DashboardStats>({
    treinamentos: 0,
    turmas: 0,
    alunos: 0,
    recursos: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [showAllActivities, setShowAllActivities] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

        const [treinamentosRes, turmasRes, alunosRes, recursosRes] = await Promise.all([
          treinamentosAPI.list(),
          turmasAPI.list(),
          alunosAPI.list(),
          recursosAPI.list()
        ]);

        setStats({
          treinamentos: treinamentosRes.length,
          turmas: turmasRes.length,
          alunos: alunosRes.length,
          recursos: recursosRes.length
        });

        // Simular atividades recentes
        const activities: ActivityItem[] = [
          {
            id: '1',
            type: 'aluno',
            action: 'Novo aluno cadastrado',
            description: 'João Silva foi adicionado ao sistema',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            status: 'success'
          },
          {
            id: '2',
            type: 'turma',
            action: 'Turma iniciada',
            description: 'Turma de Segurança Básica começou hoje',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            status: 'info'
          }
        ];
        setRecentActivities(activities);

      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
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
              Acompanhe seu progresso e acesse seus recursos de aprendizado
            </p>
          </div>

          {/* Layout Principal */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
            {/* Coluna Principal */}
            <div className="xl:col-span-2 space-y-4 sm:space-y-6">
              {/* Atividade Recente */}
              <ActivityCard activities={recentActivities} showAll={showAllActivities} onToggle={() => setShowAllActivities(!showAllActivities)} />

              {/* Insights */}
              <InsightsCard />
            </div>

            {/* Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Ações Rápidas */}
              <QuickActions />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;