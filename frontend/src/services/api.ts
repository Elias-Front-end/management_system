import axios from 'axios';
import type { 
  Treinamento, Turma, Recurso, Aluno, Matricula, User,
  LoginRequest, LoginResponse 
} from '../types';

// Prefer relative API URL during development so Vite proxy can handle requests
// Allows switching to explicit URL via environment variable when needed
const API_BASE_URL = (import.meta as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? '/api';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Helper to normalize DRF paginated responses to arrays
function unwrapArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object' && 'results' in data && Array.isArray((data as { results: unknown }).results)) {
    return (data as { results: T[] }).results;
  }
  return [] as T[];
}

// Auth API
export const authAPI = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    api.post('/auth/login/', data).then(res => res.data),
  
  logout: (): Promise<{ message: string }> =>
    api.post('/auth/logout/').then(res => res.data),
  
  me: (): Promise<User> =>
    api.get('/auth/me/').then(res => res.data),
};

// Treinamentos API
export const treinamentosAPI = {
  list: (search?: string): Promise<Treinamento[]> =>
    api.get('/treinamentos/', { params: { search } }).then(res => unwrapArray<Treinamento>(res.data)),
  
  get: (id: string): Promise<Treinamento> =>
    api.get(`/treinamentos/${id}/`).then(res => res.data),
  
  create: (data: Partial<Treinamento>): Promise<Treinamento> =>
    api.post('/treinamentos/', data).then(res => res.data),
  
  update: (id: string, data: Partial<Treinamento>): Promise<Treinamento> =>
    api.put(`/treinamentos/${id}/`, data).then(res => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/treinamentos/${id}/`).then(res => res.data),
};

// Turmas API
export const turmasAPI = {
  list: (treinamento?: string, search?: string): Promise<Turma[]> =>
    api.get('/turmas/', { params: { treinamento, search } }).then(res => unwrapArray<Turma>(res.data)),
  
  get: (id: string): Promise<Turma> =>
    api.get(`/turmas/${id}/`).then(res => res.data),
  
  create: (data: Partial<Turma>): Promise<Turma> =>
    api.post('/turmas/', data).then(res => res.data),
  
  update: (id: string, data: Partial<Turma>): Promise<Turma> =>
    api.put(`/turmas/${id}/`, data).then(res => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/turmas/${id}/`).then(res => res.data),
  
  recursos: (id: string): Promise<Recurso[]> =>
    api.get(`/turmas/${id}/recursos/`).then(res => res.data),
  
  alunos: (id: string): Promise<Aluno[]> =>
    api.get(`/turmas/${id}/alunos/`).then(res => res.data),
};

// Recursos API
export const recursosAPI = {
  list: (turma?: string, tipo?: string, search?: string): Promise<Recurso[]> =>
    api.get('/recursos/', { params: { turma, tipo, search } }).then(res => unwrapArray<Recurso>(res.data)),
  
  get: (id: string): Promise<Recurso> =>
    api.get(`/recursos/${id}/`).then(res => res.data),
  
  create: (data: FormData): Promise<Recurso> =>
    api.post('/recursos/', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data),
  
  update: (id: string, data: FormData): Promise<Recurso> =>
    api.patch(`/recursos/${id}/`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/recursos/${id}/`).then(res => res.data),
};

// Alunos API
export const alunosAPI = {
  list: (search?: string): Promise<Aluno[]> =>
    api.get('/alunos/', { params: { search } }).then(res => unwrapArray<Aluno>(res.data)),
  
  get: (id: string): Promise<Aluno> =>
    api.get(`/alunos/${id}/`).then(res => res.data),
  
  create: (data: Partial<Aluno>): Promise<Aluno> =>
    api.post('/alunos/', data).then(res => res.data),
  
  update: (id: string, data: Partial<Aluno>): Promise<Aluno> =>
    api.put(`/alunos/${id}/`, data).then(res => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/alunos/${id}/`).then(res => res.data),
  
  turmas: (id: string): Promise<Turma[]> =>
    api.get(`/alunos/${id}/turmas/`).then(res => res.data),
  
  recursosDisponiveis: (id: string): Promise<Recurso[]> =>
    api.get(`/alunos/${id}/recursos_disponiveis/`).then(res => res.data),
};

// Matrículas API
export const matriculasAPI = {
  list: (aluno?: string, turma?: string): Promise<Matricula[]> =>
    api.get('/matriculas/', { params: { aluno, turma } }).then(res => unwrapArray<Matricula>(res.data)),
  
  get: (id: string): Promise<Matricula> =>
    api.get(`/matriculas/${id}/`).then(res => res.data),
  
  create: (data: Partial<Matricula>): Promise<Matricula> =>
    api.post('/matriculas/', data).then(res => res.data),
  
  update: (id: string, data: Partial<Matricula>): Promise<Matricula> =>
    api.put(`/matriculas/${id}/`, data).then(res => res.data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/matriculas/${id}/`).then(res => res.data),
};

export default api;