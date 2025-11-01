# 🔐 CONFIGURAÇÃO DE CSRF - Guia Técnico

## 📋 Visão Geral

Este documento detalha a configuração de CSRF (Cross-Site Request Forgery) implementada no sistema para garantir segurança e funcionalidade adequada entre o backend Django e frontend React.

## ⚠️ Problema Identificado

**Sintoma**: `CSRF Failed: CSRF token missing`
**Impacto**: Impossibilidade de realizar login, logout e operações POST/PUT/PATCH/DELETE
**Causa**: Configuração inadequada de CSRF cookies para acesso JavaScript

## ✅ Solução Implementada

### 1. Configurações Backend (Django)

#### `backend/backend/settings.py`
```python
# CSRF Settings - CRÍTICAS para funcionamento
CSRF_COOKIE_HTTPONLY = False  # ⚠️ DEVE ser False para acesso JavaScript
CSRF_COOKIE_NAME = 'csrftoken'
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SECURE = not DEBUG  # True em produção com HTTPS

# Origens confiáveis para CSRF
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5174',    # Vite dev server
    'http://127.0.0.1:5174',   # Alternativa local
    # Adicionar domínios de produção aqui
    # 'https://seudominio.com',
    # 'https://www.seudominio.com',
]

# CORS Settings - Necessário para integração
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    # Adicionar domínios de produção aqui
]

CORS_ALLOW_CREDENTIALS = True  # Permite envio de cookies

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',        # ⚠️ CRÍTICO para CSRF
    'x-requested-with',
]
```

#### `backend/core/views.py`
```python
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse

@ensure_csrf_cookie
def get_csrf(request):
    """
    Endpoint para obter CSRF token.
    Força a criação do cookie csrftoken no browser.
    """
    return JsonResponse({'detail': 'CSRF cookie set'})
```

#### `backend/core/urls.py`
```python
from django.urls import path
from .views import get_csrf

urlpatterns = [
    path('api/csrf/', get_csrf, name='csrf'),
    # ... outras rotas
]
```

### 2. Configurações Frontend (React)

#### `frontend/src/services/api.ts`
```typescript
import axios from 'axios';

// Configuração base do Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true,  // ⚠️ CRÍTICO: permite envio de cookies
});

// Função para obter CSRF token do cookie
const getCSRFToken = (): string | null => {
  const name = 'csrftoken';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

// Interceptor automático para incluir CSRF token
api.interceptors.request.use((config) => {
  // Incluir CSRF token apenas em métodos que modificam dados
  if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
  }
  return config;
});

export default api;
```

#### `frontend/src/App.tsx`
```typescript
import { useEffect } from 'react';
import api from './services/api';

function App() {
  useEffect(() => {
    const initializeCSRF = async () => {
      try {
        // Obter CSRF token antes de qualquer outra requisição
        await api.get('/csrf/');
        // Verificar autenticação após obter CSRF
        checkAuth();
      } catch (error) {
        console.error('Erro ao inicializar CSRF:', error);
      }
    };

    initializeCSRF();
  }, []);

  // ... resto do componente
}
```

## 🔍 Verificação e Testes

### 1. Verificar Endpoint CSRF
```bash
# Testar se endpoint está respondendo
curl -X GET http://localhost:8000/api/csrf/ -c cookies.txt

# Verificar se cookie foi criado
cat cookies.txt | grep csrftoken
```

### 2. Verificar no Browser
```javascript
// No console do browser, verificar se cookie existe
console.log(document.cookie);
// Deve mostrar: "csrftoken=abc123..."

// Verificar se token está sendo enviado nas requisições
// Network tab -> POST request -> Headers -> Request Headers
// Deve conter: X-CSRFToken: abc123...
```

### 3. Teste de Integração
```bash
# Fazer requisição POST com CSRF token
curl -X POST http://localhost:8000/api/alunos/ \
  -b cookies.txt \
  -H "X-CSRFToken: $(grep csrftoken cookies.txt | cut -f7)" \
  -H "Content-Type: application/json" \
  -d '{"nome": "Teste", "email": "teste@teste.com"}'
```

## 🚨 Considerações de Segurança

### ✅ Configurações Seguras Mantidas
- CSRF protection permanece ativo
- Tokens são únicos por sessão
- Validação de origem (CSRF_TRUSTED_ORIGINS)
- HTTPS obrigatório em produção (CSRF_COOKIE_SECURE)

### ⚠️ Configuração Específica
- `CSRF_COOKIE_HTTPONLY = False` é necessário para acesso JavaScript
- Esta configuração é segura quando combinada com outras proteções CSRF
- Token permanece protegido contra XSS por outras camadas de segurança

## 🌍 Configuração para Produção

### Variáveis de Ambiente (.env)
```bash
# Desenvolvimento
DEBUG=True
CSRF_TRUSTED_ORIGINS=http://localhost:5174,http://127.0.0.1:5174
CORS_ALLOWED_ORIGINS=http://localhost:5174,http://127.0.0.1:5174

# Produção
DEBUG=False
CSRF_TRUSTED_ORIGINS=https://seudominio.com,https://www.seudominio.com
CORS_ALLOWED_ORIGINS=https://seudominio.com,https://www.seudominio.com
CSRF_COOKIE_SECURE=True
```

## 🔧 Troubleshooting

### Problema: Token não está sendo enviado
**Solução**: Verificar se `withCredentials: true` está configurado no Axios

### Problema: 403 Forbidden mesmo com token
**Solução**: Verificar se domínio está em `CSRF_TRUSTED_ORIGINS`

### Problema: Cookie não está sendo criado
**Solução**: Verificar se endpoint `/api/csrf/` está acessível e `@ensure_csrf_cookie` está aplicado

### Problema: Token não é lido pelo JavaScript
**Solução**: Verificar se `CSRF_COOKIE_HTTPONLY = False`

## 📚 Referências

- [Django CSRF Documentation](https://docs.djangoproject.com/en/4.2/ref/csrf/)
- [Django CORS Headers](https://github.com/adamchainz/django-cors-headers)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [MDN - HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)

---

**Última atualização**: Janeiro 2025  
**Versão**: 1.1.0