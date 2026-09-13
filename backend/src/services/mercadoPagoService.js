const { MercadoPagoConfig, Order } = require('mercadopago');

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

const crypto = require('crypto');

async function criarOrder(pedido, itens) {
  const [primeiroNome, ...resto] = pedido.usuario_nome.split(' ');
  const sobrenome = resto.join(' ') || primeiroNome;

  const body = {
  type: 'online',
  processing_mode: 'manual',
  total_amount: pedido.total,
  external_reference: String(pedido.id),
  items: itens.map((item) => ({
    title: item.produto_nome,
    unit_price: String(item.preco_unitario),
    quantity: item.quantidade,
  })),
  payer: {
    email: pedido.usuario_email,
    first_name: primeiroNome,
    last_name: sobrenome,
    identification: {
      type: 'CPF',
      number: pedido.usuario_cpf,
    },
    address: {
      zip_code: pedido.cep,
      street_name: pedido.rua,
      street_number: pedido.numero,
      neighborhood: pedido.bairro,
      city: pedido.cidade,
      state: pedido.estado,
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
