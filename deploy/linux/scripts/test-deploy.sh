#!/bin/bash

# ======================================================
# 🧪 TESTES DE VALIDAÇÃO - Management System Linux
# ======================================================
# Script para validar deploy completo da aplicação
# Testa: containers, comunicação, funcionalidades básicas
# ======================================================

set -e  # Parar em caso de erro

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$HOME/management_system_deploy/management_system"
COMPOSE_FILE="deploy/linux/config/docker-compose.linux.yml"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Contadores de testes
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
}

info() {
    echo -e "${PURPLE}ℹ️  $1${NC}"
}

# Função para executar teste
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    ((TESTS_TOTAL++))
    log "Teste $TESTS_TOTAL: $test_name"
    
    if eval "$test_command" &> /dev/null; then
        success "$test_name"
        return 0
    else
        error "$test_name"
        return 1
    fi
}

# Verificar se está no diretório correto
check_directory() {
    if [ ! -d "$DEPLOY_DIR" ]; then
        error "Diretório de deploy não encontrado: $DEPLOY_DIR"
        error "Execute o deploy primeiro: ./scripts/deploy.sh"
        exit 1
    fi
    
    cd "$DEPLOY_DIR"
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        error "Arquivo docker-compose não encontrado: $COMPOSE_FILE"
        exit 1
    fi
    
    success "Diretório de deploy encontrado"
}

# Teste 1: Verificar se containers estão rodando
test_containers_running() {
    log "=== TESTE 1: CONTAINERS EM EXECUÇÃO ==="
    
    # Verificar se docker-compose está rodando
    run_test "Docker Compose está ativo" \
        "docker-compose -f $COMPOSE_FILE ps | grep -q 'Up'"
    
    # Verificar containers individuais
    run_test "Container PostgreSQL está rodando" \
        "docker-compose -f $COMPOSE_FILE ps | grep -q 'management_system_db_linux.*Up'"
    
    run_test "Container Backend está rodando" \
        "docker-compose -f $COMPOSE_FILE ps | grep -q 'management_system_backend_linux.*Up'"
    
    run_test "Container Nginx está rodando" \
        "docker-compose -f $COMPOSE_FILE ps | grep -q 'management_system_nginx_linux.*Up'"
    
    run_test "Container Redis está rodando" \
        "docker-compose -f $COMPOSE_FILE ps | grep -q 'management_system_redis_linux.*Up'"
}

# Teste 2: Verificar saúde dos containers
test_containers_health() {
    log "=== TESTE 2: SAÚDE DOS CONTAINERS ==="
    
    # Aguardar um pouco para os healthchecks
    sleep 5
    
    run_test "PostgreSQL está saudável" \
        "docker-compose -f $COMPOSE_FILE ps | grep 'management_system_db_linux' | grep -q 'healthy'"
    
    run_test "Backend está saudável" \
        "docker-compose -f $COMPOSE_FILE ps | grep 'management_system_backend_linux' | grep -q 'healthy'"
    
    run_test "Nginx está saudável" \
        "docker-compose -f $COMPOSE_FILE ps | grep 'management_system_nginx_linux' | grep -q 'healthy'"
    
    run_test "Redis está saudável" \
        "docker-compose -f $COMPOSE_FILE ps | grep 'management_system_redis_linux' | grep -q 'healthy'"
}

# Teste 3: Conectividade de rede
test_network_connectivity() {
    log "=== TESTE 3: CONECTIVIDADE DE REDE ==="
    
    # Obter IP do servidor
    SERVER_IP=$(hostname -I | awk '{print $1}')
    
    run_test "Porta 80 (HTTP) está acessível" \
        "curl -f -s http://localhost/ > /dev/null"
    
    run_test "Porta 8000 (Backend) está acessível" \
        "curl -f -s http://localhost:8000/admin/ > /dev/null"
    
    run_test "Backend responde via IP do servidor" \
        "curl -f -s http://$SERVER_IP:8000/admin/ > /dev/null"
    
    run_test "Nginx responde via IP do servidor" \
        "curl -f -s http://$SERVER_IP/ > /dev/null"
}

