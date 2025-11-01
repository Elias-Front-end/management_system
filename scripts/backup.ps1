# Script de Backup Automatizado - Windows PowerShell
# Sistema de Gestão de Sala de Aula
# Autor: Desenvolvimento Elias Moraes

param(
    [int]$RetentionDays = 7,
    [string]$BackupDir = ".\backups"
)

$ErrorActionPreference = "Stop"

# Configurações
$Date = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = "backup_$Date.sql"
$MediaBackup = "media_backup_$Date.zip"
$ConfigBackup = "config_backup_$Date.zip"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    switch ($Level) {
        "ERROR" { Write-Host "[$timestamp] ERROR: $Message" -ForegroundColor Red }
        "SUCCESS" { Write-Host "[$timestamp] SUCCESS: $Message" -ForegroundColor Green }
        "WARNING" { Write-Host "[$timestamp] WARNING: $Message" -ForegroundColor Yellow }
        "INFO" { Write-Host "[$timestamp] INFO: $Message" -ForegroundColor Cyan }
    }
}

try {
    # Criar diretório de backup
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    }

    Write-Log "🗄️ Iniciando backup do sistema..." "INFO"

    # Verificar se containers estão rodando
    $runningContainers = docker-compose -f docker-compose.prod.yml ps --services --filter "status=running" 2>$null
    if (-not $runningContainers) {
        throw "Containers não estão rodando. Inicie o sistema primeiro."
    }

    # Backup do banco de dados
    Write-Log "Fazendo backup do banco de dados..." "INFO"
    $backupPath = Join-Path $BackupDir $BackupFile
    
    docker-compose -f docker-compose.prod.yml exec -T db pg_dump -U postgres management_system_db > $backupPath
    if ($LASTEXITCODE -eq 0) {
        Write-Log "✅ Backup do banco salvo: $backupPath" "SUCCESS"
    }
    else {
        throw "Falha no backup do banco de dados"
    }

    # Backup dos arquivos de mídia
    Write-Log "Fazendo backup dos arquivos de mídia..." "INFO"
    if (Test-Path "media") {
        $mediaBackupPath = Join-Path $BackupDir $MediaBackup
        try {
            Compress-Archive -Path "media\*" -DestinationPath $mediaBackupPath -Force
            Write-Log "✅ Backup de mídia salvo: $mediaBackupPath" "SUCCESS"
        }
        catch {
            Write-Log "Falha no backup dos arquivos de mídia" "WARNING"
        }
    }
    else {
        Write-Log "Diretório de mídia não encontrado - pulando backup de mídia" "INFO"
    }

    # Backup das configurações
    Write-Log "Fazendo backup das configurações..." "INFO"
    $configBackupPath = Join-Path $BackupDir $ConfigBackup
    try {
        $configFiles = @()
        if (Test-Path ".env") { $configFiles += ".env" }
        if (Test-Path "docker-compose.prod.yml") { $configFiles += "docker-compose.prod.yml" }
        if (Test-Path "nginx") { $configFiles += "nginx" }
        
        if ($configFiles.Count -gt 0) {
            Compress-Archive -Path $configFiles -DestinationPath $configBackupPath -Force
            Write-Log "✅ Backup de configurações salvo: $configBackupPath" "SUCCESS"
        }
    }
    catch {
        Write-Log "Falha no backup das configurações" "WARNING"
    }

    # Limpeza de backups antigos
    Write-Log "Limpando backups antigos (mais de $RetentionDays dias)..." "INFO"
    $cutoffDate = (Get-Date).AddDays(-$RetentionDays)
    
    Get-ChildItem -Path $BackupDir -Filter "*.sql" | Where-Object { $_.LastWriteTime -lt $cutoffDate } | Remove-Item -Force
    Get-ChildItem -Path $BackupDir -Filter "*.zip" | Where-Object { $_.LastWriteTime -lt $cutoffDate } | Remove-Item -Force

    # Listar backups disponíveis
    Write-Log "📋 Backups disponíveis:" "INFO"
    Get-ChildItem -Path $BackupDir | Format-Table Name, Length, LastWriteTime -AutoSize

    Write-Log "✅ Backup concluído com sucesso!" "SUCCESS"

    # Informações do backup
    Write-Host ""
    Write-Host "📊 Informações do backup:" -ForegroundColor Cyan
    Write-Host "   Data/Hora: $(Get-Date)" -ForegroundColor White
    Write-Host "   Banco:     $backupPath" -ForegroundColor White
    Write-Host "   Mídia:     $mediaBackupPath" -ForegroundColor White
    Write-Host "   Config:    $configBackupPath" -ForegroundColor White
    Write-Host ""

}
catch {
    Write-Log $_.Exception.Message "ERROR"
    exit 1
}