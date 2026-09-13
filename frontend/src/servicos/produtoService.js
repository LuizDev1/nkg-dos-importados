const API_URL = 'http://localhost:3000/api';

function headersComToken() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
}

export async function listarProdutos() {
  const resposta = await fetch(`${API_URL}/produtos`);

  if (!resposta.ok) {
    throw new Error('Erro ao carregar produtos');
  }

  return resposta.json();
}

export async function buscarProduto(id) {
  const resposta = await fetch(`${API_URL}/produtos/${id}`);

  if (!resposta.ok) {
    throw new Error('Produto não encontrado');
  }

  return resposta.json();
}

export async function listarProdutosAdmin() {
  const resposta = await fetch(`${API_URL}/produtos/admin`, {
    headers: headersComToken(),
  });

  if (!resposta.ok) {
    throw new Error('Erro ao carregar produtos');
  }

  return resposta.json();
}

export async function criarProduto(dadosProduto) {
  const resposta = await fetch(`${API_URL}/produtos`, {
    method: 'POST',
    headers: headersComToken(),
    body: JSON.stringify(dadosProduto),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao criar produto');
  }

  return dados;
}

export async function atualizarProduto(id, dadosProduto) {
  const resposta = await fetch(`${API_URL}/produtos/${id}`, {
    method: 'PUT',
    headers: headersComToken(),
    body: JSON.stringify(dadosProduto),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao atualizar produto');
  }

  return dados;
}

export async function removerProduto(id) {
  const resposta = await fetch(`${API_URL}/produtos/${id}/remover`, {
    method: 'PATCH',
    headers: headersComToken(),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao remover produto');
  }

  return dados;
}

export async function reativarProduto(id) {
  const resposta = await fetch(`${API_URL}/produtos/${id}/reativar`, {
    method: 'PATCH',
    headers: headersComToken(),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao reativar produto');
  }

  return dados;
}
