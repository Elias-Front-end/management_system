import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, Users, GraduationCap, FileText,
  Activity,
  Target, Award, Eye
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { treinamentosAPI, turmasAPI, alunosAPI, recursosAPI } from '../services/api';

interface DashboardStats {
  treinamentos: number;
  turmas: number;
  alunos: number;
  recursos: number;
}

interface ActivityItem {
  id: string;
  type: 'aluno' | 'turma' | 'treinamento' | 'recurso';
  action: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'info';
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
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

  // Componente de Atividade Recente - Melhorado para mobile
  const ActivityCard: React.FC<{ activities: ActivityItem[]; showAll: boolean; onToggle: () => void }> = ({ 
    activities, showAll, onToggle 
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <Activity size={18} className="sm:w-5 sm:h-5 text-blue-600" />
          Atividade Recente
        </h3>
        {activities.length > 3 && (
          <button
            onClick={onToggle}
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            <Eye size={14} />
            {showAll ? 'Ver menos' : 'Ver todas'}
          </button>
        )}
      </div>
      <div className="space-y-3 sm:space-y-4">
        {activities.length > 0 ? (
          activities.slice(0, showAll ? activities.length : 3).map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <div className={`p-1.5 rounded-full flex-shrink-0 ${
                activity.status === 'success' ? 'bg-green-100 text-green-600' :
                activity.status === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {activity.type === 'aluno' ? <Users size={14} /> :
                 activity.type === 'turma' ? <GraduationCap size={14} /> :
                 activity.type === 'treinamento' ? <BookOpen size={14} /> :
                 <FileText size={14} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.action}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {activity.timestamp.toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Activity size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhuma atividade recente</p>
          </div>
        )}
      </div>
    </div>
  );

  // Componente de Ações Rápidas - Otimizado para responsividade
  const QuickActions: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
        <Target size={18} className="sm:w-5 sm:h-5 text-purple-600" />
        Ações Rápidas
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <button
          onClick={() => navigate('/recursos')}
          className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group w-full text-left"
        >
          <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg text-white group-hover:scale-110 transition-transform flex-shrink-0">
            <FileText size={14} className="sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-blue-900 dark:text-blue-100 text-xs sm:text-sm truncate">Meus Recursos</p>
            <p className="text-xs text-blue-600 dark:text-blue-300">Acessar</p>
          </div>
        </button>
        <button
          onClick={() => navigate('/turmas')}
          className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group w-full text-left"
        >
          <div className="p-1.5 sm:p-2 bg-green-600 rounded-lg text-white group-hover:scale-110 transition-transform flex-shrink-0">
            <GraduationCap size={14} className="sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-green-900 dark:text-green-100 text-xs sm:text-sm truncate">Minhas Turmas</p>
            <p className="text-xs text-green-600 dark:text-green-300">Ver</p>
          </div>
        </button>
      </div>
    </div>
  );

  // Componente de Insights - Ajustado para melhor proporção
  const InsightsCard: React.FC = () => (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-8 min-h-[24rem]">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
        <Award size={24} className="text-yellow-600" />
        Insights e Recomendações
      </h3>
      <div className="space-y-5">
        <div className="flex items-start gap-4 p-4 bg-white/60 dark:bg-gray-800/60 rounded-lg">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
            <BookOpen size={16} />
          </div>
          <div>
            <p className="text-base font-medium text-gray-900 dark:text-white">
              Continue Aprendendo
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Explore os recursos disponíveis e acompanhe seu progresso nas turmas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

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