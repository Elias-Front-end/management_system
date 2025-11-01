import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { BookOpen, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<'aluno' | 'admin' | ''>('');
  const navigate = useNavigate();
  
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const { notifySuccess, notifyError, notifyWarning } = useNotificationStore();

  // Call hooks unconditionally before any early return to avoid
  // "Rendered fewer hooks than expected" errors
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      notifyWarning('Informe usuário e senha', 'Campos obrigatórios');
      return;
    }

    if (!selectedProfile) {
      notifyWarning('Selecione o tipo de perfil', 'Campo obrigatório');
      return;
    }

    try {
      await login({ username: username.trim(), password });
      notifySuccess('Login realizado com sucesso');
      
      // Redirecionamento baseado na seleção do usuário
      if (selectedProfile === 'admin') {
        navigate('/dashboard'); // Admin vai para o dashboard
      } else {
        navigate('/area-aluno'); // Aluno vai para a área do aluno
      }
    } catch (error) {
      // Store sets the error; also show a toast for visibility
      notifyError('Erro ao fazer login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4">
            <BookOpen className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">StrataSec</h1>
          <p className="text-gray-600">Sistema de Gestão de Sala de Aula</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-red-800 font-medium">Erro no login</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Usuário
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Digite seu usuário"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                  placeholder="Digite sua senha"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Profile Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Perfil
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    id="profile-aluno"
                    name="profile"
                    type="radio"
                    value="aluno"
                    checked={selectedProfile === 'aluno'}
                    onChange={(e) => setSelectedProfile(e.target.value as 'aluno')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    disabled={isLoading}
                  />
                  <label htmlFor="profile-aluno" className="ml-3 block text-sm font-medium text-gray-700">
                    Aluno
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="profile-admin"
                    name="profile"
                    type="radio"
                    value="admin"
                    checked={selectedProfile === 'admin'}
                    onChange={(e) => setSelectedProfile(e.target.value as 'admin')}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    disabled={isLoading}
                  />
                  <label htmlFor="profile-admin" className="ml-3 block text-sm font-medium text-gray-700">
                    Administrador
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !username.trim() || !password.trim() || !selectedProfile}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-700 hover:to-primary-800 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Entrando...</span>
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Credenciais de demonstração:</p>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Admin:</strong> admin / admin123</p>
              <p className="text-xs text-gray-500 mt-2">
                <strong>Dica:</strong> Selecione o tipo de perfil correspondente às suas credenciais
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            © 2024 StrataSec. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};