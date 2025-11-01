import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, BookOpen, Users, GraduationCap,
  FileText, Settings, LogOut, User
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <Home size={20} />,
    path: '/',
  },
  {
    id: 'treinamentos',
    label: 'Treinamentos',
    icon: <BookOpen size={20} />,
    path: '/treinamentos',
    adminOnly: true,
  },
  {
    id: 'turmas',
    label: 'Turmas',
    icon: <GraduationCap size={20} />,
    path: '/turmas',
    adminOnly: true,
  },
  {
    id: 'alunos',
    label: 'Alunos',
    icon: <Users size={20} />,
    path: '/alunos',
    adminOnly: true,
  },
  {
    id: 'recursos',
    label: 'Recursos',
    icon: <FileText size={20} />,
    path: '/recursos',
    adminOnly: true,
  },
  {
    id: 'matriculas',
    label: 'Matrículas',
    icon: <User size={20} />,
    path: '/matriculas',
    adminOnly: true,
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: <Settings size={20} />,
    path: '/configuracoes',
  },
  {
    id: 'area-aluno',
    label: 'Área do Aluno',
    icon: <GraduationCap size={20} />,
    path: '/area-aluno',
    adminOnly: false, // Apenas para não-administradores
  },
];

interface FloatingMenuProps {
  onNavigate?: () => void;
  isOpen: boolean; // Adicionado
}

export const FloatingMenu: React.FC<FloatingMenuProps> = ({ onNavigate, isOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredMenuItems = menuItems.filter(item => {
    // Se o item é apenas para admin e o usuário não é admin, não mostrar
    if (item.adminOnly === true && !user?.is_staff) {
      return false;
    }
    // Se o item é apenas para não-admin e o usuário é admin, não mostrar
    if (item.adminOnly === false && user?.is_staff) {
      return false;
    }
    // Mostrar todos os outros itens (sem adminOnly ou adminOnly undefined)
    return true;
  });

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Floating Menu */}
      <div
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-gradient-to-br from-blue-600 to-purple-700 text-white shadow-xl transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="floating-menu overflow-hidden h-full flex flex-col">
          {/* Header */}
          <div className="p-2 border-b border-white/20">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                <div className="w-4 h-4 bg-white rounded-sm"></div>
              </div>
            </div>
          </div>

        {/* User Info */}
        <div className="p-2 border-b border-white/20">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/30">
              <User className="text-white" size={16} />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-1 space-y-1">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => {
                onNavigate?.();
              }}
              className={`
                flex items-center justify-center p-2 rounded-xl transition-all duration-300
                ${isActive(item.path)
                  ? 'text-gray-900 bg-gray-900/10 shadow-lg backdrop-blur-sm dark:text-white dark:bg-white/30'
                  : 'text-gray-700 hover:text-gray-900 hover:shadow-md dark:text-white/80 dark:hover:text-white'
                }
                group relative
              `}
              style={{
                backgroundColor: !isActive(item.path) ? 'rgba(255, 255, 255, 0)' : undefined
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.06)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0)';
                }
              }}
            >
              <div className={`
                transition-transform duration-200
                ${isActive(item.path) ? 'scale-110' : 'group-hover:scale-105'}
              `}>
                {item.icon}
              </div>

              {/* Tooltip */}
              <div className="absolute left-full ml-2 px-2 py-1 bg-black/80 backdrop-blur-sm text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                {item.label}
              </div>
            </Link>
          ))}
        </nav>

        </div>

        {/* Footer Actions */}
        <div className="p-1 border-t border-white/20 space-y-1">
          <button
            onClick={() => {
              handleLogout();
              onNavigate?.();
            }}
            className="w-full flex items-center justify-center p-2 rounded-xl text-red-600 hover:bg-red-500/10 hover:text-red-700 transition-all duration-300 group relative dark:text-red-300 dark:hover:bg-red-500/20 dark:hover:text-red-200"
          >
            <LogOut size={20} />

            <div className="absolute left-full ml-2 px-2 py-1 bg-black/80 backdrop-blur-sm text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10 shadow-lg">
              Sair
            </div>
          </button>
        </div>
      </div>
    </>
  );
};