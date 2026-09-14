const API_URL = import.meta.env.VITE_API_URL || '/api';

function headersComToken() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
}

export async function criarPedido(dadosPedido) {
  const resposta = await fetch(`${API_URL}/pedidos`, {
    method: 'POST',
    headers: headersComToken(),
    body: JSON.stringify(dadosPedido),
  });

  if (!resposta.ok) {
    const erro = await resposta.json();
    throw new Error(erro.mensagem || 'Erro ao processar o pedido');
  }

  return await resposta.json();
}

export async function listarPedidosAdmin() {
  const resposta = await fetch(`${API_URL}/pedidos`, {
    headers: headersComToken(),
  });

  if (!resposta.ok) {
    const erro = await resposta.json();
    throw new Error(erro.mensagem || 'Erro ao carregar pedidos');
  }

  return resposta.json();
}

export async function atualizarStatusPedido(id, payment_status) {
  const resposta = await fetch(`${API_URL}/pedidos/${id}/status`, {
    method: 'PATCH',
    headers: headersComToken(),
    body: JSON.stringify({ payment_status }),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao atualizar status');
  }

  return dados;
}

export async function atualizarCodigoRastreio(id, codigo_rastreio) {
  const resposta = await fetch(`${API_URL}/pedidos/${id}/rastreio`, {
    method: 'PATCH',
    headers: headersComToken(),
    body: JSON.stringify({ codigo_rastreio }),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao atualizar rastreio');
  }

  return dados;
}

export async function listarPedidosPorUsuario(usuarioId) {
  const token = localStorage.getItem('token');

  const resposta = await fetch(
    `${API_URL}/pedidos/usuario/${usuarioId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao buscar pedidos do cliente');
  }

  return dados;
}

export async function buscarPedido(id) {
  const resposta = await fetch(`${API_URL}/pedidos/${id}`, {
    headers: headersComToken(),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao buscar pedido');
  }

  return dados;
}