# Teste 4: Funcionalidades do Backend
test_backend_functionality() {
    log "=== TESTE 4: FUNCIONALIDADES DO BACKEND ==="
    
    # Testar Django Admin
    run_test "Django Admin está acessível" \
        "curl -f -s http://localhost:8000/admin/ | grep -q 'Django'"
    
    # Testar API endpoints
    run_test "API de treinamentos responde (401 esperado)" \
        "curl -s http://localhost:8000/api/treinamentos/ | grep -q '401\\|detail'"
    
    run_test "API de turmas responde (401 esperado)" \
        "curl -s http://localhost:8000/api/turmas/ | grep -q '401\\|detail'"
    
    run_test "API de alunos responde (401 esperado)" \
        "curl -s http://localhost:8000/api/alunos/ | grep -q '401\\|detail'"
    
    # Testar CSRF token
    run_test "CSRF token está funcionando" \
        "curl -s http://localhost:8000/admin/ | grep -q 'csrfmiddlewaretoken'"
}

# Teste 5: Banco de dados
test_database() {
    log "=== TESTE 5: BANCO DE DADOS ==="
    
    run_test "PostgreSQL aceita conexões" \
        "docker-compose -f $COMPOSE_FILE exec -T db pg_isready -U postgres"
    
    run_test "Banco de dados existe" \
        "docker-compose -f $COMPOSE_FILE exec -T db psql -U postgres -lqt | cut -d \\| -f 1 | grep -qw management_system_prod"
    
    run_test "Migrações foram aplicadas" \
        "docker-compose -f $COMPOSE_FILE exec -T backend python manage.py showmigrations | grep -q '\\[X\\]'"
    
    run_test "Superusuário existe" \
        "docker-compose -f $COMPOSE_FILE exec -T backend python manage.py shell -c \"from django.contrib.auth import get_user_model; print(get_user_model().objects.filter(username='admin').exists())\" | grep -q 'True'"
}

# Teste 6: Arquivos estáticos e media
test_static_files() {
    log "=== TESTE 6: ARQUIVOS ESTÁTICOS ==="
    
    run_test "Arquivos estáticos foram coletados" \
        "docker-compose -f $COMPOSE_FILE exec -T backend ls /app/staticfiles/ | grep -q 'admin'"
    
    run_test "CSS do Django Admin está disponível" \
        "curl -f -s http://localhost:8000/static/admin/css/base.css > /dev/null"
    
    run_test "Diretório de media existe" \
        "docker-compose -f $COMPOSE_FILE exec -T backend ls -d /app/media"
}

# Teste 7: Performance básica
test_performance() {
    log "=== TESTE 7: PERFORMANCE BÁSICA ==="
    
    # Testar tempo de resposta do backend
    BACKEND_TIME=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:8000/admin/)
    if (( $(echo "$BACKEND_TIME < 2.0" | bc -l) )); then
        success "Backend responde em menos de 2s ($BACKEND_TIME s)"
        ((TESTS_PASSED++))
    else
        error "Backend demorou mais que 2s ($BACKEND_TIME s)"
        ((TESTS_FAILED++))
    fi
    ((TESTS_TOTAL++))
    
    # Testar tempo de resposta do Nginx
    NGINX_TIME=$(curl -o /dev/null -s -w '%{time_total}' http://localhost/)
    if (( $(echo "$NGINX_TIME < 1.0" | bc -l) )); then
        success "Nginx responde em menos de 1s ($NGINX_TIME s)"
        ((TESTS_PASSED++))
    else
        error "Nginx demorou mais que 1s ($NGINX_TIME s)"
        ((TESTS_FAILED++))
    fi
    ((TESTS_TOTAL++))
}

# Teste 8: Logs e monitoramento
test_logs() {
    log "=== TESTE 8: LOGS E MONITORAMENTO ==="
    
    run_test "Logs do backend estão sendo gerados" \
        "docker-compose -f $COMPOSE_FILE logs backend | grep -q 'Booting worker'"
    
    run_test "Logs do PostgreSQL estão sendo gerados" \
        "docker-compose -f $COMPOSE_FILE logs db | grep -q 'database system is ready'"
    
    run_test "Logs do Nginx estão sendo gerados" \
        "docker-compose -f $COMPOSE_FILE logs nginx | grep -q 'nginx'"
    
    run_test "Diretório de logs existe" \
        "ls -d logs/ > /dev/null 2>&1 || mkdir -p logs/"
}

