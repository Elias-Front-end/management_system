# 🚀 GUIA DE DEPLOY - Sistema de Gestão de Sala de Aula

## 📋 Índice
1. [🐳 Deploy Docker para Produção](#-deploy-docker-para-produção)
2. [💻 Desenvolvimento Local (sem Docker)](#-desenvolvimento-local-sem-docker)
3. [🔧 Troubleshooting](#-troubleshooting)

---

## 🐳 Deploy Docker para Produção

### 📋 Pré-requisitos

#### Windows
```powershell
# Instalar Docker Desktop
winget install Docker.DockerDesktop

# Verificar instalação
docker --version
docker-compose --version
```

#### Linux (Ubuntu/Debian)
```bash
# Instalar Docker
sudo apt update
sudo apt install docker.io docker-compose -y
sudo usermod -aG docker $USER
newgrp docker

# Verificar instalação
docker --version
docker-compose --version
```

### 🚀 Deploy Completo

#### 1. Preparar Ambiente

```bash
# Clonar repositório
git clone <url-do-repositorio>
cd management_system

# Criar arquivo de ambiente para produção
cp .env.example .env
```

#### 2. Configurar Variáveis de Ambiente (.env)

```env
# === CONFIGURAÇÕES DE PRODUÇÃO ===

# Django Settings
SECRET_KEY=sua-chave-secreta-super-forte-aqui-min-50-chars
DEBUG=False
ALLOWED_HOSTS=seu-dominio.com,www.seu-dominio.com,localhost

# Database (PostgreSQL)
DATABASE_URL=postgresql://postgres:senha_forte@db:5432/management_db
POSTGRES_DB=management_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=senha_forte_postgres

# CORS Settings
CORS_ALLOWED_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com
CORS_ALLOW_CREDENTIALS=True

# CSRF Settings
CSRF_TRUSTED_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com
CSRF_COOKIE_SECURE=True
CSRF_COOKIE_HTTPONLY=False
CSRF_COOKIE_NAME=csrftoken

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=1440

# Email Settings (opcional)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua-senha-app

# Security Settings
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SECURE_CONTENT_TYPE_NOSNIFF=True
SECURE_BROWSER_XSS_FILTER=True
SESSION_COOKIE_SECURE=True

# Frontend URL
VITE_API_URL=https://api.seu-dominio.com
```

#### 3. Configurar Docker para Produção

Crie o arquivo `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - management_network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - SECRET_KEY=${SECRET_KEY}
      - DEBUG=${DEBUG}
      - ALLOWED_HOSTS=${ALLOWED_HOSTS}
      - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}
      - CSRF_TRUSTED_ORIGINS=${CSRF_TRUSTED_ORIGINS}
    depends_on:
      - db
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    networks:
      - management_network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      - VITE_API_URL=${VITE_API_URL}
    networks:
      - management_network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    depends_on:
      - backend
      - frontend
    networks:
      - management_network
    restart: unless-stopped

volumes:
  postgres_data:
  static_volume:
  media_volume:

networks:
  management_network:
    driver: bridge
```

#### 4. Criar Dockerfiles de Produção

**Backend Dockerfile.prod:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Coletar arquivos estáticos
RUN python manage.py collectstatic --noinput

# Criar usuário não-root
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "backend.wsgi:application"]
```

**Frontend Dockerfile.prod:**
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Copiar package files
COPY package*.json ./
RUN npm ci --only=production

# Copiar código e buildar
COPY . .
RUN npm run build

# Nginx para servir arquivos estáticos
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 5. Configurar Nginx

Crie `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }

    upstream frontend {
        server frontend:80;
    }

    server {
        listen 80;
        server_name seu-dominio.com www.seu-dominio.com;

        # Redirecionar HTTP para HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name seu-dominio.com www.seu-dominio.com;

        # Configurações SSL
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # API Backend
        location /api/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Admin Django
        location /admin/ {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Arquivos estáticos Django
        location /static/ {
            alias /app/staticfiles/;
        }

        location /media/ {
            alias /app/media/;
        }

        # Frontend React
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

#### 6. Deploy em Produção

```bash
# Buildar e subir todos os serviços
docker-compose -f docker-compose.prod.yml up -d --build

# Executar migrações
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Criar superusuário
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser

# Verificar status
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### 7. Comandos Úteis de Produção

```bash
# Parar serviços
docker-compose -f docker-compose.prod.yml down

# Atualizar aplicação
git pull
docker-compose -f docker-compose.prod.yml up -d --build

# Backup do banco
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres management_db > backup.sql

# Restaurar backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U postgres management_db < backup.sql

# Monitorar recursos
docker stats

# Limpar containers antigos
docker system prune -f
```

---

## 💻 Desenvolvimento Local (sem Docker)

### 📋 Pré-requisitos

#### Windows
```powershell
# Instalar Python 3.10+
winget install Python.Python.3.10

# Instalar Node.js 18+
winget install OpenJS.NodeJS

# Instalar PostgreSQL (opcional, pode usar SQLite)
winget install PostgreSQL.PostgreSQL

# Verificar instalações
python --version
node --version
```

#### Linux (Ubuntu/Debian)
```bash
# Instalar Python 3.10+
sudo apt update
sudo apt install python3.10 python3.10-venv python3-pip -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PostgreSQL (opcional)
sudo apt install postgresql postgresql-contrib -y

# Verificar instalações
python3 --version
node --version
```

### 🚀 Configuração Completa

#### 1. Preparar Projeto

```bash
# Clonar repositório
git clone <url-do-repositorio>
cd management_system

# Criar arquivos de ambiente
cp backend/.env.example backend/.env
```

#### 2. Configurar Backend Django

```bash
# Navegar para backend
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt
```

#### 3. Configurar Variáveis de Ambiente Backend (.env)

```env
# === CONFIGURAÇÕES DE DESENVOLVIMENTO ===

# Django Settings
SECRET_KEY=dev-secret-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Database (SQLite para desenvolvimento)
DATABASE_URL=sqlite:///db.sqlite3

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
CORS_ALLOW_CREDENTIALS=True

# CSRF Settings
CSRF_TRUSTED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000
CSRF_COOKIE_SECURE=False
CSRF_COOKIE_HTTPONLY=False
CSRF_COOKIE_NAME=csrftoken

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=1440

# Email Settings (console para desenvolvimento)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

#### 4. Configurar Banco de Dados

```bash
# Executar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Carregar dados de exemplo (opcional)
python manage.py loaddata fixtures/sample_data.json
```

#### 5. Executar Backend

```bash
# Rodar servidor de desenvolvimento
python manage.py runserver 8000

# O backend estará disponível em:
# http://localhost:8000/api/
# http://localhost:8000/admin/
```

#### 6. Configurar Frontend React

```bash
# Abrir novo terminal e navegar para frontend
cd frontend

# Instalar dependências
npm install

# Criar arquivo de ambiente
echo "VITE_API_URL=http://localhost:8000" > .env.local
```

#### 7. Executar Frontend

```bash
# Rodar servidor de desenvolvimento
npm run dev

# O frontend estará disponível em:
# http://localhost:5173/
```

### 🧪 Executar Testes Locais

#### Testes Backend

```bash
# Navegar para backend (com venv ativo)
cd backend

# Executar todos os testes
python manage.py test

# Executar testes com pytest (mais detalhado)
pytest

# Executar testes com cobertura
pytest --cov=core --cov-report=html

# Executar testes específicos
python manage.py test core.tests.test_models
```

#### Testes Frontend

```bash
# Navegar para frontend
cd frontend

# Executar testes unitários
npm test

# Executar testes com cobertura
npm run test:coverage

# Executar testes E2E (se configurado)
npm run test:e2e

# Executar linting
npm run lint

# Executar verificação de tipos TypeScript
npm run type-check
```

### 🔧 Comandos Úteis de Desenvolvimento

#### Backend
```bash
# Criar nova migração
python manage.py makemigrations

# Aplicar migrações
python manage.py migrate

# Coletar arquivos estáticos
python manage.py collectstatic

# Abrir shell Django
python manage.py shell

# Criar app Django
python manage.py startapp nome_do_app

# Verificar problemas
python manage.py check
```

#### Frontend
```bash
# Instalar nova dependência
npm install nome-do-pacote

# Instalar dependência de desenvolvimento
npm install -D nome-do-pacote

# Atualizar dependências
npm update

# Buildar para produção
npm run build

# Preview do build
npm run preview

# Analisar bundle
npm run analyze
```

### 🐛 Debug no VS Code

#### Configuração Backend (.vscode/launch.json)

```json
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
            "cwd": "${workspaceFolder}/backend",
            "env": {
                "DJANGO_SETTINGS_MODULE": "backend.settings"
            }
        }
    ]
}
```

#### Configuração Frontend

```json
{
    "name": "React Dev Server",
    "type": "node",
    "request": "launch",
    "cwd": "${workspaceFolder}/frontend",
    "runtimeExecutable": "npm",
    "runtimeArgs": ["run", "dev"]
}
```

---

## 🔧 Troubleshooting

### 🚨 Problemas Comuns - Docker Produção

#### 1. Erro de Build Docker
**Sintomas:** Build falha com erro de dependências
```bash
# Limpar cache Docker
docker system prune -f
docker builder prune -f

# Rebuildar sem cache
docker-compose -f docker-compose.prod.yml build --no-cache
```

#### 2. Erro de Conexão com Banco
**Sintomas:** Backend não conecta com PostgreSQL
```bash
# Verificar se o banco está rodando
docker-compose -f docker-compose.prod.yml ps

# Ver logs do banco
docker-compose -f docker-compose.prod.yml logs db

# Testar conexão manual
docker-compose -f docker-compose.prod.yml exec db psql -U postgres -d management_db
```

#### 3. Erro SSL/HTTPS
**Sintomas:** Certificados SSL inválidos
```bash
# Verificar certificados
ls -la nginx/ssl/

# Gerar certificados auto-assinados para teste
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout nginx/ssl/key.pem \
    -out nginx/ssl/cert.pem
```

### 🚨 Problemas Comuns - Desenvolvimento Local

#### 1. Erro de Dependências Python
**Sintomas:** ModuleNotFoundError
```bash
# Verificar ambiente virtual ativo
which python  # Linux/Mac
where python  # Windows

# Reinstalar dependências
pip install -r requirements.txt --force-reinstall
```

#### 2. Erro de Migração Django
**Sintomas:** Erro ao executar migrate
```bash
# Resetar migrações (CUIDADO: apaga dados)
rm -rf core/migrations/
python manage.py makemigrations core
python manage.py migrate

# Ou aplicar migração específica
python manage.py migrate core 0001 --fake
```

#### 3. Erro CORS Frontend
**Sintomas:** Blocked by CORS policy
```python
# Verificar settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CORS_ALLOW_CREDENTIALS = True
```

#### 4. Erro de Dependências Node.js
**Sintomas:** Module not found
```bash
# Limpar cache npm
npm cache clean --force

# Deletar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### 📊 Logs Importantes

#### Docker Produção
```bash
# Logs de todos os serviços
docker-compose -f docker-compose.prod.yml logs -f

# Logs específicos
docker-compose -f docker-compose.prod.yml logs backend
docker-compose -f docker-compose.prod.yml logs frontend
docker-compose -f docker-compose.prod.yml logs db
docker-compose -f docker-compose.prod.yml logs nginx
```

#### Desenvolvimento Local
```bash
# Logs Django (no terminal do runserver)
# Logs automáticos no console

# Logs detalhados Django
python manage.py runserver --verbosity=2

# Logs React (no terminal do npm run dev)
# Logs automáticos no console do navegador
```

### 🆘 Suporte

Se encontrar problemas não listados aqui:

1. **Verifique os logs** primeiro
2. **Consulte a documentação** oficial do Django/React
3. **Procure no Stack Overflow** com a mensagem de erro exata
4. **Abra uma issue** no repositório do projeto

---

**✅ Documentação atualizada em:** Novembro 2025  
**🔄 Versão:** 2.0.0  
**👥 Mantido por:** Desenvolvimento Elias Moraes