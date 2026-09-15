const API_URL = import.meta.env.VITE_API_URL || '/api';

function headersComToken() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
}

async function lerResposta(resposta, mensagemPadrao) {
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.mensagem || mensagemPadrao);
  return dados;
}

export async function listarPromocoes() {
  const resposta = await fetch(`${API_URL}/promocoes`, {
    headers: headersComToken(),
  });
  return lerResposta(resposta, 'Erro ao carregar promoções');
}

export async function criarPromocao(dados) {
  const resposta = await fetch(`${API_URL}/promocoes`, {
    method: 'POST',
    headers: headersComToken(),
    body: JSON.stringify(dados),
  });
  return lerResposta(resposta, 'Erro ao criar promoção');
}

export async function desativarPromocao(id) {
  const resposta = await fetch(`${API_URL}/promocoes/${id}/desativar`, {
    method: 'PATCH',
    headers: headersComToken(),
  });
  return lerResposta(resposta, 'Erro ao desativar promoção');
}

export async function reativarPromocao(id) {
  const resposta = await fetch(`${API_URL}/promocoes/${id}/reativar`, {
    method: 'PATCH',
    headers: headersComToken(),
  });
  return lerResposta(resposta, 'Erro ao reativar promoção');
}

export async function atualizarPromocao(id, dados) {
  const resposta = await fetch(`${API_URL}/promocoes/${id}`, {
    method: 'PUT',
    headers: headersComToken(),
    body: JSON.stringify(dados),
  });
  return lerResposta(resposta, 'Erro ao atualizar promoção');
}
