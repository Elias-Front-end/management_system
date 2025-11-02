# 🐧 Deploy Manual - Produção Linux (Ubuntu/Debian)

## 📋 **Pré-requisitos**
- Servidor Ubuntu 20.04+ ou Debian 11+
- Acesso root ou sudo
- Conexão com internet
- Domínio configurado (opcional para SSL)

---

## 🔧 **Passo 1: Preparação do Sistema**

### 1.1 Atualizar o sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Criar usuário para a aplicação
```bash
# Criar usuário deploy
sudo adduser --disabled-password --gecos "" deploy
sudo usermod -aG sudo deploy

# Trocar para o usuário deploy
sudo su - deploy
```

---

## 📦 **Passo 2: Instalação de Dependências**

### 2.1 Instalar dependências essenciais
```bash
sudo apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    postgresql \
    postgresql-contrib \
    nginx \
    git \
    curl \
    wget \
    unzip \
    supervisor \
    certbot \
    python3-certbot-nginx \
    build-essential \
    libpq-dev
```

### 2.2 Instalar Node.js 18 LTS
```bash
# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -

# Instalar Node.js (inclui npm)
sudo apt install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v18.x.x
npm --version   # Deve mostrar 10.x.x
```

### 2.3 Resolver conflitos Node.js/npm (se necessário)
```bash
# Se houver erro "nodejs : Conflicts: npm"
sudo apt remove --purge npm -y
sudo apt --fix-broken install
sudo apt autoremove -y
sudo apt clean

# Reinstalar Node.js se necessário
sudo apt install --reinstall nodejs
```

---

## 🗄️ **Passo 3: Configuração do PostgreSQL**

### 3.1 Iniciar serviço PostgreSQL
```bash
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 3.2 Criar banco de dados e usuário
```bash
# Acessar PostgreSQL como usuário postgres
sudo -u postgres psql

# Dentro do PostgreSQL, executar:
CREATE USER deploy WITH PASSWORD 'sua_senha_aqui';
CREATE DATABASE management_system_db OWNER deploy;
GRANT ALL PRIVILEGES ON DATABASE management_system_db TO deploy;
\q
```

### 3.3 Testar conexão
```bash
# Testar conexão com o banco
psql -h localhost -U deploy -d management_system_db
# Digite a senha quando solicitado
# Se conectar com sucesso, digite \q para sair
```

---

## 📁 **Passo 4: Clonagem e Configuração do Projeto**

### 4.1 Clonar repositório
```bash
# Ir para diretório de aplicações
sudo mkdir -p /opt
cd /opt

# Clonar projeto
sudo git clone https://github.com/Elias-Front-end/management_system.git
sudo chown -R deploy:deploy management_system
cd management_system
```

### 4.2 Configurar backend (Django)
```bash
# Entrar no diretório backend
cd backend

# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependências Python
pip install --upgrade pip
pip install -r requirements.txt
```

### 4.3 Configurar variáveis de ambiente
```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar configurações
nano .env
```

**Configurar no arquivo .env:**
```env
# Configurações do Django
SECRET_KEY=sua_chave_secreta_muito_longa_e_aleatoria_aqui
DEBUG=False
ALLOWED_HOSTS=seu-dominio.com,www.seu-dominio.com,localhost,127.0.0.1

# Configurações do banco
DATABASE_URL=postgresql://deploy:sua_senha_aqui@localhost:5432/management_system_db

# Configurações de email (opcional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua_senha_de_app

# Configurações de arquivos estáticos
STATIC_URL=/static/
MEDIA_URL=/media/
```

### 4.4 Executar migrações Django
```bash
# Ainda no ambiente virtual
python manage.py makemigrations
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Coletar arquivos estáticos
python manage.py collectstatic --noinput
```

---

## 🎨 **Passo 5: Configuração do Frontend (React)**

### 5.1 Instalar dependências do frontend
```bash
# Voltar para raiz do projeto
cd /opt/management_system/frontend

# Instalar dependências
npm install
```

### 5.2 Configurar variáveis de ambiente do frontend
```bash
# Criar arquivo de configuração
nano .env
```

**Configurar no arquivo .env:**
```env
VITE_API_URL=https://seu-dominio.com/api
VITE_APP_NAME=Sistema de Gestão
```

### 5.3 Build do frontend
```bash
# Gerar build de produção
npm run build

# Verificar se pasta dist foi criada
ls -la dist/
```

---

## 🌐 **Passo 6: Configuração do Nginx**

### 6.1 Criar configuração do site
```bash
sudo nano /etc/nginx/sites-available/management_system
```

**Conteúdo do arquivo:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    
    # Frontend (React)
    location / {
        root /opt/management_system/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Headers de segurança
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
    }
    
    # Backend (Django API)
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
    
    # Arquivos estáticos Django
    location /static/ {
        alias /opt/management_system/backend/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Arquivos de mídia Django
    location /media/ {
        alias /opt/management_system/backend/media/;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

### 6.2 Ativar site
```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/management_system /etc/nginx/sites-enabled/

