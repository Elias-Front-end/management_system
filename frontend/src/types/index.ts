export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
}

export interface Treinamento {
  id: string;
  nome: string;
  descricao: string;
  categoria?: string;
  duracao_horas?: number;
  nivel?: 'iniciante' | 'intermediario' | 'avancado';
  turmas?: Turma[];
  created_at: string;
  updated_at: string;
}

export interface Turma {
  id: string;
  nome: string;
  treinamento: string;
  treinamento_nome: string;
  data_inicio: string;
  data_conclusao: string;
  link_acesso?: string | null;
  total_alunos: number;
  created_at: string;
  updated_at: string;
}

export interface Recurso {
  id: string;
  nome_recurso: string;
  titulo?: string; // Alias para nome_recurso
  descricao_recurso: string | null;
  descricao?: string; // Alias para descricao_recurso
  turma: string;
  turma_nome: string;
  treinamento?: string;
  // Tipos de recurso suportados pelo backend
  tipo_recurso: 'video' | 'arquivo_pdf' | 'arquivo_zip';
  tipo?: 'video' | 'arquivo_pdf' | 'arquivo_zip';
  arquivo?: string;        // caminho do arquivo armazenado
  arquivo_url?: string;    // URL absoluta para download/visualização
  url?: string;           // Alias para arquivo_url
  acesso_previo: boolean;
  draft: boolean;
  pode_acessar?: boolean;  // usado em listagem do aluno
  created_at: string;
  updated_at: string;
}

export interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  total_matriculas: number;
  created_at: string;
  updated_at: string;
}

export interface Matricula {
  id: string;
  aluno: string;
  aluno_nome: string;
  turma: string;
  turma_nome: string;
  treinamento_nome: string;
  data_matricula: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  is_admin: boolean;
  aluno: Aluno | null;
  message: string;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}