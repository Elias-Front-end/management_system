# ======================================================
# 🚀 SCRIPT DE CONFIGURAÇÃO AUTOMÁTICA - WINDOWS
# ======================================================
# 
# Este script automatiza a configuração inicial do projeto
# Sistema de Gestão de Sala de Aula no Windows
# 
# Requisitos:
# - PowerShell 5.0+
# - Git instalado
# - Node.js 18+ instalado
# - Python 3.10+ instalado
# 
# ======================================================

param(
    [switch]$SkipDependencyCheck,
    [switch]$ProductionBuild,
    [switch]$Help
)

# Cores para output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Show-Help {
    Write-ColorOutput "🚀 SCRIPT DE CONFIGURAÇÃO - SISTEMA DE GESTÃO" $Blue
    Write-ColorOutput ""
    Write-ColorOutput "USO:" $Yellow
    Write-ColorOutput "  .\setup.ps1                    # Configuração completa"
    Write-ColorOutput "  .\setup.ps1 -SkipDependencyCheck  # Pular verificação de dependências"
    Write-ColorOutput "  .\setup.ps1 -ProductionBuild      # Build para produção"
    Write-ColorOutput "  .\setup.ps1 -Help                 # Mostrar esta ajuda"
    Write-ColorOutput ""
    Write-ColorOutput "PARÂMETROS:" $Yellow
    Write-ColorOutput "  -SkipDependencyCheck    Pula a verificação de dependências"
    Write-ColorOutput "  -ProductionBuild        Executa build para produção"
    Write-ColorOutput "  -Help                   Mostra esta mensagem de ajuda"
    exit 0
}

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

function Test-Dependencies {
    Write-ColorOutput "🔍 Verificando dependências..." $Blue
    
    $dependencies = @{
        "git" = "Git"
        "node" = "Node.js"
        "npm" = "NPM"
        "python" = "Python"
        "pip" = "Pip"
    }
    
    $missing = @()
    
    foreach ($cmd in $dependencies.Keys) {
        if (Test-Command $cmd) {
            Write-ColorOutput "✅ $($dependencies[$cmd]) encontrado" $Green
        } else {
            Write-ColorOutput "❌ $($dependencies[$cmd]) não encontrado" $Red
            $missing += $dependencies[$cmd]
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-ColorOutput ""
        Write-ColorOutput "⚠️  DEPENDÊNCIAS FALTANDO:" $Red
        foreach ($dep in $missing) {
            Write-ColorOutput "   - $dep" $Red
        }
        Write-ColorOutput ""
        Write-ColorOutput "Por favor, instale as dependências faltando e execute o script novamente." $Yellow
        Write-ColorOutput "Consulte o README.md para instruções de instalação." $Yellow
        exit 1
    }
    
    Write-ColorOutput "✅ Todas as dependências estão instaladas!" $Green
    Write-ColorOutput ""
}

function Setup-Environment {
    Write-ColorOutput "🔧 Configurando ambiente..." $Blue
    
    # Verificar se .env existe
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Write-ColorOutput "📋 Copiando .env.example para .env..." $Yellow
            Copy-Item ".env.example" ".env"
            Write-ColorOutput "✅ Arquivo .env criado!" $Green
            Write-ColorOutput "⚠️  IMPORTANTE: Edite o arquivo .env com suas configurações!" $Yellow
        } else {
            Write-ColorOutput "❌ Arquivo .env.example não encontrado!" $Red
            exit 1
        }
    } else {
        Write-ColorOutput "✅ Arquivo .env já existe" $Green
    }
    Write-ColorOutput ""
}

