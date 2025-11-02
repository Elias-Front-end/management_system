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

### 📖 Guia Completo de Desenvolvimento

Para instruções detalhadas de configuração do ambiente de desenvolvimento, consulte:

**📋 [Guia Manual de Setup IDE](SETUP_MANUAL_IDE.md)**
- Configuração completa para Windows, macOS e Linux
- Instalação passo-a-passo de todas as dependências
- Configuração de IDEs (VS Code, PyCharm)
- Scripts úteis para desenvolvimento
- Solução de problemas comuns

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

### 📖 Guia Completo de Deploy

Para instruções detalhadas de deploy em produção, consulte:

**🐧 [Guia Manual de Deploy Linux](DEPLOY_MANUAL_LINUX.md)**
- Configuração completa do servidor Ubuntu/Debian
- Instalação passo-a-passo de todas as dependências
- Configuração de PostgreSQL, Nginx e Gunicorn
- Setup de SSL/TLS com Let's Encrypt
- Monitoramento e manutenção
- Solução de problemas específicos

### 🔄 Atualizações

Para atualizar a aplicação, siga os passos no [Guia Manual de Deploy Linux](DEPLOY_MANUAL_LINUX.md) na seção "Manutenção e Atualizações".

---

## 📚 Documentação Adicional

### 📖 Guias de Configuração
- **[Setup Manual IDE](SETUP_MANUAL_IDE.md)** - Configuração completa do ambiente de desenvolvimento
- **[Deploy Manual Linux](DEPLOY_MANUAL_LINUX.md)** - Deploy em produção passo-a-passo
- **[Funcionalidades e Regras de Negócio](FUNCIONALIDADES_E_REGRAS_DE_NEGOCIO.md)** - Documentação técnica completa

### 🔧 Configurações Adicionais

### 🔐 SSL/TLS (Let's Encrypt)

Para configuração de SSL/TLS, consulte o [Guia Manual de Deploy Linux](DEPLOY_MANUAL_LINUX.md) na seção "Configuração SSL/TLS".

### 📊 Monitoramento

Para comandos de monitoramento e logs, consulte o [Guia Manual de Deploy Linux](DEPLOY_MANUAL_LINUX.md) na seção "Monitoramento e Logs".

### 🔄 Backup Automático

Para configuração de backup, consulte o [Guia Manual de Deploy Linux](DEPLOY_MANUAL_LINUX.md) na seção "Backup e Restauração".

---

## 🚨 Troubleshooting

Para solução de problemas comuns e comandos de diagnóstico, consulte:
- **[Guia Manual de Deploy Linux](DEPLOY_MANUAL_LINUX.md)** - Seção "Solução de Problemas"
- **[Setup Manual IDE](SETUP_MANUAL_IDE.md)** - Seção "Solução de Problemas Comuns"

---

## 📞 Suporte

Para dúvidas ou problemas:

1. 📖 Consulte os guias de configuração:
   - **[Setup Manual IDE](SETUP_MANUAL_IDE.md)** - Ambiente de desenvolvimento
   - **[Deploy Manual Linux](DEPLOY_MANUAL_LINUX.md)** - Deploy em produção
   - **[Funcionalidades e Regras de Negócio](FUNCIONALIDADES_E_REGRAS_DE_NEGOCIO.md)** - Documentação técnica
2. 🐛 Reporte bugs através das Issues do GitHub
3. 💬 Entre em contato com a equipe de desenvolvimento

---

## 📄 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

---

**Desenvolvido com ❤️ usando Django + React**