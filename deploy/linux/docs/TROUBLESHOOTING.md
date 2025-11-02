# 🔧 Solução de Problemas - Deploy Linux

## 🎯 Visão Geral

Este documento contém soluções para problemas comuns encontrados durante o deploy e operação do Management System em ambiente Linux.

## 🚨 Problemas de Instalação

### Docker não instala ou não inicia

#### Sintomas
- Comando `docker` não encontrado
- Erro: "Cannot connect to the Docker daemon"
- Docker service failed to start

#### Soluções

```bash
# 1. Verificar se Docker está instalado
docker --version

# 2. Se não estiver instalado, reinstalar
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 3. Verificar status do serviço
sudo systemctl status docker

# 4. Iniciar Docker se parado
sudo systemctl start docker
sudo systemctl enable docker

# 5. Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
newgrp docker

# 6. Testar instalação
docker run hello-world
```

### Docker Compose não funciona

#### Sintomas
- Comando `docker-compose` não encontrado
- Versão incompatível

#### Soluções

```bash
# 1. Verificar versão
docker-compose --version

# 2. Instalar/atualizar Docker Compose
COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 3. Criar link simbólico se necessário
sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# 4. Testar
docker-compose --version
```

### Problemas de Permissão

#### Sintomas
- "Permission denied" ao executar Docker
- "Got permission denied while trying to connect to the Docker daemon socket"

#### Soluções

```bash
# 1. Verificar se usuário está no grupo docker
groups $USER

# 2. Adicionar ao grupo docker
sudo usermod -aG docker $USER

# 3. Fazer logout e login novamente, ou usar:
newgrp docker

# 4. Verificar permissões do socket Docker
ls -la /var/run/docker.sock

# 5. Se necessário, corrigir permissões
sudo chmod 666 /var/run/docker.sock
```

## 🐳 Problemas de Container

### Container não inicia

#### Sintomas
- Container fica em estado "Exited"
- Erro ao executar `docker-compose up`

#### Diagnóstico

```bash
# 1. Verificar status dos containers
docker-compose ps

# 2. Ver logs do container problemático
docker-compose logs nome-do-container

# 3. Verificar configuração
docker-compose config

# 4. Tentar iniciar container individualmente
docker-compose up nome-do-container
```

#### Soluções Comuns

```bash
# 1. Recriar containers
docker-compose down
docker-compose up -d --force-recreate

# 2. Limpar cache e reconstruir
docker-compose down
docker system prune -a
docker-compose build --no-cache
docker-compose up -d

# 3. Verificar variáveis de ambiente
docker-compose exec nome-do-container env

# 4. Verificar se portas estão disponíveis
ss -tlnp | grep :8000
ss -tlnp | grep :5432
```

### Container PostgreSQL não inicia

#### Sintomas
- Erro: "database system was not properly shut down"
- Container postgres fica reiniciando

#### Soluções

```bash
# 1. Verificar logs específicos
docker-compose logs postgres

# 2. Verificar se porta está livre
ss -tlnp | grep :5432

# 3. Limpar volume do banco (CUIDADO: apaga dados!)
docker-compose down
docker volume rm $(docker volume ls -q | grep postgres)
docker-compose up -d postgres

# 4. Verificar permissões do volume
docker-compose exec postgres ls -la /var/lib/postgresql/data

# 5. Recriar banco com configurações limpas
docker-compose down
docker volume prune
docker-compose up -d postgres
```

### Container Django não conecta ao banco

#### Sintomas
- Erro: "could not connect to server"
- "FATAL: database does not exist"

#### Soluções

```bash
# 1. Verificar se PostgreSQL está rodando
docker-compose ps postgres

# 2. Testar conexão manual
docker-compose exec postgres psql -U postgres -c "SELECT 1;"

# 3. Verificar variáveis de ambiente
docker-compose exec backend env | grep DB_

# 4. Aguardar PostgreSQL inicializar completamente
sleep 30
docker-compose restart backend

# 5. Criar banco manualmente se necessário
docker-compose exec postgres createdb -U postgres management_system_db

# 6. Executar migrações
docker-compose exec backend python manage.py migrate
```

## 🌐 Problemas de Rede

### Erro 502 Bad Gateway

#### Sintomas
- Nginx retorna erro 502
- Frontend não consegue acessar backend

#### Soluções

```bash
# 1. Verificar se backend está respondendo
curl -f http://localhost:8000/admin/

# 2. Verificar configuração do Nginx
docker-compose exec nginx nginx -t

# 3. Verificar logs do Nginx
docker-compose logs nginx

# 4. Reiniciar Nginx
docker-compose restart nginx

# 5. Verificar conectividade entre containers
docker-compose exec nginx ping backend
docker-compose exec frontend ping backend
```

### Problemas de CORS

#### Sintomas
- Erro CORS no console do navegador
- "Access to XMLHttpRequest has been blocked by CORS policy"

#### Soluções

