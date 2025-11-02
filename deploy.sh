#!/bin/bash

# ====================================================================
# 🚀 SCRIPT DE DEPLOY AUTOMÁTICO - SERVIDOR LINUX
# ====================================================================
# Sistema de Gestão de Sala de Aula
# Deploy e gerenciamento automático no servidor Linux
# ====================================================================

set -e  # Parar em caso de erro

# Configurações padrão
APP_NAME="management_system"
APP_USER="deploy"
APP_DIR="/opt/$APP_NAME"
NGINX_SITE="/etc/nginx/sites-available/$APP_NAME"
SYSTEMD_SERVICE="/etc/systemd/system/$APP_NAME.service"
DB_NAME="${APP_NAME}_db"
BACKUP_DIR="/var/backups/$APP_NAME"
LOG_FILE="/var/log/$APP_NAME-deploy.log"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

print_step() {
    echo -e "\n${BLUE}🔧 $1${NC}"
    log "STEP: $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    log "SUCCESS: $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    log "WARNING: $1"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    log "ERROR: $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "Este script deve ser executado como root (use sudo)"
        exit 1
    fi
}

check_user_exists() {
    if ! id "$APP_USER" &>/dev/null; then
        print_step "Criando usuário $APP_USER..."
        adduser --disabled-password --gecos "" "$APP_USER"
        usermod -aG sudo "$APP_USER"
        print_success "Usuário $APP_USER criado"
    else
        print_success "Usuário $APP_USER já existe"
    fi
}

install_dependencies() {
    print_step "Atualizando sistema e instalando dependências..."
    
    # Atualizar sistema
    apt update && apt upgrade -y
    
    # Instalar dependências essenciais
    apt install -y \
        python3 \
        python3-pip \
        python3-venv \
        python3-dev \
        nodejs \
        npm \
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
    
    # Instalar versão mais recente do Node.js se necessário
    if ! node --version | grep -q "v1[89]\|v[2-9][0-9]"; then
        print_step "Instalando Node.js 18 LTS..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt install -y nodejs
    fi
    
    print_success "Dependências instaladas"
}

setup_postgresql() {
    print_step "Configurando PostgreSQL..."
    
    # Iniciar PostgreSQL
    systemctl start postgresql
    systemctl enable postgresql
    
    # Criar banco e usuário se não existirem
    sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || {
        print_step "Criando banco de dados $DB_NAME..."
        
        # Solicitar senha do banco
        read -s -p "Digite a senha para o usuário do banco '$APP_USER': " DB_PASSWORD
        echo
        
        sudo -u postgres createuser --interactive --pwprompt "$APP_USER" << EOF
$DB_PASSWORD
$DB_PASSWORD
n
y
n
EOF
        
        sudo -u postgres createdb -O "$APP_USER" "$DB_NAME"
        print_success "Banco de dados configurado"
    }
}

clone_or_update_repo() {
    print_step "Configurando repositório..."
    
    if [[ ! -d "$APP_DIR" ]]; then
        # Solicitar URL do repositório
        read -p "Digite a URL do repositório Git: " REPO_URL
        
        print_step "Clonando repositório..."
        git clone "$REPO_URL" "$APP_DIR"
        chown -R "$APP_USER:$APP_USER" "$APP_DIR"
    else
        print_step "Atualizando repositório..."
        cd "$APP_DIR"
        sudo -u "$APP_USER" git pull origin main || sudo -u "$APP_USER" git pull origin master
    fi
    
    print_success "Repositório configurado"
}

setup_python_env() {
    print_step "Configurando ambiente Python..."
    
    cd "$APP_DIR/backend"
    
    # Criar ambiente virtual se não existir
    if [[ ! -d "venv" ]]; then
        sudo -u "$APP_USER" python3 -m venv venv
    fi
    
    # Instalar dependências
    sudo -u "$APP_USER" venv/bin/pip install --upgrade pip
    sudo -u "$APP_USER" venv/bin/pip install -r requirements.txt
    
    # Instalar psycopg2 para PostgreSQL
    sudo -u "$APP_USER" venv/bin/pip install psycopg2-binary
    
    print_success "Ambiente Python configurado"
}

setup_env_file() {
    print_step "Configurando arquivo .env..."
    
    cd "$APP_DIR/backend"
    
    if [[ ! -f ".env" ]]; then
        # Solicitar informações para o .env
        read -p "Digite o domínio da aplicação (ex: meusite.com): " DOMAIN
        read -s -p "Digite a SECRET_KEY do Django: " SECRET_KEY
        echo
        read -s -p "Digite a senha do banco de dados: " DB_PASSWORD
        echo
        read -p "Digite o email para configurações SMTP: " EMAIL_USER
        read -s -p "Digite a senha do email: " EMAIL_PASSWORD
        echo
        
        # Criar arquivo .env
        cat > .env << EOF
DEBUG=False
SECRET_KEY=$SECRET_KEY
DATABASE_URL=postgresql://$APP_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
ALLOWED_HOSTS=$DOMAIN,www.$DOMAIN,localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=https://$DOMAIN,https://www.$DOMAIN

# Configurações de Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=$EMAIL_USER
EMAIL_HOST_PASSWORD=$EMAIL_PASSWORD

# Configurações de Arquivos
MEDIA_URL=/media/
MEDIA_ROOT=$APP_DIR/media/
STATIC_URL=/static/
STATIC_ROOT=$APP_DIR/staticfiles/
EOF
        
        chown "$APP_USER:$APP_USER" .env
        chmod 600 .env
        print_success "Arquivo .env criado"
    else
        print_warning "Arquivo .env já existe"
    fi
}

