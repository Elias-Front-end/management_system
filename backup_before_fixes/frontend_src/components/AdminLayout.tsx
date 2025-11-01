import React from 'react';
import { AdminHeader } from './AdminHeader';
import { useTheme } from '../contexts/ThemeContext';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, subtitle }) => {
  const { theme: _theme } = useTheme();

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden transition-colors duration-300">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-600/10 dark:to-purple-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-600/10 dark:to-pink-600/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-300/10 to-purple-300/10 dark:from-blue-700/5 dark:to-purple-700/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Header */}
      <AdminHeader title={title} subtitle={subtitle} />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative z-10">
        <div className="h-full overflow-y-auto p-2 sm:p-4 md:p-6">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50 transition-colors duration-300 flex-shrink-0">
        <div className="w-full max-w-none mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <p>&copy; 2024 StrataSec. Todos os direitos reservados.</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Suporte</a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Documentação</a>
              <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contato</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdminLayout;