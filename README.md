# 🎓 Sistema de Gestão de Sala de Aula

## 📋 Visão Geral

Sistema educacional completo desenvolvido com **Django REST Framework** (backend) e **React + TypeScript** (frontend) para gerenciamento de treinamentos, turmas, recursos educacionais e alunos.

### 🏗️ Arquitetura do Sistema

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Banco de      │
│   React + TS    │◄──►│  Django + DRF   │◄──►│   Dados         │
│   (Port 3000)   │    │   (Port 8000)   │    │ SQLite/PostgreSQL│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🚀 Tecnologias Utilizadas

**Backend:**
- Python 3.10+
- Django 4.2.16
- Django REST Framework 3.14.0
- JWT Authentication (djangorestframework-simplejwt)
- SQLite (desenvolvimento) / PostgreSQL (produção)

**Frontend:**
- React 19.1.1
- TypeScript 5.9.3
- Vite 6.0.7
- Tailwind CSS 3.4.17
- Zustand (gerenciamento de estado)
- Axios (requisições HTTP)

### 📚 Funcionalidades Principais

- **👨‍💼 Administração**: Gerenciamento completo de treinamentos, turmas e recursos
- **👨‍🎓 Área do Aluno**: Acesso controlado aos conteúdos baseado em regras de negócio
- **🔐 Autenticação JWT**: Sistema seguro de login e controle de acesso
- **📱 Interface Responsiva**: Design moderno e adaptável a diferentes dispositivos
- **🎥 Player de Vídeo**: Reprodução de conteúdo multimídia integrada
- **📄 Gestão de Arquivos**: Upload e download de recursos educacionais

---

## 🖥️ Desenvolvimento Local (Sem Docker)

### 📋 Pré-requisitos

- **Python 3.10+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))

### 🔧 Configuração Manual

#### 1️⃣ Clone do Repositório

```bash
git clone https://github.com/seu-usuario/management_system.git
cd management_system
```

#### 2️⃣ Configuração do Backend

```bash
# Navegar para o diretório do backend
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

# Configurar variáveis de ambiente
cp .env.example .env

# Executar migrações
python manage.py migrate

# Criar superusuário (opcional)
python manage.py createsuperuser

# Coletar arquivos estáticos
python manage.py collectstatic --noinput

# Iniciar servidor de desenvolvimento
python manage.py runserver
```

#### 3️⃣ Configuração do Frontend

```bash
# Em um novo terminal, navegar para o frontend
cd frontend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar servidor de desenvolvimento
npm run dev
```

#### 4️⃣ Configuração dos Arquivos .env

**Backend (.env):**
```env
DEBUG=True
SECRET_KEY=sua-chave-secreta-aqui
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Configurações de Email (opcional)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua-senha-de-app

# Configurações de Arquivos
MEDIA_URL=/media/
MEDIA_ROOT=media/
STATIC_URL=/static/
STATIC_ROOT=staticfiles/
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:8000/api
VITE_MEDIA_URL=http://localhost:8000
```

### 🤖 Configuração Automatizada (Recomendado)

Execute o script de configuração automática:

**Windows (PowerShell):**
```powershell
.\setup-local.ps1
```

**Linux/Mac:**
```bash
chmod +x setup-local.sh
./setup-local.sh
```

### 🚀 Executando o Sistema

Após a configuração, acesse:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Admin Django**: http://localhost:8000/admin

---

## 🐧 Deploy no Servidor Linux

### 📋 Requisitos do Servidor

**Sistema Operacional:**
- Ubuntu 20.04+ / Debian 11+ / CentOS 8+
- Acesso root ou sudo

**Recursos Mínimos:**
- 2 GB RAM
- 20 GB de armazenamento
- 1 vCPU

**Software Necessário:**
- Python 3.10+
- Node.js 18+
- PostgreSQL 12+
- Nginx
- Git

### 🔧 Deploy Manual

#### 1️⃣ Preparação do Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências essenciais
sudo apt install -y python3 python3-pip python3-venv nodejs npm postgresql postgresql-contrib nginx git curl

# Configurar PostgreSQL
sudo -u postgres createuser --interactive --pwprompt deploy
sudo -u postgres createdb -O deploy management_system_db

# Criar usuário para a aplicação
sudo adduser deploy
sudo usermod -aG sudo deploy
```

#### 2️⃣ Configuração da Aplicação

```bash
# Fazer login como usuário deploy
sudo su - deploy

# Clonar repositório
git clone https://github.com/seu-usuario/management_system.git /opt/management_system
cd /opt/management_system

# Configurar backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
nano .env  # Editar com configurações de produção
```

**Configuração do .env de Produção:**
```env
DEBUG=False
SECRET_KEY=sua-chave-secreta-super-segura
DATABASE_URL=postgresql://deploy:senha@localhost:5432/management_system_db
ALLOWED_HOSTS=seu-dominio.com,www.seu-dominio.com
CORS_ALLOWED_ORIGINS=https://seu-dominio.com

# Configurações de Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua-senha-de-app
```

#### 3️⃣ Configuração do Frontend

```bash
# Configurar frontend
cd ../frontend
npm install
npm run build

