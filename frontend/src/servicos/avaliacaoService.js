const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function listarAvaliacoes(produtoId) {
  const resposta = await fetch(`${API_URL}/produtos/${produtoId}/avaliacoes`);
  if (!resposta.ok) throw new Error('Erro ao carregar avaliações');
  const avaliacoes = await resposta.json();
  const votosResposta = await fetch(API_URL + '/produtos/' + produtoId + '/avaliacoes/meus-votos');
  if (votosResposta.status === 401) return avaliacoes;
  if (!votosResposta.ok) throw new Error('Erro ao carregar votos');
  const votos = new Set(await votosResposta.json());
  return avaliacoes.map(a => ({ ...a, votou_util: votos.has(a.id) }));
}

export async function verificarPermissaoAvaliacao(produtoId) {
  const resposta = await fetch(`${API_URL}/produtos/${produtoId}/avaliacoes/permissao`);
  if (!resposta.ok) throw new Error('Erro ao verificar permissão para avaliar');
  return resposta.json();
}

export async function salvarAvaliacao(produtoId, avaliacao) {
  const resposta = await fetch(`${API_URL}/produtos/${produtoId}/avaliacoes/minha`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
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
  });
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.mensagem || 'Erro ao marcar avaliação como útil');
  return dados;
}
