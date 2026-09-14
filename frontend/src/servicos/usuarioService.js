const API_URL = import.meta.env.VITE_API_URL || '/api';

function headers() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };
}

export async function listarClientes(busca = '') {
  const resposta = await fetch(
    `${API_URL}/usuarios/clientes?busca=${encodeURIComponent(busca)}`,
    { headers: headers() }
  );

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao listar clientes');
  }

  return dados;
}

export async function atualizarStatusCliente(id, status) {
  const resposta = await fetch(`${API_URL}/usuarios/${id}/status`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ status }),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao atualizar cliente');
  }

  return dados;
}