# Script de Deploy Automatizado - Windows PowerShell
# Sistema de Gestão de Sala de Aula
# Autor: Desenvolvimento Elias Moraes
# Data: $(Get-Date)

param(
    [switch]$SkipBackup,
    [switch]$SkipGitPull,
    [switch]$Verbose
)

# Configurações
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Função para log colorido
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    switch ($Level) {
        "ERROR" { Write-Host "[$timestamp] ERROR: $Message" -ForegroundColor Red }
        "SUCCESS" { Write-Host "[$timestamp] SUCCESS: $Message" -ForegroundColor Green }
        "WARNING" { Write-Host "[$timestamp] WARNING: $Message" -ForegroundColor Yellow }
        "INFO" { Write-Host "[$timestamp] INFO: $Message" -ForegroundColor Cyan }
        default { Write-Host "[$timestamp] $Message" -ForegroundColor White }
    }
}

function Write-Banner {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
    Write-Host "║                    SISTEMA DE GESTÃO                         ║" -ForegroundColor Blue
    Write-Host "║                   DEPLOY AUTOMATIZADO                        ║" -ForegroundColor Blue
    Write-Host "║                      Versão 1.0.0                           ║" -ForegroundColor Blue
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
    Write-Host ""
}

function Test-DockerRunning {
    try {
        $null = docker info 2>$null
        return $true
    }
    catch {
        return $false
    }
}

function Test-DockerCompose {
    try {
        $null = docker-compose --version 2>$null
        return $true
    }
    catch {
        return $false
    }
}

function Wait-ForService {
    param([string]$ServiceName, [int]$MaxAttempts = 30, [int]$DelaySeconds = 2)
    
    Write-Log "Aguardando $ServiceName ficar disponível..." "INFO"
    
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        try {
            if ($ServiceName -eq "database") {
                $result = docker-compose -f docker-compose.prod.yml exec -T db pg_isready -U postgres 2>$null
                if ($LASTEXITCODE -eq 0) {
                    Write-Log "$ServiceName está pronto" "SUCCESS"
                    return $true
                }
            }
            elseif ($ServiceName -eq "api") {
                $response = Invoke-WebRequest -Uri "http://localhost/api/" -Method HEAD -TimeoutSec 5 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 401 -or $response.StatusCode -eq 200) {
                    Write-Log "$ServiceName está respondendo" "SUCCESS"
                    return $true
                }
            }
        }
        catch {
            # Continuar tentando
        }
        
        if ($i -eq $MaxAttempts) {
            Write-Log "Timeout aguardando $ServiceName" "ERROR"
            return $false
        }
        
        Start-Sleep -Seconds $DelaySeconds
    }
}

# Banner inicial
Write-Banner
Write-Log "🚀 Iniciando deploy do Sistema de Gestão de Sala de Aula..." "INFO"

