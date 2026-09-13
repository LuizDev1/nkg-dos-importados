const { MercadoPagoConfig, Order } = require('mercadopago');
const crypto = require('crypto');

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

async function criarOrder(pedido, itens) {
  const [primeiroNome, ...resto] = pedido.usuario_nome.split(' ');
  const sobrenome = resto.join(' ') || primeiroNome;
  const cpfLimpo = pedido.usuario_cpf ? pedido.usuario_cpf.replace(/\D/g, '') : '12345678909';
  const cepLimpo = pedido.cep ? pedido.cep.replace(/\D/g, '') : '70000000';
  const estadoUf = pedido.estado ? pedido.estado.trim().substring(0, 2).toUpperCase() : 'DF';

  const body = {
    type: 'online',
    processing_mode: 'manual',
    total_amount: String(Number(pedido.total).toFixed(2)), 
    external_reference: String(pedido.id),
    items: itens.map((item) => ({
      title: String(item.produto_nome),
      unit_price: String(Number(item.preco_unitario).toFixed(2)), 
      quantity: Number(item.quantidade),
    })),
payer: {
      email: String(pedido.usuario_email && pedido.usuario_email.includes('@testuser.com') ? pedido.usuario_email : 'test_user_1532400859416612283@testuser.com'), // <-- Força um e-mail de teste válido
      first_name: String(primeiroNome),
      last_name: String(sobrenome),
      identification: {
        type: 'CPF',
        number: cpfLimpo,
      },
      address: {
        zip_code: cepLimpo,
        street_name: String(pedido.rua || 'Rua Principal'),
        street_number: String(pedido.numero || '123'), 
        neighborhood: String(pedido.bairro || 'Centro'),
        city: String(pedido.cidade || 'Brasília'),
        state: estadoUf,
      },
    },
  };

  const resposta = await fetch('https://api.mercadopago.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      'X-Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify(body),
  });

  const dados = await resposta.json();
  console.log('resposta da order:', JSON.stringify(dados, null, 2));
  return dados;
}

async function buscarOrder(id) {
  const order = new Order(client);
  const resultado = await order.get({ id });
  return resultado;
}

module.exports = { criarOrder, buscarOrder };