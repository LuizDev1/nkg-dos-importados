const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function cotarFrete(cepDestino, itens, servicoId = '') {
  const token = localStorage.getItem('token');
  const resposta = await fetch(`${API_URL}/fretes/cotacao`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({
      cep_destino: cepDestino,
      itens,
      ...(servicoId ? { servico_id: servicoId } : {}),
    }),
  });
  const dados = await resposta.json();
  if (!resposta.ok) throw new Error(dados.mensagem || 'Não foi possível calcular o frete');
  return dados;
}