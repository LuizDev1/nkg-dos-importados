export async function criarPedido(dadosPedido) {

  const token = localStorage.getItem('token'); 

  const resposta = await fetch('http://localhost:3000/api/pedidos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    },
    body: JSON.stringify(dadosPedido),
  });

  if (!resposta.ok) {
    const erro = await resposta.json();
    throw new Error(erro.mensagem || 'Erro ao processar o pedido');
  }

  return await resposta.json();
}