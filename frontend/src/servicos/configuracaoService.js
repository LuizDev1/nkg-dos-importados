const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function buscarConfiguracoes() {
  const resposta = await fetch(`${API_URL}/configuracoes-loja`);
  const dados = await resposta.json();

  if (!resposta.ok) throw new Error(dados.mensagem);
  return dados;
}

export async function atualizarConfiguracoes(configuracoes) {
  const token = localStorage.getItem('token');

  const resposta = await fetch(`${API_URL}/configuracoes-loja`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(configuracoes),
  });

  const dados = await resposta.json();

  if (!resposta.ok) throw new Error(dados.mensagem);
  return dados;
}