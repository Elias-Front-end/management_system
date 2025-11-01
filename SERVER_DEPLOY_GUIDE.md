# 🚀 GUIA DE DEPLOY EM SERVIDORES - Sistema de Gestão de Sala de Aula

## 📋 Índice
1. [🐧 Deploy em Servidor Linux](#-deploy-em-servidor-linux)
2. [🪟 Deploy em Servidor Windows](#-deploy-em-servidor-windows)
3. [🔧 Configurações de Firewall](#-configurações-de-firewall)
4. [📊 Monitoramento e Logs](#-monitoramento-e-logs)
5. [🔄 Scripts de Automação](#-scripts-de-automação)
6. [🆘 Troubleshooting Servidor](#-troubleshooting-servidor)

---

## 🐧 Deploy em Servidor Linux

### 📋 Pré-requisitos do Servidor

#### Ubuntu 20.04+ / Debian 11+
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências básicas
sudo apt install -y curl wget git unzip software-properties-common

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalações
docker --version
docker-compose --version
```

#### CentOS 8+ / RHEL 8+ / Rocky Linux
```bash
# Atualizar sistema
sudo dnf update -y

# Instalar dependências básicas
sudo dnf install -y curl wget git unzip

# Instalar Docker
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf install -y docker-ce docker-ce-cli containerd.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalações
docker --version
docker-compose --version
```

### 🚀 Deploy Completo no Linux

#### 1. Preparar Diretório do Projeto

```bash
# Criar usuário para aplicação (recomendado)
sudo useradd -m -s /bin/bash appuser
sudo usermod -aG docker appuser

# Mudar para usuário da aplicação
sudo su - appuser

# Criar diretório do projeto
mkdir -p /home/appuser/management_system
cd /home/appuser/management_system

# Clonar repositório
git clone https://github.com/seu-usuario/management_system.git .
```

#### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar configurações de produção
nano .env
```

**Configuração .env para Servidor Linux:**
```env
# === CONFIGURAÇÕES DE PRODUÇÃO LINUX ===

# Django Settings
SECRET_KEY=sua-chave-secreta-super-forte-aqui-min-50-chars-linux-prod
DEBUG=False
ALLOWED_HOSTS=seu-dominio.com,www.seu-dominio.com,IP_DO_SERVIDOR

# Database (PostgreSQL)
DATABASE_NAME=management_system_db
DATABASE_USER=postgres
DATABASE_PASSWORD=senha_forte_postgres_123
DATABASE_HOST=db
DATABASE_PORT=5432

# CORS Settings
CORS_ALLOWED_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com
CORS_ALLOW_CREDENTIALS=True

# CSRF Settings
CSRF_TRUSTED_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com
CSRF_COOKIE_SECURE=True
CSRF_COOKIE_HTTPONLY=False

# Security Settings
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SESSION_COOKIE_SECURE=True

# Email Settings (opcional)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua-senha-app
```

#### 3. Configurar SSL/HTTPS (Opcional mas Recomendado)

```bash
# Instalar Certbot para Let's Encrypt
sudo apt install -y certbot

# Gerar certificados SSL
sudo certbot certonly --standalone -d seu-dominio.com -d www.seu-dominio.com

# Copiar certificados para projeto
sudo mkdir -p nginx/ssl
sudo cp /etc/letsencrypt/live/seu-dominio.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/seu-dominio.com/privkey.pem nginx/ssl/key.pem
sudo chown -R appuser:appuser nginx/ssl/
```

#### 4. Deploy com Docker

```bash
# Fazer deploy
docker-compose -f docker-compose.prod.yml up -d --build

# Aguardar inicialização (30-60 segundos)
sleep 60

# Verificar status dos containers
docker-compose -f docker-compose.prod.yml ps

# Criar usuário administrador
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser --noinput --username admin --email admin@seu-dominio.com
docker-compose -f docker-compose.prod.yml exec backend python set_admin_password.py

# Verificar logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### 5. Configurar Serviço Systemd (Opcional)

```bash
# Criar arquivo de serviço
sudo nano /etc/systemd/system/management-system.service
```

**Conteúdo do arquivo de serviço:**
```ini
[Unit]
Description=Management System Docker Compose
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/appuser/management_system
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0
User=appuser
Group=appuser

[Install]
WantedBy=multi-user.target
```

```bash
# Habilitar e iniciar serviço
sudo systemctl daemon-reload
sudo systemctl enable management-system.service
sudo systemctl start management-system.service

# Verificar status
sudo systemctl status management-system.service
```

---

## 🪟 Deploy em Servidor Windows

### 📋 Pré-requisitos do Servidor Windows

#### Windows Server 2019/2022
```powershell
# Executar como Administrador

# Instalar Chocolatey (gerenciador de pacotes)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Instalar Git
choco install git -y

# Instalar Docker Desktop
choco install docker-desktop -y

# Reiniciar o servidor
Restart-Computer
```

**Após reinicialização:**
```powershell
# Verificar instalações
docker --version
docker-compose --version
git --version
```

### 🚀 Deploy Completo no Windows Server

#### 1. Preparar Diretório do Projeto

```powershell
# Criar diretório do projeto
New-Item -ItemType Directory -Path "C:\management_system" -Force
Set-Location "C:\management_system"

# Clonar repositório
git clone https://github.com/seu-usuario/management_system.git .
```

#### 2. Configurar Variáveis de Ambiente

```powershell
# Copiar arquivo de exemplo
Copy-Item ".env.example" ".env"

# Editar configurações (usar notepad ou editor de preferência)
notepad .env
```

**Configuração .env para Windows Server:**
```env
# === CONFIGURAÇÕES DE PRODUÇÃO WINDOWS ===

# Django Settings
SECRET_KEY=sua-chave-secreta-super-forte-aqui-min-50-chars-windows-prod
DEBUG=False
ALLOWED_HOSTS=seu-dominio.com,www.seu-dominio.com,IP_DO_SERVIDOR

# Database (PostgreSQL)
DATABASE_NAME=management_system_db
DATABASE_USER=postgres
DATABASE_PASSWORD=senha_forte_postgres_123
DATABASE_HOST=db
DATABASE_PORT=5432

# CORS Settings
CORS_ALLOWED_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com
CORS_ALLOW_CREDENTIALS=True

# CSRF Settings
CSRF_TRUSTED_ORIGINS=https://seu-dominio.com,https://www.seu-dominio.com
CSRF_COOKIE_SECURE=True
CSRF_COOKIE_HTTPONLY=False

# Security Settings (ajustar para Windows)
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SESSION_COOKIE_SECURE=True

# Email Settings
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=seu-email@gmail.com
EMAIL_HOST_PASSWORD=sua-senha-app
```

#### 3. Configurar Certificados SSL (Windows)

```powershell
# Criar diretório para SSL
New-Item -ItemType Directory -Path "nginx\ssl" -Force

# Para certificados auto-assinados (desenvolvimento/teste)
# Instalar OpenSSL via Chocolatey
choco install openssl -y

# Gerar certificados auto-assinados
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx\ssl\key.pem -out nginx\ssl\cert.pem -subj "/C=BR/ST=SP/L=SaoPaulo/O=SuaEmpresa/CN=seu-dominio.com"
```

#### 4. Deploy com Docker no Windows

```powershell
# Fazer deploy
docker-compose -f docker-compose.prod.yml up -d --build

# Aguardar inicialização
Start-Sleep -Seconds 60

# Verificar status dos containers
docker-compose -f docker-compose.prod.yml ps

# Criar usuário administrador
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser --noinput --username admin --email admin@seu-dominio.com
docker-compose -f docker-compose.prod.yml exec backend python set_admin_password.py

# Verificar logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### 5. Configurar Serviço Windows (Opcional)

```powershell
# Instalar NSSM (Non-Sucking Service Manager)
choco install nssm -y

# Criar script de inicialização
@"
@echo off
cd /d C:\management_system
docker-compose -f docker-compose.prod.yml up -d
"@ | Out-File -FilePath "C:\management_system\start-service.bat" -Encoding ASCII

# Criar serviço
nssm install "ManagementSystem" "C:\management_system\start-service.bat"
nssm set "ManagementSystem" DisplayName "Management System Docker"
nssm set "ManagementSystem" Description "Sistema de Gestão de Sala de Aula"
nssm set "ManagementSystem" Start SERVICE_AUTO_START

# Iniciar serviço
nssm start "ManagementSystem"

# Verificar status
nssm status "ManagementSystem"
```

---

## 🔧 Configurações de Firewall

### Linux (UFW - Ubuntu/Debian)
```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH (importante!)
sudo ufw allow ssh

# Permitir HTTP e HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Permitir portas específicas se necessário
sudo ufw allow 8000/tcp  # Backend direto (opcional)

# Verificar status
sudo ufw status verbose
```

### Linux (Firewalld - CentOS/RHEL)
```bash
# Verificar status
sudo firewall-cmd --state

# Permitir HTTP e HTTPS
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# Permitir portas específicas
sudo firewall-cmd --permanent --add-port=8000/tcp

# Recarregar configurações
sudo firewall-cmd --reload

# Verificar configurações
sudo firewall-cmd --list-all
```

### Windows Server
```powershell
# Permitir HTTP (porta 80)
New-NetFirewallRule -DisplayName "Allow HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow

# Permitir HTTPS (porta 443)
New-NetFirewallRule -DisplayName "Allow HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow

# Permitir backend direto (opcional)
New-NetFirewallRule -DisplayName "Allow Backend" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow

# Verificar regras
Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*HTTP*" -or $_.DisplayName -like "*Backend*"}
```

---

## 📊 Monitoramento e Logs

### Comandos de Monitoramento Linux
```bash
# Monitorar recursos do sistema
htop
# ou
top

# Monitorar uso de disco
df -h

# Monitorar logs do sistema
sudo journalctl -f

# Monitorar containers Docker
docker stats

# Logs específicos da aplicação
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f db
```

### Comandos de Monitoramento Windows
```powershell
# Monitorar recursos do sistema
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10

# Monitorar uso de disco
Get-WmiObject -Class Win32_LogicalDisk | Select-Object DeviceID, @{Name="Size(GB)";Expression={[math]::Round($_.Size/1GB,2)}}, @{Name="FreeSpace(GB)";Expression={[math]::Round($_.FreeSpace/1GB,2)}}

# Monitorar containers Docker
docker stats

# Logs da aplicação
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f nginx
docker-compose -f docker-compose.prod.yml logs -f db
```

### Configurar Logrotate (Linux)
```bash
# Criar configuração de rotação de logs
sudo nano /etc/logrotate.d/management-system
```

**Conteúdo do arquivo logrotate:**
```
/home/appuser/management_system/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 appuser appuser
    postrotate
        docker-compose -f /home/appuser/management_system/docker-compose.prod.yml restart backend
    endscript
}
```

---

## 🔄 Scripts de Automação

### 📋 Scripts Disponíveis

#### 1. Deploy Automatizado

**Linux (deploy.sh)**
```bash
# Tornar executável
chmod +x deploy.sh

# Deploy completo
./deploy.sh

# O script irá:
# - Verificar Docker e Docker Compose
# - Fazer backup automático do banco atual
# - Atualizar código do repositório (se for git)
# - Construir e iniciar containers
# - Executar migrações
# - Criar usuário admin
# - Verificar saúde da aplicação
```

**Windows (deploy.ps1)**
```powershell
# Permitir execução de scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Deploy completo
.\deploy.ps1

# Deploy sem backup
.\deploy.ps1 -SkipBackup

# Deploy sem git pull
.\deploy.ps1 -SkipGitPull

# Deploy com logs detalhados
.\deploy.ps1 -Verbose
```

#### 2. Backup e Restauração

**Backup - Linux**
```bash
chmod +x scripts/backup.sh
./scripts/backup.sh

# Cria backups de:
# - Banco de dados (PostgreSQL)
# - Arquivos de mídia
# - Configurações (.env, docker-compose, nginx)
# - Mantém histórico de 7 dias
```

**Backup - Windows**
```powershell
.\scripts\backup.ps1

# Com retenção personalizada
.\scripts\backup.ps1 -RetentionDays 14

# Diretório personalizado
.\scripts\backup.ps1 -BackupDir "C:\Backups\Sistema"
```

**Restauração - Linux**
```bash
chmod +x scripts/restore.sh
./scripts/restore.sh

# Interface interativa para:
# - Selecionar backup do banco
# - Selecionar backup de mídia
# - Selecionar backup de configurações
# - Confirmação antes de cada restauração
```

#### 3. Monitoramento

**Windows (monitor.ps1)**
```powershell
# Verificação única
.\scripts\monitor.ps1

# Monitoramento contínuo (atualiza a cada 30s)
.\scripts\monitor.ps1 -Continuous

# Com logs recentes
.\scripts\monitor.ps1 -ShowLogs -LogLines 100

# Intervalo personalizado
.\scripts\monitor.ps1 -Continuous -IntervalSeconds 60
```

### 📊 Funcionalidades dos Scripts

#### Deploy Automatizado
- ✅ Verificação de pré-requisitos
- ✅ Backup automático antes do deploy
- ✅ Atualização de código (git pull)
- ✅ Build e inicialização de containers
- ✅ Migrações de banco
- ✅ Criação de usuário admin
- ✅ Verificação de saúde
- ✅ Limpeza de imagens antigas
- ✅ Logs coloridos e informativos

#### Backup
- ✅ Backup completo do banco PostgreSQL
- ✅ Backup de arquivos de mídia
- ✅ Backup de configurações
- ✅ Retenção automática de backups
- ✅ Verificação de integridade

#### Restauração
- ✅ Interface interativa
- ✅ Listagem de backups disponíveis
- ✅ Backup de segurança antes da restauração
- ✅ Restauração seletiva (banco, mídia, config)
- ✅ Verificação pós-restauração

#### Monitoramento
- ✅ Status dos containers
- ✅ Uso de recursos (CPU, memória)
- ✅ Saúde dos serviços
- ✅ Informações do sistema
- ✅ Logs recentes
- ✅ Comandos úteis

### Script de Deploy Linux
```bash
# Criar script de deploy
nano deploy.sh
```

**Conteúdo do deploy.sh:**
```bash
#!/bin/bash

# Script de Deploy Automatizado - Linux
# Autor: Sistema de Gestão de Sala de Aula
# Data: $(date)

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy do Sistema de Gestão de Sala de Aula..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    error "Docker não está rodando. Inicie o Docker e tente novamente."
fi

# Verificar se arquivo .env existe
if [ ! -f ".env" ]; then
    error "Arquivo .env não encontrado. Copie .env.example para .env e configure."
fi

log "Fazendo backup dos containers atuais..."
docker-compose -f docker-compose.prod.yml down || warning "Nenhum container estava rodando"

log "Fazendo backup do banco de dados..."
if docker ps -a | grep -q management_system_db_prod; then
    docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U postgres management_system_db > "backup_$(date +%Y%m%d_%H%M%S).sql" || warning "Falha no backup do banco"
fi

log "Atualizando código do repositório..."
git pull origin main || error "Falha ao atualizar código"

log "Construindo e iniciando containers..."
docker-compose -f docker-compose.prod.yml up -d --build || error "Falha ao iniciar containers"

log "Aguardando inicialização dos serviços..."
sleep 30

log "Verificando status dos containers..."
docker-compose -f docker-compose.prod.yml ps

log "Executando migrações do banco..."
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate || error "Falha nas migrações"

log "Coletando arquivos estáticos..."
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput || warning "Falha ao coletar estáticos"

log "Verificando saúde da aplicação..."
sleep 10
if curl -f http://localhost/api/ > /dev/null 2>&1; then
    log "✅ Deploy concluído com sucesso!"
    log "🌐 Aplicação disponível em: http://localhost/"
    log "🔧 Admin disponível em: http://localhost/admin/"
else
    warning "Aplicação pode não estar respondendo corretamente. Verifique os logs."
fi

log "Limpando imagens Docker antigas..."
docker image prune -f || warning "Falha ao limpar imagens antigas"

echo ""
log "📊 Status final dos containers:"
docker-compose -f docker-compose.prod.yml ps

echo ""
log "📝 Para ver os logs em tempo real:"
echo "docker-compose -f docker-compose.prod.yml logs -f"

echo ""
log "🎉 Deploy finalizado!"
```

```bash
# Tornar executável
chmod +x deploy.sh

# Executar deploy
./deploy.sh
```

### Script de Deploy Windows
```powershell
# Criar script de deploy
New-Item -ItemType File -Path "deploy.ps1" -Force
```

**Conteúdo do deploy.ps1:**
```powershell
# Script de Deploy Automatizado - Windows
# Autor: Sistema de Gestão de Sala de Aula
# Data: Get-Date

param(
    [switch]$SkipBackup = $false
)

# Configurações
$ErrorActionPreference = "Stop"

# Função para log
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $color = switch ($Level) {
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        "SUCCESS" { "Green" }
        default { "White" }
    }
    
    Write-Host "[$timestamp] $Message" -ForegroundColor $color
}

try {
    Write-Log "🚀 Iniciando deploy do Sistema de Gestão de Sala de Aula..." "SUCCESS"
    
    # Verificar se Docker está rodando
    try {
        docker info | Out-Null
    }
    catch {
        Write-Log "Docker não está rodando. Inicie o Docker Desktop e tente novamente." "ERROR"
        exit 1
    }
    
    # Verificar se arquivo .env existe
    if (-not (Test-Path ".env")) {
        Write-Log "Arquivo .env não encontrado. Copie .env.example para .env e configure." "ERROR"
        exit 1
    }
    
    Write-Log "Parando containers atuais..."
    docker-compose -f docker-compose.prod.yml down
    
    if (-not $SkipBackup) {
        Write-Log "Fazendo backup do banco de dados..."
        $backupFile = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
        try {
            docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U postgres management_system_db > $backupFile
            Write-Log "Backup salvo em: $backupFile" "SUCCESS"
        }
        catch {
            Write-Log "Falha no backup do banco de dados" "WARNING"
        }
    }
    
    Write-Log "Atualizando código do repositório..."
    git pull origin main
    
    Write-Log "Construindo e iniciando containers..."
    docker-compose -f docker-compose.prod.yml up -d --build
    
    Write-Log "Aguardando inicialização dos serviços..."
    Start-Sleep -Seconds 30
    
    Write-Log "Verificando status dos containers..."
    docker-compose -f docker-compose.prod.yml ps
    
    Write-Log "Executando migrações do banco..."
    docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
    
    Write-Log "Coletando arquivos estáticos..."
    try {
        docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
    }
    catch {
        Write-Log "Falha ao coletar arquivos estáticos" "WARNING"
    }
    
    Write-Log "Verificando saúde da aplicação..."
    Start-Sleep -Seconds 10
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost/api/" -Method HEAD -TimeoutSec 10
        Write-Log "✅ Deploy concluído com sucesso!" "SUCCESS"
        Write-Log "🌐 Aplicação disponível em: http://localhost/" "SUCCESS"
        Write-Log "🔧 Admin disponível em: http://localhost/admin/" "SUCCESS"
    }
    catch {
        Write-Log "Aplicação pode não estar respondendo corretamente. Verifique os logs." "WARNING"
    }
    
    Write-Log "Limpando imagens Docker antigas..."
    try {
        docker image prune -f
    }
    catch {
        Write-Log "Falha ao limpar imagens antigas" "WARNING"
    }
    
    Write-Log ""
    Write-Log "📊 Status final dos containers:" "SUCCESS"
    docker-compose -f docker-compose.prod.yml ps
    
    Write-Log ""
    Write-Log "📝 Para ver os logs em tempo real:" "SUCCESS"
    Write-Log "docker-compose -f docker-compose.prod.yml logs -f"
    
    Write-Log ""
    Write-Log "🎉 Deploy finalizado!" "SUCCESS"
}
catch {
    Write-Log "Erro durante o deploy: $($_.Exception.Message)" "ERROR"
    Write-Log "Verifique os logs para mais detalhes." "ERROR"
    exit 1
}
```

```powershell
# Executar deploy
.\deploy.ps1

# Ou executar sem backup
.\deploy.ps1 -SkipBackup
```

---

## 🆘 Troubleshooting Servidor

### Problemas Comuns Linux

#### 1. Erro de Permissão Docker
```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker

# Ou executar com sudo temporariamente
sudo docker-compose -f docker-compose.prod.yml up -d --build
```

#### 2. Porta já em uso
```bash
# Verificar o que está usando a porta 80
sudo netstat -tulpn | grep :80

# Parar serviço que está usando a porta
sudo systemctl stop apache2  # ou nginx, ou outro serviço
sudo systemctl disable apache2  # para não iniciar automaticamente
```

#### 3. Falta de espaço em disco
```bash
# Verificar espaço
df -h

# Limpar containers e imagens antigas
docker system prune -a -f

# Limpar logs antigos
sudo journalctl --vacuum-time=7d
```

### Problemas Comuns Windows

#### 1. Docker Desktop não inicia
```powershell
# Verificar se Hyper-V está habilitado
Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V

# Habilitar Hyper-V se necessário
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All

# Reiniciar após habilitar Hyper-V
Restart-Computer
```

#### 2. Erro de compartilhamento de drive
```powershell
# No Docker Desktop, ir em Settings > Resources > File Sharing
# Adicionar o drive C:\ se não estiver listado
# Aplicar e reiniciar Docker Desktop
```

#### 3. Porta já em uso no Windows
```powershell
# Verificar o que está usando a porta 80
netstat -ano | findstr :80

# Parar IIS se estiver rodando
Stop-Service -Name W3SVC -Force
Set-Service -Name W3SVC -StartupType Disabled
```

### Comandos de Diagnóstico

#### Linux
```bash
# Verificar logs do sistema
sudo journalctl -xe

# Verificar logs do Docker
sudo journalctl -u docker.service

# Verificar recursos do sistema
free -h
df -h
top

# Testar conectividade
curl -I http://localhost/
telnet localhost 80
```

#### Windows
```powershell
# Verificar logs do sistema
Get-EventLog -LogName System -Newest 50

# Verificar recursos do sistema
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10
Get-WmiObject -Class Win32_OperatingSystem | Select-Object TotalVisibleMemorySize, FreePhysicalMemory

# Testar conectividade
Test-NetConnection -ComputerName localhost -Port 80
Invoke-WebRequest -Uri http://localhost/ -Method HEAD
```

---

**✅ Documentação atualizada em:** Novembro 2025  
**🔄 Versão:** 1.0.0  
**👥 Mantido por:** Desenvolvimento Elias Moraes

**📞 Suporte:**
- Para problemas técnicos, consulte a seção de troubleshooting
- Para dúvidas sobre configuração, verifique os logs dos containers
- Para problemas de rede, verifique as configurações de firewall