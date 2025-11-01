import React, { useState } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { FloatingMenu } from './FloatingMenu';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Novo estado para a sidebar do desktop
  const { theme, toggleTheme } = useTheme();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden transition-colors duration-300">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 dark:from-blue-600/10 dark:to-purple-600/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 dark:from-purple-600/10 dark:to-pink-600/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-300/10 to-purple-300/10 dark:from-blue-700/5 dark:to-purple-700/5 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm transition-colors duration-300 flex-shrink-0">
        <div className="w-full max-w-none mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {/* Hamburger Button in Header (left corner) */}
              <button
                onClick={toggleSidebar} // Sempre alterna a sidebar no desktop
                className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:opacity-90 shadow-md transition-colors"
                aria-label={isSidebarOpen ? 'Ocultar menu' : 'Abrir menu'}
              >
                {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="w-6 h-6 bg-white rounded-lg"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  StrataSec
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Botão de alternância de tema */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white hover:opacity-90 shadow-md transition-colors"
                aria-label="Alternar tema"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              {/* Indicador Sistema Online */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300 font-medium hidden sm:inline">Sistema Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex relative z-10 overflow-hidden">
        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-30"
            onClick={toggleMobileMenu}
          />
        )}

        {/* Sidebar */}
        <div className={`sidebar-responsive ${isSidebarOpen ? '' : 'sidebar-closed-desktop'} ${isMobileMenuOpen ? '' : 'sidebar-hidden-mobile'}`}>
          <FloatingMenu onNavigate={() => setIsMobileMenuOpen(false)} />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-2 sm:p-4 md:p-6">
            {children}
          </div>
        </main>
      </div>

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