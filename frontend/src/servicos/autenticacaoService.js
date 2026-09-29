const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function login(email, senha, turnstileToken = '') {
  const resposta = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha, turnstile_token: turnstileToken }),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao fazer login');
  }

  return dados;
}

export async function registrar(dadosUsuario) {
  const resposta = await fetch(`${API_URL}/auth/registrar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dadosUsuario),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao cadastrar');
  }

  return dados;
}

export async function logout() {
  const resposta = await fetch(`${API_URL}/auth/logout`, { method: 'POST' });
  if (!resposta.ok && resposta.status !== 401) throw new Error('Erro ao encerrar sessão');
}
