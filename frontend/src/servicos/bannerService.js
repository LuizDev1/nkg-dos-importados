const API_URL = import.meta.env.VITE_API_URL || '/api';

function headers() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  };
}

async function ler(resposta, mensagem) {
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.mensagem || mensagem);
  return dados;
}

export async function listarBanners() {
  return ler(await fetch(`${API_URL}/banners`), 'Erro ao carregar banners');
}

export async function listarBannersAdmin() {
  return ler(await fetch(`${API_URL}/banners/admin`, { headers: headers() }), 'Erro ao carregar banners');
}

export async function criarBanner(dados) {
  return ler(await fetch(`${API_URL}/banners`, {
    method: 'POST', headers: headers(), body: JSON.stringify(dados),
  }), 'Erro ao criar banner');
}

export async function atualizarBanner(id, dados) {
  return ler(await fetch(`${API_URL}/banners/${id}`, {
    method: 'PUT', headers: headers(), body: JSON.stringify(dados),
  }), 'Erro ao atualizar banner');
}

export async function excluirBanner(id) {
  return ler(await fetch(`${API_URL}/banners/${id}`, {
    method: 'DELETE', headers: headers(),
  }), 'Erro ao excluir banner');
}
