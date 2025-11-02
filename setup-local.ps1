# ====================================================================
# 🚀 SCRIPT DE CONFIGURAÇÃO AUTOMÁTICA - AMBIENTE LOCAL WINDOWS
# ====================================================================
# Sistema de Gestão de Sala de Aula
# Configuração automática para desenvolvimento local sem Docker
# ====================================================================

param(
    [switch]$SkipDependencyCheck,
    [switch]$Force,
    [string]$GitRepo = "https://github.com/seu-usuario/management_system.git"
)

# Configurações
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Cores para output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"

# Funções auxiliares
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "`n🔧 $Message" $Blue
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" $Green
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️  $Message" $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "❌ $Message" $Red
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

function Test-PythonVersion {
    try {
        $pythonVersion = python --version 2>&1
        if ($pythonVersion -match "Python (\d+)\.(\d+)") {
            $major = [int]$matches[1]
            $minor = [int]$matches[2]
            return ($major -eq 3 -and $minor -ge 10) -or ($major -gt 3)
        }
        return $false
    }
    catch {
        return $false
    }
}

function Test-NodeVersion {
    try {
        $nodeVersion = node --version 2>&1
        if ($nodeVersion -match "v(\d+)\.(\d+)") {
            $major = [int]$matches[1]
            return $major -ge 18
        }
        return $false
    }
    catch {
        return $false
    }
}

function Install-Python {
    Write-Step "Instalando Python 3.11..."
    $pythonUrl = "https://www.python.org/ftp/python/3.11.7/python-3.11.7-amd64.exe"
    $pythonInstaller = "$env:TEMP\python-installer.exe"
    
    try {
        Invoke-WebRequest -Uri $pythonUrl -OutFile $pythonInstaller
        Start-Process -FilePath $pythonInstaller -ArgumentList "/quiet", "InstallAllUsers=1", "PrependPath=1" -Wait
        Remove-Item $pythonInstaller -Force
        
        # Atualizar PATH
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
        
        Write-Success "Python instalado com sucesso!"
        return $true
    }
    catch {
        Write-Error "Falha ao instalar Python: $($_.Exception.Message)"
        return $false
    }
}

function Install-NodeJS {
    Write-Step "Instalando Node.js 20 LTS..."
    $nodeUrl = "https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi"
    $nodeInstaller = "$env:TEMP\node-installer.msi"
    
    try {
        Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeInstaller
        Start-Process -FilePath "msiexec.exe" -ArgumentList "/i", $nodeInstaller, "/quiet" -Wait
        Remove-Item $nodeInstaller -Force
        
        # Atualizar PATH
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH", "User")
        
        Write-Success "Node.js instalado com sucesso!"
        return $true
    }
    catch {
        Write-Error "Falha ao instalar Node.js: $($_.Exception.Message)"
        return $false
    }
}

function Test-GitRepo {
    param([string]$RepoPath)
    return Test-Path (Join-Path $RepoPath ".git")
}

function Setup-Backend {
    param([string]$ProjectPath)
    
    $backendPath = Join-Path $ProjectPath "backend"
    
    if (-not (Test-Path $backendPath)) {
        Write-Error "Diretório backend não encontrado em: $backendPath"
        return $false
    }
    
    Set-Location $backendPath
    
    Write-Step "Configurando ambiente virtual Python..."
    
    # Criar ambiente virtual
    if (Test-Path "venv") {
        if ($Force) {
            Remove-Item "venv" -Recurse -Force
        } else {
            Write-Warning "Ambiente virtual já existe. Use -Force para recriar."
        }
    }
    
    if (-not (Test-Path "venv")) {
        python -m venv venv
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Falha ao criar ambiente virtual"
            return $false
        }
    }
    
    # Ativar ambiente virtual
    $activateScript = "venv\Scripts\Activate.ps1"
    if (Test-Path $activateScript) {
        & $activateScript
    } else {
        Write-Error "Script de ativação não encontrado: $activateScript"
        return $false
    }
    
    Write-Success "Ambiente virtual criado e ativado!"
    
    # Instalar dependências
    Write-Step "Instalando dependências Python..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha ao instalar dependências Python"
        return $false
    }
    
    Write-Success "Dependências Python instaladas!"
    
    # Configurar .env
    Write-Step "Configurando arquivo .env do backend..."
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Success "Arquivo .env criado a partir do .env.example"
        } else {
            # Criar .env básico
            $envContent = @"
DEBUG=True
SECRET_KEY=django-insecure-local-development-key-change-in-production
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Configurações de Email (desenvolvimento)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# Configurações de Arquivos
MEDIA_URL=/media/
MEDIA_ROOT=media/
STATIC_URL=/static/
STATIC_ROOT=staticfiles/
"@
            Set-Content -Path ".env" -Value $envContent
            Write-Success "Arquivo .env criado com configurações padrão"
        }
    } else {
        Write-Warning "Arquivo .env já existe"
    }
    
    # Executar migrações
    Write-Step "Executando migrações do banco de dados..."
    python manage.py migrate
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha ao executar migrações"
        return $false
    }
    
    Write-Success "Migrações executadas com sucesso!"
    
    # Coletar arquivos estáticos
    Write-Step "Coletando arquivos estáticos..."
    python manage.py collectstatic --noinput
    
    Write-Success "Backend configurado com sucesso!"
    return $true
}

