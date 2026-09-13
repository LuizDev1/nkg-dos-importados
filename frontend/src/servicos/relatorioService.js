const API_URL = 'http://localhost:3000/api';

function headersComToken() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
}

export async function buscarRelatorioMensal() {
  const resposta = await fetch(`${API_URL}/relatorios/mensal`, {
    headers: headersComToken(),
  });

  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.mensagem || 'Erro ao carregar relatório');
  }

  return dados;
}