# Teste 9: Segurança básica
test_security() {
    log "=== TESTE 9: SEGURANÇA BÁSICA ==="
    
    run_test "Headers de segurança estão presentes" \
        "curl -I http://localhost:8000/admin/ | grep -q 'X-Frame-Options'"
    
    run_test "CSRF protection está ativo" \
        "curl -X POST http://localhost:8000/admin/login/ | grep -q '403\\|csrf'"
    
    run_test "Debug está desabilitado" \
        "docker-compose -f $COMPOSE_FILE exec -T backend python -c \"from django.conf import settings; print(settings.DEBUG)\" | grep -q 'False'"
}

# Teste 10: Recursos do sistema
test_system_resources() {
    log "=== TESTE 10: RECURSOS DO SISTEMA ==="
    
    # Verificar uso de CPU dos containers
    CPU_USAGE=$(docker stats --no-stream --format "table {{.CPUPerc}}" | tail -n +2 | sed 's/%//' | awk '{sum+=$1} END {print sum}')
    if (( $(echo "$CPU_USAGE < 80" | bc -l) )); then
        success "Uso de CPU está normal ($CPU_USAGE%)"
        ((TESTS_PASSED++))
    else
        warning "Uso de CPU está alto ($CPU_USAGE%)"
        ((TESTS_FAILED++))
    fi
    ((TESTS_TOTAL++))
    
    # Verificar uso de memória
    MEMORY_USAGE=$(docker stats --no-stream --format "table {{.MemPerc}}" | tail -n +2 | sed 's/%//' | awk '{sum+=$1} END {print sum}')
    if (( $(echo "$MEMORY_USAGE < 80" | bc -l) )); then
        success "Uso de memória está normal ($MEMORY_USAGE%)"
        ((TESTS_PASSED++))
    else
        warning "Uso de memória está alto ($MEMORY_USAGE%)"
        ((TESTS_FAILED++))
    fi
    ((TESTS_TOTAL++))
}

# Mostrar relatório final
show_test_report() {
    echo ""
    echo "======================================================="
    echo "📊 RELATÓRIO DE TESTES - DEPLOY LINUX"
    echo "======================================================="
    echo ""
    
    # Calcular porcentagem de sucesso
    SUCCESS_RATE=$(( (TESTS_PASSED * 100) / TESTS_TOTAL ))
    
    echo "📈 Estatísticas:"
    echo "├── 📊 Total de testes: $TESTS_TOTAL"
    echo "├── ✅ Testes aprovados: $TESTS_PASSED"
    echo "├── ❌ Testes falharam: $TESTS_FAILED"
    echo "└── 📊 Taxa de sucesso: $SUCCESS_RATE%"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        success "🎉 TODOS OS TESTES PASSARAM! Deploy está funcionando perfeitamente."
        echo ""
        echo "🔗 URLs de Acesso:"
        SERVER_IP=$(hostname -I | awk '{print $1}')
        echo "├── 🎨 Frontend: http://$SERVER_IP/"
        echo "├── 🔧 Backend API: http://$SERVER_IP/api/"
        echo "└── 👤 Django Admin: http://$SERVER_IP/admin/ (admin/admin123)"
        echo ""
    elif [ $SUCCESS_RATE -ge 80 ]; then
        warning "⚠️  Deploy está funcionando com algumas falhas ($TESTS_FAILED/$TESTS_TOTAL)"
        echo "Verifique os logs para mais detalhes:"
        echo "docker-compose -f $COMPOSE_FILE logs"
    else
        error "❌ Deploy tem problemas críticos ($TESTS_FAILED/$TESTS_TOTAL falhas)"
        echo "Execute novamente o deploy ou verifique a configuração."
        exit 1
    fi
}

# Função principal
main() {
    echo "======================================================="
    echo "🧪 TESTES DE VALIDAÇÃO - MANAGEMENT SYSTEM LINUX"
    echo "======================================================="
    echo ""
    
    info "Iniciando testes em: $DEPLOY_DIR"
    info "Compose file: $COMPOSE_FILE"
    echo ""
    
    check_directory
    test_containers_running
    test_containers_health
    test_network_connectivity
    test_backend_functionality
    test_database
    test_static_files
    test_performance
    test_logs
    test_security
    test_system_resources
    show_test_report
}

# Verificar dependências
if ! command -v bc &> /dev/null; then
    warning "Comando 'bc' não encontrado. Instalando..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get install -y bc
    elif command -v yum &> /dev/null; then
        sudo yum install -y bc
    fi
fi

# Executar função principal
main "$@"