run_django_setup() {
    print_step "Executando configurações do Django..."
    
    cd "$APP_DIR/backend"
    
    # Executar migrações
    sudo -u "$APP_USER" venv/bin/python manage.py migrate
    
    # Coletar arquivos estáticos
    sudo -u "$APP_USER" venv/bin/python manage.py collectstatic --noinput
    
    # Criar diretórios necessários
    mkdir -p "$APP_DIR/media" "$APP_DIR/staticfiles"
    chown -R "$APP_USER:$APP_USER" "$APP_DIR/media" "$APP_DIR/staticfiles"
    
    print_success "Django configurado"
}

setup_frontend() {
    print_step "Configurando frontend..."
    
    cd "$APP_DIR/frontend"
    
    # Instalar dependências
    sudo -u "$APP_USER" npm install
    
    # Configurar .env do frontend se não existir
    if [[ ! -f ".env" ]]; then
        cat > .env << EOF
VITE_API_URL=https://$DOMAIN/api
VITE_MEDIA_URL=https://$DOMAIN
EOF
        chown "$APP_USER:$APP_USER" .env
    fi
    
    # Build do frontend
    sudo -u "$APP_USER" npm run build
    
    # Copiar arquivos buildados
    mkdir -p /var/www/$APP_NAME
    cp -r dist/* /var/www/$APP_NAME/
    chown -R www-data:www-data /var/www/$APP_NAME
    
    print_success "Frontend configurado"
}

setup_nginx() {
    print_step "Configurando Nginx..."
    
    # Criar configuração do Nginx
    cat > "$NGINX_SITE" << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Frontend
    location / {
        root /var/www/$APP_NAME;
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

    # Admin Django
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Arquivos estáticos
    location /static/ {
        alias $APP_DIR/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Arquivos de mídia
    location /media/ {
        alias $APP_DIR/media/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Configurações de segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
}
EOF
    
    # Ativar site
    ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/
    
    # Remover site padrão se existir
    rm -f /etc/nginx/sites-enabled/default
    
    # Testar configuração
    nginx -t
    
    # Reiniciar Nginx
    systemctl restart nginx
    systemctl enable nginx
    
    print_success "Nginx configurado"
}

setup_systemd_service() {
    print_step "Configurando serviço systemd..."
    
    # Criar arquivo de serviço
    cat > "$SYSTEMD_SERVICE" << EOF
[Unit]
Description=$APP_NAME Gunicorn daemon
After=network.target

[Service]
User=$APP_USER
Group=$APP_USER
WorkingDirectory=$APP_DIR/backend
Environment="PATH=$APP_DIR/backend/venv/bin"
ExecStart=$APP_DIR/backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 backend.wsgi:application
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
    
    # Recarregar systemd e iniciar serviço
    systemctl daemon-reload
    systemctl enable "$APP_NAME"
    systemctl start "$APP_NAME"
    
    print_success "Serviço systemd configurado"
}

setup_ssl() {
    print_step "Configurando SSL com Let's Encrypt..."
    
    # Verificar se o domínio está apontando para o servidor
    read -p "O domínio $DOMAIN está apontando para este servidor? (y/N): " SSL_CONFIRM
    
    if [[ "$SSL_CONFIRM" =~ ^[Yy]$ ]]; then
        certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email "$EMAIL_USER"
        
        # Configurar renovação automática
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        
        print_success "SSL configurado"
    else
        print_warning "SSL não configurado. Configure manualmente após apontar o domínio."
    fi
}

create_backup() {
    print_step "Criando backup..."
    
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup do banco de dados
    sudo -u postgres pg_dump "$DB_NAME" > "$BACKUP_FILE"
    
    # Backup dos arquivos de mídia
    tar -czf "$BACKUP_DIR/media_$TIMESTAMP.tar.gz" -C "$APP_DIR" media/
    
    print_success "Backup criado: $BACKUP_FILE"
}

restore_backup() {
    local backup_file="$1"
    
    if [[ -z "$backup_file" ]]; then
        print_error "Especifique o arquivo de backup"
        exit 1
    fi
    
    if [[ ! -f "$backup_file" ]]; then
        print_error "Arquivo de backup não encontrado: $backup_file"
        exit 1
    fi
    
    print_step "Restaurando backup: $backup_file"
    
    # Parar aplicação
    systemctl stop "$APP_NAME"
    
    # Restaurar banco
    sudo -u postgres dropdb "$DB_NAME"
    sudo -u postgres createdb -O "$APP_USER" "$DB_NAME"
    sudo -u postgres psql "$DB_NAME" < "$backup_file"
    
    # Reiniciar aplicação
    systemctl start "$APP_NAME"
    
    print_success "Backup restaurado"
}

update_application() {
    print_step "Atualizando aplicação..."
    
    # Parar aplicação
    systemctl stop "$APP_NAME"
    
    # Atualizar código
    cd "$APP_DIR"
    sudo -u "$APP_USER" git pull origin main || sudo -u "$APP_USER" git pull origin master
    
    # Atualizar dependências backend
    cd "$APP_DIR/backend"
    sudo -u "$APP_USER" venv/bin/pip install -r requirements.txt
    
    # Executar migrações
    sudo -u "$APP_USER" venv/bin/python manage.py migrate
    
    # Coletar arquivos estáticos
    sudo -u "$APP_USER" venv/bin/python manage.py collectstatic --noinput
    
    # Atualizar frontend
    cd "$APP_DIR/frontend"
    sudo -u "$APP_USER" npm install
    sudo -u "$APP_USER" npm run build
    cp -r dist/* /var/www/$APP_NAME/
    chown -R www-data:www-data /var/www/$APP_NAME
    
    # Reiniciar aplicação
    systemctl start "$APP_NAME"
    systemctl restart nginx
    
    print_success "Aplicação atualizada"
}

show_status() {
    print_step "Status dos serviços..."
    
    echo -e "\n${BLUE}🔍 Status dos Serviços:${NC}"
    systemctl status "$APP_NAME" --no-pager -l
    systemctl status nginx --no-pager -l
    systemctl status postgresql --no-pager -l
    
    echo -e "\n${BLUE}🌐 Conectividade:${NC}"
    curl -I http://localhost:8000/api/ 2>/dev/null || echo "Backend não acessível"
    curl -I http://localhost/ 2>/dev/null || echo "Frontend não acessível"
    
    echo -e "\n${BLUE}💾 Uso de Disco:${NC}"
    df -h /
    
    echo -e "\n${BLUE}🧠 Uso de Memória:${NC}"
    free -h
}

show_logs() {
    local service="${1:-$APP_NAME}"
    local lines="${2:-50}"
    
    print_step "Logs do serviço: $service"
    journalctl -u "$service" -n "$lines" --no-pager
}

show_help() {
    cat << EOF

🎓 Sistema de Gestão de Sala de Aula - Deploy Script

Uso: $0 [COMANDO] [OPÇÕES]

COMANDOS:
    install             Instalação completa do sistema
    update              Atualizar aplicação existente
    backup              Criar backup do banco de dados
    restore <arquivo>   Restaurar backup
    status              Mostrar status dos serviços
    logs [serviço]      Mostrar logs (padrão: $APP_NAME)
    ssl                 Configurar SSL/TLS
    help                Mostrar esta ajuda

EXEMPLOS:
    $0 install                    # Instalação completa
    $0 update                     # Atualizar aplicação
    $0 backup                     # Criar backup
    $0 restore backup.sql         # Restaurar backup
    $0 status                     # Ver status
    $0 logs nginx                 # Ver logs do nginx

EOF
}

# ====================================================================
# SCRIPT PRINCIPAL
# ====================================================================

# Criar diretório de log
mkdir -p "$(dirname "$LOG_FILE")"

case "${1:-install}" in
    "install")
        print_step "Iniciando instalação completa..."
        check_root
        check_user_exists
        install_dependencies
        setup_postgresql
        clone_or_update_repo
        setup_python_env
        setup_env_file
        run_django_setup
        setup_frontend
        setup_nginx
        setup_systemd_service
        
        # Perguntar sobre SSL
        read -p "Deseja configurar SSL agora? (y/N): " SETUP_SSL
        if [[ "$SETUP_SSL" =~ ^[Yy]$ ]]; then
            setup_ssl
        fi
        
        print_success "Instalação concluída!"
        echo -e "\n${GREEN}🎉 Sistema instalado com sucesso!${NC}"
        echo -e "${YELLOW}📝 Próximos passos:${NC}"
        echo -e "   1. Criar superusuário: cd $APP_DIR/backend && sudo -u $APP_USER venv/bin/python manage.py createsuperuser"
        echo -e "   2. Configurar SSL se não foi feito: $0 ssl"
        echo -e "   3. Verificar status: $0 status"
        ;;
        
    "update")
        check_root
        create_backup
        update_application
        ;;
        
    "backup")
        check_root
        create_backup
        ;;
        
    "restore")
        check_root
        restore_backup "$2"
        ;;
        
    "status")
        show_status
        ;;
        
    "logs")
        show_logs "$2" "$3"
        ;;
        
    "ssl")
        check_root
        setup_ssl
        ;;
        
    "help"|"-h"|"--help")
        show_help
        ;;
        
    *)
        print_error "Comando inválido: $1"
        show_help
        exit 1
        ;;
esac