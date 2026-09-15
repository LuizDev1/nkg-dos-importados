const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function cadastrarAvisoEstoque(produtoId, variacaoId = null) {
  const resposta = await fetch(`${API_URL}/avisos-estoque`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
    },
    body: JSON.stringify({ produto_id: produtoId, ...(variacaoId ? { variacao_id: variacaoId } : {}) }),
  });
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.mensagem || 'Erro ao cadastrar aviso');
  return dados;
}