function Setup-Frontend {
    param([string]$ProjectPath)
    
    $frontendPath = Join-Path $ProjectPath "frontend"
    
    if (-not (Test-Path $frontendPath)) {
        Write-Error "Diretório frontend não encontrado em: $frontendPath"
        return $false
    }
    
    Set-Location $frontendPath
    
    Write-Step "Instalando dependências do frontend..."
    
    # Instalar dependências
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Falha ao instalar dependências do frontend"
        return $false
    }
    
    Write-Success "Dependências do frontend instaladas!"
    
    # Configurar .env
    Write-Step "Configurando arquivo .env do frontend..."
    if (-not (Test-Path ".env")) {
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Success "Arquivo .env criado a partir do .env.example"
        } else {
            # Criar .env básico
            $envContent = @"
VITE_API_URL=http://localhost:8000/api
VITE_MEDIA_URL=http://localhost:8000
"@
            Set-Content -Path ".env" -Value $envContent
            Write-Success "Arquivo .env criado com configurações padrão"
        }
    } else {
        Write-Warning "Arquivo .env já existe"
    }
    
    Write-Success "Frontend configurado com sucesso!"
    return $true
}

function Start-Servers {
    param([string]$ProjectPath)
    
    Write-Step "Iniciando servidores de desenvolvimento..."
    
    # Iniciar backend em nova janela
    $backendPath = Join-Path $ProjectPath "backend"
    $backendScript = @"
Set-Location '$backendPath'
& 'venv\Scripts\Activate.ps1'
Write-Host '🚀 Iniciando servidor Django em http://localhost:8000' -ForegroundColor Green
Write-Host '📊 Admin disponível em http://localhost:8000/admin' -ForegroundColor Yellow
Write-Host '🔌 API disponível em http://localhost:8000/api' -ForegroundColor Cyan
python manage.py runserver
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript
    
    # Aguardar um pouco antes de iniciar o frontend
    Start-Sleep -Seconds 3
    
    # Iniciar frontend em nova janela
    $frontendPath = Join-Path $ProjectPath "frontend"
    $frontendScript = @"
Set-Location '$frontendPath'
Write-Host '🎨 Iniciando servidor React em http://localhost:3000' -ForegroundColor Green
npm run dev
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript
    
    Write-Success "Servidores iniciados!"
    Write-ColorOutput "`n🌐 Acesse a aplicação em: http://localhost:3000" $Green
    Write-ColorOutput "🔧 API Django em: http://localhost:8000/api" $Blue
    Write-ColorOutput "👨‍💼 Admin Django em: http://localhost:8000/admin" $Yellow
}

function Show-Summary {
    param([string]$ProjectPath)
    
    Write-ColorOutput "`n" + "="*60 $Green
    Write-ColorOutput "🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!" $Green
    Write-ColorOutput "="*60 $Green
    
    Write-ColorOutput "`n📁 Projeto configurado em: $ProjectPath" $Blue
    
    Write-ColorOutput "`n🚀 Para iniciar os servidores manualmente:" $Yellow
    Write-ColorOutput "   Backend:  cd backend && venv\Scripts\Activate.ps1 && python manage.py runserver" $White
    Write-ColorOutput "   Frontend: cd frontend && npm run dev" $White
    
    Write-ColorOutput "`n🌐 URLs importantes:" $Yellow
    Write-ColorOutput "   • Aplicação: http://localhost:3000" $White
    Write-ColorOutput "   • API:       http://localhost:8000/api" $White
    Write-ColorOutput "   • Admin:     http://localhost:8000/admin" $White
    
    Write-ColorOutput "`n📚 Próximos passos:" $Yellow
    Write-ColorOutput "   1. Criar superusuário: python manage.py createsuperuser" $White
    Write-ColorOutput "   2. Acessar admin Django para configurar dados iniciais" $White
    Write-ColorOutput "   3. Testar a aplicação no frontend" $White
    
    Write-ColorOutput "`n🔧 Comandos úteis:" $Yellow
    Write-ColorOutput "   • Executar testes backend:  cd backend && python manage.py test" $White
    Write-ColorOutput "   • Executar testes frontend: cd frontend && npm test" $White
    Write-ColorOutput "   • Build frontend:           cd frontend && npm run build" $White
    
    Write-ColorOutput "`n" + "="*60 $Green
}

