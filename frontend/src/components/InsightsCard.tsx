import React from 'react';
import { Award, BookOpen } from 'lucide-react';

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

export default InsightsCard;