try {
    # Verificar Docker
    Write-Log "Verificando se Docker está disponível..." "INFO"
    if (-not (Test-DockerRunning)) {
        throw "Docker não está rodando. Inicie o Docker Desktop e tente novamente."
    }
    Write-Log "✅ Docker está rodando" "SUCCESS"

    # Verificar Docker Compose
    if (-not (Test-DockerCompose)) {
        throw "Docker Compose não está disponível. Verifique a instalação."
    }
    Write-Log "✅ Docker Compose está disponível" "SUCCESS"

    # Verificar arquivo .env
    if (-not (Test-Path ".env")) {
        Write-Log "Arquivo .env não encontrado. Criando a partir do exemplo..." "WARNING"
        if (Test-Path ".env.example") {
            Copy-Item ".env.example" ".env"
            Write-Log "⚠️  Configure o arquivo .env antes de continuar o deploy!" "WARNING"
            Write-Log "⚠️  Edite as variáveis de ambiente em .env e execute novamente." "WARNING"
            exit 1
        }
        else {
            throw "Arquivo .env.example não encontrado. Verifique o repositório."
        }
    }
    Write-Log "✅ Arquivo .env encontrado" "SUCCESS"

    # Verificar docker-compose.prod.yml
    if (-not (Test-Path "docker-compose.prod.yml")) {
        throw "Arquivo docker-compose.prod.yml não encontrado. Verifique o repositório."
    }
    Write-Log "✅ Arquivo docker-compose.prod.yml encontrado" "SUCCESS"

    # Parar containers existentes
    Write-Log "Verificando containers existentes..." "INFO"
    $runningContainers = docker-compose -f docker-compose.prod.yml ps --services --filter "status=running" 2>$null
    if ($runningContainers) {
        Write-Log "Parando containers atuais..." "INFO"
        docker-compose -f docker-compose.prod.yml down
    }
    else {
        Write-Log "Nenhum container estava rodando" "INFO"
    }

    # Backup do banco de dados
    if (-not $SkipBackup) {
        Write-Log "Verificando necessidade de backup do banco..." "INFO"
        $volumes = docker volume ls --format "{{.Name}}" | Where-Object { $_ -like "*postgres_data*" }
        if ($volumes) {
            Write-Log "Fazendo backup do banco de dados..." "INFO"
            $backupFile = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
            
            # Iniciar apenas o banco temporariamente
            docker-compose -f docker-compose.prod.yml up -d db
            Start-Sleep -Seconds 10
            
            try {
                docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U postgres management_system_db > $backupFile
                Write-Log "✅ Backup salvo em: $backupFile" "SUCCESS"
            }
            catch {
                Write-Log "Falha no backup do banco - continuando deploy" "WARNING"
            }
            
            docker-compose -f docker-compose.prod.yml down
        }
        else {
            Write-Log "Nenhum volume de banco encontrado - primeiro deploy" "INFO"
        }
    }

    # Atualizar código do repositório
    if (-not $SkipGitPull -and (Test-Path ".git")) {
        Write-Log "Atualizando código do repositório..." "INFO"
        try {
            git pull origin main 2>$null
            if ($LASTEXITCODE -ne 0) {
                git pull origin master 2>$null
            }
            if ($LASTEXITCODE -eq 0) {
                Write-Log "✅ Código atualizado" "SUCCESS"
            }
            else {
                Write-Log "Falha ao atualizar código - usando versão local" "WARNING"
            }
        }
        catch {
            Write-Log "Falha ao atualizar código - usando versão local" "WARNING"
        }
    }
    else {
        Write-Log "Usando código local (git pull ignorado)" "INFO"
    }

    # Construir e iniciar containers
    Write-Log "Construindo e iniciando containers..." "INFO"
    docker-compose -f docker-compose.prod.yml up -d --build
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao iniciar containers"
    }
    Write-Log "✅ Containers iniciados com sucesso" "SUCCESS"

    # Aguardar inicialização
    Write-Log "Aguardando inicialização dos serviços..." "INFO"
    for ($i = 1; $i -le 12; $i++) {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 5
    }
    Write-Host ""

    # Verificar status dos containers
    Write-Log "Verificando status dos containers..." "INFO"
    docker-compose -f docker-compose.prod.yml ps

    # Aguardar banco estar pronto
    if (-not (Wait-ForService -ServiceName "database")) {
        throw "Timeout aguardando banco de dados"
    }

    # Executar migrações
    Write-Log "Executando migrações do banco..." "INFO"
    docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
    if ($LASTEXITCODE -ne 0) {
        throw "Falha nas migrações do banco"
    }
    Write-Log "✅ Migrações executadas com sucesso" "SUCCESS"

    # Coletar arquivos estáticos
    Write-Log "Coletando arquivos estáticos..." "INFO"
    docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
    if ($LASTEXITCODE -eq 0) {
        Write-Log "✅ Arquivos estáticos coletados" "SUCCESS"
    }
    else {
        Write-Log "Falha ao coletar arquivos estáticos" "WARNING"
    }

    # Criar usuário administrador
    Write-Log "Verificando usuário administrador..." "INFO"
    $userCheck = docker-compose -f docker-compose.prod.yml exec backend python manage.py shell -c "from django.contrib.auth.models import User; print('exists' if User.objects.filter(username='admin').exists() else 'not_exists')"
    
    if ($userCheck -like "*not_exists*") {
        Write-Log "Criando usuário administrador..." "INFO"
        docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser --noinput --username admin --email admin@example.com
        if ($LASTEXITCODE -eq 0) {
            docker-compose -f docker-compose.prod.yml exec backend python set_admin_password.py
            if ($LASTEXITCODE -eq 0) {
                Write-Log "✅ Usuário administrador criado (admin/admin123)" "SUCCESS"
            }
            else {
                Write-Log "Falha ao definir senha do administrador" "WARNING"
            }
        }
        else {
            Write-Log "Falha ao criar usuário administrador" "WARNING"
        }
    }
    else {
        Write-Log "Usuário administrador já existe" "INFO"
    }

    # Verificar saúde da aplicação
    Write-Log "Verificando saúde da aplicação..." "INFO"
    Start-Sleep -Seconds 10

    if (Wait-ForService -ServiceName "api" -MaxAttempts 10 -DelaySeconds 3) {
        Write-Log "✅ Aplicação está respondendo corretamente" "SUCCESS"
    }
    else {
        Write-Log "Aplicação pode não estar respondendo corretamente" "WARNING"
        Write-Log "Verifique os logs: docker-compose -f docker-compose.prod.yml logs -f" "WARNING"
    }

    # Limpeza
    Write-Log "Limpando imagens Docker antigas..." "INFO"
    try {
        docker image prune -f > $null
        Write-Log "✅ Imagens antigas removidas" "SUCCESS"
    }
    catch {
        Write-Log "Falha ao limpar imagens antigas" "WARNING"
    }

    # Status final
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                    DEPLOY CONCLUÍDO                          ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""

    Write-Log "📊 Status final dos containers:" "INFO"
    docker-compose -f docker-compose.prod.yml ps

    Write-Host ""
    Write-Log "🌐 URLs de acesso:" "INFO"
    Write-Host "   Frontend: http://localhost/" -ForegroundColor Cyan
    Write-Host "   API:      http://localhost/api/" -ForegroundColor Cyan
    Write-Host "   Admin:    http://localhost/admin/" -ForegroundColor Cyan

    Write-Host ""
    Write-Log "🔐 Credenciais do administrador:" "INFO"
    Write-Host "   Usuário: admin" -ForegroundColor Cyan
    Write-Host "   Senha:   admin123" -ForegroundColor Cyan

    Write-Host ""
    Write-Log "📝 Comandos úteis:" "INFO"
    Write-Host "   Ver logs:        docker-compose -f docker-compose.prod.yml logs -f" -ForegroundColor Cyan
    Write-Host "   Parar sistema:   docker-compose -f docker-compose.prod.yml down" -ForegroundColor Cyan
    Write-Host "   Reiniciar:       docker-compose -f docker-compose.prod.yml restart" -ForegroundColor Cyan
    Write-Host "   Status:          docker-compose -f docker-compose.prod.yml ps" -ForegroundColor Cyan

    Write-Host ""
    Write-Log "🎉 Deploy finalizado com sucesso!" "SUCCESS"
    Write-Host ""

}
catch {
    Write-Log $_.Exception.Message "ERROR"
    Write-Host ""
    Write-Log "❌ Deploy falhou. Verifique os logs acima para mais detalhes." "ERROR"
    Write-Host ""
    exit 1
}