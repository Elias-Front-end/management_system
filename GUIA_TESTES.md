# 🧪 GUIA DE TESTES - Sistema de Gestão de Treinamentos

Este guia fornece instruções detalhadas para testar todas as funcionalidades do sistema após o deploy.

## 📋 Pré-requisitos para Testes

- Sistema configurado conforme README.md
- Servidores backend e frontend em execução
- PowerShell aberto como administrador
- Navegador web moderno (Chrome, Firefox, Edge)

## 🚀 1. VERIFICAÇÃO INICIAL DOS SERVIÇOS

### 1.1 Verificar Backend Django
```powershell
# Testar se o backend está respondendo
Invoke-WebRequest -Uri "http://localhost:8000/admin/" -Method GET

# Resultado esperado: Status 200 OK com página de login do Django Admin
```

### 1.2 Verificar Frontend React
```powershell
# Testar se o frontend está respondendo
Invoke-WebRequest -Uri "http://localhost:5174/" -Method GET

# Resultado esperado: Status 200 OK com HTML da aplicação React
```

### 1.3 Verificar Integração (Proxy)
```powershell
# Testar proxy do frontend para backend
Invoke-WebRequest -Uri "http://localhost:5174/api/treinamentos/" -Method GET

# Resultado esperado: Status 401 com mensagem de autenticação necessária
# Isso confirma que o proxy está funcionando corretamente
```

## 🔐 2. TESTES DE AUTENTICAÇÃO

### 2.1 Acesso ao Django Admin
1. Abra o navegador e acesse: `http://localhost:8000/admin/`
2. Faça login com:
   - **Usuário:** admin
   - **Senha:** admin123
3. **Resultado esperado:** Acesso ao painel administrativo do Django

### 2.2 Teste da API de Autenticação
```powershell
# Testar login via API (deve falhar por falta de tipo_perfil)
$body = @{username="admin"; password="admin123"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" -Method POST -Body $body -ContentType "application/json"

# Resultado esperado: Erro informando que tipo_perfil é obrigatório
```

## 🎯 3. TESTES FUNCIONAIS DO FRONTEND

### 3.1 Carregamento da Aplicação
1. Abra o navegador e acesse: `http://localhost:5174/`
2. **Verificações:**
   - ✅ Página carrega sem erros
   - ✅ Interface React é exibida
   - ✅ Não há erros no console do navegador

### 3.2 Navegação e Interface
1. **Teste de responsividade:**
   - Redimensione a janela do navegador
   - Verifique se a interface se adapta corretamente

2. **Teste de componentes:**
   - Verifique se todos os elementos visuais estão carregando
   - Teste interações básicas (cliques, hovers)

## 🔧 4. TESTES DE API (Backend)

### 4.1 Endpoints Principais
```powershell
# Testar endpoint de treinamentos
Invoke-WebRequest -Uri "http://localhost:8000/api/treinamentos/" -Method GET

# Testar endpoint de turmas
Invoke-WebRequest -Uri "http://localhost:8000/api/turmas/" -Method GET

# Testar endpoint de alunos
Invoke-WebRequest -Uri "http://localhost:8000/api/alunos/" -Method GET

# Testar endpoint de recursos
Invoke-WebRequest -Uri "http://localhost:8000/api/recursos/" -Method GET

# Testar endpoint de matrículas
Invoke-WebRequest -Uri "http://localhost:8000/api/matriculas/" -Method GET

# Resultado esperado para todos: Status 401 (autenticação necessária)
# Isso confirma que os endpoints estão protegidos corretamente
```

### 4.2 Verificar CSRF Protection
```powershell
# Testar endpoint CSRF
Invoke-WebRequest -Uri "http://localhost:8000/api/csrf/" -Method GET

# Resultado esperado: Status 200 com token CSRF
```

## 📊 5. TESTES DE DADOS (Django Admin)

### 5.1 Criar Dados de Teste
1. Acesse o Django Admin: `http://localhost:8000/admin/`
2. Faça login como admin
3. **Criar Treinamento:**
   - Vá em "Treinamentos" → "Adicionar"
   - Nome: "Treinamento de Teste"
   - Descrição: "Descrição do treinamento de teste"
   - Salve

4. **Criar Turma:**
   - Vá em "Turmas" → "Adicionar"
   - Selecione o treinamento criado
   - Nome: "Turma Teste 2024"
   - Data início: data atual
   - Data conclusão: data futura
   - Salve

5. **Criar Aluno:**
   - Vá em "Alunos" → "Adicionar"
   - Nome: "João Silva"
   - Email: "joao@teste.com"
   - Telefone: "(11) 99999-9999"
   - Salve

### 5.2 Verificar Relacionamentos
1. **Criar Matrícula:**
   - Vá em "Matriculas" → "Adicionar"
   - Selecione a turma e aluno criados
   - Salve

2. **Criar Recurso:**
   - Vá em "Recursos" → "Adicionar"
   - Selecione a turma criada
   - Nome: "Material de Apoio"
   - Tipo: "pdf"
   - Configure as opções de acesso
   - Salve

## 🌐 6. TESTES DE INTEGRAÇÃO COMPLETA

