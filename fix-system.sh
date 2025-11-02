#!/bin/bash

# ====================================================================
# 🔧 SCRIPT DE CORREÇÃO RÁPIDA DO SISTEMA DE PACOTES
# ====================================================================
# Corrige problemas comuns do dpkg e sistema de pacotes no Ubuntu/Debian
# ====================================================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
print_step() {
    echo -e "\n${BLUE}🔧 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "Este script deve ser executado como root (use sudo)"
        exit 1
    fi
}

fix_package_system() {
    print_step "Verificando e corrigindo sistema de pacotes..."
    
    # Verificar se dpkg está em estado consistente
    if ! dpkg --audit &>/dev/null; then
        print_warning "Sistema de pacotes inconsistente. Corrigindo..."
        
        # Corrigir pacotes interrompidos
        print_step "Configurando pacotes interrompidos..."
        dpkg --configure -a || {
            print_warning "Erro ao configurar pacotes. Tentando correção forçada..."
            dpkg --configure -a --force-confold
        }
        
        # Corrigir dependências quebradas
        print_step "Corrigindo dependências quebradas..."
        apt-get install -f -y
        
        # Limpar cache de pacotes
        print_step "Limpando cache de pacotes..."
        apt-get clean
        apt-get autoclean
        
        # Remover pacotes órfãos
        apt-get autoremove -y
        
        print_success "Sistema de pacotes corrigido"
    else
        print_success "Sistema de pacotes está consistente"
    fi
    
    # Verificar e corrigir repositórios duplicados
    if grep -r "google-chrome" /etc/apt/sources.list.d/ 2>/dev/null | grep -q "google.list"; then
        print_warning "Repositórios Google duplicados detectados. Corrigindo..."
        
        # Backup dos arquivos de repositório
        cp /etc/apt/sources.list.d/google.list /etc/apt/sources.list.d/google.list.backup 2>/dev/null || true
        cp /etc/apt/sources.list.d/google-chrome.list /etc/apt/sources.list.d/google-chrome.list.backup 2>/dev/null || true
        
        # Remover duplicatas (manter apenas google-chrome.list)
        rm -f /etc/apt/sources.list.d/google.list
        
        print_success "Repositórios duplicados corrigidos"
    fi
    
    # Atualizar lista de pacotes
    print_step "Atualizando lista de pacotes..."
    apt-get update
    
    print_success "Sistema de pacotes totalmente corrigido e atualizado!"
}

# ====================================================================
# SCRIPT PRINCIPAL
# ====================================================================

echo -e "${BLUE}🔧 CORREÇÃO RÁPIDA DO SISTEMA DE PACOTES${NC}"
echo "=================================================="

check_root
fix_package_system

echo -e "\n${GREEN}🎉 Correção concluída com sucesso!${NC}"
echo "Agora você pode executar:"
echo "  sudo ./deploy.sh install"
echo ""