# Mover arquivos buildados
sudo mkdir -p /var/www/management_system
sudo cp -r dist/* /var/www/management_system/
```

#### 4️⃣ Configuração do Nginx

```bash
# Criar configuração do Nginx
sudo nano /etc/nginx/sites-available/management_system
```

**Configuração do Nginx:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Frontend
    location / {
        root /var/www/management_system;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Admin Django
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Arquivos estáticos
    location /static/ {
        alias /opt/management_system/backend/staticfiles/;
    }

    # Arquivos de mídia
    location /media/ {
        alias /opt/management_system/backend/media/;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/management_system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5️⃣ Configuração do Gunicorn

```bash
# Criar arquivo de serviço
sudo nano /etc/systemd/system/management_system.service
```

**Configuração do Systemd:**
```ini
[Unit]
Description=Management System Gunicorn daemon
After=network.target

[Service]
User=deploy
Group=deploy
WorkingDirectory=/opt/management_system/backend
Environment="PATH=/opt/management_system/backend/venv/bin"
ExecStart=/opt/management_system/backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 backend.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
# Ativar e iniciar serviço
sudo systemctl daemon-reload
sudo systemctl enable management_system
sudo systemctl start management_system
```

#### 6️⃣ Finalização

```bash
# Executar migrações
cd /opt/management_system/backend
source venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput

# Criar superusuário
python manage.py createsuperuser

# Verificar status dos serviços
sudo systemctl status management_system
sudo systemctl status nginx
```

### 🤖 Deploy Automatizado (Recomendado)

Execute o script de deploy automático:

```bash
# Baixar e executar script
curl -O https://raw.githubusercontent.com/seu-usuario/management_system/main/deploy.sh
chmod +x deploy.sh
sudo ./deploy.sh
```

O script automaticamente:
- ✅ Configura o servidor com todas as dependências
- ✅ Clona o repositório
- ✅ Configura PostgreSQL
- ✅ Instala dependências Python e Node.js
- ✅ Configura Nginx e Gunicorn
- ✅ Executa migrações e coleta arquivos estáticos
- ✅ Configura SSL com Let's Encrypt (opcional)

### 🔄 Atualizações

Para atualizar a aplicação:

**Manual:**
```bash
cd /opt/management_system
git pull origin main
cd backend && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
cd ../frontend && npm install && npm run build
sudo cp -r dist/* /var/www/management_system/
sudo systemctl restart management_system
```

**Automatizado:**
```bash
./deploy.sh update
```

---

## 🛠️ Scripts de Automação

### 📝 setup-local.ps1 (Windows)

Script para configuração automática do ambiente de desenvolvimento local no Windows.

**Funcionalidades:**
- ✅ Verifica e instala dependências (Python, Node.js)
- ✅ Clona repositório (se necessário)
- ✅ Configura ambiente virtual Python
- ✅ Instala dependências do backend e frontend
- ✅ Configura arquivos .env
- ✅ Executa migrações
- ✅ Inicia servidores de desenvolvimento

**Uso:**
```powershell
# Executar como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\setup-local.ps1
```

### 📝 deploy.sh (Linux)

Script para deploy e gerenciamento da aplicação no servidor Linux.

**Funcionalidades:**
- ✅ Configuração completa do servidor
- ✅ Instalação de dependências
- ✅ Configuração de banco de dados
- ✅ Setup do Nginx e Gunicorn
- ✅ Configuração de SSL/TLS
- ✅ Atualizações automáticas
- ✅ Backup e restauração

**Comandos disponíveis:**
```bash
./deploy.sh install    # Instalação inicial
./deploy.sh update     # Atualizar aplicação
./deploy.sh backup     # Fazer backup
./deploy.sh restore    # Restaurar backup
./deploy.sh status     # Verificar status
./deploy.sh logs       # Visualizar logs
```

---

## 🔧 Configurações Adicionais

### 🔐 SSL/TLS (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 📊 Monitoramento

```bash
# Verificar logs
sudo journalctl -u management_system -f
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Verificar status dos serviços
sudo systemctl status management_system nginx postgresql
```

### 🔄 Backup Automático

```bash
# Criar script de backup
sudo nano /usr/local/bin/backup_management_system.sh

# Adicionar ao crontab para backup diário
sudo crontab -e
# Adicionar: 0 2 * * * /usr/local/bin/backup_management_system.sh
```

---

## 🚨 Troubleshooting

### ❌ Problemas Comuns

**1. Erro 500 Internal Server Error**
```bash
# Verificar logs
sudo journalctl -u management_system -n 50
# Verificar configurações do .env
# Verificar permissões dos arquivos
```

**2. Erro 502 Bad Gateway**
```bash
# Verificar se Gunicorn está rodando
sudo systemctl status management_system
# Verificar configuração do Nginx
sudo nginx -t
```

**3. Arquivos Estáticos Não Carregam**
```bash
# Coletar arquivos estáticos novamente
python manage.py collectstatic --noinput
# Verificar permissões
sudo chown -R deploy:deploy /opt/management_system
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

---

## 📞 Suporte

Para dúvidas ou problemas:

1. 📖 Consulte a documentação completa em `FUNCIONALIDADES_E_REGRAS_DE_NEGOCIO.md`
2. 🐛 Reporte bugs através das Issues do GitHub
3. 💬 Entre em contato com a equipe de desenvolvimento

---

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

**Desenvolvido com ❤️ usando Django + React**