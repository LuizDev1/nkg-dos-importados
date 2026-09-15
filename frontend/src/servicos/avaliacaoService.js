const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function listarAvaliacoes(produtoId) {
  const resposta = await fetch(`${API_URL}/produtos/${produtoId}/avaliacoes`);
  if (!resposta.ok) throw new Error('Erro ao carregar avaliações');
  const avaliacoes = await resposta.json();
  const token = localStorage.getItem('token');
  if (!token) return avaliacoes;
  const votosResposta = await fetch(API_URL + '/produtos/' + produtoId + '/avaliacoes/meus-votos', {
    headers: { Authorization: 'Bearer ' + token },
  });
  if (!votosResposta.ok) throw new Error('Erro ao carregar votos');
  const votos = new Set(await votosResposta.json());
  return avaliacoes.map(a => ({ ...a, votou_util: votos.has(a.id) }));
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

export async function marcarAvaliacaoUtil(avaliacaoId, ativo = true) {
  const resposta = await fetch(API_URL + '/avaliacoes/' + avaliacaoId + '/util', {
    method: ativo ? 'PUT' : 'DELETE',
    headers: { Authorization: 'Bearer ' + (localStorage.getItem('token') || '') },
  });
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.mensagem || 'Erro ao marcar avaliação como útil');
  return dados;
}
