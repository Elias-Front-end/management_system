# 🎓 Sistema de Gestão de Sala de Aula

Sistema completo para gestão de treinamentos, turmas e recursos educacionais, desenvolvido com Django REST Framework e React.

## 📋 Índice

- [🎓 Sistema de Gestão de Sala de Aula](#-sistema-de-gestão-de-sala-de-aula)
  - [📋 Índice](#-índice)
  - [🏗️ Arquitetura do Sistema](#️-arquitetura-do-sistema)
  - [💻 Configuração Local no VS Code (Windows)](#-configuração-local-no-vs-code-windows)
    - [📋 Requisitos do Sistema](#-requisitos-do-sistema)
    - [🚀 Configuração Passo a Passo](#-configuração-passo-a-passo)
    - [⚙️ Configuração de Variáveis de Ambiente](#️-configuração-de-variáveis-de-ambiente)
    - [🔧 Executar em Modo Desenvolvimento](#-executar-em-modo-desenvolvimento)
    - [📦 Build para Produção](#-build-para-produção)
    - [🤖 Script de Automação (Opcional)](#-script-de-automação-opcional)
  - [🐧 Deploy no Servidor Linux](#-deploy-no-servidor-linux)
    - [📋 Requisitos do Servidor](#-requisitos-do-servidor)
    - [🔧 Preparação do Servidor](#-preparação-do-servidor)
    - [📂 Opção A: Deploy via Git](#-opção-a-deploy-via-git)
    - [📁 Opção B: Deploy via Transferência de Arquivos (FileZilla)](#-opção-b-deploy-via-transferência-de-arquivos-filezilla)
    - [⚙️ Comandos Manuais de Gerenciamento](#️-comandos-manuais-de-gerenciamento)
    - [🤖 Script de Deploy Automatizado (Opcional)](#-script-de-deploy-automatizado-opcional)
  - [🚀 Rodando em Produção](#-rodando-em-produção)
    - [🔧 Configuração do Serviço (systemd)](#-configuração-do-serviço-systemd)
    - [📊 Monitoramento Recomendado](#-monitoramento-recomendado)
    - [🛠️ Procedimentos de Manutenção](#️-procedimentos-de-manutenção)
  - [🐳 Deploy com Docker (Alternativa)](#-deploy-com-docker-alternativa)
  - [🔧 Troubleshooting](#-troubleshooting)
  - [📚 Documentação Adicional](#-documentação-adicional)

## 🏗️ Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Banco de      │
│   React + Vite  │◄──►│  Django + DRF   │◄──►│   Dados         │
│   Port: 5174    │    │   Port: 8000    │    │ SQLite/PostgreSQL│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 💻 Configuração Local no VS Code (Windows)

### 📋 Requisitos do Sistema

**Versões Mínimas Requeridas:**
- **Node.js**: 18.0.0 ou superior
- **Python**: 3.10.0 ou superior
- **Git**: 2.30.0 ou superior
- **VS Code**: 1.70.0 ou superior

**Extensões Recomendadas para VS Code:**
- Python (Microsoft)
- Pylance (Microsoft)
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Thunder Client (para testar APIs)

### 🚀 Configuração Passo a Passo

#### 1️⃣ Clonar o Repositório

```powershell
# Abra o PowerShell como Administrador
cd C:\
mkdir Projetos
cd Projetos

# Clone o repositório
git clone https://github.com/seu-usuario/management_system.git
cd management_system
```

#### 2️⃣ Configurar o Backend (Django)

```powershell
# Navegar para o diretório do backend
cd backend

# Criar ambiente virtual Python
python -m venv venv

# Ativar o ambiente virtual
.\venv\Scripts\Activate.ps1

# Atualizar pip
python -m pip install --upgrade pip

# Instalar dependências
pip install -r requirements.txt

# Voltar para o diretório raiz
cd ..
```

#### 3️⃣ Configurar o Frontend (React)

```powershell
# Navegar para o diretório do frontend
cd frontend

# Instalar dependências Node.js
npm install

# Voltar para o diretório raiz
cd ..
```

### ⚙️ Configuração de Variáveis de Ambiente

#### 1️⃣ Configurar Backend (.env)

```powershell
# Copiar arquivo de exemplo
copy .env.example .env
```

**Edite o arquivo `.env` com as seguintes configurações para desenvolvimento:**

```env
# ======================================================
# 🐍 CONFIGURAÇÕES DO DJANGO (BACKEND)
# ======================================================
SECRET_KEY=django-insecure-dev-key-mude-em-producao-123456789
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# ======================================================
# 🗄️ CONFIGURAÇÕES DO BANCO DE DADOS (DESENVOLVIMENTO)
# ======================================================
DATABASE_ENGINE=sqlite
DATABASE_NAME=db.sqlite3

# ======================================================
# 🔐 CONFIGURAÇÕES JWT
# ======================================================
ACCESS_TOKEN_LIFETIME=60
REFRESH_TOKEN_LIFETIME=7
JWT_ALGORITHM=HS256
JWT_SECRET_KEY=sua-chave-jwt-secreta-dev

# ======================================================
# 🌐 CONFIGURAÇÕES CORS
# ======================================================
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5174,http://127.0.0.1:3000,http://127.0.0.1:5174
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://localhost:5174,http://127.0.0.1:3000,http://127.0.0.1:5174
CORS_ALLOW_CREDENTIALS=True

# ======================================================
# 📧 CONFIGURAÇÕES DE EMAIL (DESENVOLVIMENTO)
# ======================================================
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# ======================================================
# 📁 CONFIGURAÇÕES DE ARQUIVOS
# ======================================================
MEDIA_ROOT=media
MEDIA_URL=/media/
STATIC_ROOT=staticfiles
STATIC_URL=/static/
MAX_UPLOAD_SIZE=100
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,ppt,pptx,txt,zip,rar,mp4,avi,mov,jpg,jpeg,png,gif

# ======================================================
# 📊 CONFIGURAÇÕES DE LOG
# ======================================================
LOG_LEVEL=DEBUG
LOG_DIR=logs
```

#### 2️⃣ Configurar Frontend (.env)

```powershell
# Navegar para o frontend
cd frontend

# Criar arquivo .env para o frontend
echo "VITE_API_BASE_URL=http://localhost:8000/api" > .env

# Voltar para o diretório raiz
cd ..
```

### 🔧 Executar em Modo Desenvolvimento

#### 1️⃣ Inicializar o Backend

```powershell
# Ativar ambiente virtual (se não estiver ativo)
cd backend
.\venv\Scripts\Activate.ps1

# Executar migrações do banco de dados
python manage.py makemigrations
python manage.py migrate

# Criar superusuário (opcional)
python manage.py createsuperuser

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

# Iniciar servidor de desenvolvimento
python manage.py runserver 0.0.0.0:8000
```

#### 2️⃣ Inicializar o Frontend (Nova janela do terminal)

```powershell
# Navegar para o frontend
cd frontend

# Iniciar servidor de desenvolvimento
npm run dev
```

**🎉 Acesso ao Sistema:**
- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:8000/api
- **Admin Django**: http://localhost:8000/admin

### 📦 Build para Produção

#### 1️⃣ Build do Frontend

```powershell
cd frontend

# Executar build de produção
npm run build

# Os arquivos serão gerados em frontend/dist/
```

#### 2️⃣ Configurar Backend para Produção

```powershell
cd backend

# Ativar ambiente virtual
.\venv\Scripts\Activate.ps1

# Configurar variáveis de produção no .env
# DEBUG=False
# ALLOWED_HOSTS=seu-dominio.com,www.seu-dominio.com

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

# Executar com Gunicorn (servidor WSGI)
pip install gunicorn
gunicorn --bind 0.0.0.0:8000 --workers 3 backend.wsgi:application
```

### 🤖 Script de Automação (Opcional)

Crie o arquivo `setup.ps1` na raiz do projeto:

```powershell
# Criar script de setup
@"
# ======================================================
# 🚀 SCRIPT DE CONFIGURAÇÃO AUTOMÁTICA - WINDOWS
# ======================================================

Write-Host "🎓 Configurando Sistema de Gestão de Sala de Aula..." -ForegroundColor Green

# Verificar se Python está instalado
try {
    `$pythonVersion = python --version
    Write-Host "✅ Python encontrado: `$pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python não encontrado. Instale Python 3.10+ primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se Node.js está instalado
try {
    `$nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: `$nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale Node.js 18+ primeiro." -ForegroundColor Red
    exit 1
}

# Configurar Backend
Write-Host "🐍 Configurando Backend Django..." -ForegroundColor Yellow
cd backend

# Criar ambiente virtual
python -m venv venv
.\venv\Scripts\Activate.ps1

# Instalar dependências
pip install --upgrade pip
pip install -r requirements.txt

# Configurar .env se não existir
if (-not (Test-Path "../.env")) {
    Copy-Item "../.env.example" "../.env"
    Write-Host "📝 Arquivo .env criado. Configure as variáveis necessárias." -ForegroundColor Yellow
}

# Executar migrações
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput

cd ..

# Configurar Frontend
Write-Host "⚛️ Configurando Frontend React..." -ForegroundColor Yellow
cd frontend

# Instalar dependências
npm install

# Configurar .env do frontend se não existir
if (-not (Test-Path ".env")) {
    "VITE_API_BASE_URL=http://localhost:8000/api" | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "📝 Arquivo .env do frontend criado." -ForegroundColor Green
}

cd ..

Write-Host "🎉 Configuração concluída!" -ForegroundColor Green
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Configure as variáveis no arquivo .env" -ForegroundColor White
Write-Host "2. Execute: cd backend && .\venv\Scripts\Activate.ps1 && python manage.py runserver" -ForegroundColor White
Write-Host "3. Em outro terminal: cd frontend && npm run dev" -ForegroundColor White
"@ | Out-File -FilePath "setup.ps1" -Encoding UTF8
```

**Para executar o script:**

```powershell
# Permitir execução de scripts (executar como Administrador)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Executar o script de setup
.\setup.ps1
```

## 🐧 Deploy no Servidor Linux

### 📋 Requisitos do Servidor

**Sistema Operacional Suportado:**
- Ubuntu 20.04 LTS ou superior
- CentOS 8 ou superior
- Debian 11 ou superior

**Software Necessário:**
- **Python**: 3.10+
- **Node.js**: 18+
- **Nginx**: 1.18+
- **PostgreSQL**: 13+ (recomendado)
- **Git**: 2.30+
- **Supervisor**: 4.0+ (para gerenciamento de processos)

**Recursos Mínimos:**
- **RAM**: 2GB (4GB recomendado)
- **CPU**: 2 cores
- **Armazenamento**: 20GB livres
- **Largura de banda**: 100 Mbps

### 🔧 Preparação do Servidor

#### 1️⃣ Atualizar Sistema e Instalar Dependências

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências básicas
sudo apt install -y python3 python3-pip python3-venv nodejs npm nginx postgresql postgresql-contrib git supervisor curl wget

# Verificar versões instaladas
python3 --version  # Deve ser 3.10+
node --version     # Deve ser 18+
nginx -v          # Deve ser 1.18+
psql --version    # Deve ser 13+
```

#### 2️⃣ Configurar PostgreSQL

```bash
# Iniciar e habilitar PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar banco de dados e usuário
sudo -u postgres psql << EOF
CREATE DATABASE management_system_db;
CREATE USER management_user WITH PASSWORD 'sua_senha_segura_aqui';
ALTER ROLE management_user SET client_encoding TO 'utf8';
ALTER ROLE management_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE management_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE management_system_db TO management_user;
\q
EOF
```

#### 3️⃣ Criar Usuário para a Aplicação

```bash
# Criar usuário dedicado
sudo adduser --system --group --home /opt/management_system management

# Criar diretórios necessários
sudo mkdir -p /opt/management_system/{app,logs,media,static,backups}
sudo chown -R management:management /opt/management_system
```

### 📂 Opção A: Deploy via Git

#### 1️⃣ Configurar Repositório Remoto

```bash
# Mudar para o usuário da aplicação
sudo su - management

# Clonar repositório
cd /opt/management_system
git clone https://github.com/seu-usuario/management_system.git app
cd app

# Configurar Git para atualizações futuras
git config pull.rebase false
```

#### 2️⃣ Configurar Ambiente Python

```bash
# Criar ambiente virtual
python3 -m venv /opt/management_system/venv

# Ativar ambiente virtual
source /opt/management_system/venv/bin/activate

# Atualizar pip e instalar dependências
pip install --upgrade pip
pip install -r backend/requirements.txt

# Instalar psycopg2 para PostgreSQL
pip install psycopg2-binary
```

#### 3️⃣ Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env de produção
cat > /opt/management_system/app/.env << 'EOF'
# ======================================================
# 🐍 CONFIGURAÇÕES DE PRODUÇÃO
# ======================================================
SECRET_KEY=sua-chave-secreta-super-segura-aqui-mude-sempre
DEBUG=False
ALLOWED_HOSTS=seu-dominio.com,www.seu-dominio.com,localhost

# ======================================================
# 🗄️ BANCO DE DADOS POSTGRESQL
# ======================================================
DATABASE_ENGINE=postgresql
DATABASE_NAME=management_system_db
DATABASE_USER=management_user
DATABASE_PASSWORD=sua_senha_segura_aqui
DATABASE_HOST=localhost
DATABASE_PORT=5432

# ======================================================
# 🔐 JWT CONFIGURAÇÕES
# ======================================================
ACCESS_TOKEN_LIFETIME=60
REFRESH_TOKEN_LIFETIME=7
JWT_ALGORITHM=HS256
JWT_SECRET_KEY=sua-chave-jwt-super-secreta

# ======================================================
# 🌐 CORS E CSRF
# ======================================================
CORS_ALLOWED_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com
CSRF_TRUSTED_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com
CORS_ALLOW_CREDENTIALS=True

# ======================================================
# 📧 EMAIL SMTP
# ======================================================
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua-senha-de-app
DEFAULT_FROM_EMAIL=Sistema de Gestão <seu-email@gmail.com>

# ======================================================
# 📁 ARQUIVOS E MÍDIA
# ======================================================
MEDIA_ROOT=/opt/management_system/media
MEDIA_URL=/media/
STATIC_ROOT=/opt/management_system/static
STATIC_URL=/static/
MAX_UPLOAD_SIZE=100
ALLOWED_FILE_TYPES=pdf,doc,docx,xls,xlsx,ppt,pptx,txt,zip,rar,mp4,avi,mov,jpg,jpeg,png,gif

# ======================================================
# 📊 LOGGING
# ======================================================
LOG_LEVEL=INFO
LOG_DIR=/opt/management_system/logs

# ======================================================
# 🔒 SEGURANÇA
# ======================================================
USE_HTTPS=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
EOF

# Definir permissões seguras
chmod 600 /opt/management_system/app/.env
```

#### 4️⃣ Executar Migrações e Configurações

```bash
# Ativar ambiente virtual
source /opt/management_system/venv/bin/activate

# Navegar para o backend
cd /opt/management_system/app/backend

# Executar migrações
python manage.py makemigrations
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

# Definir permissões
sudo chown -R management:management /opt/management_system
```

#### 5️⃣ Configurar Frontend

```bash
# Navegar para o frontend
cd /opt/management_system/app/frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente do frontend
cat > .env << 'EOF'
VITE_API_BASE_URL=https://seu-dominio.com/api
EOF

# Build de produção
npm run build

# Mover arquivos para diretório do Nginx
sudo cp -r dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html
```

#### 6️⃣ Comandos para Atualizações Futuras

```bash
# Script de atualização via Git
cat > /opt/management_system/update.sh << 'EOF'
#!/bin/bash
set -e

echo "🔄 Iniciando atualização do sistema..."

# Mudar para usuário da aplicação
cd /opt/management_system/app

# Fazer backup do banco antes da atualização
sudo -u postgres pg_dump management_system_db > /opt/management_system/backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Parar serviços
sudo systemctl stop management_system
sudo systemctl stop nginx

# Atualizar código
git pull origin main

# Ativar ambiente virtual
source /opt/management_system/venv/bin/activate

# Atualizar dependências Python
pip install -r backend/requirements.txt

# Executar migrações
cd backend
python manage.py migrate
python manage.py collectstatic --noinput

# Atualizar frontend
cd ../frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/

# Reiniciar serviços
sudo systemctl start management_system
sudo systemctl start nginx

echo "✅ Atualização concluída!"
EOF

chmod +x /opt/management_system/update.sh
```

### 📁 Opção B: Deploy via Transferência de Arquivos (FileZilla)

#### 1️⃣ Estrutura de Diretórios Necessária

**No servidor, criar a estrutura:**

```bash
sudo mkdir -p /opt/management_system/{app,logs,media,static,backups}
sudo chown -R management:management /opt/management_system
```

#### 2️⃣ Arquivos Essenciais para Transferir

**Via FileZilla, transferir os seguintes arquivos/diretórios:**

```
Local (Windows)                    → Servidor Linux
─────────────────────────────────────────────────────────
backend/                          → /opt/management_system/app/backend/
frontend/dist/                    → /var/www/html/
.env                              → /opt/management_system/app/.env
requirements.txt                  → /opt/management_system/app/backend/requirements.txt
manage.py                         → /opt/management_system/app/backend/manage.py
wait-for-db.sh                   → /opt/management_system/app/wait-for-db.sh
```

#### 3️⃣ Configuração Pós-Transferência

```bash
# Definir permissões corretas
sudo chown -R management:management /opt/management_system
sudo chmod +x /opt/management_system/app/wait-for-db.sh

# Configurar ambiente Python
sudo su - management
cd /opt/management_system
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r app/backend/requirements.txt
pip install psycopg2-binary gunicorn

# Executar configurações do Django
cd app/backend
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py collectstatic --noinput
```

#### 4️⃣ Permissões Necessárias

```bash
# Definir permissões de arquivos
sudo chown -R management:management /opt/management_system
sudo chmod -R 755 /opt/management_system/app
sudo chmod 600 /opt/management_system/app/.env
sudo chmod +x /opt/management_system/app/backend/manage.py

# Permissões para arquivos estáticos e mídia
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html
```

### ⚙️ Comandos Manuais de Gerenciamento

#### 🚀 Iniciar/Parar Sistema

```bash
# Iniciar sistema completo
sudo systemctl start management_system
sudo systemctl start nginx
sudo systemctl start postgresql

# Parar sistema completo
sudo systemctl stop management_system
sudo systemctl stop nginx

# Reiniciar sistema
sudo systemctl restart management_system
sudo systemctl restart nginx

# Verificar status
sudo systemctl status management_system
sudo systemctl status nginx
sudo systemctl status postgresql
```

#### 📊 Verificar Logs

```bash
# Logs da aplicação Django
sudo tail -f /opt/management_system/logs/django.log

# Logs do Gunicorn
sudo journalctl -u management_system -f

# Logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-13-main.log
```

#### 🔄 Atualizar Sistema

```bash
# Atualização manual completa
sudo systemctl stop management_system

# Ativar ambiente virtual
sudo su - management
source /opt/management_system/venv/bin/activate

# Atualizar dependências
cd /opt/management_system/app/backend
pip install -r requirements.txt

# Executar migrações
python manage.py migrate
python manage.py collectstatic --noinput

# Reiniciar serviço
exit
sudo systemctl start management_system
```

#### 💾 Backup Manual

```bash
# Backup do banco de dados
sudo -u postgres pg_dump management_system_db > /opt/management_system/backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Backup dos arquivos de mídia
sudo tar -czf /opt/management_system/backups/media_$(date +%Y%m%d_%H%M%S).tar.gz /opt/management_system/media/

# Backup da configuração
sudo cp /opt/management_system/app/.env /opt/management_system/backups/.env_$(date +%Y%m%d_%H%M%S)
```

### 🤖 Script de Deploy Automatizado (Opcional)

Criar o arquivo `/opt/management_system/deploy.sh`:

```bash
sudo tee /opt/management_system/deploy.sh > /dev/null << 'EOF'
#!/bin/bash
# ======================================================
# 🚀 SCRIPT DE DEPLOY AUTOMATIZADO - LINUX
# ======================================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Verificar se está executando como root
if [[ $EUID -eq 0 ]]; then
   error "Este script não deve ser executado como root"
   exit 1
fi

log "🚀 Iniciando deploy do Sistema de Gestão de Sala de Aula"

# Definir variáveis
APP_DIR="/opt/management_system/app"
VENV_DIR="/opt/management_system/venv"
BACKUP_DIR="/opt/management_system/backups"
LOG_DIR="/opt/management_system/logs"

# Criar backup antes do deploy
log "💾 Criando backup do banco de dados..."
sudo -u postgres pg_dump management_system_db > "$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"

# Parar serviços
log "⏹️ Parando serviços..."
sudo systemctl stop management_system || warn "Serviço management_system não estava rodando"

# Atualizar código (se usando Git)
if [ -d "$APP_DIR/.git" ]; then
    log "📥 Atualizando código do repositório..."
    cd "$APP_DIR"
    git pull origin main
else
    warn "Repositório Git não encontrado. Pulando atualização de código."
fi

# Ativar ambiente virtual
log "🐍 Ativando ambiente virtual..."
source "$VENV_DIR/bin/activate"

# Atualizar dependências Python
log "📦 Atualizando dependências Python..."
cd "$APP_DIR/backend"
pip install -r requirements.txt

# Executar migrações
log "🗄️ Executando migrações do banco de dados..."
python manage.py migrate

# Coletar arquivos estáticos
log "📁 Coletando arquivos estáticos..."
python manage.py collectstatic --noinput

# Atualizar frontend (se existir)
if [ -d "$APP_DIR/frontend" ]; then
    log "⚛️ Atualizando frontend..."
    cd "$APP_DIR/frontend"
    npm install
    npm run build
    sudo cp -r dist/* /var/www/html/
    sudo chown -R www-data:www-data /var/www/html
fi

# Definir permissões
log "🔒 Definindo permissões..."
sudo chown -R management:management /opt/management_system
sudo chmod 600 "$APP_DIR/.env"

# Reiniciar serviços
log "🔄 Reiniciando serviços..."
sudo systemctl start management_system
sudo systemctl start nginx

# Verificar se os serviços estão rodando
sleep 5
if sudo systemctl is-active --quiet management_system; then
    log "✅ Serviço management_system está rodando"
else
    error "❌ Falha ao iniciar management_system"
    exit 1
fi

if sudo systemctl is-active --quiet nginx; then
    log "✅ Nginx está rodando"
else
    error "❌ Falha ao iniciar Nginx"
    exit 1
fi

# Teste de conectividade
log "🔍 Testando conectividade..."
if curl -f -s http://localhost:8000/api/health/ > /dev/null; then
    log "✅ API está respondendo"
else
    warn "⚠️ API pode não estar respondendo corretamente"
fi

log "🎉 Deploy concluído com sucesso!"
log "📋 Próximos passos:"
log "   - Verificar logs: sudo journalctl -u management_system -f"
log "   - Acessar sistema: https://seu-dominio.com"
log "   - Monitorar: sudo systemctl status management_system"

EOF

# Tornar executável
sudo chmod +x /opt/management_system/deploy.sh
sudo chown management:management /opt/management_system/deploy.sh
```

**Para executar o deploy automatizado:**

```bash
# Executar como usuário management
sudo su - management
/opt/management_system/deploy.sh
```

## 🚀 Rodando em Produção

### 🔧 Configuração do Serviço (systemd)

#### 1️⃣ Criar Arquivo de Serviço

```bash
sudo tee /etc/systemd/system/management_system.service > /dev/null << 'EOF'
[Unit]
Description=Sistema de Gestão de Sala de Aula - Gunicorn
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=notify
User=management
Group=management
WorkingDirectory=/opt/management_system/app/backend
Environment=PATH=/opt/management_system/venv/bin
EnvironmentFile=/opt/management_system/app/.env
ExecStart=/opt/management_system/venv/bin/gunicorn \
    --bind unix:/opt/management_system/management_system.sock \
    --workers 3 \
    --worker-class gthread \
    --threads 2 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --timeout 120 \
    --keep-alive 5 \
    --user management \
    --group management \
    --log-level info \
    --log-file /opt/management_system/logs/gunicorn.log \
    --access-logfile /opt/management_system/logs/access.log \
    --error-logfile /opt/management_system/logs/error.log \
    --capture-output \
    backend.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
```

#### 2️⃣ Configurar Nginx

```bash
sudo tee /etc/nginx/sites-available/management_system << 'EOF'
# ======================================================
# 🌐 CONFIGURAÇÃO NGINX - SISTEMA DE GESTÃO
# ======================================================

upstream management_system {
    server unix:/opt/management_system/management_system.sock;
}

# Redirecionamento HTTP para HTTPS
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

# Configuração HTTPS
server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    # Certificados SSL (configure com Let's Encrypt ou seu certificado)
    ssl_certificate /etc/ssl/certs/seu-dominio.com.crt;
    ssl_certificate_key /etc/ssl/private/seu-dominio.com.key;
    
    # Configurações SSL seguras
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Headers de segurança
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Configurações gerais
    client_max_body_size 100M;
    keepalive_timeout 65;
    
    # Logs
    access_log /var/log/nginx/management_system_access.log;
    error_log /var/log/nginx/management_system_error.log;

    # Servir arquivos estáticos do frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
        
        # Cache para arquivos estáticos
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Proxy para API Django
    location /api/ {
        proxy_pass http://management_system;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Admin Django
    location /admin/ {
        proxy_pass http://management_system;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # Arquivos estáticos Django
    location /static/ {
        alias /opt/management_system/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Arquivos de mídia
    location /media/ {
        alias /opt/management_system/media/;
        expires 1y;
        add_header Cache-Control "public";
        
        # Proteção para arquivos sensíveis
        location ~* \.(php|py|pl|sh|cgi)$ {
            deny all;
        }
    }

    # Bloquear acesso a arquivos sensíveis
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log|ini|conf)$ {
        deny all;
    }
}
EOF

# Habilitar site
sudo ln -sf /etc/nginx/sites-available/management_system /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

#### 3️⃣ Habilitar e Iniciar Serviços

```bash
# Recarregar systemd
sudo systemctl daemon-reload

# Habilitar serviços para iniciar no boot
sudo systemctl enable management_system
sudo systemctl enable nginx
sudo systemctl enable postgresql

# Iniciar serviços
sudo systemctl start management_system
sudo systemctl start nginx

# Verificar status
sudo systemctl status management_system
sudo systemctl status nginx
```

### 📊 Monitoramento Recomendado

#### 1️⃣ Configurar Logrotate

```bash
sudo tee /etc/logrotate.d/management_system << 'EOF'
/opt/management_system/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 management management
    postrotate
        systemctl reload management_system
    endscript
}
EOF
```

#### 2️⃣ Script de Monitoramento

```bash
sudo tee /opt/management_system/monitor.sh << 'EOF'
#!/bin/bash
# ======================================================
# 📊 SCRIPT DE MONITORAMENTO - SISTEMA DE GESTÃO
# ======================================================

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "📊 Status do Sistema de Gestão de Sala de Aula"
echo "=============================================="

# Verificar serviços
services=("management_system" "nginx" "postgresql")
for service in "${services[@]}"; do
    if systemctl is-active --quiet "$service"; then
        echo -e "✅ $service: ${GREEN}ATIVO${NC}"
    else
        echo -e "❌ $service: ${RED}INATIVO${NC}"
    fi
done

echo ""

# Verificar uso de recursos
echo "💻 Uso de Recursos:"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')%"
echo "RAM: $(free -m | awk 'NR==2{printf "%.1f%%", $3*100/$2 }')"
echo "Disco: $(df -h / | awk 'NR==2 {print $5}')"

echo ""

# Verificar conectividade
echo "🌐 Conectividade:"
if curl -f -s http://localhost:8000/api/health/ > /dev/null 2>&1; then
    echo -e "✅ API: ${GREEN}RESPONDENDO${NC}"
else
    echo -e "❌ API: ${RED}NÃO RESPONDE${NC}"
fi

if curl -f -s http://localhost/ > /dev/null 2>&1; then
    echo -e "✅ Frontend: ${GREEN}RESPONDENDO${NC}"
else
    echo -e "❌ Frontend: ${RED}NÃO RESPONDE${NC}"
fi

echo ""

# Verificar logs recentes
echo "📋 Logs Recentes (últimas 5 linhas):"
echo "--- Gunicorn ---"
tail -n 5 /opt/management_system/logs/gunicorn.log 2>/dev/null || echo "Log não encontrado"

echo "--- Nginx Error ---"
tail -n 5 /var/log/nginx/management_system_error.log 2>/dev/null || echo "Log não encontrado"

echo ""

# Verificar espaço em disco
echo "💾 Espaço em Disco:"
df -h /opt/management_system | tail -n 1

echo ""

# Verificar processos
echo "🔄 Processos Ativos:"
ps aux | grep -E "(gunicorn|nginx)" | grep -v grep | wc -l | xargs echo "Processos rodando:"
EOF

sudo chmod +x /opt/management_system/monitor.sh
sudo chown management:management /opt/management_system/monitor.sh
```

#### 3️⃣ Configurar Cron para Monitoramento

```bash
# Adicionar ao crontab do usuário management
sudo -u management crontab -e

# Adicionar estas linhas:
# Monitoramento a cada 5 minutos
*/5 * * * * /opt/management_system/monitor.sh >> /opt/management_system/logs/monitor.log 2>&1

# Backup diário às 2:00 AM
0 2 * * * /usr/bin/pg_dump management_system_db > /opt/management_system/backups/daily_backup_$(date +\%Y\%m\%d).sql

# Limpeza de backups antigos (manter 30 dias)
0 3 * * * find /opt/management_system/backups -name "*.sql" -mtime +30 -delete
```

### 🛠️ Procedimentos de Manutenção

#### 1️⃣ Backup Regular

```bash
# Script de backup completo
sudo tee /opt/management_system/backup.sh << 'EOF'
#!/bin/bash
set -e

BACKUP_DIR="/opt/management_system/backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "💾 Iniciando backup completo..."

# Backup do banco de dados
echo "📊 Backup do banco de dados..."
sudo -u postgres pg_dump management_system_db > "$BACKUP_DIR/db_backup_$DATE.sql"

# Backup dos arquivos de mídia
echo "📁 Backup dos arquivos de mídia..."
tar -czf "$BACKUP_DIR/media_backup_$DATE.tar.gz" /opt/management_system/media/

# Backup da configuração
echo "⚙️ Backup da configuração..."
cp /opt/management_system/app/.env "$BACKUP_DIR/env_backup_$DATE"

# Backup dos logs
echo "📋 Backup dos logs..."
tar -czf "$BACKUP_DIR/logs_backup_$DATE.tar.gz" /opt/management_system/logs/

echo "✅ Backup concluído: $DATE"

# Limpeza de backups antigos (manter 30 dias)
find "$BACKUP_DIR" -name "*backup*" -mtime +30 -delete

echo "🧹 Limpeza de backups antigos concluída"
EOF

sudo chmod +x /opt/management_system/backup.sh
sudo chown management:management /opt/management_system/backup.sh
```

#### 2️⃣ Atualização de Segurança

```bash
# Script de atualização de segurança
sudo tee /opt/management_system/security_update.sh << 'EOF'
#!/bin/bash
set -e

echo "🔒 Iniciando atualização de segurança..."

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Atualizar dependências Python
source /opt/management_system/venv/bin/activate
pip install --upgrade pip
pip list --outdated --format=freeze | grep -v '^\-e' | cut -d = -f 1 | xargs -n1 pip install -U

# Verificar vulnerabilidades
pip-audit

# Reiniciar serviços se necessário
sudo systemctl restart management_system

echo "✅ Atualização de segurança concluída"
EOF

sudo chmod +x /opt/management_system/security_update.sh
```

#### 3️⃣ Restauração de Backup

```bash
# Script de restauração
sudo tee /opt/management_system/restore.sh << 'EOF'
#!/bin/bash
set -e

if [ $# -eq 0 ]; then
    echo "Uso: $0 <arquivo_backup_db.sql>"
    echo "Exemplo: $0 /opt/management_system/backups/db_backup_20240101_120000.sql"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Arquivo de backup não encontrado: $BACKUP_FILE"
    exit 1
fi

echo "⚠️ ATENÇÃO: Esta operação irá substituir o banco de dados atual!"
read -p "Deseja continuar? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operação cancelada."
    exit 1
fi

echo "🔄 Iniciando restauração..."

# Parar aplicação
sudo systemctl stop management_system

# Fazer backup atual antes da restauração
echo "💾 Criando backup de segurança..."
sudo -u postgres pg_dump management_system_db > "/opt/management_system/backups/pre_restore_backup_$(date +%Y%m%d_%H%M%S).sql"

# Restaurar banco
echo "📊 Restaurando banco de dados..."
sudo -u postgres dropdb management_system_db
sudo -u postgres createdb management_system_db
sudo -u postgres psql management_system_db < "$BACKUP_FILE"

# Recriar usuário e permissões
sudo -u postgres psql << EOF
GRANT ALL PRIVILEGES ON DATABASE management_system_db TO management_user;
EOF

# Reiniciar aplicação
sudo systemctl start management_system

echo "✅ Restauração concluída!"
EOF

sudo chmod +x /opt/management_system/restore.sh
```

## 🐳 Deploy com Docker (Alternativa)

Para uma alternativa mais simples usando Docker, você pode usar os arquivos `docker-compose.yml` já configurados:

### 🚀 Deploy de Desenvolvimento

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/management_system.git
cd management_system

# Configurar .env
cp .env.example .env
# Editar .env conforme necessário

# Executar com Docker Compose
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

### 🏭 Deploy de Produção

```bash
# Usar arquivo de produção
docker-compose -f docker-compose.prod.yml up -d

# Verificar status
docker-compose -f docker-compose.prod.yml ps

# Logs de produção
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔧 Troubleshooting

### ❌ Problemas Comuns

#### 1️⃣ Erro de Permissão

```bash
# Corrigir permissões
sudo chown -R management:management /opt/management_system
sudo chmod 600 /opt/management_system/app/.env
sudo chmod +x /opt/management_system/app/backend/manage.py
```

#### 2️⃣ Erro de Conexão com Banco

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
sudo -u postgres psql -c "SELECT version();"

# Verificar configurações no .env
grep DATABASE /opt/management_system/app/.env
```

#### 3️⃣ Erro 502 Bad Gateway

```bash
# Verificar se Gunicorn está rodando
sudo systemctl status management_system

# Verificar logs do Gunicorn
sudo journalctl -u management_system -f

# Verificar configuração do Nginx
sudo nginx -t
```

#### 4️⃣ Arquivos Estáticos Não Carregam

```bash
# Coletar arquivos estáticos novamente
source /opt/management_system/venv/bin/activate
cd /opt/management_system/app/backend
python manage.py collectstatic --noinput

# Verificar permissões
sudo chown -R www-data:www-data /opt/management_system/static
```

### 🔍 Comandos de Diagnóstico

```bash
# Verificar portas em uso
sudo netstat -tlnp | grep -E ':80|:443|:8000|:5432'

# Verificar processos
ps aux | grep -E "(gunicorn|nginx|postgres)"

# Verificar espaço em disco
df -h

# Verificar memória
free -h

# Verificar logs do sistema
sudo journalctl -xe
```

## 📚 Documentação Adicional

### 🔗 Links Úteis

- **Django Documentation**: https://docs.djangoproject.com/
- **Django REST Framework**: https://www.django-rest-framework.org/
- **React Documentation**: https://react.dev/
- **Vite Documentation**: https://vitejs.dev/
- **Nginx Documentation**: https://nginx.org/en/docs/
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/

### 📁 Estrutura de Arquivos

```
management_system/
├── backend/                    # Backend Django
│   ├── backend/               # Configurações Django
│   ├── core/                  # App principal
│   ├── manage.py              # Comando Django
│   └── requirements.txt       # Dependências Python
├── frontend/                  # Frontend React
│   ├── src/                   # Código fonte
│   ├── public/                # Arquivos públicos
│   ├── package.json           # Dependências Node.js
│   └── vite.config.ts         # Configuração Vite
├── nginx/                     # Configurações Nginx
├── scripts/                   # Scripts de automação
├── .env.example               # Exemplo de variáveis
├── docker-compose.yml         # Docker desenvolvimento
├── docker-compose.prod.yml    # Docker produção
├── Dockerfile                 # Imagem Docker
└── README.md                  # Esta documentação
```

### 🆘 Suporte

Para suporte técnico:

1. **Verificar logs** primeiro usando os comandos de diagnóstico
2. **Consultar documentação** oficial das tecnologias
3. **Abrir issue** no repositório do projeto
4. **Contatar equipe** de desenvolvimento

---

**📝 Última atualização**: $(date +%Y-%m-%d)  
**👨‍💻 Mantido por**: Equipe de Desenvolvimento  
**📄 Licença**: MIT License