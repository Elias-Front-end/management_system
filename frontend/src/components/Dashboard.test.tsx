import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { Dashboard } from '../pages/Dashboard'

import { useAuthStore } from '../store/authStore'

// Mock do store
vi.mock('../store/authStore')

// Mock do react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  )
}

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar dashboard do admin', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      login: vi.fn(),
      isLoading: false,
      error: null,
      user: { id: 1, username: 'admin', is_staff: true },
      isAuthenticated: true,
      logout: vi.fn(),
      clearError: vi.fn(),
      checkAuth: vi.fn(),
    })

    renderDashboard()
    
    expect(screen.getByText(/painel administrativo/i)).toBeInTheDocument() as unknown as void
    expect(screen.getByText(/treinamentos/i)).toBeInTheDocument()
    expect(screen.getByText(/turmas/i)).toBeInTheDocument()
    expect(screen.getByText(/alunos/i)).toBeInTheDocument()
  })

  it('deve renderizar dashboard do aluno', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      login: vi.fn(),
      isLoading: false,
      error: null,
      user: { id: 2, username: 'aluno1', is_staff: false },
      isAuthenticated: true,
      logout: vi.fn(),
      clearError: vi.fn(),
      checkAuth: vi.fn(),
    })

    renderDashboard()
    
    expect(screen.getByText(/meus treinamentos/i)).toBeInTheDocument()
    expect(screen.getByText(/minhas turmas/i)).toBeInTheDocument()
  })

  it('deve exibir botão de logout', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      login: vi.fn(),
      isLoading: false,
      error: null,
      user: { id: 1, username: 'admin', is_staff: true },
      isAuthenticated: true,
      logout: vi.fn(),
      clearError: vi.fn(),
      checkAuth: vi.fn(),
    })

    renderDashboard()
    
    expect(screen.getByRole('button', { name: /sair/i })).toBeInTheDocument()
  })
})