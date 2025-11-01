# 📝 CHANGELOG

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.1.0] - 2025-01-27

### ✅ Corrigido
- **CRÍTICO**: Resolvido erro "CSRF Failed: CSRF token missing" que impedia login e operações POST/PUT/PATCH/DELETE
- Configurado `CSRF_COOKIE_HTTPONLY = False` no backend para permitir acesso JavaScript ao token
- Implementado interceptor automático no Axios para incluir CSRF token em requisições
- Corrigida inicialização do CSRF token no componente App.tsx

### 🔧 Alterado
- **Backend**: Atualizado `settings.py` com configurações CSRF corretas
- **Frontend**: Melhorado `api.ts` com função automática de obtenção de CSRF token
- **Frontend**: Modificado `App.tsx` para inicialização assíncrona do CSRF

### 📚 Documentação
- Atualizado `DEPLOY_GUIDE.md` com seção específica sobre configurações CSRF
- Adicionado troubleshooting detalhado para problemas de CSRF
- Atualizado `README.md` com seção de atualizações recentes
- Criado `CHANGELOG.md` para rastreamento de mudanças

### 🧪 Testes
- Adicionados comandos de teste para verificação de CSRF endpoint
- Documentados procedimentos de validação de CSRF token no browser

## [1.0.0] - 2025-01-26

### ✨ Adicionado
- Sistema completo de gestão de sala de aula
- Backend Django com Django REST Framework
- Frontend React com TypeScript
- Autenticação JWT
- Sistema de upload e reprodução de recursos
- Painel administrativo completo
- Painel do aluno com controle de acesso
- Regras de negócio para acesso prévio e draft
- Deploy com Docker e docker-compose
- Documentação completa

### 🏗️ Arquitetura
- **Backend**: Django 4.2.16 + DRF 3.14.0
- **Frontend**: React 19.1.1 + TypeScript 5.7.2 + Vite 6.0.7
- **Banco**: SQLite (dev) / PostgreSQL (prod)
- **Estilo**: TailwindCSS 3.4.17
- **Estado**: Zustand 5.0.8
- **HTTP**: Axios 1.12.2

### 📋 Funcionalidades
- Gestão de Treinamentos, Turmas, Recursos, Alunos e Matrículas
- Upload de vídeos, PDFs e arquivos ZIP
- Player de vídeo integrado
- Sistema de permissões baseado em datas
- Interface responsiva com tema dark/light
- API REST completa com documentação

---

## Tipos de Mudanças
- `✨ Adicionado` para novas funcionalidades
- `🔧 Alterado` para mudanças em funcionalidades existentes
- `❌ Depreciado` para funcionalidades que serão removidas
- `🗑️ Removido` para funcionalidades removidas
- `✅ Corrigido` para correção de bugs
- `🔒 Segurança` para vulnerabilidades corrigidas
- `📚 Documentação` para mudanças na documentação
- `🧪 Testes` para adição ou correção de testes