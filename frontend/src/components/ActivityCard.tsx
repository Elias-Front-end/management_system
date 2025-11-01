import React from 'react';
import { Activity, Eye, Users, GraduationCap, BookOpen, FileText } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'aluno' | 'turma' | 'treinamento' | 'recurso';
  action: string;
  description: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'info';
}

interface ActivityCardProps {
  activities: ActivityItem[];
  showAll: boolean;
  onToggle: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activities, showAll, onToggle }) => (
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

export default ActivityCard;
export type { ActivityItem };