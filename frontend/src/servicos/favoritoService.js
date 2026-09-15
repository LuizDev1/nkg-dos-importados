const API_URL = import.meta.env.VITE_API_URL || '/api';

function headers() {
  return { Authorization: `Bearer ${localStorage.getItem('token') || ''}` };
}

async function ler(resposta) {
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.mensagem || 'Erro ao processar favorito');
  return dados;
}

export async function listarFavoritos() {
  return ler(await fetch(`${API_URL}/favoritos`, { headers: headers() }));
}

export async function adicionarFavorito(produtoId) {
  return ler(await fetch(`${API_URL}/favoritos/${produtoId}`, { method: 'POST', headers: headers() }));
}

export async function removerFavorito(produtoId) {
  return ler(await fetch(`${API_URL}/favoritos/${produtoId}`, { method: 'DELETE', headers: headers() }));
}
