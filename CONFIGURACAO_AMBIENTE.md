# 🔧 Configuração de Ambiente - Sistema de Gestão de Sala de Aula

## 🚀 Início Rápido

**Para usuários novos, siga estes passos primeiro:**

1. **📖 Leia o README.md completo** - Contém instruções passo a passo de instalação
2. **⚡ Execute o setup básico** seguindo o README.md
3. **🧪 Execute os testes** usando o GUIA_TESTES.md
4. **📚 Consulte este documento** para entender as configurações em detalhes

**⚠️ IMPORTANTE:** Este documento é para **referência técnica**. Para instalação inicial, use o **README.md**.

---

## 📋 Visão Geral

Este documento descreve a estrutura de configuração de ambiente do Sistema de Gestão de Sala de Aula, incluindo todos os arquivos `.env`, `.gitignore` e `.gitattributes`.

## 📁 Estrutura de Arquivos de Configuração

```
management_system/
├── .env                    # Configurações principais do projeto
├── .env.example           # Exemplo completo das configurações
├── .gitignore             # Arquivos ignorados pelo Git
├── .gitattributes         # Configurações de atributos do Git
└── backend/
    ├── .env               # Configurações específicas do backend
    └── .env.example       # Exemplo das configurações do backend
```

## 🔐 Arquivos de Ambiente (.env)

### 📄 `.env` (Principal)
**Localização:** `d:\PROGETOS_BLOCK\management_system\.env`

**Propósito:** Configurações centralizadas para todo o projeto

**Seções principais:**
- 🐍 Configurações do Django (Backend)
- 🗄️ Configurações do Banco de Dados
- 🌐 Configurações de CORS e CSRF
- 🔐 Configurações de Autenticação JWT
- 📧 Configurações de Email
- 📁 Configurações de Arquivos e Mídia
- 🎯 Configurações Específicas do Projeto

**Configurações críticas:**
```env
SECRET_KEY=django-insecure-dev-key-for-local-development-only
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5174,http://127.0.0.1:3000,http://127.0.0.1:5174
```

### 📄 `backend/.env`
**Localização:** `d:\PROGETOS_BLOCK\management_system\backend\.env`

**Propósito:** Configurações específicas do backend Django

**Características:**
- Sincronizado com o `.env` principal
- Inclui todas as configurações necessárias para o Django
- Configurações de CORS atualizadas para incluir porta 5174 (Vite)
- Configurações JWT consistentes

**Configurações atualizadas:**
```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5174,http://127.0.0.1:3000,http://127.0.0.1:5174
ACCESS_TOKEN_LIFETIME=60
REFRESH_TOKEN_LIFETIME=7
```

## 📝 Arquivos de Exemplo (.env.example)

### 📄 `.env.example` (Principal)
**Localização:** `d:\PROGETOS_BLOCK\management_system\.env.example`

**Características:**
- ✅ Documentação completa de todas as variáveis
- ✅ Exemplos para desenvolvimento e produção
- ✅ Instruções detalhadas de configuração
- ✅ Seções organizadas com emojis
- ✅ Notas de segurança e boas práticas

**Seções incluídas:**
- Configurações Django
- Banco de dados (SQLite, PostgreSQL, MySQL)
- CORS e CSRF
- JWT
- Email (Console, SMTP)
- Arquivos e mídia
- Produção e segurança
- Docker
- Performance e cache
- Monitoramento
- Internacionalização
- Configurações específicas do projeto
- Desenvolvimento
- Mobile (futuro)
- Backup

### 📄 `backend/.env.example`
**Localização:** `d:\PROGETOS_BLOCK\management_system\backend\.env.example`

**Características:**
- ✅ Focado especificamente no backend Django
- ✅ Configurações corrigidas (nome do projeto)
- ✅ Documentação clara e organizada
- ✅ Exemplos para diferentes ambientes

**Correções aplicadas:**
- ❌ `stratasec_db` → ✅ `management_system_db`
- ✅ Configurações CORS atualizadas
- ✅ Configurações JWT padronizadas

## 🚫 Arquivo .gitignore

**Localização:** `d:\PROGETOS_BLOCK\management_system\.gitignore`

**Características:**
- ✅ Muito completo e bem estruturado
- ✅ Cobertura para Python/Django
- ✅ Cobertura para React/Node.js
- ✅ Ferramentas de desenvolvimento
- ✅ Arquivos de sistema (Windows, macOS, Linux)
- ✅ Configurações de segurança
- ✅ Arquivos de teste e relatórios
- ✅ Deploy e produção
- ✅ Mobile (futuro)

**Seções principais:**
```gitignore
# Python/Django Backend
__pycache__/
*.pyc
db.sqlite3
media/
staticfiles/

# React/Node.js Frontend
node_modules/
/build
/dist
.env.local

# Segurança
.env
*.pem
*.key
secrets.json
```

## 📋 Arquivo .gitattributes

**Localização:** `d:\PROGETOS_BLOCK\management_system\.gitattributes`

**Conteúdo:**
```gitattributes
# Auto detect text files and perform LF normalization
* text=auto
```

**Status:** ✅ Básico mas funcional

## ✅ Validação e Testes

### 🧪 Testes Realizados

1. **Backend Django:** ✅ Funcionando
   - Servidor rodando na porta 8000
   - API respondendo corretamente
   - Autenticação funcionando (erro 401 esperado)

2. **Frontend React:** ✅ Funcionando
   - Servidor rodando na porta 5174
   - Página carregando corretamente
   - Status 200 OK

3. **Integração Frontend-Backend:** ✅ Funcionando
   - Proxy Vite funcionando
   - Redirecionamento de `/api` para backend
   - CORS configurado corretamente

### 🔍 Problemas Identificados e Corrigidos

| Problema | Status | Solução |
|----------|--------|---------|
| CORS não incluía porta 5174 | ✅ Corrigido | Adicionado `:5174` nas configurações |
| Configurações JWT inconsistentes | ✅ Corrigido | Padronizadas entre arquivos |
| Nome do projeto incorreto | ✅ Corrigido | `stratasec_db` → `management_system_db` |
| Configurações incompletas | ✅ Corrigido | Sincronizadas entre arquivos |

## 🚀 Recomendações

### 🔐 Segurança
1. **Nunca** commitar arquivos `.env` no Git
2. Usar chaves secretas diferentes para cada ambiente
3. Configurar HTTPS em produção
4. Usar PostgreSQL em produção

### 🛠️ Desenvolvimento
1. Copiar `.env.example` para `.env` ao configurar
2. Verificar configurações CORS ao adicionar novos domínios
3. Manter sincronização entre arquivos de configuração
4. Testar configurações após mudanças

### 📊 Monitoramento
1. Configurar logs adequados
2. Implementar monitoramento de erros
3. Fazer backups regulares
4. Testar configurações em ambiente de staging

## 🔄 Processo de Atualização

1. **Modificar configurações:**
   - Atualizar `.env` principal
   - Sincronizar `backend/.env`
   - Atualizar arquivos `.example`

2. **Testar mudanças:**
   - Verificar backend
   - Verificar frontend
   - Testar integração

3. **Documentar:**
   - Atualizar este documento
   - Atualizar README.md
   - Notificar equipe

## 📞 Suporte

Em caso de problemas com configurações:

1. Verificar este documento
2. Consultar arquivos `.env.example`
3. Verificar logs de erro
4. Testar em ambiente limpo
5. Consultar documentação oficial Django/React

---

**Última atualização:** Novembro 2025  
**Versão:** 1.0.0  
**Status:** ✅ Configurações validadas e funcionais