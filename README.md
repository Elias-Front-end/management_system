# StrataSec - Sistema de Gestão de Sala de Aula

![StrataSec Logo](https://img.shields.io/badge/StrataSec-Management%20System-blue?style=for-the-badge)
![Django](https://img.shields.io/badge/Django-4.2.16-green?style=flat-square)
![React](https://img.shields.io/badge/React-19.1.1-blue?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-blue?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.10+-yellow?style=flat-square)

Sistema web completo para gestão de treinamentos e turmas, permitindo que administradores gerenciem conteúdos educacionais e alunos acessem materiais de forma controlada e segura.

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Tecnologias](#-tecnologias)
- [Requisitos do Sistema](#-requisitos-do-sistema)
- [Configuração do Ambiente](#-configuração-do-ambiente)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Estrutura do Banco de Dados](#-estrutura-do-banco-de-dados)
- [Testes Automatizados](#-testes-automatizados)
- [Execução em Desenvolvimento](#-execução-em-desenvolvimento)
- [Deploy em Produção](#-deploy-em-produção)
- [API Endpoints](#-api-endpoints)
- [Funcionalidades](#-funcionalidades)
- [Troubleshooting](#-troubleshooting)
- [IDEs Recomendadas](#-ides-recomendadas)

## 🎯 Visão Geral

O StrataSec é uma plataforma educacional que oferece:

- **Painel Administrativo**: Gestão completa de treinamentos, turmas, recursos, alunos e matrículas
- **Painel do Aluno**: Acesso controlado a materiais educacionais baseado em cronogramas e permissões
- **Sistema de Recursos**: Upload e reprodução de vídeos, PDFs e arquivos ZIP
- **Controle de Acesso**: Regras de negócio para acesso prévio e controle de draft
- **Interface Moderna**: Design responsivo com tema dark/light

## 🚀 Tecnologias

### Backend
- **Django 4.2.16** - Framework web Python
- **Django REST Framework 3.14.0** - API REST
- **SQLite** (desenvolvimento) / **PostgreSQL** (produção)
- **Python 3.10+**
- **python-decouple** - Gerenciamento de variáveis de ambiente

### Frontend
- **React 19.1.1** - Biblioteca JavaScript
- **TypeScript 5.7.2** - Tipagem estática
- **Vite 6.0.7** - Build tool e dev server
- **TailwindCSS 3.4.17** - Framework CSS
- **React Router DOM 7.9.4** - Roteamento
- **Zustand 5.0.8** - Gerenciamento de estado
- **Axios 1.12.2** - Cliente HTTP
- **Lucide React** - Ícones

## 💻 Requisitos do Sistema

### Windows
- **Sistema Operacional**: Windows 10 ou superior
- **Python**: 3.10.0 ou superior
- **Node.js**: 18.0.0 ou superior
- **npm**: 9.0.0 ou superior
- **Git**: 2.30.0 ou superior
- **PowerShell**: 5.1 ou superior

### Linux (Ubuntu/Debian)
- **Sistema Operacional**: Ubuntu 20.04+ ou Debian 11+
- **Python**: 3.10.0 ou superior
- **Node.js**: 18.0.0 ou superior
- **npm**: 9.0.0 ou superior
- **Git**: 2.30.0 ou superior

### Verificar Versões Instaladas

```bash
# Verificar Python
python --version
# ou no Linux
python3 --version

# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar Git
git --version
```

### Instalação de Dependências do Sistema

#### Windows
```powershell
# Instalar Python (via Microsoft Store ou python.org)
# Instalar Node.js (via nodejs.org)
# Instalar Git (via git-scm.com)

# Verificar instalações
python --version
node --version
npm --version
git --version
```

#### Linux (Ubuntu/Debian)
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Python 3.10+
sudo apt install python3 python3-pip python3-venv -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Git
sudo apt install git -y

# Verificar instalações
python3 --version
node --version
npm --version
git --version
```

## 🛠 Configuração do Ambiente

### 1. Clone do Repositório

```bash
git clone <repository-url>
cd management_system
```

### 2. Configuração do Backend (Django)

#### Windows
```powershell
# Navegar para o diretório do backend
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Copiar arquivo de configuração
copy .env.example .env

# Executar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Coletar arquivos estáticos
python manage.py collectstatic --noinput
```

#### Linux
```bash
# Navegar para o diretório do backend
cd backend

# Criar ambiente virtual
python3 -m venv venv

# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Copiar arquivo de configuração
cp .env.example .env

# Executar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Coletar arquivos estáticos
python manage.py collectstatic --noinput
```

### 3. Configuração do Frontend (React)

```bash
# Navegar para o diretório do frontend
cd ../frontend

# Instalar dependências
npm install

# Verificar se não há vulnerabilidades
npm audit

# Corrigir vulnerabilidades automáticas (se houver)
npm audit fix
```

### 4. Configuração do Banco de Dados

#### SQLite (Desenvolvimento - Padrão)
O SQLite é configurado automaticamente. Não requer instalação adicional.

#### PostgreSQL (Produção)

##### Windows
```powershell
# Baixar e instalar PostgreSQL do site oficial
# Ou usar chocolatey
choco install postgresql

# Criar banco de dados
psql -U postgres
CREATE DATABASE stratasec_db;
CREATE USER stratasec_user WITH PASSWORD 'sua_senha_aqui';
GRANT ALL PRIVILEGES ON DATABASE stratasec_db TO stratasec_user;
\q
```

##### Linux
```bash
# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Configurar PostgreSQL
sudo -u postgres psql
CREATE DATABASE stratasec_db;
CREATE USER stratasec_user WITH PASSWORD 'sua_senha_aqui';
GRANT ALL PRIVILEGES ON DATABASE stratasec_db TO stratasec_user;
\q

# Configurar autenticação (opcional)
sudo nano /etc/postgresql/*/main/pg_hba.conf
# Alterar 'peer' para 'md5' para conexões locais
sudo systemctl restart postgresql
```

## 📁 Estrutura do Projeto

```
management_system/
├── backend/                    # Django Backend
│   ├── backend/               # Configurações do Django
│   │   ├── __init__.py
│   │   ├── settings.py        # Configurações principais
│   │   ├── urls.py           # URLs principais
│   │   ├── wsgi.py           # WSGI configuration
│   │   └── asgi.py           # ASGI configuration
│   ├── core/                 # App principal
│   │   ├── __init__.py
│   │   ├── models.py         # Modelos de dados
│   │   ├── views.py          # Views da API
│   │   ├── serializers.py    # Serializers DRF
│   │   ├── urls.py           # URLs da API
│   │   ├── admin.py          # Admin Django
│   │   ├── apps.py           # Configuração do app
│   │   ├── tests.py          # Testes unitários
│   │   └── migrations/       # Migrações do banco
│   ├── media/                # Arquivos de mídia
│   │   └── recursos/         # Uploads de recursos
│   ├── logs/                 # Logs da aplicação
│   ├── requirements.txt      # Dependências Python
│   ├── manage.py            # Django management
│   ├── .env.example         # Exemplo de variáveis de ambiente
│   └── db.sqlite3           # Banco de dados (dev)
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/       # Componentes React reutilizáveis
│   │   │   ├── ui/          # Componentes de interface
│   │   │   ├── forms/       # Componentes de formulário
│   │   │   └── layout/      # Componentes de layout
│   │   ├── pages/           # Páginas da aplicação
│   │   │   ├── admin/       # Páginas administrativas
│   │   │   └── student/     # Páginas do aluno
│   │   ├── services/        # Serviços e API
│   │   │   └── api.ts       # Configuração do Axios
│   │   ├── store/           # Gerenciamento de estado (Zustand)
│   │   │   ├── authStore.ts # Store de autenticação
│   │   │   └── appStore.ts  # Store da aplicação
│   │   ├── types/           # Tipos TypeScript
│   │   │   └── index.ts     # Definições de tipos
│   │   ├── contexts/        # Contextos React
│   │   ├── hooks/           # Custom hooks
│   │   ├── utils/           # Utilitários
│   │   ├── test/            # Configuração de testes
│   │   └── main.tsx         # Entry point
│   ├── public/              # Arquivos públicos
│   ├── package.json         # Dependências Node.js
│   ├── vite.config.ts       # Configuração Vite
│   ├── tailwind.config.js   # Configuração Tailwind
│   ├── tsconfig.json        # Configuração TypeScript
│   ├── eslint.config.js     # Configuração ESLint
│   └── vitest.config.ts     # Configuração Vitest
├── .gitignore               # Arquivos ignorados pelo Git
├── .env.example             # Exemplo de variáveis globais
├── BUSINESS_RULES.md        # Regras de negócio e fluxos
└── README.md                # Este arquivo
```

## 🗄️ Estrutura do Banco de Dados

### Modelos Django e Relacionamentos

#### 1. **Treinamento** (`core.models.Treinamento`)
```python
class Treinamento(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    nome = models.CharField(max_length=200)
    descricao = models.TextField(blank=True, null=True)
    nivel = models.CharField(max_length=20, choices=NIVEL_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Campos:**
- `id`: Identificador único (UUID)
- `nome`: Nome do treinamento (máx. 200 caracteres)
- `descricao`: Descrição detalhada (opcional)
- `nivel`: Nível do treinamento (iniciante, intermediário, avançado)
- `created_at`: Data de criação
- `updated_at`: Data da última atualização

#### 2. **Turma** (`core.models.Turma`)
```python
class Turma(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    treinamento = models.ForeignKey(Treinamento, on_delete=models.CASCADE)
    nome = models.CharField(max_length=200)
    data_inicio = models.DateField()
    data_conclusao = models.DateField()
    link_acesso = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Campos:**
- `id`: Identificador único (UUID)
- `treinamento`: Referência ao treinamento (FK)
- `nome`: Nome da turma
- `data_inicio`: Data de início da turma
- `data_conclusao`: Data de conclusão da turma
- `link_acesso`: Link para acesso à turma (opcional)

**Validações:**
- Data de início deve ser anterior à data de conclusão

#### 3. **Recurso** (`core.models.Recurso`)
```python
class Recurso(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    turma = models.ForeignKey(Turma, on_delete=models.CASCADE, blank=True, null=True)
    treinamento = models.ForeignKey(Treinamento, on_delete=models.CASCADE, blank=True, null=True)
    tipo_recurso = models.CharField(max_length=20, choices=TIPO_CHOICES)
    acesso_previo = models.BooleanField(default=False)
    draft = models.BooleanField(default=True)
    nome_recurso = models.CharField(max_length=200)
    descricao_recurso = models.TextField(blank=True, null=True)
    arquivo = models.FileField(upload_to=upload_to, validators=[...])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Campos:**
- `id`: Identificador único (UUID)
- `turma`: Referência à turma (FK, opcional)
- `treinamento`: Referência ao treinamento (FK, opcional)
- `tipo_recurso`: Tipo do recurso (video, arquivo_pdf, arquivo_zip)
- `acesso_previo`: Permite acesso antes do início da turma
- `draft`: Indica se o recurso está em rascunho
- `nome_recurso`: Nome do recurso
- `descricao_recurso`: Descrição do recurso (opcional)
- `arquivo`: Arquivo do recurso

**Validações:**
- Extensões permitidas: mp4, avi, mov, pdf, zip
- Deve ter pelo menos uma referência (turma OU treinamento)

#### 4. **Aluno** (`core.models.Aluno`)
```python
class Aluno(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    nome = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Campos:**
- `id`: Identificador único (UUID)
- `user`: Referência ao usuário Django (OneToOne)
- `nome`: Nome completo do aluno
- `email`: Email único do aluno
- `telefone`: Telefone do aluno (opcional)

#### 5. **Matricula** (`core.models.Matricula`)
```python
class Matricula(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    turma = models.ForeignKey(Turma, on_delete=models.CASCADE)
    aluno = models.ForeignKey(Aluno, on_delete=models.CASCADE)
    data_matricula = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Campos:**
- `id`: Identificador único (UUID)
- `turma`: Referência à turma (FK)
- `aluno`: Referência ao aluno (FK)
- `data_matricula`: Data da matrícula

**Restrições:**
- Unique constraint: (turma, aluno) - Um aluno não pode se matricular duas vezes na mesma turma

### Relacionamentos
- **Treinamento** → **Turma** (1:N) - Um treinamento pode ter várias turmas
- **Turma** → **Recurso** (1:N) - Uma turma pode ter vários recursos
- **Treinamento** → **Recurso** (1:N) - Um treinamento pode ter recursos gerais
- **Turma** ↔ **Aluno** (N:N através de Matricula) - Relacionamento muitos-para-muitos
- **User** → **Aluno** (1:1) - Cada usuário Django pode ter um perfil de aluno

### Métodos Principais do Sistema

#### Modelos
- `Treinamento.__str__()`: Retorna o nome do treinamento
- `Turma.__str__()`: Retorna "Nome - Treinamento"
- `Turma.clean()`: Valida datas de início e conclusão
- `Recurso.__str__()`: Retorna nome do recurso com contexto
- `Recurso.clean()`: Valida referências de turma/treinamento
- `Aluno.__str__()`: Retorna nome do aluno
- `Aluno.save()`: Sincroniza email com usuário Django
- `Matricula.__str__()`: Retorna "Aluno - Turma"

## 🧪 Testes Automatizados

### Configuração do Ambiente de Testes

#### Backend (Django)
```bash
cd backend

# Ativar ambiente virtual
# Windows
venv\Scripts\activate
# Linux
source venv/bin/activate

# Instalar dependências de teste (já incluídas no requirements.txt)
pip install pytest pytest-django coverage

# Configurar pytest (criar pytest.ini)
echo "[tool:pytest]
DJANGO_SETTINGS_MODULE = backend.settings
python_files = tests.py test_*.py *_tests.py" > pytest.ini
```

#### Frontend (React)
```bash
cd frontend

# Dependências de teste já incluídas no package.json
# Vitest, @testing-library/react, @testing-library/jest-dom

# Verificar configuração
npm run test --version
```

### Executar Testes

#### Testes Unitários - Backend

```bash
cd backend

# Executar todos os testes
python manage.py test

# Executar testes específicos
python manage.py test core.tests.test_models
python manage.py test core.tests.test_views
python manage.py test core.tests.test_serializers

# Executar com pytest (recomendado)
pytest

# Executar testes com cobertura
coverage run --source='.' manage.py test
coverage report
coverage html  # Gera relatório HTML em htmlcov/

# Executar testes específicos com pytest
pytest core/tests/test_models.py
pytest core/tests/test_views.py -v
pytest -k "test_treinamento"
```

#### Testes Unitários - Frontend

```bash
cd frontend

# Executar todos os testes
npm run test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage

# Executar testes específicos
npm run test -- --run src/components/
npm run test -- --run src/store/

# Interface gráfica de testes
npm run test:ui
```

### Testes de Integração

#### Testes de API - Backend

```bash
cd backend

# Executar testes de integração
python manage.py test core.tests.test_integration

# Testar endpoints específicos
python manage.py test core.tests.test_api_endpoints
```

#### Exemplo de Teste de API com curl

```bash
# Iniciar servidor de desenvolvimento
cd backend
python manage.py runserver 8000

# Em outro terminal, testar endpoints

# 1. Obter CSRF token
curl -c cookies.txt http://127.0.0.1:8000/api/csrf/

# 2. Login
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "sua_senha"}' \
  -b cookies.txt -c cookies.txt

# 3. Testar endpoints administrativos
curl -X GET http://127.0.0.1:8000/api/treinamentos/ -b cookies.txt
curl -X GET http://127.0.0.1:8000/api/turmas/ -b cookies.txt
curl -X GET http://127.0.0.1:8000/api/recursos/ -b cookies.txt
curl -X GET http://127.0.0.1:8000/api/alunos/ -b cookies.txt
curl -X GET http://127.0.0.1:8000/api/matriculas/ -b cookies.txt

# 4. Testar Django Admin
curl -X GET http://127.0.0.1:8000/admin/ -b cookies.txt
```

### Testes End-to-End

#### Configuração do Playwright (Opcional)

```bash
cd frontend

# Instalar Playwright
npm install -D @playwright/test

# Instalar browsers
npx playwright install

# Executar testes E2E
npx playwright test

# Executar com interface gráfica
npx playwright test --ui

# Executar testes específicos
npx playwright test tests/login.spec.ts
npx playwright test tests/dashboard.spec.ts
```

#### Exemplo de Teste E2E

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('http://localhost:5174/login');
  
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'senha123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('http://localhost:5174/dashboard');
});

test('student area access', async ({ page }) => {
  // Login como aluno
  await page.goto('http://localhost:5174/login');
  await page.fill('input[name="username"]', 'aluno@test.com');
  await page.fill('input[name="password"]', 'senha123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('http://localhost:5174/area-aluno');
});
```

### Cobertura de Testes

#### Metas de Cobertura
- **Backend**: Mínimo 85% de cobertura
- **Frontend**: Mínimo 75% de cobertura
- **Componentes críticos**: 95%+ de cobertura

#### Gerar Relatórios de Cobertura

```bash
# Backend
cd backend
coverage run --source='.' manage.py test
coverage report --show-missing
coverage html
# Abrir htmlcov/index.html no navegador

# Frontend
cd frontend
npm run test:coverage
# Abrir coverage/index.html no navegador
```

### Testes de Rotas Específicas

#### Dashboard Admin (http://localhost:5174/dashboard)
```bash
# Teste manual
# 1. Fazer login como admin
# 2. Verificar redirecionamento para /dashboard
# 3. Verificar carregamento de estatísticas
# 4. Verificar navegação entre seções
```

#### Área do Aluno (http://localhost:5174/area-aluno)
```bash
# Teste manual
# 1. Fazer login como aluno
# 2. Verificar redirecionamento para /area-aluno
# 3. Verificar listagem de turmas matriculadas
# 4. Verificar acesso a recursos baseado em regras
```

#### Django Admin (http://127.0.0.1:8000/admin/)
```bash
# Teste manual
# 1. Acessar /admin/
# 2. Fazer login com superusuário
# 3. Verificar acesso a todos os modelos
# 4. Testar CRUD de cada modelo
```

## 🏃‍♂️ Execução em Desenvolvimento

### Fluxo de Trabalho Diário

#### 1. Iniciar Ambiente de Desenvolvimento

```bash
# Terminal 1 - Backend
cd backend

# Ativar ambiente virtual
# Windows
venv\Scripts\activate
# Linux
source venv/bin/activate

# Verificar migrações pendentes
python manage.py makemigrations
python manage.py migrate

# Iniciar servidor Django
python manage.py runserver 8000
```

```bash
# Terminal 2 - Frontend
cd frontend

# Verificar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

#### 2. URLs de Acesso

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/
- **Documentação da API**: http://localhost:8000/api/docs/ (se configurado)

#### 3. Executar Testes Durante Desenvolvimento

```bash
# Backend - Testes rápidos
cd backend
python manage.py test --keepdb --parallel

# Frontend - Testes em modo watch
cd frontend
npm run test:watch
```

#### 4. Como Fazer Atualizações no Sistema

##### Atualizações no Backend

```bash
cd backend

# 1. Ativar ambiente virtual
source venv/bin/activate  # Linux
# ou
venv\Scripts\activate     # Windows

# 2. Atualizar dependências (se necessário)
pip install -r requirements.txt

# 3. Criar/aplicar migrações
python manage.py makemigrations
python manage.py migrate

# 4. Executar testes
python manage.py test

# 5. Reiniciar servidor (Ctrl+C e python manage.py runserver)
```

##### Atualizações no Frontend

```bash
cd frontend

# 1. Atualizar dependências (se necessário)
npm install

# 2. Executar testes
npm run test

# 3. Verificar tipos TypeScript
npm run type-check

# 4. Verificar linting
npm run lint

# 5. O Vite recarrega automaticamente
```

##### Atualizações no Banco de Dados

```bash
cd backend

# Criar nova migração após alterar models.py
python manage.py makemigrations

# Visualizar SQL da migração (opcional)
python manage.py sqlmigrate core 0001

# Aplicar migrações
python manage.py migrate

# Reverter migração (se necessário)
python manage.py migrate core 0001
```

### Procedimentos de Troubleshooting

#### Problemas Comuns - Backend

##### 1. Erro de Migração
```bash
# Problema: django.db.utils.OperationalError
# Solução:
python manage.py migrate --fake-initial
# ou
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

##### 2. Erro de Dependências
```bash
# Problema: ModuleNotFoundError
# Solução:
pip install -r requirements.txt
# ou
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

##### 3. Erro de CORS
```bash
# Problema: CORS policy error
# Solução: Verificar CORS_ALLOWED_ORIGINS em settings.py
# Adicionar URL do frontend se necessário
```

##### 4. Erro de Arquivo de Mídia
```bash
# Problema: FileNotFoundError para uploads
# Solução:
mkdir -p media/recursos
# Verificar MEDIA_ROOT e MEDIA_URL em settings.py
```

#### Problemas Comuns - Frontend

##### 1. Erro de Dependências
```bash
# Problema: Module not found
# Solução:
rm -rf node_modules package-lock.json
npm install
```

##### 2. Erro de TypeScript
```bash
# Problema: Type errors
# Solução:
npm run type-check
# Corrigir erros reportados
```

##### 3. Erro de Build
```bash
# Problema: Build fails
# Solução:
npm run lint
npm run type-check
npm run build
```

##### 4. Erro de Conexão com API
```bash
# Problema: Network Error
# Solução:
# 1. Verificar se backend está rodando na porta 8000
# 2. Verificar configuração de CORS no backend
# 3. Verificar URL base da API no frontend
```

#### Logs e Debugging

##### Backend
```bash
# Logs do Django
tail -f logs/django.log

# Debug mode
# Definir DEBUG=True no .env
# Acessar http://localhost:8000 para ver erros detalhados
```

##### Frontend
```bash
# Console do navegador (F12)
# Verificar Network tab para requisições
# Verificar Console tab para erros JavaScript
```

#### Comandos de Limpeza

```bash
# Backend - Limpar cache Python
find . -name "*.pyc" -delete
find . -name "__pycache__" -type d -exec rm -rf {} +

# Frontend - Limpar cache Node
npm run clean
rm -rf node_modules package-lock.json
npm install

# Banco de dados - Reset completo (CUIDADO!)
cd backend
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

## 🚀 Deploy em Produção

### Pré-requisitos para Deploy

#### Servidor Linux (Ubuntu 20.04+)
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install python3-pip python3-venv postgresql postgresql-contrib nginx supervisor git -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Servidor Windows (Windows Server 2019+)
```powershell
# Instalar IIS
Enable-WindowsOptionalFeature -Online -FeatureName IIS-WebServerRole, IIS-WebServer, IIS-CommonHttpFeatures, IIS-HttpErrors, IIS-HttpLogging, IIS-RequestFiltering, IIS-StaticContent

# Instalar Python, Node.js, PostgreSQL via instaladores oficiais
# Configurar variáveis de ambiente PATH
```

### Configuração de Produção

#### 1. Variáveis de Ambiente (.env)

```bash
# Criar arquivo .env no backend/
cat > backend/.env << EOF
# Django Settings
SECRET_KEY=sua-chave-secreta-muito-longa-e-complexa-aqui-minimo-50-caracteres
DEBUG=False
ALLOWED_HOSTS=seudominio.com,www.seudominio.com,seu-ip-servidor

# Database (PostgreSQL)
DATABASE_URL=postgresql://stratasec_user:senha_forte@localhost:5432/stratasec_db

# CORS Settings
CORS_ALLOWED_ORIGINS=https://seudominio.com,https://www.seudominio.com

# Media Files
MEDIA_URL=/media/
STATIC_URL=/static/
MEDIA_ROOT=/var/www/stratasec/media/
STATIC_ROOT=/var/www/stratasec/static/

# Security Settings
SECURE_SSL_REDIRECT=True
SECURE_PROXY_SSL_HEADER=HTTP_X_FORWARDED_PROTO,https
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_BROWSER_XSS_FILTER=True
SECURE_CONTENT_TYPE_NOSNIFF=True
EOF
```

#### 2. Configuração do PostgreSQL

```bash
# Instalar e configurar PostgreSQL
sudo -u postgres psql
CREATE DATABASE stratasec_db;
CREATE USER stratasec_user WITH PASSWORD 'senha_forte_aqui';
ALTER ROLE stratasec_user SET client_encoding TO 'utf8';
ALTER ROLE stratasec_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE stratasec_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE stratasec_db TO stratasec_user;
\q
```

#### 3. Deploy do Backend

```bash
# Criar diretório do projeto
sudo mkdir -p /var/www/stratasec
sudo chown $USER:$USER /var/www/stratasec

# Clonar repositório
cd /var/www/stratasec
git clone <repository-url> .

# Configurar backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# Configurar banco de dados
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

#### 4. Deploy do Frontend

```bash
# Build do frontend
cd /var/www/stratasec/frontend
npm install
npm run build

# Copiar arquivos para Nginx
sudo mkdir -p /var/www/stratasec/frontend_build
sudo cp -r dist/* /var/www/stratasec/frontend_build/
```

#### 5. Configuração do Gunicorn

```bash
# Criar arquivo de configuração do Gunicorn
cat > /var/www/stratasec/gunicorn.conf.py << EOF
bind = "unix:/var/www/stratasec/stratasec.sock"
workers = 3
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
timeout = 30
keepalive = 2
user = "www-data"
group = "www-data"
tmp_upload_dir = None
EOF

# Criar arquivo de serviço do Supervisor
sudo tee /etc/supervisor/conf.d/stratasec.conf << EOF
[program:stratasec]
command=/var/www/stratasec/backend/venv/bin/gunicorn --config /var/www/stratasec/gunicorn.conf.py backend.wsgi:application
directory=/var/www/stratasec/backend
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/stratasec.log
environment=PATH="/var/www/stratasec/backend/venv/bin"
EOF

# Recarregar Supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start stratasec
```

#### 6. Configuração do Nginx

```bash
# Criar configuração do Nginx
sudo tee /etc/nginx/sites-available/stratasec << EOF
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seudominio.com www.seudominio.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seudominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Frontend (React)
    location / {
        root /var/www/stratasec/frontend_build;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://unix:/var/www/stratasec/stratasec.sock;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_redirect off;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://unix:/var/www/stratasec/stratasec.sock;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_redirect off;
    }

    # Static files
    location /static/ {
        alias /var/www/stratasec/static/;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Media files
    location /media/ {
        alias /var/www/stratasec/media/;
        expires 1y;
        add_header Cache-Control "public";
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# Ativar site
sudo ln -s /etc/nginx/sites-available/stratasec /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d seudominio.com -d www.seudominio.com

# Configurar renovação automática
sudo crontab -e
# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

### Opções de Hospedagem em Nuvem

#### 1. DigitalOcean Droplet

```bash
# Criar droplet Ubuntu 20.04
# Seguir passos de configuração acima
# Configurar firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

#### 2. AWS EC2

```bash
# Lançar instância EC2 Ubuntu
# Configurar Security Groups (portas 22, 80, 443)
# Seguir passos de configuração
# Configurar Elastic IP (opcional)
```

#### 3. Heroku (Alternativa Simples)

```bash
# Instalar Heroku CLI
# Criar Procfile no root do projeto
echo "web: cd backend && gunicorn backend.wsgi:application" > Procfile

# Deploy
heroku create stratasec-app
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set DEBUG=False
git push heroku main
```

## 🔗 API Endpoints

### Base URL: `http://localhost:8000/api/`

### Autenticação

#### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
    "username": "admin",
    "password": "senha123"
}
```

#### Logout
```http
POST /api/auth/logout/
```

#### Verificar Usuário Atual
```http
GET /api/auth/me/
```

### Treinamentos

```http
GET    /api/treinamentos/           # Listar
POST   /api/treinamentos/           # Criar
GET    /api/treinamentos/{id}/      # Detalhar
PUT    /api/treinamentos/{id}/      # Atualizar
DELETE /api/treinamentos/{id}/      # Deletar
```

### Turmas

```http
GET    /api/turmas/                 # Listar
POST   /api/turmas/                 # Criar
GET    /api/turmas/{id}/            # Detalhar
PUT    /api/turmas/{id}/            # Atualizar
DELETE /api/turmas/{id}/            # Deletar
GET    /api/turmas/{id}/recursos/   # Recursos da turma
GET    /api/turmas/{id}/alunos/     # Alunos da turma
```

### Recursos

```http
GET    /api/recursos/               # Listar
POST   /api/recursos/               # Criar (multipart/form-data)
GET    /api/recursos/{id}/          # Detalhar
PUT    /api/recursos/{id}/          # Atualizar
DELETE /api/recursos/{id}/          # Deletar
```

### Alunos

```http
GET    /api/alunos/                 # Listar
POST   /api/alunos/                 # Criar
GET    /api/alunos/{id}/            # Detalhar
PUT    /api/alunos/{id}/            # Atualizar
DELETE /api/alunos/{id}/            # Deletar
GET    /api/alunos/{id}/turmas/     # Turmas do aluno
GET    /api/alunos/{id}/recursos_disponiveis/  # Recursos disponíveis
```

### Matrículas

```http
GET    /api/matriculas/             # Listar
POST   /api/matriculas/             # Criar
GET    /api/matriculas/{id}/        # Detalhar
PUT    /api/matriculas/{id}/        # Atualizar
DELETE /api/matriculas/{id}/        # Deletar
```

## 🎨 Funcionalidades

### Painel Administrativo
- Dashboard com estatísticas
- CRUD completo de treinamentos
- CRUD completo de turmas
- CRUD completo de recursos
- CRUD completo de alunos
- Gestão de matrículas
- Upload de arquivos (vídeos, PDFs, ZIPs)

### Painel do Aluno
- Visualização de turmas matriculadas
- Acesso a recursos baseado em regras
- Player de vídeo integrado
- Download de materiais
- Cronograma de atividades

### Sistema de Permissões
- Acesso prévio a recursos
- Controle de draft
- Validação de datas
- Autenticação obrigatória

## 💡 IDEs Recomendadas

### Visual Studio Code
```json
// .vscode/settings.json
{
    "python.defaultInterpreterPath": "./backend/venv/bin/python",
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": true,
    "typescript.preferences.importModuleSpecifier": "relative",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    }
}
```

```json
// .vscode/extensions.json
{
    "recommendations": [
        "ms-python.python",
        "ms-python.pylint",
        "bradlc.vscode-tailwindcss",
        "esbenp.prettier-vscode",
        "ms-vscode.vscode-typescript-next",
        "ms-vscode.vscode-json"
    ]
}
```

### PyCharm Professional
- Configurar interpretador Python: `backend/venv/bin/python`
- Configurar Django: Marcar `backend` como Django project
- Configurar Node.js: Apontar para instalação local
- Habilitar plugins: Django, TypeScript, TailwindCSS

### Configuração de Debug

#### VS Code - Backend (Django)
```json
// .vscode/launch.json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Django",
            "type": "python",
            "request": "launch",
            "program": "${workspaceFolder}/backend/manage.py",
            "args": ["runserver", "8000"],
            "django": true,
            "cwd": "${workspaceFolder}/backend"
        }
    ]
}
```

#### VS Code - Frontend (React)
```json
// .vscode/launch.json (adicionar à configuração acima)
{
    "name": "React",
    "type": "node",
    "request": "launch",
    "cwd": "${workspaceFolder}/frontend",
    "runtimeExecutable": "npm",
    "runtimeArgs": ["run", "dev"]
}
```

## 📚 Documentação Adicional

- [Regras de Negócio e Fluxos](./BUSINESS_RULES.md) - Documentação detalhada das funcionalidades
- [Guia de Contribuição](./CONTRIBUTING.md) - Como contribuir para o projeto
- [Changelog](./CHANGELOG.md) - Histórico de versões

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.


---

**StrataSec** - Sistema de Gestão de Sala de Aula
Desenvolvido  usando Django e React