```bash
# 1. Verificar configuração CORS no .env
grep CORS .env

# 2. Adicionar domínios permitidos
echo "CORS_ALLOWED_ORIGINS=http://localhost,http://127.0.0.1,http://seu-dominio.com" >> .env

# 3. Verificar ALLOWED_HOSTS
grep ALLOWED_HOSTS .env

# 4. Reiniciar backend
docker-compose restart backend

# 5. Verificar logs para erros CORS
docker-compose logs backend | grep -i cors
```

### Problemas de Conectividade Externa

#### Sintomas
- Aplicação não acessível externamente
- Timeout ao acessar pelo IP público

#### Soluções

```bash
# 1. Verificar firewall
sudo ufw status
sudo firewall-cmd --list-all  # CentOS/RHEL

# 2. Abrir portas necessárias
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8000/tcp

# 3. Verificar se serviços estão ouvindo em todas as interfaces
ss -tlnp | grep :80
ss -tlnp | grep :8000

# 4. Testar conectividade local
curl -f http://localhost:8000/admin/
curl -f http://127.0.0.1:8000/admin/

# 5. Verificar configuração de rede do Docker
docker network ls
docker network inspect nome-da-rede
```

## 💾 Problemas de Banco de Dados

### Migrações falham

#### Sintomas
- Erro ao executar `python manage.py migrate`
- "relation already exists"
- "column does not exist"

#### Soluções

```bash
# 1. Verificar status das migrações
docker-compose exec backend python manage.py showmigrations

# 2. Fazer fake migration se necessário
docker-compose exec backend python manage.py migrate --fake-initial

# 3. Resetar migrações (CUIDADO: pode perder dados!)
docker-compose exec backend python manage.py migrate nome_app zero
docker-compose exec backend python manage.py migrate

# 4. Verificar integridade do banco
docker-compose exec postgres psql -U postgres -d management_system_db -c "SELECT * FROM django_migrations;"

# 5. Backup antes de operações arriscadas
docker-compose exec postgres pg_dump -U postgres management_system_db > backup_pre_migration.sql
```

### Banco de dados corrompido

#### Sintomas
- Erro: "database is corrupted"
- Dados inconsistentes
- Queries muito lentas

#### Soluções

```bash
# 1. Fazer backup imediato
docker-compose exec postgres pg_dump -U postgres management_system_db > backup_emergency.sql

# 2. Verificar integridade
docker-compose exec postgres psql -U postgres -d management_system_db -c "VACUUM FULL ANALYZE;"

# 3. Reindexar banco
docker-compose exec postgres psql -U postgres -d management_system_db -c "REINDEX DATABASE management_system_db;"

# 4. Se necessário, restaurar de backup
docker-compose exec postgres dropdb -U postgres management_system_db
docker-compose exec postgres createdb -U postgres management_system_db
docker-compose exec -T postgres psql -U postgres management_system_db < backup_emergency.sql
```

## 🔐 Problemas de Segurança

### Erro de CSRF Token

#### Sintomas
- "CSRF verification failed"
- Formulários não funcionam

#### Soluções

```bash
# 1. Verificar configuração CSRF no settings
docker-compose exec backend python manage.py shell -c "
from django.conf import settings
print('CSRF_TRUSTED_ORIGINS:', getattr(settings, 'CSRF_TRUSTED_ORIGINS', 'Not set'))
print('CSRF_COOKIE_SECURE:', getattr(settings, 'CSRF_COOKIE_SECURE', 'Not set'))
"

# 2. Adicionar domínios confiáveis no .env
echo "CSRF_TRUSTED_ORIGINS=http://localhost,http://127.0.0.1,http://seu-dominio.com" >> .env

# 3. Reiniciar backend
docker-compose restart backend

# 4. Limpar cookies do navegador
# (instruir usuário a limpar cookies)
```

### Problemas de SSL/HTTPS

#### Sintomas
- Certificado SSL inválido
- "Your connection is not private"

#### Soluções

```bash
# 1. Verificar certificado
openssl x509 -in /path/to/cert.pem -text -noout

# 2. Renovar certificado Let's Encrypt
sudo certbot renew --dry-run
sudo certbot renew

# 3. Verificar configuração Nginx SSL
docker-compose exec nginx nginx -t

# 4. Verificar se certificados estão montados corretamente
docker-compose exec nginx ls -la /etc/ssl/certs/

# 5. Forçar HTTPS no Django (apenas se SSL estiver funcionando)
echo "SECURE_SSL_REDIRECT=True" >> .env
docker-compose restart backend
```

## 📊 Problemas de Performance

### Aplicação lenta

#### Sintomas
- Páginas demoram para carregar
- Timeouts frequentes
- Alto uso de CPU/memória

#### Diagnóstico

```bash
# 1. Verificar uso de recursos
docker stats --no-stream

# 2. Verificar logs para erros
docker-compose logs backend | tail -100

# 3. Verificar queries lentas no banco
docker-compose exec postgres psql -U postgres -d management_system_db -c "
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;"

# 4. Verificar espaço em disco
df -h
docker system df
```

#### Soluções

