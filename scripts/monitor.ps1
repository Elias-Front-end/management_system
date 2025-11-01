# ============================================================================
# SCRIPT DE MONITORAMENTO - SISTEMA DE GESTAO DE SALA DE AULA
# ============================================================================
# Autor: Sistema Automatizado
# Versao: 1.0
# Descricao: Monitora o status dos containers Docker e servicos do sistema
# ============================================================================

param(
    [bool]$Continuous = $true,
    [int]$IntervalSeconds = 30
)

# Funcao para logging com cores
function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    switch ($Level) {
        "SUCCESS" { Write-Host "[$timestamp] $Message" -ForegroundColor Green }
        "WARNING" { Write-Host "[$timestamp] $Message" -ForegroundColor Yellow }
        "ERROR"   { Write-Host "[$timestamp] $Message" -ForegroundColor Red }
        "INFO"    { Write-Host "[$timestamp] $Message" -ForegroundColor Cyan }
        default   { Write-Host "[$timestamp] $Message" }
    }
}

# Funcao para verificar status dos containers
function Get-ContainerStats {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Blue
    Write-Host "                    STATUS DOS CONTAINERS                       " -ForegroundColor Blue
    Write-Host "================================================================" -ForegroundColor Blue
    
    try {
        $containers = docker-compose -f docker-compose.prod.yml ps 2>$null
        
        if ($LASTEXITCODE -eq 0 -and $containers) {
            Write-Host $containers
            Write-Host ""
            
            # Verificar uso de recursos
            Write-Host "Uso de Recursos:" -ForegroundColor Cyan
            $stats = docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>$null
            if ($stats) {
                Write-Host $stats
            }
        } else {
            Write-Log "Nenhum container encontrado ou Docker Compose nao disponivel" "WARNING"
        }
    }
    catch {
        Write-Log "Erro ao verificar containers: $($_.Exception.Message)" "ERROR"
    }
    Write-Host ""
}

# Funcao para testar saude dos servicos
function Test-ServiceHealth {
    Write-Host "================================================================" -ForegroundColor Magenta
    Write-Host "                    SAUDE DOS SERVICOS                          " -ForegroundColor Magenta
    Write-Host "================================================================" -ForegroundColor Magenta
    
    # Testar banco de dados
    Write-Host "Testando Banco de Dados..." -ForegroundColor Cyan
    try {
        $dbTest = docker-compose -f docker-compose.prod.yml exec -T db pg_isready -U postgres 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Log "Banco de dados: OK" "SUCCESS"
        } else {
            Write-Log "Banco de dados: FALHA" "ERROR"
        }
    }
    catch {
        Write-Log "Erro ao testar banco: $($_.Exception.Message)" "ERROR"
    }
    
    # Testar API
    Write-Host "Testando API..." -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "http://localhost/api/" -Method HEAD -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 401 -or $response.StatusCode -eq 200) {
            Write-Log "API: OK (Status: $($response.StatusCode))" "SUCCESS"
        } else {
            Write-Log "API: Resposta inesperada (Status: $($response.StatusCode))" "WARNING"
        }
    }
    catch {
        Write-Log "API: FALHA - $($_.Exception.Message)" "ERROR"
    }
    
    # Testar Frontend
    Write-Host "Testando Frontend..." -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "http://localhost/" -Method HEAD -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Log "Frontend: OK" "SUCCESS"
        } else {
            Write-Log "Frontend: Status $($response.StatusCode)" "WARNING"
        }
    }
    catch {
        Write-Log "Frontend: FALHA - $($_.Exception.Message)" "ERROR"
    }
    
    # Testar Nginx
    Write-Host "Testando Nginx..." -ForegroundColor Cyan
    try {
        $nginxTest = docker-compose -f docker-compose.prod.yml exec -T nginx nginx -t 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Log "Nginx: Configuracao OK" "SUCCESS"
        } else {
            Write-Log "Nginx: Erro na configuracao" "ERROR"
        }
    }
    catch {
        Write-Log "Erro ao testar Nginx: $($_.Exception.Message)" "ERROR"
    }
    
    Write-Host ""
}

