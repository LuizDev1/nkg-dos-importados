const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function listarAvaliacoes(produtoId) {
  const resposta = await fetch(`${API_URL}/produtos/${produtoId}/avaliacoes`);
  if (!resposta.ok) throw new Error('Erro ao carregar avaliações');
  return resposta.json();
}

export async function verificarPermissaoAvaliacao(produtoId) {
  const resposta = await fetch(`${API_URL}/produtos/${produtoId}/avaliacoes/permissao`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
  });
  if (!resposta.ok) throw new Error('Erro ao verificar permissão para avaliar');
  return resposta.json();
}

export async function salvarAvaliacao(produtoId, avaliacao) {
  const resposta = await fetch(`${API_URL}/produtos/${produtoId}/avaliacoes/minha`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
    body: JSON.stringify(avaliacao),
  });
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.mensagem || 'Erro ao salvar avaliação');
  return dados;
}
