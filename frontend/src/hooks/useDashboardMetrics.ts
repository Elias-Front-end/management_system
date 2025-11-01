import { useMemo } from 'react';
import type { Aluno, Turma } from '../types';

interface Stats {
  treinamentos: number;
  turmas: number;
  alunos: number;
  recursos: number;
}

interface DashboardMetrics {
  alunosEsteMes: number;
  turmasAtivas: number;
  crescimentoAlunos: number;
  mediaAlunosPorTurma: number;
  utilizacaoRecursos: number;
}

export const useDashboardMetrics = (
  alunosLista: Aluno[], 
  turmasLista: Turma[], 
  stats: Stats
): DashboardMetrics => {
  return useMemo(() => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    // Alunos cadastrados este mês
    const alunosEsteMes = alunosLista.filter(aluno => {
      const created = new Date(aluno.created_at);
      return created.getMonth() === thisMonth && created.getFullYear() === thisYear;
    }).length;

    // Turmas ativas (com data de início recente)
    const turmasAtivas = turmasLista.filter(turma => {
      const inicio = new Date(turma.data_inicio);
      const diffTime = now.getTime() - inicio.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 90; // Turmas iniciadas nos últimos 90 dias
    }).length;

    // Taxa de crescimento mensal
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    const alunosUltimoMes = alunosLista.filter(aluno => {
      const created = new Date(aluno.created_at);
      return created.getMonth() === lastMonth && created.getFullYear() === lastMonthYear;
    }).length;

    const crescimentoAlunos = alunosUltimoMes > 0
      ? ((alunosEsteMes - alunosUltimoMes) / alunosUltimoMes * 100)
      : alunosEsteMes > 0 ? 100 : 0;

    return {
      alunosEsteMes,
      turmasAtivas,
      crescimentoAlunos: Number(crescimentoAlunos.toFixed(1)),
      mediaAlunosPorTurma: turmasLista.length > 0 ? Number((alunosLista.length / turmasLista.length).toFixed(1)) : 0,
      utilizacaoRecursos: Number(((stats.recursos / Math.max(stats.treinamentos, 1)) * 100).toFixed(1))
    };
  }, [alunosLista, turmasLista, stats]);
};