import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  color: string;
  onClick?: () => void;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  trendValue, 
  color, 
  onClick 
}) => (
  <div
    className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4 lg:p-6 hover:shadow-md transition-all duration-200 w-full ${
      onClick ? 'cursor-pointer hover:scale-105' : ''
    }`}
    onClick={onClick}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 truncate">{title}</p>
        <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
          <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
          {trend && trendValue !== undefined && (
            <div className={`flex items-center text-xs sm:text-sm font-medium ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {trend === 'up' ? <ArrowUp size={12} className="sm:w-4 sm:h-4" /> : trend === 'down' ? <ArrowDown size={12} className="sm:w-4 sm:h-4" /> : null}
              <span>{Math.abs(trendValue)}%</span>
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">{subtitle}</p>
        )}
      </div>
      <div className={`p-2 sm:p-3 rounded-lg ${color} flex-shrink-0`}>
        <div className="w-5 h-5 sm:w-6 sm:h-6 text-white">
          {icon}
        </div>
      </div>
    </div>
  </div>
);

export default MetricCard;