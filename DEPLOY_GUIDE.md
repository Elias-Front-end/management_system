# 🚀 GUIA COMPLETO DE DEPLOY - Sistema de Gestão de Sala de Aula

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Deploy Local (Desenvolvimento)](#deploy-local-desenvolvimento)
3. [Deploy com Docker](#deploy-com-docker)
4. [Deploy em Plataformas PaaS (Render/Railway)](#deploy-em-plataformas-paas-renderrailway)
5. [Deploy em Cloud Providers](#deploy-em-cloud-providers)
6. [Deploy em Produção (VPS/Servidor Próprio)](#deploy-em-produção-vpsservidor-próprio)
7. [Configurações de Ambiente](#configurações-de-ambiente)
8. [Testes e Validação](#testes-e-validação)
9. [Troubleshooting](#troubleshooting)
10. [Monitoramento e Manutenção](#monitoramento-e-manutenção)

---

## 🔧 Pré-requisitos

### Para Windows
```powershell
# Instalar Python 3.10+
winget install Python.Python.3.10

# Instalar Node.js 18+
winget install OpenJS.NodeJS

# Instalar Git
winget install Git.Git

# Instalar Docker Desktop
winget install Docker.DockerDesktop

# Verificar instalações
python --version
node --version
git --version
docker --version
docker-compose --version
```

### Para Linux (Ubuntu/Debian)
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Python 3.10+
sudo apt install python3.10 python3.10-venv python3-pip -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Git
sudo apt install git -y

# Instalar Docker
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalações
python3 --version
node --version
git --version
docker --version
docker-compose --version
```

---

## 🏠 Deploy Local (Desenvolvimento)

### Método 1: Desenvolvimento Local Simples (Recomendado para Iniciantes)

Este método usa SQLite e é ideal para desenvolvimento rápido e testes.

#### 1. Preparar o Ambiente

```bash
# Clonar repositório
git clone <url-do-repositorio>
cd management_system

# Verificar pré-requisitos
python --version  # Deve ser 3.10+
node --version     # Deve ser 18+
```

#### 2. Configurar Backend (Django + SQLite)

```bash
# Navegar para o backend
cd backend

# Criar e ativar ambiente virtual
python -m venv .venv

# Ativar ambiente virtual
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Windows CMD:
.venv\Scripts\activate.bat
# Linux/Mac:
source .venv/bin/activate

# Instalar dependências essenciais (sem PostgreSQL)
pip install Django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow python-decouple

# Executar migrações (SQLite é configurado por padrão)
python manage.py makemigrations
python manage.py migrate

# Criar superusuário automaticamente
python set_admin_password.py

# Iniciar servidor Django
python manage.py runserver 8000
```

#### 3. Configurar Frontend (React)

```bash
# Em outro terminal, navegar para o frontend
cd frontend

# Instalar dependências
npm install

# Iniciar servidor React
npm run dev
```

#### 4. Acessar a Aplicação

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/

**Credenciais padrão:**
- **Admin**: `admin` / `admin123`
- **Importante**: Selecione "Administrador" no tipo de perfil ao fazer login

---

### Método 2: Desenvolvimento Completo (PostgreSQL)

Para desenvolvimento mais próximo ao ambiente de produção.

#### 1. Clonar e Configurar o Projeto

```bash
# Clonar repositório
git clone <url-do-repositorio>
cd management_system

# Criar arquivo de ambiente
cp backend/.env.example backend/.env
```

#### 2. Configurar Backend (Django + PostgreSQL)

```bash
# Navegar para o backend
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências completas
pip install -r requirements.txt

# Configurar banco de dados
python manage.py makemigrations
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

# Executar testes
python manage.py test

# Iniciar servidor de desenvolvimento
python manage.py runserver 8000
```

#### 3. Configurar Frontend (React)

```bash
# Em outro terminal, navegar para o frontend
cd frontend

# Instalar dependências
npm install

# Executar testes
npm run test

# Iniciar servidor de desenvolvimento
npm run dev
```

#### 4. Acessar a Aplicação

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/

---

## 🐳 Deploy com Docker

### Configuração Rápida (Recomendado)

```bash
# 1. Clonar o projeto
git clone <url-do-repositorio>
cd management_system

# 2. Configurar variáveis de ambiente
cp backend/.env.example backend/.env
# Editar backend/.env conforme necessário

# 3. Construir e iniciar todos os serviços
docker-compose up --build -d

# 4. Verificar status
docker-compose ps

# 5. Executar migrações
docker-compose exec backend python manage.py migrate

# 6. Criar superusuário
docker-compose exec backend python manage.py createsuperuser

# 7. Acessar aplicação
# Frontend: http://localhost:5174
# Backend: http://localhost:8000
# Admin: http://localhost:8000/admin/
```

### Comandos Docker Úteis

```bash
# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Parar serviços
docker-compose down

# Parar e remover volumes (CUIDADO: apaga dados)
docker-compose down --volumes

# Reconstruir serviços
docker-compose up --build

# Executar comandos no container
docker-compose exec backend python manage.py shell
docker-compose exec backend python manage.py test
docker-compose exec db psql -U postgres -d management_system

# Backup do banco
docker-compose exec db pg_dump -U postgres management_system > backup.sql

# Restaurar backup
docker-compose exec -T db psql -U postgres management_system < backup.sql
```

### Docker em Produção

```bash
# Usar arquivo de produção
docker-compose -f docker-compose.prod.yml up --build -d

# Configurar variáveis de produção no .env
# DEBUG=False
# ALLOWED_HOSTS=seudominio.com,www.seudominio.com
# DATABASE_URL=postgresql://user:pass@db:5432/dbname
```

---

## 🌐 Deploy em Plataformas PaaS (Render/Railway)

### Visão Geral

As plataformas PaaS (Platform as a Service) oferecem uma alternativa simples ao Docker, ideal para:
- **Iniciantes** que querem deploy rápido sem configuração complexa
- **Projetos pequenos/médios** com tráfego moderado
- **Prototipagem** e demonstrações
- **Deploy automático** via Git

**Vantagens:**
- ✅ Deploy automático a cada push no Git
- ✅ SSL/HTTPS automático
- ✅ Banco de dados gerenciado
- ✅ Monitoramento integrado
- ✅ Escalabilidade automática

**Desvantagens:**
- ❌ Custo pode ser maior em escala
- ❌ Menos controle sobre infraestrutura
- ❌ Dependência da plataforma

---

### 🎨 Opção 1: Render.com (Recomendado)

#### Características
- **Plano gratuito** disponível (com limitações)
- **Deploy automático** via GitHub/GitLab
- **PostgreSQL gratuito** (até 1GB)
- **SSL automático**
- **Logs em tempo real**

#### Passo a Passo

##### 1. Preparar o Projeto

```bash
# 1. Criar arquivos de configuração para Render
cd management_system

# 2. Criar build.sh para o backend
echo '#!/usr/bin/env bash
set -o errexit

cd backend
pip install -r requirements.txt
python manage.py collectstatic --clear --noinput
python manage.py migrate' > build.sh

chmod +x build.sh

# 3. Criar start.sh para o backend
echo '#!/usr/bin/env bash
cd backend
gunicorn backend.wsgi:application' > start.sh

chmod +x start.sh
```

##### 2. Configurar Backend no Render

```yaml
# render.yaml (opcional - pode configurar via interface)
services:
  - type: web
    name: management-system-backend
    env: python
    buildCommand: "./build.sh"
    startCommand: "./start.sh"
    envVars:
      - key: DEBUG
        value: False
      - key: ALLOWED_HOSTS
        value: management-system-backend.onrender.com
      - key: DATABASE_URL
        fromDatabase:
          name: management-system-db
          property: connectionString

databases:
  - name: management-system-db
    databaseName: management_system
    user: management_user
```

**Passos na Interface Render:**

1. **Criar conta** em [render.com](https://render.com)
2. **Conectar repositório** GitHub/GitLab
3. **Criar Web Service** para backend:
   - **Build Command**: `./build.sh`
   - **Start Command**: `./start.sh`
   - **Environment**: `Python 3`
4. **Criar PostgreSQL Database**:
   - Nome: `management-system-db`
   - Conectar ao Web Service
5. **Configurar variáveis de ambiente**:
   ```
   DEBUG=False
   ALLOWED_HOSTS=your-app-name.onrender.com
   SECRET_KEY=your-secret-key
   ```

##### 3. Configurar Frontend no Render

```bash
# Build command para frontend
cd frontend && npm install && npm run build

# Publish directory
frontend/dist
```

**Passos na Interface:**

1. **Criar Static Site** para frontend:
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
2. **Configurar variáveis de ambiente**:
   ```
   VITE_API_URL=https://your-backend-name.onrender.com/api
   ```

##### 4. Deploy e Teste

```bash
# 1. Fazer push para repositório
git add .
git commit -m "Configure for Render deployment"
git push origin main

# 2. Render fará deploy automático
# 3. Acessar URLs fornecidas:
# - Backend: https://your-backend-name.onrender.com
# - Frontend: https://your-frontend-name.onrender.com
```

---

### 🚂 Opção 2: Railway.app

#### Características
- **$5/mês** de crédito gratuito
- **Deploy extremamente simples**
- **Detecção automática** de tecnologias
- **Banco de dados com um clique**
- **Monitoramento avançado**

#### Passo a Passo

##### 1. Preparar o Projeto

```bash
# 1. Criar Procfile para o backend
echo "web: cd backend && gunicorn backend.wsgi:application --bind 0.0.0.0:\$PORT" > Procfile

# 2. Criar railway.json (opcional)
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
```

##### 2. Deploy no Railway

**Via Interface Web:**

1. **Criar conta** em [railway.app](https://railway.app)
2. **Conectar GitHub** e selecionar repositório
3. **Deploy automático**:
   - Railway detecta Django automaticamente
   - Instala dependências do `requirements.txt`
   - Configura variáveis automaticamente

**Via CLI:**

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Inicializar projeto
railway init

# 4. Deploy
railway up
```

##### 3. Configurar Banco de Dados

```bash
# 1. Adicionar PostgreSQL via interface Railway
# 2. Railway fornece DATABASE_URL automaticamente
# 3. Executar migrações:
railway run python backend/manage.py migrate
```

##### 4. Configurar Variáveis de Ambiente

```bash
# Via CLI
railway variables set DEBUG=False
railway variables set ALLOWED_HOSTS=your-app.railway.app
railway variables set SECRET_KEY=your-secret-key

# Via interface web: Settings > Variables
```

##### 5. Deploy Frontend (Separado)

```bash
# 1. Criar novo projeto Railway para frontend
railway init frontend-project

# 2. Configurar build
# Build Command: cd frontend && npm install && npm run build
# Start Command: npx serve -s frontend/dist -l $PORT

# 3. Deploy
railway up
```

---

### 🔧 Configurações Adicionais

#### Arquivos Necessários

**Para Render:**
```bash
# build.sh
#!/usr/bin/env bash
set -o errexit
cd backend
pip install -r requirements.txt
python manage.py collectstatic --clear --noinput
python manage.py migrate

# start.sh  
#!/usr/bin/env bash
cd backend
gunicorn backend.wsgi:application
```

**Para Railway:**
```bash
# Procfile
web: cd backend && gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT

# runtime.txt (opcional)
python-3.10.12
```

#### Variáveis de Ambiente Essenciais

```bash
# Backend
DEBUG=False
SECRET_KEY=your-super-secret-key
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=postgresql://user:pass@host:port/dbname
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com

# Frontend  
VITE_API_URL=https://your-backend-domain.com/api
```

#### Comandos Pós-Deploy

```bash
# Render (via dashboard ou CLI)
render-cli run "python backend/manage.py createsuperuser"

# Railway
railway run python backend/manage.py createsuperuser
railway run python backend/manage.py collectstatic --noinput
```

---

### 📊 Comparação Render vs Railway

| Aspecto | Render | Railway |
|---------|--------|---------|
| **Plano Gratuito** | ✅ Limitado | ✅ $5/mês crédito |
| **Facilidade** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **PostgreSQL** | ✅ 1GB gratuito | ✅ Pago |
| **SSL Automático** | ✅ | ✅ |
| **Deploy Automático** | ✅ | ✅ |
| **Logs** | ✅ Básico | ✅ Avançado |
| **Monitoramento** | ✅ Básico | ✅ Avançado |
| **Suporte** | 📧 Email | 💬 Discord |

### 🎯 Recomendação

- **Para iniciantes**: **Render.com** (plano gratuito)
- **Para projetos sérios**: **Railway.app** (melhor DX)
- **Para produção**: Considere ambos, mas teste performance

---

## ☁️ Deploy em Cloud Providers

### 1. Render.com (Recomendado para Iniciantes)

#### Backend (Django)
```yaml
# render.yaml
services:
  - type: web
    name: stratasec-backend
    env: python
    buildCommand: |
      cd backend
      pip install -r requirements.txt
      python manage.py collectstatic --noinput
      python manage.py migrate
    startCommand: |
      cd backend
      gunicorn backend.wsgi:application
    envVars:
      - key: PYTHON_VERSION
        value: 3.10.0
      - key: DATABASE_URL
        fromDatabase:
          name: stratasec-db
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: False

  - type: redis
    name: stratasec-redis
    ipAllowList: []

databases:
  - name: stratasec-db
    databaseName: stratasec
    user: stratasec
```

#### Frontend (React)
```yaml
# render.yaml (adicionar ao arquivo acima)
  - type: web
    name: stratasec-frontend
    env: node
    buildCommand: |
      cd frontend
      npm install
      npm run build
    startCommand: |
      cd frontend
      npm run preview
    envVars:
      - key: NODE_VERSION
        value: 18.0.0
      - key: VITE_API_URL
        value: https://stratasec-backend.onrender.com
```

### 2. Vercel (Frontend) + Railway (Backend)

#### Frontend no Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Configurar variáveis de ambiente no dashboard:
# VITE_API_URL=https://seu-backend.railway.app
```

#### Backend no Railway
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login e deploy
railway login
railway init
railway up

# Configurar variáveis no dashboard:
# DEBUG=False
# ALLOWED_HOSTS=seu-backend.railway.app
# DATABASE_URL=postgresql://...
```

### 3. DigitalOcean App Platform

```yaml
# .do/app.yaml
name: stratasec
services:
- name: backend
  source_dir: backend
  github:
    repo: seu-usuario/management_system
    branch: main
  run_command: gunicorn backend.wsgi:application
  environment_slug: python
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: DEBUG
    value: "False"
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}

- name: frontend
  source_dir: frontend
  github:
    repo: seu-usuario/management_system
    branch: main
  run_command: npm run preview
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  envs:
  - key: VITE_API_URL
    value: ${backend.PUBLIC_URL}

databases:
- name: db
  engine: PG
  version: "15"
```

### 4. AWS (Avançado)

#### Usando AWS Elastic Beanstalk
```bash
# Instalar EB CLI
pip install awsebcli

# Inicializar projeto
cd backend
eb init

# Criar ambiente
eb create production

# Deploy
eb deploy

# Configurar RDS PostgreSQL no console AWS
# Configurar variáveis de ambiente no EB
```

#### Usando AWS ECS com Docker
```yaml
# docker-compose.aws.yml
version: '3.8'
services:
  backend:
    image: seu-usuario/stratasec-backend:latest
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - DEBUG=False
    depends_on:
      - db

  frontend:
    image: seu-usuario/stratasec-frontend:latest
    environment:
      - VITE_API_URL=${BACKEND_URL}

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=stratasec
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
```

---

## 🖥️ Deploy em Produção (VPS/Servidor Próprio)

### 1. Configuração do Servidor (Ubuntu 20.04+)

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install python3-pip python3-venv postgresql postgresql-contrib nginx supervisor git -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar Docker (opcional)
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker $USER
```

### 2. Configurar PostgreSQL

```bash
# Acessar PostgreSQL
sudo -u postgres psql

# Criar banco e usuário
CREATE DATABASE stratasec_db;
CREATE USER stratasec_user WITH PASSWORD 'senha_forte_aqui';
ALTER ROLE stratasec_user SET client_encoding TO 'utf8';
ALTER ROLE stratasec_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE stratasec_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE stratasec_db TO stratasec_user;
\q
```

### 3. Deploy do Backend

```bash
# Criar diretório
sudo mkdir -p /var/www/stratasec
sudo chown $USER:$USER /var/www/stratasec

# Clonar projeto
cd /var/www/stratasec
git clone <repository-url> .

# Configurar backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# Configurar .env para produção
cat > .env << EOF
SECRET_KEY=sua-chave-secreta-muito-longa-e-complexa
DEBUG=False
ALLOWED_HOSTS=seudominio.com,www.seudominio.com,seu-ip
DATABASE_URL=postgresql://stratasec_user:senha_forte_aqui@localhost:5432/stratasec_db
CORS_ALLOWED_ORIGINS=https://seudominio.com,https://www.seudominio.com
EOF

# Executar migrações
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

### 4. Configurar Gunicorn

```bash
# Criar arquivo de configuração do Gunicorn
cat > /var/www/stratasec/backend/gunicorn.conf.py << EOF
bind = "127.0.0.1:8000"
workers = 3
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
timeout = 30
keepalive = 2
user = "www-data"
group = "www-data"
EOF

# Criar serviço systemd
sudo cat > /etc/systemd/system/stratasec.service << EOF
[Unit]
Description=Stratasec Django App
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/stratasec/backend
Environment="PATH=/var/www/stratasec/backend/venv/bin"
ExecStart=/var/www/stratasec/backend/venv/bin/gunicorn --config gunicorn.conf.py backend.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Ativar serviço
sudo systemctl daemon-reload
sudo systemctl enable stratasec
sudo systemctl start stratasec
sudo systemctl status stratasec
```

### 5. Deploy do Frontend

```bash
# Configurar frontend
cd /var/www/stratasec/frontend

# Configurar variáveis de ambiente
cat > .env << EOF
VITE_API_URL=https://seudominio.com
EOF

# Build do frontend
npm install
npm run build

# Mover arquivos para nginx
sudo cp -r dist/* /var/www/html/
```

### 6. Configurar Nginx

```bash
# Criar configuração do site
sudo cat > /etc/nginx/sites-available/stratasec << EOF
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Django Admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Arquivos estáticos Django
    location /static/ {
        alias /var/www/stratasec/backend/staticfiles/;
    }

    # Arquivos de mídia Django
    location /media/ {
        alias /var/www/stratasec/backend/media/;
    }
}
EOF

# Ativar site
sudo ln -s /etc/nginx/sites-available/stratasec /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d seudominio.com -d www.seudominio.com

# Renovação automática
sudo crontab -e
# Adicionar linha:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

---
# Executar servidor de desenvolvimento
python manage.py runserver 0.0.0.0:8000
```

### 3. Configurar Frontend (React)

```bash
# Em outro terminal, navegar para o frontend
cd frontend

# Instalar dependências
npm install

# Executar servidor de desenvolvimento
npm run dev
```

### 4. Acessar a Aplicação

- **Backend API**: http://localhost:8000/api/
- **Admin Django**: http://localhost:8000/admin/
- **Frontend React**: http://localhost:5174/

---

## 🐳 Deploy com Docker

### 1. Deploy de Desenvolvimento

```bash
# Na raiz do projeto
docker-compose up --build

# Para executar em background
docker-compose up -d --build

# Para parar os serviços
docker-compose down
```

### 2. Deploy de Produção

```bash
# Configurar variáveis de produção no .env
cp .env.example .env.prod

# Editar .env.prod com configurações de produção
# DEBUG=False
# ALLOWED_HOSTS=seu-dominio.com,www.seu-dominio.com
# DATABASE_ENGINE=postgresql
# etc...

# Executar em produção
docker-compose -f docker-compose.prod.yml up -d --build

# Executar migrações
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Criar superusuário
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Coletar arquivos estáticos
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

---

## 🌐 Deploy em Produção

### Opção 1: VPS/Servidor Dedicado

#### 1. Preparar Servidor

```bash
# Conectar ao servidor
ssh usuario@seu-servidor.com

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install python3.10 python3.10-venv python3-pip nginx postgresql redis-server -y

# Configurar firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

#### 2. Configurar Banco de Dados

```bash
# Configurar PostgreSQL
sudo -u postgres psql

CREATE DATABASE management_system;
CREATE USER management_user WITH PASSWORD 'senha_segura';
GRANT ALL PRIVILEGES ON DATABASE management_system TO management_user;
ALTER USER management_user CREATEDB;
\q
```

#### 3. Deploy da Aplicação

```bash
# Clonar projeto
git clone <url-do-repositorio> /var/www/management_system
cd /var/www/management_system

# Configurar backend
cd backend
python3.10 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
nano .env  # Editar com configurações de produção

# Executar migrações
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser

# Configurar Gunicorn
pip install gunicorn
```

#### 4. Configurar Nginx

```bash
# Criar configuração do Nginx
sudo nano /etc/nginx/sites-available/management_system
```

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root /var/www/management_system/backend;
    }
    
    location /media/ {
        root /var/www/management_system/backend;
    }

    location /api/ {
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn.sock;
    }

    location /admin/ {
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn.sock;
    }

    location / {
        root /var/www/management_system/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/management_system /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Configurar Systemd para Gunicorn

```bash
# Criar arquivo de serviço
sudo nano /etc/systemd/system/gunicorn.service
```

```ini
[Unit]
Description=gunicorn daemon
Requires=gunicorn.socket
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
RuntimeDirectory=gunicorn
WorkingDirectory=/var/www/management_system/backend
ExecStart=/var/www/management_system/backend/venv/bin/gunicorn \
          --access-logfile - \
          --workers 3 \
          --bind unix:/run/gunicorn.sock \
          backend.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true

[Install]
WantedBy=multi-user.target
```

```bash
# Criar socket
sudo nano /etc/systemd/system/gunicorn.socket
```

```ini
[Unit]
Description=gunicorn socket

[Socket]
ListenStream=/run/gunicorn.sock
SocketUser=www-data

[Install]
WantedBy=sockets.target
```

```bash
# Ativar serviços
sudo systemctl daemon-reload
sudo systemctl start gunicorn.socket
sudo systemctl enable gunicorn.socket
sudo systemctl status gunicorn.socket
```

#### 6. Build do Frontend

```bash
cd /var/www/management_system/frontend

# Instalar Node.js se necessário
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar dependências e fazer build
npm install
npm run build

# Configurar permissões
sudo chown -R www-data:www-data /var/www/management_system
sudo chmod -R 755 /var/www/management_system
```

### Opção 2: Plataformas Cloud (Render, Railway, etc.)

#### Deploy no Render

1. **Backend (Django)**:
   - Conectar repositório no Render
   - Configurar como "Web Service"
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `cd backend && gunicorn backend.wsgi:application`
   - Adicionar variáveis de ambiente

2. **Frontend (React)**:
   - Configurar como "Static Site"
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/dist`

3. **Banco de Dados**:
   - Criar PostgreSQL database no Render
   - Configurar DATABASE_URL no backend

---

## ⚙️ Configurações de Ambiente

### Variáveis de Ambiente Essenciais

#### Backend (.env)
```bash
# Configurações básicas
SECRET_KEY=sua-chave-secreta-muito-longa-e-complexa-com-pelo-menos-50-caracteres
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,seudominio.com,www.seudominio.com

# Banco de dados PostgreSQL
DATABASE_URL=postgresql://usuario:senha@localhost:5432/nome_do_banco

# Configurações de mídia e arquivos estáticos
MEDIA_URL=/media/
MEDIA_ROOT=/var/www/stratasec/backend/media/
STATIC_URL=/static/
STATIC_ROOT=/var/www/stratasec/backend/staticfiles/

# Configurações de CORS
CORS_ALLOWED_ORIGINS=http://localhost:5174,https://seudominio.com,https://www.seudominio.com
CORS_ALLOW_CREDENTIALS=True

# JWT (Simple JWT)
SIMPLE_JWT_ACCESS_TOKEN_LIFETIME=60  # minutos
SIMPLE_JWT_REFRESH_TOKEN_LIFETIME=1440  # minutos (24 horas)
SIMPLE_JWT_ROTATE_REFRESH_TOKENS=True

# Email (opcional)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua-senha-de-app

# Configurações de segurança (produção)
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SECURE_BROWSER_XSS_FILTER=True
SECURE_CONTENT_TYPE_NOSNIFF=True
```

#### Frontend (.env)
```bash
# URL da API
VITE_API_URL=http://localhost:8000
# Para produção: VITE_API_URL=https://seudominio.com

# Configurações de desenvolvimento
VITE_DEV_SERVER_PORT=5174
VITE_DEV_SERVER_HOST=0.0.0.0

# Configurações de build
VITE_BUILD_OUTDIR=dist
VITE_BUILD_SOURCEMAP=false
```

### Configurações por Ambiente

#### 🔧 Desenvolvimento
```bash
# Backend (.env.development)
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:5174,http://127.0.0.1:5174

# Frontend (.env.development)
VITE_API_URL=http://localhost:8000
VITE_DEV_SERVER_PORT=5174
```

#### 🧪 Teste
```bash
# Backend (.env.test)
DEBUG=True
DATABASE_URL=sqlite:///:memory:
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
CORS_ALLOWED_ORIGINS=http://localhost:5174

# Frontend (.env.test)
VITE_API_URL=http://localhost:8000
```

#### 🚀 Produção
```bash
# Backend (.env.production)
DEBUG=False
ALLOWED_HOSTS=seudominio.com,www.seudominio.com
DATABASE_URL=postgresql://user:pass@localhost:5432/stratasec_db
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000

# Frontend (.env.production)
VITE_API_URL=https://seudominio.com
```

---

## 🧪 Testes e Validação

### ⚠️ Configurações Críticas de CSRF (RESOLVIDO)

**IMPORTANTE**: Durante o desenvolvimento, foi identificado e corrigido um problema crítico com CSRF tokens. As seguintes configurações são essenciais:

#### Backend - Configurações CSRF (settings.py)
```python
# CSRF Settings - CRÍTICO para funcionamento do frontend
CSRF_COOKIE_HTTPONLY = False  # ⚠️ DEVE ser False para acesso JavaScript
CSRF_COOKIE_NAME = 'csrftoken'
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    # Adicionar domínios de produção aqui
]

# CORS Settings - Necessário para integração frontend/backend
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    # Adicionar domínios de produção aqui
]
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',  # ⚠️ CRÍTICO para CSRF
    'x-requested-with',
]
```

#### Frontend - Interceptor CSRF Automático (api.ts)
```typescript
// Função para obter CSRF token do cookie
const getCSRFToken = (): string | null => {
  const name = 'csrftoken';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Interceptor automático para incluir CSRF token
api.interceptors.request.use((config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
  }
  return config;
});
```

### Testes Automatizados

#### Backend (Django + pytest)
```bash
# Instalar dependências de teste
pip install pytest pytest-django pytest-cov factory-boy

# Executar todos os testes
pytest

# Executar com coverage
pytest --cov=. --cov-report=html

# Executar testes específicos
pytest apps/treinamentos/tests/
pytest apps/turmas/tests/test_models.py::TestTurmaModel

# Executar testes com verbose
pytest -v --tb=short

# ✅ Testar CSRF endpoint
curl -X GET http://localhost:8000/api/csrf/ -c cookies.txt
curl -X POST http://localhost:8000/api/alunos/ -b cookies.txt -H "X-CSRFToken: $(grep csrftoken cookies.txt | cut -f7)"
```

#### Frontend (React + Vitest)
```bash
# Executar testes unitários
npm run test

# Executar com coverage
npm run test:coverage

# Executar testes em modo watch
npm run test:watch

# Executar testes E2E (Playwright)
npm run test:e2e

# ✅ Testar integração CSRF
# Verificar se o token é obtido corretamente no browser console:
# document.cookie (deve mostrar csrftoken)
```

### Testes de API

#### Autenticação
```bash
# Registrar usuário
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "telefone": "11999999999",
    "password": "senha123"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "password": "senha123"
  }'

# Usar token retornado
TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."

# Testar endpoint protegido
curl -X GET http://localhost:8000/api/treinamentos/ \
  -H "Authorization: Bearer $TOKEN"
```

#### CRUD Operations
```bash
# Listar treinamentos
curl -X GET http://localhost:8000/api/treinamentos/ \
  -H "Authorization: Bearer $TOKEN"

# Criar treinamento (admin)
curl -X POST http://localhost:8000/api/treinamentos/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Python Avançado",
    "descricao": "Curso completo de Python"
  }'

# Listar turmas do aluno
curl -X GET http://localhost:8000/api/aluno/turmas/ \
  -H "Authorization: Bearer $TOKEN"
```

### Testes de Performance

#### Backend (Django Debug Toolbar)
```bash
# Instalar django-debug-toolbar
pip install django-debug-toolbar

# Adicionar ao settings.py (apenas desenvolvimento)
if DEBUG:
    INSTALLED_APPS += ['debug_toolbar']
    MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware']
    INTERNAL_IPS = ['127.0.0.1']
```

#### Load Testing com Artillery
```bash
# Instalar Artillery
npm install -g artillery

# Criar arquivo de teste (artillery-test.yml)
config:
  target: 'http://localhost:8000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/treinamentos/"
          headers:
            Authorization: "Bearer {{ token }}"

# Executar teste
artillery run artillery-test.yml
```

### Validação de Deploy

#### Script de Validação Completa
```bash
#!/bin/bash
# validate-deployment.sh

echo "🔍 Validando Deploy do Sistema de Gestão..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar status
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
        exit 1
    fi
}

# 1. Verificar containers Docker
echo -e "${YELLOW}📦 Verificando containers Docker...${NC}"
docker-compose ps | grep -q "Up"
check_status "Containers Docker rodando"

# 2. Verificar backend API
echo -e "${YELLOW}🔧 Verificando Backend API...${NC}"
curl -f -s http://localhost:8000/api/ > /dev/null
check_status "Backend API acessível"

# 3. Verificar Django Admin
echo -e "${YELLOW}👤 Verificando Django Admin...${NC}"
curl -f -s http://localhost:8000/admin/ > /dev/null
check_status "Django Admin acessível"

# 4. Verificar Frontend
echo -e "${YELLOW}🎨 Verificando Frontend...${NC}"
curl -f -s http://localhost:5174/ > /dev/null
check_status "Frontend acessível"

# 5. Verificar banco de dados
echo -e "${YELLOW}🗄️ Verificando Banco de Dados...${NC}"
docker-compose exec -T db psql -U postgres -d management_system -c "SELECT 1;" > /dev/null
check_status "Banco de dados conectado"

# 6. Verificar migrações
echo -e "${YELLOW}📋 Verificando Migrações...${NC}"
docker-compose exec -T backend python manage.py showmigrations --plan | grep -q "\[X\]"
check_status "Migrações aplicadas"

# 7. Verificar arquivos estáticos
echo -e "${YELLOW}📁 Verificando Arquivos Estáticos...${NC}"
curl -f -s http://localhost:8000/static/admin/css/base.css > /dev/null
check_status "Arquivos estáticos servidos"

echo -e "${GREEN}🎉 Deploy validado com sucesso!${NC}"
echo -e "${YELLOW}📋 URLs de acesso:${NC}"
echo -e "   Frontend: http://localhost:5174"
echo -e "   Backend API: http://localhost:8000/api/"
echo -e "   Django Admin: http://localhost:8000/admin/"
```

---

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. ⚠️ Erro de CSRF Token (CRÍTICO)
```bash
# Sintomas:
# - "CSRF Failed: CSRF token missing" nos logs
# - 403 Forbidden em requisições POST/PUT/PATCH/DELETE
# - Frontend não consegue fazer login/logout

# ✅ SOLUÇÃO IMPLEMENTADA:
# 1. Verificar configuração no backend (settings.py):
CSRF_COOKIE_HTTPONLY = False  # DEVE ser False!
CSRF_COOKIE_NAME = 'csrftoken'
CSRF_TRUSTED_ORIGINS = ['http://localhost:5174', 'http://127.0.0.1:5174']

# 2. Verificar se o endpoint CSRF existe:
curl -X GET http://localhost:8000/api/csrf/

# 3. Verificar se o frontend está obtendo o token:
# No browser console: document.cookie (deve mostrar csrftoken)

# 4. Verificar se o interceptor está funcionando:
# Inspecionar Network tab - requisições POST devem ter header X-CSRFToken

# 5. Reiniciar containers após mudanças:
docker-compose restart backend frontend
```

#### 2. Erro de CORS
```bash
# Verificar configurações no .env
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Verificar se django-cors-headers está instalado
pip install django-cors-headers
```

#### 3. Erro de Banco de Dados
```bash
# Verificar conexão
python manage.py dbshell

# Recriar migrações
python manage.py makemigrations --empty core
python manage.py migrate
```

#### 4. Erro de Arquivos Estáticos
```bash
# Coletar novamente
python manage.py collectstatic --clear --noinput

# Verificar permissões
sudo chown -R www-data:www-data /var/www/management_system/backend/staticfiles
```

#### 5. Erro de JWT
```bash
# Verificar configurações JWT no settings.py
# Verificar se djangorestframework-simplejwt está instalado
pip install djangorestframework-simplejwt
```

### Logs Importantes

```bash
# Logs do Django
tail -f /var/log/management_system/app.log

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Logs do Gunicorn
sudo journalctl -u gunicorn.service -f

# Logs do Docker
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 📊 Monitoramento

### Métricas Básicas

```bash
# Verificar status dos serviços
sudo systemctl status nginx
sudo systemctl status gunicorn
sudo systemctl status postgresql

# Verificar uso de recursos
htop
df -h
free -h

# Verificar logs de erro
sudo tail -f /var/log/nginx/error.log
sudo journalctl -u gunicorn.service --since "1 hour ago"
```

### Backup Automático

```bash
# Criar script de backup
sudo nano /usr/local/bin/backup_management_system.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/management_system"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do banco de dados
pg_dump -U management_user -h localhost management_system > $BACKUP_DIR/db_$DATE.sql

# Backup dos arquivos de mídia
tar -czf $BACKUP_DIR/media_$DATE.tar.gz /var/www/management_system/backend/media/

# Remover backups antigos (manter apenas 7 dias)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup concluído: $DATE"
```

```bash
# Tornar executável
sudo chmod +x /usr/local/bin/backup_management_system.sh

# Adicionar ao crontab (backup diário às 2h)
sudo crontab -e
0 2 * * * /usr/local/bin/backup_management_system.sh >> /var/log/backup.log 2>&1
```

---

## 🔐 Segurança

### SSL/HTTPS com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Renovação automática
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

### Configurações de Segurança

```bash
# Configurar fail2ban
sudo apt install fail2ban -y
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true

[nginx-http-auth]
enabled = true
```

---

## 📞 Suporte

Para problemas ou dúvidas:

1. Verificar logs de erro
2. Consultar documentação do Django e React
3. Verificar issues no repositório
4. Contatar a equipe de desenvolvimento

---

**✅ Checklist de Deploy:**

- [ ] Pré-requisitos instalados
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados configurado
- [ ] Migrações executadas
- [ ] Arquivos estáticos coletados
- [ ] Testes executados com sucesso
- [ ] SSL configurado (produção)
- [ ] Backup configurado
- [ ] Monitoramento ativo
- [ ] Documentação atualizada

---

*Última atualização: $(date)*