```bash
# 1. Otimizar banco de dados
docker-compose exec postgres psql -U postgres -d management_system_db -c "VACUUM ANALYZE;"

# 2. Limpar cache Redis (se configurado)
docker-compose exec redis redis-cli FLUSHALL

# 3. Aumentar recursos do container (docker-compose.yml)
# Editar limites de memória e CPU

# 4. Configurar cache Django
echo "CACHE_BACKEND=redis://redis:6379/1" >> .env
docker-compose restart backend

# 5. Otimizar arquivos estáticos
docker-compose exec backend python manage.py collectstatic --noinput
```

### Espaço em disco insuficiente

#### Sintomas
- "No space left on device"
- Containers param de funcionar

#### Soluções

```bash
# 1. Verificar uso de disco
df -h
docker system df

# 2. Limpar containers e imagens não utilizados
docker system prune -a

# 3. Limpar volumes não utilizados
docker volume prune

# 4. Limpar logs antigos
sudo journalctl --vacuum-time=7d

# 5. Configurar rotação de logs Docker
sudo nano /etc/docker/daemon.json
# Adicionar:
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}

sudo systemctl restart docker
```

## 🔄 Problemas de Deploy e Atualização

### Deploy falha

#### Sintomas
- Script de deploy para com erro
- Containers não sobem após atualização

#### Soluções

```bash
# 1. Verificar logs do deploy
tail -f deploy.log

# 2. Executar deploy passo a passo
git pull origin main
docker-compose build --no-cache
docker-compose down
docker-compose up -d

# 3. Verificar se todas as dependências estão atualizadas
docker-compose exec backend pip list --outdated

# 4. Rollback se necessário
git checkout HEAD~1
docker-compose build --no-cache
docker-compose up -d
```

### Problemas após atualização

#### Sintomas
- Aplicação não funciona após update
- Novos erros aparecem

#### Soluções

```bash
# 1. Verificar se migrações foram executadas
docker-compose exec backend python manage.py showmigrations

# 2. Executar migrações pendentes
docker-compose exec backend python manage.py migrate

# 3. Coletar arquivos estáticos
docker-compose exec backend python manage.py collectstatic --noinput

# 4. Verificar configurações novas
docker-compose exec backend python manage.py check --deploy

# 5. Rollback se problemas persistirem
git log --oneline -10  # ver commits recentes
git checkout commit-anterior-funcionando
docker-compose build --no-cache
docker-compose up -d
```

## 🛠️ Ferramentas de Diagnóstico

### Script de Diagnóstico Completo

```bash
#!/bin/bash
echo "=== DIAGNÓSTICO COMPLETO ==="

echo "1. Status dos Containers:"
docker-compose ps

echo -e "\n2. Uso de Recursos:"
docker stats --no-stream

echo -e "\n3. Espaço em Disco:"
df -h
docker system df

echo -e "\n4. Portas em Uso:"
ss -tlnp | grep -E ":(80|443|8000|5432|6379)"

echo -e "\n5. Logs Recentes (últimas 20 linhas):"
docker-compose logs --tail=20

echo -e "\n6. Conectividade:"
curl -s -o /dev/null -w "Backend: %{http_code}\n" http://localhost:8000/admin/
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost/

echo -e "\n7. Banco de Dados:"
docker-compose exec postgres psql -U postgres -c "SELECT version();" 2>/dev/null || echo "Erro ao conectar no banco"

echo -e "\n8. Variáveis de Ambiente Críticas:"
docker-compose exec backend env | grep -E "(DEBUG|SECRET_KEY|DB_|ALLOWED_HOSTS)" | head -10

echo "=== FIM DO DIAGNÓSTICO ==="
```

### Comandos Úteis para Debug

```bash
# Entrar no container para debug
docker-compose exec backend bash
docker-compose exec postgres psql -U postgres

# Verificar logs em tempo real
docker-compose logs -f backend

# Testar conectividade entre containers
docker-compose exec frontend ping backend
docker-compose exec backend ping postgres

# Verificar configuração Django
docker-compose exec backend python manage.py check
docker-compose exec backend python manage.py check --deploy

# Executar shell Django
docker-compose exec backend python manage.py shell

# Verificar migrações
docker-compose exec backend python manage.py showmigrations

# Criar backup rápido
docker-compose exec postgres pg_dump -U postgres management_system_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 📞 Quando Buscar Ajuda

Se os problemas persistirem após tentar as soluções acima:

1. **Colete informações:**
   - Execute o script de diagnóstico completo
   - Salve logs relevantes
   - Anote passos para reproduzir o problema

2. **Verifique documentação:**
   - [Documentação do Django](https://docs.djangoproject.com/)
   - [Documentação do Docker](https://docs.docker.com/)
   - [Documentação do PostgreSQL](https://www.postgresql.org/docs/)

3. **Busque ajuda:**
   - Issues no repositório do projeto
   - Stack Overflow
   - Comunidades Django/Docker

---
**Nota:** Mantenha sempre backups atualizados antes de tentar soluções que possam afetar dados.