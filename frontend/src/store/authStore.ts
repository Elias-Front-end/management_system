import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginRequest, Aluno, LoginResponse } from '../types';
import { authAPI } from '../services/api';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  aluno: Aluno | null; // Dados do perfil do aluno
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAdmin: false,
      aluno: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          set({
            user: response.user,
            isAdmin: response.is_admin,
            aluno: response.aluno,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login';
          set({
            user: null,
            isAdmin: false,
            aluno: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Erro ao fazer logout:', error);
        } finally {
          // Limpar estado da aplicação
          set({
            user: null,
            isAdmin: false,
            aluno: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });

          // Limpar dados sensíveis do localStorage/sessionStorage
          try {
            // Limpar outros dados que possam conter informações sensíveis
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (key.includes('auth') || key.includes('user') || key.includes('session'))) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));

            // Limpar sessionStorage também
            sessionStorage.clear();
          } catch (storageError) {
            console.warn('Erro ao limpar storage:', storageError);
          }
        }
      },

      checkAuth: async () => {
        if (get().isAuthenticated) {
          set({ isLoading: true });
          try {
            const response = (await authAPI.me()) as unknown as LoginResponse;
            set({ 
              user: response.user,
              isAdmin: response.is_admin,
              aluno: response.aluno,
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
          } catch {
            set({ 
              user: null, 
              isAdmin: false,
              aluno: null,
              isAuthenticated: false, 
              isLoading: false,
              error: null
            });
          }
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      // Persistir apenas os dados essenciais de autenticação
      partialize: (state) => ({
        user: state.user,
        isAdmin: state.isAdmin,
        aluno: state.aluno,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);