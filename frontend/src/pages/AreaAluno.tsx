import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { GraduationCap, Calendar, Users, ArrowRight } from 'lucide-react';
import { alunosAPI } from '../services/api';
import type { Turma } from '../types';
import StudentHeader from '../components/StudentHeader';

export const AreaAluno: React.FC = () => {
  const { user, aluno: alunoFromStore } = useAuthStore();
  const navigate = useNavigate();

  // Estados
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (!alunoFromStore?.id) {
          throw new Error('Dados do aluno não encontrados');
        }

        // Buscar apenas turmas do aluno
        const turmasResponse = await alunosAPI.turmas(alunoFromStore.id);
        setTurmas(turmasResponse);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [alunoFromStore]);

  const handleTurmaClick = (turma: Turma) => {
    navigate(`/turma/${turma.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <StudentHeader />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <StudentHeader />

      <div className="container mx-auto px-4 py-8">
        {/* Seção de Boas-vindas */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Minha Área do Aluno
          </h1>
          <p className="text-slate-300">
            Bem-vindo(a), {user?.first_name}! Aqui você encontra suas turmas e recursos de aprendizado.
          </p>
        </div>

        {/* Seção de Turmas */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Minhas Turmas</h2>
          </div>

          {turmas.length === 0 ? (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-8 text-center">
              <GraduationCap className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300 text-lg">Nenhuma turma encontrada</p>
              <p className="text-slate-400 text-sm mt-2">
                Entre em contato com a administração para verificar suas matrículas.
              </p>
            </div>
          ) : (
            <div className="responsive-cards-grid">
              {turmas.map((turma) => (
                <div
                  key={turma.id}
                  onClick={() => handleTurmaClick(turma)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTurmaClick(turma);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-labelledby={`turma-${turma.id}-title`}
                  aria-describedby={`turma-${turma.id}-dates`}
                  className="responsive-card bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6 hover:border-purple-500 transition-all duration-300 cursor-pointer group hover:bg-slate-800/70"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3
                        id={`turma-${turma.id}-title`}
                        className="text-lg font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors"
                      >
                        {turma.treinamento_nome}
                      </h3>
                      <div
                        id={`turma-${turma.id}-dates`}
                        className="flex items-center gap-2 text-sm text-slate-400 mb-2"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(turma.data_inicio).toLocaleDateString('pt-BR')} - {' '}
                          {new Date(turma.data_conclusao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Users className="w-4 h-4" />
                        <span>Turma {turma.nome}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
                  </div>

                  <div className="pt-4 border-t border-slate-700">
                    <p className="text-sm text-slate-300">
                      Clique para ver recursos e materiais de estudo
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AreaAluno;