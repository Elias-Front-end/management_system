# StrataSec - Sistema de Gestão de Sala de Aula

![StrataSec Logo](https://img.shields.io/badge/StrataSec-Management%20System-blue?style=for-the-badge)

Sistema web completo para gestão de treinamentos e turmas, permitindo que administradores gerenciem conteúdos educacionais e alunos acessem materiais de forma controlada e segura.

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Tecnologias](#-tecnologias)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Estrutura do Banco de Dados](#-estrutura-do-banco-de-dados)
- [Endpoints da API](#-endpoints-da-api)
- [Rotas do Frontend](#-rotas-do-frontend)
- [Requisitos para Execução Local](#-requisitos-para-execução-local)
- [Instalação e Configuração](#-instalação-e-configuração)
- [Execução em Desenvolvimento](#-execução-em-desenvolvimento)
- [Testes](#-testes)
- [Deploy em Produção](#-deploy-em-produção)
- [API Endpoints](#-api-endpoints)
- [Funcionalidades](#-funcionalidades)
- [Troubleshooting](#-troubleshooting)
- [Contribuição](#-contribuição)

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

### Frontend
- **React 19.1.1** - Biblioteca JavaScript
- **TypeScript** - Tipagem estática
- **Vite 6.0.7** - Build tool e dev server
- **TailwindCSS 3.4.17** - Framework CSS
- **React Router DOM 7.9.4** - Roteamento
- **Zustand 5.0.8** - Gerenciamento de estado
- **Axios 1.12.2** - Cliente HTTP
- **Lucide React** - Ícones

## 📁 Estrutura do Projeto

```
management_system/
├── backend/                    # Django Backend
│   ├── backend/               # Configurações do Django
│   │   ├── settings.py        # Configurações principais
│   │   ├── urls.py           # URLs principais
│   │   └── wsgi.py           # WSGI configuration
│   ├── core/                 # App principal
│   │   ├── models.py         # Modelos de dados
│   │   ├── views.py          # Views da API
│   │   ├── serializers.py    # Serializers DRF
│   │   ├── urls.py           # URLs da API
│   │   └── admin.py          # Admin Django
│   ├── requirements.txt      # Dependências Python
│   ├── manage.py            # Django management
│   └── db.sqlite3           # Banco de dados (dev)
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── services/        # Serviços e API
│   │   ├── store/           # Gerenciamento de estado
│   │   ├── types/           # Tipos TypeScript
│   │   ├── contexts/        # Contextos React
│   │   └── main.tsx         # Entry point
│   ├── package.json         # Dependências Node.js
│   ├── vite.config.ts       # Configuração Vite
│   ├── tailwind.config.js   # Configuração Tailwind
│   └── tsconfig.json        # Configuração TypeScript
└── README.md                # Este arquivo
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas e Relacionamentos

#### 1. **Treinamento**
```sql
CREATE TABLE core_treinamento (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);
```

#### 2. **Turma**
```sql
CREATE TABLE core_turma (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(200) NOT NULL,
    data_inicio DATE NOT NULL,
    data_conclusao DATE,
    link_acesso VARCHAR(500),
    treinamento_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (treinamento_id) REFERENCES core_treinamento(id)
);
```

#### 3. **Aluno**
```sql
CREATE TABLE core_aluno (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(254) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    user_id INTEGER UNIQUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth_user(id)
);
```

#### 4. **Recurso**
```sql
CREATE TABLE core_recurso (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_recurso VARCHAR(200) NOT NULL,
    descricao_recurso TEXT,
    tipo_recurso VARCHAR(20) NOT NULL,
    arquivo VARCHAR(100),
    acesso_previo BOOLEAN NOT NULL DEFAULT 0,
    draft BOOLEAN NOT NULL DEFAULT 0,
    turma_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (turma_id) REFERENCES core_turma(id)
);
```

#### 5. **Matricula**
```sql
CREATE TABLE core_matricula (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data_matricula DATE NOT NULL,
    aluno_id INTEGER NOT NULL,
    turma_id INTEGER NOT NULL,
    UNIQUE (aluno_id, turma_id),
    FOREIGN KEY (aluno_id) REFERENCES core_aluno(id),
    FOREIGN KEY (turma_id) REFERENCES core_turma(id)
);
```

### Relacionamentos
- **Treinamento** → **Turma** (1:N)
- **Turma** → **Recurso** (1:N)
- **Turma** ↔ **Aluno** (N:N através de Matricula)
- **User** → **Aluno** (1:1)

## 🔗 Endpoints da API

### Base URL: `http://localhost:8000/api/`

### 1. **Autenticação** (`/auth/`)

#### Login
```http
POST /api/auth/login/
Content-Type: application/json

{
    "username": "admin",
    "password": "senha123"
}
```

**Resposta:**
```json
{
    "user": {
        "id": 1,
        "username": "admin",
        "email": "admin@example.com",
        "is_staff": true
    },
    "is_admin": true,
    "aluno": null,
    "message": "Login realizado com sucesso"
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

### 2. **Treinamentos** (`/treinamentos/`)

#### Listar Treinamentos
```http
GET /api/treinamentos/
GET /api/treinamentos/?search=python
```

#### Criar Treinamento
```http
POST /api/treinamentos/
Content-Type: application/json

{
    "nome": "Python Avançado",
    "descricao": "Curso completo de Python"
}
```

#### Atualizar Treinamento
```http
PUT /api/treinamentos/1/
PATCH /api/treinamentos/1/
```

#### Deletar Treinamento
```http
DELETE /api/treinamentos/1/
```

### 3. **Turmas** (`/turmas/`)

#### Listar Turmas
```http
GET /api/turmas/
GET /api/turmas/?treinamento=1
GET /api/turmas/?search=avançado
```

#### Criar Turma
```http
POST /api/turmas/
Content-Type: application/json

{
    "nome": "Python Avançado - Turma 1",
    "data_inicio": "2025-02-01",
    "data_conclusao": "2025-03-01",
    "link_acesso": "https://meet.google.com/abc-def-ghi",
    "treinamento": 1
}
```

#### Recursos da Turma
```http
GET /api/turmas/1/recursos/
```

#### Alunos da Turma
```http
GET /api/turmas/1/alunos/
```

### 4. **Recursos** (`/recursos/`)

#### Listar Recursos
```http
GET /api/recursos/
GET /api/recursos/?turma=1
GET /api/recursos/?tipo=video
GET /api/recursos/?search=aula
```

#### Criar Recurso
```http
POST /api/recursos/
Content-Type: multipart/form-data

nome_recurso: "Aula 1 - Introdução"
descricao_recurso: "Primeira aula do curso"
tipo_recurso: "video"
arquivo: [arquivo.mp4]
turma: 1
acesso_previo: false
draft: false
```

### 5. **Alunos** (`/alunos/`)

#### Listar Alunos
```http
GET /api/alunos/
GET /api/alunos/?search=joão
```

#### Criar Aluno
```http
POST /api/alunos/
Content-Type: application/json

{
    "nome": "João Silva",
    "email": "joao@example.com",
    "telefone": "(11) 99999-9999"
}
```

#### Turmas do Aluno
```http
GET /api/alunos/1/turmas/
```

#### Recursos Disponíveis para o Aluno
```http
GET /api/alunos/1/recursos_disponiveis/
```

### 6. **Matrículas** (`/matriculas/`)

#### Listar Matrículas
```http
GET /api/matriculas/
GET /api/matriculas/?aluno=1
GET /api/matriculas/?turma=1
```

#### Criar Matrícula
```http
POST /api/matriculas/
Content-Type: application/json

{
    "aluno": 1,
    "turma": 1,
    "data_matricula": "2025-01-15"
}
```

### 7. **CSRF Token**
```http
GET /api/csrf/
```

## 🌐 Rotas do Frontend

### Rotas Públicas
- `/login` - Página de login

### Rotas Protegidas (Requer Autenticação)
- `/` - Redirecionamento baseado no perfil
- `/area-aluno` - Área do aluno (apenas para não-admins)

### Rotas Administrativas (Apenas Admins)
- `/dashboard` - Dashboard administrativo
- `/treinamentos` - Gestão de treinamentos
- `/turmas` - Gestão de turmas
- `/recursos` - Gestão de recursos
- `/alunos` - Gestão de alunos
- `/matriculas` - Gestão de matrículas

### Componentes de Proteção
- **ProtectedRoute**: Verifica autenticação
- **AdminRoute**: Verifica se é administrador
- **RedirectBasedOnProfile**: Redireciona baseado no perfil

## 💻 Requisitos para Execução Local

### Versões Necessárias

- **Node.js**: 18.0.0 ou superior
- **npm**: 9.0.0 ou superior (ou yarn 1.22.0+)
- **Python**: 3.10.0 ou superior
- **pip**: 21.0.0 ou superior

### Verificar Versões Instaladas

```bash
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar Python
python --version

# Verificar pip
pip --version
```

## 🛠 Instalação e Configuração

### 1. Clone o Repositório

```bash
git clone <repository-url>
cd management_system
```

### 2. Configuração do Backend (Django)

```bash
# Navegar para o diretório do backend
cd backend

# Criar ambiente virtual (recomendado)
python -m venv venv

# Ativar ambiente virtual
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Executar migrações
python manage.py migrate

# Criar superusuário (opcional)
python manage.py createsuperuser

# Coletar arquivos estáticos (se necessário)
python manage.py collectstatic --noinput
```

### 3. Configuração do Frontend (React)

```bash
# Navegar para o diretório do frontend
cd ../frontend

# Instalar dependências
npm install
# ou
yarn install
```

## 🏃‍♂️ Execução em Desenvolvimento

### Iniciar Backend

```bash
cd backend

# Ativar ambiente virtual (se não estiver ativo)
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Iniciar servidor Django
python manage.py runserver 8000
```

O backend estará disponível em: `http://localhost:8000`

### Iniciar Frontend

```bash
cd frontend

# Iniciar servidor de desenvolvimento
npm run dev
# ou
yarn dev
```

O frontend estará disponível em: `http://localhost:5174`

### Acesso ao Sistema

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:8000/api/
- **Admin Django**: http://localhost:8000/admin/

## 🧪 Testes

### Backend (Django)

```bash
cd backend

# Executar todos os testes
python manage.py test

# Executar testes com pytest (recomendado)
pytest

# Executar testes com cobertura
coverage run -m pytest
coverage report
coverage html  # Gera relatório HTML
```

### Frontend (React)

```bash
cd frontend

# Executar testes unitários
npm run test
# ou
yarn test

# Executar testes com cobertura
npm run test:coverage
# ou
yarn test:coverage

# Executar testes em modo watch
npm run test:watch
# ou
yarn test:watch
```

### Frameworks de Teste Utilizados

- **Backend**: Django TestCase, pytest (opcional)
- **Frontend**: Vitest, React Testing Library, @testing-library/jest-dom

### Cobertura de Testes Esperada

- **Backend**: Mínimo 80% de cobertura
- **Frontend**: Mínimo 70% de cobertura
- **Componentes críticos**: 90%+ de cobertura

## 🚀 Deploy em Produção

### Pré-requisitos para Deploy

- **Servidor**: Ubuntu 20.04+ ou CentOS 8+
- **Python**: 3.10+
- **Node.js**: 18+
- **PostgreSQL**: 13+
- **Nginx**: 1.18+
- **Supervisor** ou **systemd** para gerenciamento de processos

### 1. Configuração do Servidor

#### Instalar Dependências do Sistema

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3-pip python3-venv postgresql postgresql-contrib nginx supervisor

# CentOS/RHEL
sudo yum install python3-pip python3-venv postgresql-server postgresql-contrib nginx supervisor
```

#### Configurar PostgreSQL

```bash
# Inicializar PostgreSQL (CentOS)
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar banco de dados
sudo -u postgres psql
CREATE DATABASE stratasec_db;
CREATE USER stratasec_user WITH PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE stratasec_db TO stratasec_user;
\q
```

### 2. Variáveis de Ambiente

Crie um arquivo `.env` no diretório `backend/`:

```env
# Django Settings
SECRET_KEY=your-very-long-secret-key-here-minimum-50-characters
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com,your-server-ip

# Database (PostgreSQL)
DATABASE_URL=postgresql://stratasec_user:strong_password_here@localhost:5432/stratasec_db

# CORS Settings
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

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
```

### 3. Deploy do Backend

```bash
# Criar diretório do projeto
sudo mkdir -p /var/www/stratasec
sudo chown $USER:$USER /var/www/stratasec

# Clonar repositório
cd /var/www/stratasec
git clone <repository-url> .

# Configurar ambiente virtual
cd backend
python3 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# Configurar banco de dados
python manage.py migrate
python manage.py collectstatic --noinput

# Criar superusuário
python manage.py createsuperuser
```

### 4. Deploy do Frontend

```bash
# Instalar Node.js (se não estiver instalado)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Build do frontend
cd /var/www/stratasec/frontend
npm install
npm run build

# Copiar arquivos para diretório do Nginx
sudo cp -r dist/* /var/www/stratasec/frontend_build/
```

### 5. Configuração do Gunicorn

Criar arquivo `/etc/supervisor/conf.d/stratasec.conf`:

```ini
[program:stratasec]
command=/var/www/stratasec/backend/venv/bin/gunicorn --workers 3 --bind unix:/var/www/stratasec/stratasec.sock management_system.wsgi:application
directory=/var/www/stratasec/backend
user=www-data
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/stratasec.log
```

```bash
# Recarregar supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start stratasec
```

### 6. Configuração do Nginx

Criar arquivo `/etc/nginx/sites-available/stratasec`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (use Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend (React)
    location / {
        root /var/www/stratasec/frontend_build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://unix:/var/www/stratasec/stratasec.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://unix:/var/www/stratasec/stratasec.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static/ {
        alias /var/www/stratasec/static/;
    }

    # Media files
    location /media/ {
        alias /var/www/stratasec/media/;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/stratasec /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Configurar renovação automática
sudo crontab -e
# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🧪 Procedimentos de Teste

### 1. Testes de Unidade

#### Backend
```bash
cd backend
source venv/bin/activate

# Executar todos os testes
python manage.py test

# Executar testes específicos
python manage.py test core.tests.test_models
python manage.py test core.tests.test_views
python manage.py test core.tests.test_api

# Com cobertura (instalar coverage)
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

#### Frontend
```bash
cd frontend

# Executar testes
npm run test

# Testes com cobertura
npm run test:coverage

# Testes em modo watch
npm run test:watch

# Interface gráfica de testes
npm run test:ui
```

### 2. Testes de Integração

#### Teste de API com curl

```bash
# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "senha123"}' \
  -c cookies.txt

# Listar treinamentos
curl -X GET http://localhost:8000/api/treinamentos/ \
  -b cookies.txt

# Criar treinamento
curl -X POST http://localhost:8000/api/treinamentos/ \
  -H "Content-Type: application/json" \
  -d '{"nome": "Teste API", "descricao": "Teste via curl"}' \
  -b cookies.txt
```

#### Teste com Postman/Insomnia

1. Importe a coleção de endpoints da API
2. Configure variáveis de ambiente:
   - `base_url`: http://localhost:8000
   - `username`: admin
   - `password`: senha123

### 3. Testes End-to-End (E2E)

#### Configuração do Playwright (Opcional)

```bash
cd frontend
npm install -D @playwright/test
npx playwright install

# Executar testes E2E
npx playwright test
```

### 4. Testes de Performance

#### Backend (Django)
```bash
# Instalar django-silk para profiling
pip install django-silk

# Adicionar ao INSTALLED_APPS e configurar URLs
# Acessar /silk/ para análise de performance
```

#### Frontend (Lighthouse)
```bash
# Instalar Lighthouse CLI
npm install -g lighthouse

# Executar auditoria
lighthouse http://localhost:5174 --output html --output-path ./lighthouse-report.html
```

### 5. Testes de Segurança

#### Backend
```bash
# Verificar configurações de segurança
python manage.py check --deploy

# Instalar bandit para análise de segurança
pip install bandit
bandit -r . -f json -o security-report.json
```

#### Frontend
```bash
# Auditoria de dependências
npm audit
npm audit fix

# Análise de vulnerabilidades
npx audit-ci --config audit-ci.json
```

### 6. Checklist de Testes Pré-Deploy

- [ ] Todos os testes unitários passando
- [ ] Cobertura de testes acima de 80%
- [ ] Testes de integração da API funcionando
- [ ] Login/logout funcionando corretamente
- [ ] CRUD de todas as entidades funcionando
- [ ] Permissões de acesso funcionando
- [ ] Upload de arquivos funcionando
- [ ] Responsividade do frontend
- [ ] Performance aceitável (< 3s carregamento)
- [ ] Sem vulnerabilidades críticas
- [ ] SSL configurado corretamente
- [ ] Backup do banco de dados configurado

### Opções de Hospedagem Recomendadas

#### 1. Vercel (Frontend) + Railway/Heroku (Backend)

**Frontend (Vercel):**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

**Backend (Railway):**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login e deploy
railway login
railway init
railway up
```

#### 2. DigitalOcean App Platform

```yaml
# app.yaml
name: stratasec
services:
- name: backend
  source_dir: backend
  github:
    repo: your-username/stratasec
    branch: main
  run_command: gunicorn backend.wsgi:application
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  
- name: frontend
  source_dir: frontend
  github:
    repo: your-username/stratasec
    branch: main
  build_command: npm run build
  run_command: npm run preview
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
```

#### 3. Docker (Opcional)

**Dockerfile (Backend):**
```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
```

**Dockerfile (Frontend):**
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5174
CMD ["npm", "run", "preview"]
```

### Configuração de CI/CD

#### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.10'
    
    - name: Install dependencies
      run: |
        cd backend
        pip install -r requirements.txt
    
    - name: Run tests
      run: |
        cd backend
        python manage.py test
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install frontend dependencies
      run: |
        cd frontend
        npm install
    
    - name: Run frontend tests
      run: |
        cd frontend
        npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - name: Deploy to production
      run: echo "Deploy to your hosting platform"
```

## 📡 API Endpoints

### Autenticação

```
POST /api/auth/login/          # Login
POST /api/auth/logout/         # Logout
GET  /api/auth/user/           # Dados do usuário atual
```

### Treinamentos

```
GET    /api/treinamentos/      # Listar treinamentos
POST   /api/treinamentos/      # Criar treinamento
GET    /api/treinamentos/{id}/ # Detalhes do treinamento
PUT    /api/treinamentos/{id}/ # Atualizar treinamento
DELETE /api/treinamentos/{id}/ # Deletar treinamento
```

### Turmas

```
GET    /api/turmas/            # Listar turmas
POST   /api/turmas/            # Criar turma
GET    /api/turmas/{id}/       # Detalhes da turma
PUT    /api/turmas/{id}/       # Atualizar turma
DELETE /api/turmas/{id}/       # Deletar turma
```

### Recursos

```
GET    /api/recursos/          # Listar recursos
POST   /api/recursos/          # Criar recurso (upload)
GET    /api/recursos/{id}/     # Detalhes do recurso
PUT    /api/recursos/{id}/     # Atualizar recurso
DELETE /api/recursos/{id}/     # Deletar recurso
```

### Alunos

```
GET    /api/alunos/            # Listar alunos
POST   /api/alunos/            # Criar aluno
GET    /api/alunos/{id}/       # Detalhes do aluno
PUT    /api/alunos/{id}/       # Atualizar aluno
DELETE /api/alunos/{id}/       # Deletar aluno
GET    /api/alunos/{id}/turmas/           # Turmas do aluno
GET    /api/alunos/{id}/recursos_disponiveis/ # Recursos disponíveis
```

### Matrículas

```
GET    /api/matriculas/        # Listar matrículas
POST   /api/matriculas/        # Criar matrícula
DELETE /api/matriculas/{id}/   # Deletar matrícula
```

## ✨ Funcionalidades

### Painel Administrativo

- ✅ **Dashboard**: Estatísticas gerais e navegação rápida
- ✅ **Gestão de Treinamentos**: CRUD completo com nome e descrição
- ✅ **Gestão de Turmas**: Vinculação a treinamentos, datas e links de acesso
- ✅ **Gestão de Recursos**: Upload de vídeos, PDFs e ZIPs com controles de acesso
- ✅ **Gestão de Alunos**: Cadastro com nome, email e telefone
- ✅ **Gestão de Matrículas**: Vinculação aluno-turma

### Painel do Aluno

- ✅ **Visualização de Treinamentos**: Lista de treinamentos matriculados
- ✅ **Acesso a Turmas**: Baseado em cronograma e permissões
- ✅ **Player de Recursos**: Reprodução de vídeos e download de materiais
- ✅ **Controle de Acesso**: Regras de acesso prévio e draft

### Regras de Negócio

1. **Acesso Prévio**: Antes da data de início, alunos só acessam recursos marcados como "Acesso Prévio"
2. **Controle de Draft**: Após data de início, alunos só acessam recursos não marcados como "Draft"
3. **Matrículas**: Alunos só veem treinamentos/turmas onde estão matriculados

### Interface

- ✅ **Design Responsivo**: Adaptado para desktop, tablet e mobile
- ✅ **Tema Dark/Light**: Alternância entre temas com persistência
- ✅ **Menu Lateral**: Navegação com ícones e tooltips
- ✅ **Componentes Modernos**: Cards, modais, tabelas e formulários estilizados

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Erro de CORS no Frontend

**Problema**: `Access to XMLHttpRequest at 'http://localhost:8000' from origin 'http://localhost:5174' has been blocked by CORS policy`

**Solução**:
```python
# backend/backend/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]
```

#### 2. Erro de Migração Django

**Problema**: `django.db.utils.OperationalError: no such table`

**Solução**:
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

#### 3. Erro de Dependências Node.js

**Problema**: `Module not found` ou `Cannot resolve dependency`

**Solução**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### 4. Erro de Permissão de Arquivo

**Problema**: `PermissionError: [Errno 13] Permission denied`

**Solução**:
```bash
# Linux/Mac
sudo chown -R $USER:$USER .
chmod -R 755 .

# Windows (executar como administrador)
icacls . /grant %USERNAME%:F /T
```

#### 5. Porta em Uso

**Problema**: `Error: listen EADDRINUSE: address already in use :::5174`

**Solução**:
```bash
# Encontrar processo usando a porta
lsof -ti:5174
# ou no Windows
netstat -ano | findstr :5174

# Matar processo
kill -9 <PID>
# ou no Windows
taskkill /PID <PID> /F
```

### Logs e Debugging

#### Backend (Django)

```python
# backend/backend/settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}
```

#### Frontend (React)

```bash
# Executar com logs detalhados
npm run dev -- --debug

# Verificar build
npm run build -- --debug
```

### Performance

#### Backend

```python
# Otimizações de query
# core/views.py
queryset = Model.objects.select_related('foreign_key').prefetch_related('many_to_many')
```

#### Frontend

```bash
# Análise do bundle
npm run build
npx vite-bundle-analyzer dist
```

## 🤝 Contribuição

### Configuração para Desenvolvimento

1. Fork o repositório
2. Clone seu fork: `git clone <your-fork-url>`
3. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
4. Instale dependências conforme instruções acima
5. Faça suas alterações
6. Execute testes: `npm test` e `python manage.py test`
7. Commit: `git commit -m "feat: adiciona nova funcionalidade"`
8. Push: `git push origin feature/nova-funcionalidade`
9. Abra um Pull Request

### Padrões de Código

#### Backend (Python)

```bash
# Instalar ferramentas de qualidade
pip install black flake8 isort

# Formatar código
black .
isort .

# Verificar qualidade
flake8 .
```

#### Frontend (TypeScript)

```bash
# Verificar lint
npm run lint

# Formatar código (se configurado)
npm run format
```

### Estrutura de Commits

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:

- 📧 Email: suporte@stratasec.com
- 📱 WhatsApp: +55 (11) 99999-9999
- 🌐 Website: https://stratasec.com

---

**Desenvolvido com ❤️ pela equipe StrataSec**