function Install-BackendDependencies {
    Write-ColorOutput "🐍 Instalando dependências do Backend..." $Blue
    
    if (-not (Test-Path "backend")) {
        Write-ColorOutput "❌ Diretório backend não encontrado!" $Red
        exit 1
    }
    
    Set-Location "backend"
    
    # Criar ambiente virtual se não existir
    if (-not (Test-Path "venv")) {
        Write-ColorOutput "📦 Criando ambiente virtual Python..." $Yellow
        python -m venv venv
    }
    
    # Ativar ambiente virtual
    Write-ColorOutput "🔄 Ativando ambiente virtual..." $Yellow
    & ".\venv\Scripts\Activate.ps1"
    
    # Instalar dependências
    Write-ColorOutput "📥 Instalando dependências Python..." $Yellow
    pip install -r requirements.txt
    
    # Executar migrações
    Write-ColorOutput "🗄️ Executando migrações do banco..." $Yellow
    python manage.py migrate
    
    # Coletar arquivos estáticos
    Write-ColorOutput "📁 Coletando arquivos estáticos..." $Yellow
    python manage.py collectstatic --noinput
    
    # Criar superusuário (opcional)
    Write-ColorOutput ""
    $createSuperuser = Read-Host "Deseja criar um superusuário? (s/N)"
    if ($createSuperuser -eq "s" -or $createSuperuser -eq "S") {
        python manage.py createsuperuser
    }
    
    Set-Location ".."
    Write-ColorOutput "✅ Backend configurado com sucesso!" $Green
    Write-ColorOutput ""
}

function Install-FrontendDependencies {
    Write-ColorOutput "⚛️ Instalando dependências do Frontend..." $Blue
    
    if (-not (Test-Path "frontend")) {
        Write-ColorOutput "❌ Diretório frontend não encontrado!" $Red
        exit 1
    }
    
    Set-Location "frontend"
    
    # Instalar dependências
    Write-ColorOutput "📥 Instalando dependências Node.js..." $Yellow
    npm install
    
    if ($ProductionBuild) {
        Write-ColorOutput "🏗️ Executando build para produção..." $Yellow
        npm run build
    }
    
    Set-Location ".."
    Write-ColorOutput "✅ Frontend configurado com sucesso!" $Green
    Write-ColorOutput ""
}

function Show-NextSteps {
    Write-ColorOutput "🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!" $Green
    Write-ColorOutput ""
    Write-ColorOutput "📋 PRÓXIMOS PASSOS:" $Blue
    Write-ColorOutput ""
    Write-ColorOutput "1. 📝 Edite o arquivo .env com suas configurações:" $Yellow
    Write-ColorOutput "   - Defina SECRET_KEY para produção"
    Write-ColorOutput "   - Configure banco de dados se necessário"
    Write-ColorOutput "   - Ajuste CORS_ALLOWED_ORIGINS"
    Write-ColorOutput ""
    Write-ColorOutput "2. 🚀 Para executar em desenvolvimento:" $Yellow
    Write-ColorOutput "   Backend:  cd backend && .\venv\Scripts\Activate.ps1 && python manage.py runserver"
    Write-ColorOutput "   Frontend: cd frontend && npm run dev"
    Write-ColorOutput ""
    Write-ColorOutput "3. 🐳 Para executar com Docker:" $Yellow
    Write-ColorOutput "   docker-compose up -d"
    Write-ColorOutput ""
    Write-ColorOutput "4. 🌐 Acessos:" $Yellow
    Write-ColorOutput "   Backend:  http://localhost:8000"
    Write-ColorOutput "   Frontend: http://localhost:5174"
    Write-ColorOutput "   Admin:    http://localhost:8000/admin"
    Write-ColorOutput ""
    Write-ColorOutput "📚 Consulte o README.md para mais informações!" $Blue
}

# ======================================================
# EXECUÇÃO PRINCIPAL
# ======================================================

if ($Help) {
    Show-Help
}

Write-ColorOutput "🚀 INICIANDO CONFIGURAÇÃO DO SISTEMA DE GESTÃO" $Blue
Write-ColorOutput "================================================" $Blue
Write-ColorOutput ""

# Verificar se estamos no diretório correto
if (-not (Test-Path "manage.py") -and -not (Test-Path "backend\manage.py")) {
    Write-ColorOutput "❌ Execute este script no diretório raiz do projeto!" $Red
    exit 1
}

# Verificar dependências
if (-not $SkipDependencyCheck) {
    Test-Dependencies
}

# Configurar ambiente
Setup-Environment

# Instalar dependências
Install-BackendDependencies
Install-FrontendDependencies

# Mostrar próximos passos
Show-NextSteps

Write-ColorOutput ""
Write-ColorOutput "✨ Setup concluído! Bom desenvolvimento! ✨" $Green