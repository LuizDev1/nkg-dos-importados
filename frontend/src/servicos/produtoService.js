const API_URL = 'http://localhost:3000/api';

export async function listarProdutos() {
  const resposta = await fetch(`${API_URL}/produtos`);

  if (!resposta.ok) {
    throw new Error('Erro ao carregar produtos');
  }

  return resposta.json();
}