# ====================================================================
# SCRIPT PRINCIPAL
# ====================================================================

try {
    Write-ColorOutput @"

🎓 ====================================================================
   SISTEMA DE GESTÃO DE SALA DE AULA - SETUP AUTOMÁTICO
   ====================================================================
   Configuração automática do ambiente de desenvolvimento local
   Django + React + TypeScript
   ====================================================================

"@ $Green

    # Verificar se está executando como administrador para instalações
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
    
    if (-not $isAdmin -and -not $SkipDependencyCheck) {
        Write-Warning "Para instalar dependências automaticamente, execute como Administrador"
        Write-ColorOutput "Continuando com verificação de dependências..." $Yellow
    }

    # Verificar dependências
    if (-not $SkipDependencyCheck) {
        Write-Step "Verificando dependências do sistema..."
        
        $pythonOk = Test-Command "python" -and (Test-PythonVersion)
        $nodeOk = Test-Command "node" -and (Test-NodeVersion)
        $gitOk = Test-Command "git"
        
        if (-not $pythonOk) {
            Write-Warning "Python 3.10+ não encontrado"
            if ($isAdmin) {
                if (-not (Install-Python)) {
                    throw "Falha ao instalar Python"
                }
                $pythonOk = $true
            } else {
                Write-Error "Instale Python 3.10+ manualmente: https://www.python.org/downloads/"
                throw "Python não encontrado"
            }
        } else {
            Write-Success "Python OK"
        }
        
        if (-not $nodeOk) {
            Write-Warning "Node.js 18+ não encontrado"
            if ($isAdmin) {
                if (-not (Install-NodeJS)) {
                    throw "Falha ao instalar Node.js"
                }
                $nodeOk = $true
            } else {
                Write-Error "Instale Node.js 18+ manualmente: https://nodejs.org/"
                throw "Node.js não encontrado"
            }
        } else {
            Write-Success "Node.js OK"
        }
        
        if (-not $gitOk) {
            Write-Error "Git não encontrado. Instale: https://git-scm.com/"
            throw "Git não encontrado"
        } else {
            Write-Success "Git OK"
        }
    }

    # Determinar diretório do projeto
    $currentDir = Get-Location
    $projectPath = $currentDir.Path
    
    # Verificar se estamos em um repositório Git ou se precisamos clonar
    if (-not (Test-GitRepo $projectPath)) {
        Write-Step "Repositório não encontrado no diretório atual"
        
        $cloneChoice = Read-Host "Deseja clonar o repositório? (y/N)"
        if ($cloneChoice -eq "y" -or $cloneChoice -eq "Y") {
            $repoUrl = Read-Host "URL do repositório [$GitRepo]"
            if ([string]::IsNullOrWhiteSpace($repoUrl)) {
                $repoUrl = $GitRepo
            }
            
            $projectName = "management_system"
            $projectPath = Join-Path $currentDir.Path $projectName
            
            Write-Step "Clonando repositório..."
            git clone $repoUrl $projectPath
            
            if ($LASTEXITCODE -ne 0) {
                throw "Falha ao clonar repositório"
            }
            
            Write-Success "Repositório clonado com sucesso!"
        } else {
            Write-Warning "Continuando no diretório atual: $projectPath"
        }
    }

    # Configurar backend
    if (-not (Setup-Backend $projectPath)) {
        throw "Falha na configuração do backend"
    }

    # Configurar frontend
    if (-not (Setup-Frontend $projectPath)) {
        throw "Falha na configuração do frontend"
    }

    # Perguntar se deseja iniciar os servidores
    $startServers = Read-Host "`nDeseja iniciar os servidores de desenvolvimento agora? (Y/n)"
    if ($startServers -ne "n" -and $startServers -ne "N") {
        Start-Servers $projectPath
    }

    # Mostrar resumo
    Show-Summary $projectPath

} catch {
    Write-Error "❌ Erro durante a configuração: $($_.Exception.Message)"
    Write-ColorOutput "`n🔧 Para configuração manual, consulte o README.md" $Yellow
    exit 1
}

Write-ColorOutput "`n🎉 Setup concluído com sucesso!" $Green