# Remover site padrão
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## ⚙️ **Passo 7: Configuração do Gunicorn**

### 7.1 Criar arquivo de configuração do Gunicorn
```bash
sudo nano /opt/management_system/backend/gunicorn.conf.py
```

**Conteúdo do arquivo:**
```python
# Gunicorn configuration file
bind = "127.0.0.1:8000"
workers = 3
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
timeout = 30
keepalive = 2
preload_app = True
daemon = False
user = "deploy"
group = "deploy"
tmp_upload_dir = None
errorlog = "/var/log/gunicorn/error.log"
accesslog = "/var/log/gunicorn/access.log"
loglevel = "info"
```

### 7.2 Criar diretório de logs
```bash
sudo mkdir -p /var/log/gunicorn
sudo chown deploy:deploy /var/log/gunicorn
```

### 7.3 Criar serviço systemd
```bash
sudo nano /etc/systemd/system/management_system.service
```

**Conteúdo do arquivo:**
```ini
[Unit]
Description=Management System Gunicorn daemon
After=network.target

[Service]
User=deploy
Group=deploy
WorkingDirectory=/opt/management_system/backend
Environment="PATH=/opt/management_system/backend/venv/bin"
ExecStart=/opt/management_system/backend/venv/bin/gunicorn \
    --config /opt/management_system/backend/gunicorn.conf.py \
    backend.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### 7.4 Iniciar serviço
```bash
# Recarregar systemd
sudo systemctl daemon-reload

# Iniciar serviço
sudo systemctl start management_system
sudo systemctl enable management_system

# Verificar status
sudo systemctl status management_system
```

---

## 🔒 **Passo 8: Configuração SSL (Opcional)**

### 8.1 Obter certificado SSL
```bash
# Instalar certificado Let's Encrypt
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com

# Seguir instruções do certbot
```

### 8.2 Configurar renovação automática
```bash
# Testar renovação
sudo certbot renew --dry-run

# Adicionar ao crontab
sudo crontab -e

# Adicionar linha:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🧪 **Passo 9: Testes e Verificação**

### 9.1 Verificar serviços
```bash
# Status dos serviços
sudo systemctl status nginx
sudo systemctl status postgresql
sudo systemctl status management_system

# Verificar logs
sudo journalctl -u management_system -f
tail -f /var/log/gunicorn/error.log
```

### 9.2 Testar aplicação
```bash
# Testar backend
curl http://localhost:8000/api/

# Testar frontend
curl http://localhost/

# Testar com domínio (se configurado)
curl https://seu-dominio.com/
```

---

## 🔄 **Passo 10: Comandos de Manutenção**

### 10.1 Atualizar aplicação
```bash
cd /opt/management_system

# Fazer backup do banco
sudo -u postgres pg_dump management_system_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Atualizar código
git pull origin main

# Atualizar backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

# Atualizar frontend
cd ../frontend
npm install
npm run build

# Reiniciar serviços
sudo systemctl restart management_system
sudo systemctl restart nginx
```

### 10.2 Logs e monitoramento
```bash
# Ver logs do Django
tail -f /var/log/gunicorn/error.log

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Ver logs do sistema
sudo journalctl -u management_system -f
```

---

## 🚨 **Solução de Problemas Comuns**

### Erro: "nodejs : Conflicts: npm"
```bash
sudo apt remove --purge npm -y
sudo apt --fix-broken install
sudo apt autoremove -y
sudo apt install --reinstall nodejs
```

### Erro: "Permission denied" no PostgreSQL
```bash
sudo -u postgres psql
ALTER USER deploy CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE management_system_db TO deploy;
```

### Erro: "502 Bad Gateway" no Nginx
```bash
# Verificar se Gunicorn está rodando
sudo systemctl status management_system

# Verificar logs
sudo journalctl -u management_system -f
```

### Erro: "Static files not found"
```bash
cd /opt/management_system/backend
source venv/bin/activate
python manage.py collectstatic --noinput
sudo systemctl restart management_system
```

---

## ✅ **Checklist Final**

- [ ] Sistema atualizado
- [ ] Usuário deploy criado
- [ ] Dependências instaladas
- [ ] PostgreSQL configurado
- [ ] Projeto clonado
- [ ] Backend configurado
- [ ] Frontend buildado
- [ ] Nginx configurado
- [ ] Gunicorn configurado
- [ ] SSL configurado (opcional)
- [ ] Serviços iniciados
- [ ] Testes realizados

**🎉 Parabéns! Sua aplicação está rodando em produção!**