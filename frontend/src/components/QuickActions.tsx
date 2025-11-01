import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, FileText, GraduationCap } from 'lucide-react';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
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
};

export default QuickActions;