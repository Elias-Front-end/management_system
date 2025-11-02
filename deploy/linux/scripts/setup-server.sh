#!/bin/bash

# ======================================================
# 🐧 SETUP SERVIDOR LINUX - Management System
# ======================================================
# Script para configuração inicial do servidor Linux
# Compatível com: Ubuntu 20.04+, CentOS 8+, Debian 11+
# ======================================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Detectar distribuição Linux
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    else
        error "Não foi possível detectar a distribuição Linux"
    fi
    
    log "Sistema detectado: $OS $VER"
}

# Verificar se é root ou sudo
check_privileges() {
    if [[ $EUID -eq 0 ]]; then
        log "Executando como root"
    elif sudo -n true 2>/dev/null; then
        log "Usuário tem privilégios sudo"
        SUDO="sudo"
    else
        error "Este script precisa ser executado como root ou com privilégios sudo"
    fi
}

# Atualizar sistema
update_system() {
    log "Atualizando sistema..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        $SUDO apt-get update -y
        $SUDO apt-get upgrade -y
        success "Sistema Ubuntu/Debian atualizado"
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        $SUDO yum update -y
        success "Sistema CentOS/RHEL atualizado"
    else
        warning "Distribuição não reconhecida, pulando atualização automática"
    fi
}

# Instalar dependências básicas
install_dependencies() {
    log "Instalando dependências básicas..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        $SUDO apt-get install -y \
            curl \
            wget \
            git \
            unzip \
            htop \
            nano \
            ufw \
            fail2ban \
            ca-certificates \
            gnupg \
            lsb-release
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        $SUDO yum install -y \
            curl \
            wget \
            git \
            unzip \
            htop \
            nano \
            firewalld \
            fail2ban \
            ca-certificates
    fi
    
    success "Dependências básicas instaladas"
}

# Instalar Docker
install_docker() {
    log "Verificando instalação do Docker..."
    
    if command -v docker &> /dev/null; then
        warning "Docker já está instalado"
        docker --version
        return
    fi
    
    log "Instalando Docker..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        # Remover versões antigas
        $SUDO apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
        
        # Adicionar repositório oficial
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | $SUDO gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | $SUDO tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        $SUDO apt-get update -y
        $SUDO apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
        
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        # Remover versões antigas
        $SUDO yum remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine 2>/dev/null || true
        
        # Instalar repositório
        $SUDO yum install -y yum-utils
        $SUDO yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
        
        $SUDO yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    fi
    
    # Iniciar e habilitar Docker
    $SUDO systemctl start docker
    $SUDO systemctl enable docker
    
    success "Docker instalado e configurado"
}

# Instalar Docker Compose (versão standalone)
install_docker_compose() {
    log "Verificando Docker Compose..."
    
    if command -v docker-compose &> /dev/null; then
        warning "Docker Compose já está instalado"
        docker-compose --version
        return
    fi
    
    log "Instalando Docker Compose..."
    
    # Baixar versão mais recente
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
    $SUDO curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    $SUDO chmod +x /usr/local/bin/docker-compose
    
    # Criar link simbólico
    $SUDO ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    success "Docker Compose instalado: $(docker-compose --version)"
}

# Configurar usuário Docker
configure_docker_user() {
    log "Configurando usuário para Docker..."
    
    # Criar grupo docker se não existir
    $SUDO groupadd docker 2>/dev/null || true
    
    # Adicionar usuário atual ao grupo docker
    if [[ $EUID -ne 0 ]]; then
        $SUDO usermod -aG docker $USER
        success "Usuário $USER adicionado ao grupo docker"
        warning "IMPORTANTE: Faça logout e login novamente para aplicar as permissões"
    else
        warning "Executando como root - configuração de usuário pulada"
    fi
}

# Configurar firewall
configure_firewall() {
    log "Configurando firewall..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        # UFW para Ubuntu/Debian
        $SUDO ufw --force enable
        $SUDO ufw default deny incoming
        $SUDO ufw default allow outgoing
        $SUDO ufw allow ssh
        $SUDO ufw allow 80/tcp
        $SUDO ufw allow 443/tcp
        success "UFW configurado"
        
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        # Firewalld para CentOS/RHEL
        $SUDO systemctl start firewalld
        $SUDO systemctl enable firewalld
        $SUDO firewall-cmd --permanent --add-service=ssh
        $SUDO firewall-cmd --permanent --add-service=http
        $SUDO firewall-cmd --permanent --add-service=https
        $SUDO firewall-cmd --reload
        success "Firewalld configurado"
    fi
}

# Criar diretórios de trabalho
create_directories() {
    log "Criando diretórios de trabalho..."
    
    mkdir -p ~/management_system_deploy/{logs,backups,ssl}
    chmod 755 ~/management_system_deploy
    
    success "Diretórios criados em ~/management_system_deploy"
}

# Verificar instalação
verify_installation() {
    log "Verificando instalação..."
    
    # Verificar Docker
    if docker --version &> /dev/null; then
        success "Docker: $(docker --version)"
    else
        error "Docker não está funcionando"
    fi
    
    # Verificar Docker Compose
    if docker-compose --version &> /dev/null; then
        success "Docker Compose: $(docker-compose --version)"
    else
        error "Docker Compose não está funcionando"
    fi
    
    # Verificar Git
    if git --version &> /dev/null; then
        success "Git: $(git --version)"
    else
        error "Git não está instalado"
    fi
    
    # Testar Docker
    log "Testando Docker..."
    if docker run --rm hello-world &> /dev/null; then
        success "Docker está funcionando corretamente"
    else
        error "Docker não consegue executar containers"
    fi
}

# Função principal
main() {
    echo "======================================================="
    echo "🐧 CONFIGURAÇÃO SERVIDOR LINUX - Management System"
    echo "======================================================="
    echo ""
    
    detect_os
    check_privileges
    update_system
    install_dependencies
    install_docker
    install_docker_compose
    configure_docker_user
    configure_firewall
    create_directories
    verify_installation
    
    echo ""
    echo "======================================================="
    success "✅ CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!"
    echo "======================================================="
    echo ""
    echo "📋 Próximos passos:"
    echo "1. Faça logout e login novamente (se não for root)"
    echo "2. Clone o repositório: git clone <seu-repo>"
    echo "3. Execute o deploy: ./deploy/linux/scripts/deploy.sh"
    echo ""
    echo "🔧 Comandos úteis:"
    echo "- Verificar Docker: docker --version"
    echo "- Testar Docker: docker run hello-world"
    echo "- Ver containers: docker ps"
    echo ""
}

# Executar função principal
main "$@"