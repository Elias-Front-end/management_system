import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import api from './services/api';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import Notifications from './components/Notifications';
import InactivityWrapper from './components/InactivityWrapper';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Treinamentos } from './pages/Treinamentos';
import { Turmas } from './pages/Turmas';
import { Recursos } from './pages/Recursos';
import { Alunos } from './pages/Alunos';
import { Matriculas } from './pages/Matriculas';
import { AreaAluno } from './pages/AreaAluno';
import TurmaDetalhes from './pages/TurmaDetalhes';
import { TurmaGrid } from './pages/TurmaGrid';
import { TreinamentoGrid } from './pages/TreinamentoGrid';

// Redirect Based on Profile Component
const RedirectBasedOnProfile: React.FC = () => {
  const { isAdmin } = useAuthStore();

  if (isAdmin) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/area-aluno" replace />;
  }
};

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Admin Route Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/area-aluno" replace />;
  }

  return <>{children}</>;
};

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // Ensure CSRF cookie is set for subsequent POST/PUT/DELETE requests
    api.get('/csrf/').catch(() => {
      // Ignore errors; CSRF cookie will be set when available
    });
    checkAuth();
  }, [checkAuth]);

  return (
    <Router>
      <InactivityWrapper>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <RedirectBasedOnProfile />
                  </Layout>
                </ProtectedRoute>
              }
            />

          <Route
            path="/dashboard"
            element={
              <AdminRoute>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </AdminRoute>
            }
          />

          {/* Student Area - only for non-admin users */}
          <Route
            path="/area-aluno"
            element={
              <ProtectedRoute>
                <AreaAluno />
              </ProtectedRoute>
            }
          />

          {/* Turma Details - only for non-admin users */}
          <Route
            path="/turma/:turmaId"
            element={
              <ProtectedRoute>
                <TurmaDetalhes />
              </ProtectedRoute>
            }
          />

          {/* Turma Grid - admin route for managing trainings in a specific class */}
          <Route
            path="/turmas/:turmaId/grid"
            element={
              <AdminRoute>
                <AdminLayout title="Gerenciar Turma">
                  <TurmaGrid />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/treinamentos/:treinamentoId/grid"
            element={
              <AdminRoute>
                <AdminLayout title="Gerenciar Treinamento">
                  <TreinamentoGrid />
                </AdminLayout>
              </AdminRoute>
            }
          />

          {/* Admin Only Routes */}
          <Route
            path="/treinamentos"
            element={
              <AdminRoute>
                <AdminLayout title="Treinamentos">
                  <Treinamentos />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/turmas"
            element={
              <AdminRoute>
                <AdminLayout title="Turmas">
                  <Turmas />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/recursos"
            element={
              <AdminRoute>
                <AdminLayout title="Recursos">
                  <Recursos />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/alunos"
            element={
              <AdminRoute>
                <AdminLayout title="Alunos">
                  <Alunos />
                </AdminLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/matriculas"
            element={
              <AdminRoute>
                <AdminLayout title="Matrículas">
                  <Matriculas />
                </AdminLayout>
              </AdminRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Global Notifications - mounted once to cover all routes including Login */}
        <Notifications />
      </div>
    </InactivityWrapper>
  </Router>
  );
}

export default App;