### 6.1 Fluxo Completo de Dados
```powershell
# Após criar dados no admin, testar se a API retorna os dados
# (ainda retornará 401, mas confirma que os endpoints estão funcionando)

# Verificar se os dados foram criados
Invoke-WebRequest -Uri "http://localhost:8000/api/treinamentos/" -Method GET
Invoke-WebRequest -Uri "http://localhost:8000/api/turmas/" -Method GET
Invoke-WebRequest -Uri "http://localhost:8000/api/alunos/" -Method GET
```

### 6.2 Teste de Performance Básica
```powershell
# Medir tempo de resposta dos endpoints
Measure-Command { Invoke-WebRequest -Uri "http://localhost:8000/api/treinamentos/" -Method GET }
Measure-Command { Invoke-WebRequest -Uri "http://localhost:5174/" -Method GET }

# Resultado esperado: Tempos de resposta < 1 segundo
```

## 🚨 7. TESTES DE SEGURANÇA

### 7.1 Verificar Proteção de Endpoints
```powershell
# Tentar acessar endpoints sem autenticação
$endpoints = @(
    "http://localhost:8000/api/treinamentos/",
    "http://localhost:8000/api/turmas/",
    "http://localhost:8000/api/alunos/",
    "http://localhost:8000/api/recursos/",
    "http://localhost:8000/api/matriculas/"
)

foreach ($endpoint in $endpoints) {
    try {
        Invoke-WebRequest -Uri $endpoint -Method GET
        Write-Host "❌ FALHA DE SEGURANÇA: $endpoint não está protegido!"
    }
    catch {
        Write-Host "✅ SEGURANÇA OK: $endpoint está protegido"
    }
}
```

### 7.2 Verificar Headers de Segurança
```powershell
# Verificar headers de resposta
$response = Invoke-WebRequest -Uri "http://localhost:8000/admin/" -Method GET
$response.Headers

# Verificar se contém headers de segurança apropriados
```

## 📝 8. CHECKLIST DE VALIDAÇÃO

### ✅ Backend (Django)
- [ ] Servidor iniciado na porta 8000
- [ ] Django Admin acessível
- [ ] Endpoints da API respondem (mesmo com 401)
- [ ] CSRF protection ativo
- [ ] Modelos de dados funcionando
- [ ] Relacionamentos entre modelos OK

### ✅ Frontend (React)
- [ ] Servidor iniciado na porta 5174
- [ ] Aplicação carrega sem erros
- [ ] Interface responsiva
- [ ] Proxy para backend funcionando
- [ ] Configurações de ambiente carregadas

### ✅ Integração
- [ ] Proxy Vite → Django funcionando
- [ ] CORS configurado corretamente
- [ ] Comunicação entre portas 5174 ↔ 8000
- [ ] Headers de autenticação sendo enviados

### ✅ Segurança
- [ ] Endpoints protegidos por autenticação
- [ ] CSRF tokens funcionando
- [ ] Credenciais não expostas
- [ ] Headers de segurança presentes

## 🔍 9. TROUBLESHOOTING

### Problema: Backend não responde
```powershell
# Verificar se o processo está rodando
Get-Process python | Where-Object {$_.ProcessName -eq "python"}

# Verificar porta 8000
netstat -an | findstr :8000

# Solução: Reiniciar o servidor
cd D:\PROGETOS_BLOCK\management_system\backend
python manage.py runserver 0.0.0.0:8000
```

### Problema: Frontend não carrega
```powershell
# Verificar se o processo está rodando
Get-Process node | Where-Object {$_.ProcessName -eq "node"}

# Verificar porta 5174
netstat -an | findstr :5174

# Solução: Reiniciar o servidor
cd D:\PROGETOS_BLOCK\management_system\frontend
npm run dev
```

### Problema: Proxy não funciona
1. Verificar `vite.config.ts`
2. Confirmar que backend está na porta 8000
3. Reiniciar servidor frontend

### Problema: Erro 500 no Django
```powershell
# Verificar logs do Django no terminal
# Verificar configurações no settings.py
# Verificar migrações aplicadas
python manage.py showmigrations
```

## 📊 10. RELATÓRIO DE TESTES

Após executar todos os testes, documente os resultados:

### Resultados Esperados:
- ✅ **Backend:** Funcionando na porta 8000
- ✅ **Frontend:** Funcionando na porta 5174
- ✅ **API:** Endpoints protegidos (401 sem auth)
- ✅ **Admin:** Acessível com credenciais
- ✅ **Proxy:** Redirecionamento funcionando
- ✅ **Segurança:** Endpoints protegidos
- ✅ **Dados:** CRUD funcionando via admin

### Status do Sistema:
- 🟢 **OPERACIONAL:** Todos os componentes funcionando
- 🟡 **PARCIAL:** Alguns componentes com problemas
- 🔴 **FALHA:** Sistema não funcional

---

## 🎯 CONCLUSÃO

Este guia garante que todos os aspectos do sistema estejam funcionando corretamente após o deploy. Execute os testes na ordem apresentada para uma validação completa.

Para suporte adicional, consulte o arquivo `README.md` ou verifique os logs dos servidores.