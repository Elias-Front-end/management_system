/**
 * Utilidades para extrair e traduzir mensagens de erro (DRF/Axios) para PT-BR.
 */

type AnyError = any;

/**
 * Traduz mensagens comuns do Django/DRF para Português (Brasil).
 */
export function translateToPTBR(message: string): string {
  if (!message) return 'Ocorreu um erro.';
  const trimmed = message.trim();

  const directMap: Record<string, string> = {
    'This field may not be blank.': 'Este campo não pode ficar em branco.',
    'This field may not be null.': 'Este campo não pode ser nulo.',
    'This field is required.': 'Este campo é obrigatório.',
    'This field must be unique.': 'Este campo deve ser único.',
    'Enter a valid email address.': 'Digite um email válido.',
    'A user with that username already exists.': 'Já existe um usuário com este nome de usuário.',
    'Not found.': 'Não encontrado.',
    'Incorrect authentication credentials.': 'Credenciais de autenticação incorretas.',
    'Invalid username/password.': 'Usuário/senha inválidos.',
  };

  if (directMap[trimmed]) return directMap[trimmed];

  // Caso específico: duplicidade de email
  if (/with this\s+email\s+already exists\.?/i.test(trimmed)) {
    return 'Este email já está em uso.';
  }

  // Padrão: "<Model> with this <Field> already exists."
  const existsPattern = /with this (.+?) already exists\.?/i;
  if (existsPattern.test(trimmed)) {
    let translated = trimmed.replace(existsPattern, 'com este $1 já existe.');
    // Ajustes de termos comuns
    translated = translated.replace(/^User\b/i, 'Usuário');
    translated = translated.replace(/^Aluno\b/i, 'Aluno');
    translated = translated.replace(/Email\b/i, 'Email');
    translated = translated.replace(/Username\b/i, 'Nome de usuário');
    return translated;
  }

  // Padrão: "Ensure this field has no more than X characters."
  const charPattern = /Ensure this field has no more than (\d+) characters\./i;
  const charMatch = trimmed.match(charPattern);
  if (charMatch) {
    return `Certifique-se de que este campo tenha no máximo ${charMatch[1]} caracteres.`;
  }

  return trimmed; // fallback: mantém original se não reconhecido
}

/**
 * Extrai uma mensagem de erro de uma resposta Axios/DRF e aplica tradução para PT-BR.
 */
export function extractAndTranslateError(error: AnyError, fallback: string = 'Ocorreu um erro ao processar a solicitação'): string {
  const data = error?.response?.data;
  let msg: string | undefined = data?.error || data?.detail;

  const fieldKeys = [
    'email', 'nome', 'username', 'password', 'arquivo', 'tipo_recurso', 'turma', 'aluno', 'non_field_errors'
  ];

  if (!msg && data) {
    for (const key of fieldKeys) {
      const v = data[key];
      if (typeof v === 'string' && v) { msg = v; break; }
      if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'string') { msg = v[0]; break; }
    }
  }

  if (!msg && typeof error?.message === 'string' && error.message) {
    msg = error.message;
  }

  return translateToPTBR(msg || fallback);
}