# Funcao para informacoes do sistema
function Get-SystemInfo {
    Write-Host "================================================================" -ForegroundColor Yellow
    Write-Host "                    INFORMACOES DO SISTEMA                      " -ForegroundColor Yellow
    Write-Host "================================================================" -ForegroundColor Yellow
    
    # Espaco em disco
    Write-Host "Espaco em Disco:" -ForegroundColor Cyan
    $disk = Get-WmiObject -Class Win32_LogicalDisk -Filter "DriveType=3" | Select-Object DeviceID, @{Name="Size(GB)";Expression={[math]::Round($_.Size/1GB,2)}}, @{Name="FreeSpace(GB)";Expression={[math]::Round($_.FreeSpace/1GB,2)}}, @{Name="Used%";Expression={[math]::Round((($_.Size-$_.FreeSpace)/$_.Size)*100,2)}}
    $disk | Format-Table -AutoSize
    
    # Memoria
    Write-Host "Memoria:" -ForegroundColor Cyan
    $memory = Get-WmiObject -Class Win32_OperatingSystem
    $totalMemory = [math]::Round($memory.TotalVisibleMemorySize/1MB, 2)
    $freeMemory = [math]::Round($memory.FreePhysicalMemory/1MB, 2)
    $usedMemory = $totalMemory - $freeMemory
    $memoryPercent = [math]::Round(($usedMemory / $totalMemory) * 100, 2)
    
    Write-Host "   Total: $totalMemory GB"
    Write-Host "   Usado: $usedMemory GB ($memoryPercent%)"
    Write-Host "   Livre: $freeMemory GB"
    
    # Uptime
    Write-Host "Uptime do Sistema:" -ForegroundColor Cyan
    $uptime = (Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime
    Write-Host "   $($uptime.Days) dias, $($uptime.Hours) horas, $($uptime.Minutes) minutos"
    
    Write-Host ""
}

# Funcao para informacoes do Docker
function Get-DockerInfo {
    Write-Host "================================================================" -ForegroundColor DarkCyan
    Write-Host "                    INFORMACOES DO DOCKER                       " -ForegroundColor DarkCyan
    Write-Host "================================================================" -ForegroundColor DarkCyan
    
    try {
        # Versao do Docker
        $dockerVersion = docker --version 2>$null
        Write-Host "Versao: $dockerVersion" -ForegroundColor Cyan
        
        # Espaco usado pelo Docker
        Write-Host "Uso de Espaco:" -ForegroundColor Cyan
        $dockerSystem = docker system df 2>$null
        if ($dockerSystem) {
            Write-Host $dockerSystem
        }
        
        Write-Host ""
    }
    catch {
        Write-Log "Erro ao obter informacoes do Docker: $($_.Exception.Message)" "ERROR"
    }
}

# Funcao para logs recentes
function Show-RecentLogs {
    Write-Host "================================================================" -ForegroundColor DarkGreen
    Write-Host "                      LOGS RECENTES                             " -ForegroundColor DarkGreen
    Write-Host "================================================================" -ForegroundColor DarkGreen
    
    try {
        Write-Host "Ultimas 5 linhas dos logs:" -ForegroundColor Cyan
        $logs = docker-compose -f docker-compose.prod.yml logs --tail=5 2>$null
        if ($logs) {
            Write-Host $logs
        } else {
            Write-Log "Nenhum log disponivel" "WARNING"
        }
    }
    catch {
        Write-Log "Erro ao obter logs: $($_.Exception.Message)" "ERROR"
    }
    
    Write-Host ""
}

# Funcao para informacoes de rede
function Get-NetworkInfo {
    Write-Host "================================================================" -ForegroundColor DarkMagenta
    Write-Host "                    INFORMACOES DE REDE                         " -ForegroundColor DarkMagenta
    Write-Host "================================================================" -ForegroundColor DarkMagenta
    
    Write-Host "Portas em Uso:" -ForegroundColor Cyan
    try {
        $ports = netstat -an | Select-String ":80\s|:443\s|:5432\s|:6379\s" | Select-Object -First 10
        if ($ports) {
            $ports | ForEach-Object { Write-Host "   $($_.Line)" }
        } else {
            Write-Host "   Nenhuma porta relevante encontrada"
        }
    }
    catch {
        Write-Log "Erro ao verificar portas: $($_.Exception.Message)" "ERROR"
    }
    
    Write-Host ""
}

function Show-QuickCommands {
    Write-Host ""
    Write-Host "================================================================" -ForegroundColor Magenta
    Write-Host "                    COMANDOS UTEIS                              " -ForegroundColor Magenta
    Write-Host "================================================================" -ForegroundColor Magenta
    Write-Host ""
    
    Write-Host "Comandos de Gerenciamento:" -ForegroundColor Cyan
    Write-Host "   docker-compose -f docker-compose.prod.yml ps              # Status"
    Write-Host "   docker-compose -f docker-compose.prod.yml logs -f         # Logs em tempo real"
    Write-Host "   docker-compose -f docker-compose.prod.yml restart         # Reiniciar"
    Write-Host "   docker-compose -f docker-compose.prod.yml down            # Parar"
    Write-Host "   docker-compose -f docker-compose.prod.yml up -d           # Iniciar"
    Write-Host ""
    
    Write-Host "Comandos de Manutencao:" -ForegroundColor Cyan
    Write-Host "   .\scripts\backup.ps1                                      # Fazer backup"
    Write-Host "   docker system prune -f                                    # Limpar Docker"
    Write-Host "   docker-compose -f docker-compose.prod.yml pull            # Atualizar imagens"
    Write-Host ""
}

# Banner principal
Write-Host ""
Write-Host "================================================================" -ForegroundColor Green
Write-Host "                    MONITOR DO SISTEMA                          " -ForegroundColor Green
Write-Host "                   Gestao de Sala de Aula                      " -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green

# Loop principal de monitoramento
do {
    if ($Continuous) {
        Clear-Host
        
        Write-Host ""
        Write-Host "================================================================" -ForegroundColor Green
        Write-Host "                    MONITOR DO SISTEMA                          " -ForegroundColor Green
        Write-Host "                   $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')                    " -ForegroundColor Green
        Write-Host "================================================================" -ForegroundColor Green
    }
    
    # Verificar se Docker esta rodando
    try {
        $null = docker info 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Log "Docker nao esta rodando!" "ERROR"
            Write-Host ""
            Write-Host "Inicie o Docker Desktop e execute novamente." -ForegroundColor Yellow
            exit 1
        }
    }
    catch {
        Write-Log "Docker nao esta disponivel!" "ERROR"
        exit 1
    }
    
    # Executar verificacoes
    Get-ContainerStats
    Test-ServiceHealth
    Get-SystemInfo
    Get-DockerInfo
    Get-NetworkInfo
    Show-RecentLogs
    
    if (-not $Continuous) {
        Show-QuickCommands
        break
    }
    
    Write-Host ""
    Write-Log "Proxima atualizacao em $IntervalSeconds segundos... (Ctrl+C para sair)" "INFO"
    Start-Sleep -Seconds $IntervalSeconds
    
} while ($Continuous)

Write-Host ""
Write-Log "Monitoramento finalizado." "SUCCESS"