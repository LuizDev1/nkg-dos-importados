const { MercadoPagoConfig, Order } = require('mercadopago');
const { normalizarCpf, validarCpf } = require('../utils/cpf');
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

const FRONTEND_URL = (
  process.env.FRONTEND_URL || 'http://localhost:5173'
).replace(/\/$/, '');

function montarItensOrder(pedido, itens) {
  const linhas = itens.map((item) => ({
    titulo: String(item.produto_nome),
    quantidade: Number(item.quantidade),
    totalCentavos: Math.round(Number(item.preco_unitario) * Number(item.quantidade) * 100),
  }));
  const subtotalCentavos = linhas.reduce((total, linha) => total + linha.totalCentavos, 0);
  const descontoCentavos = Math.min(
    subtotalCentavos,
    Math.max(0, Math.round(Number(pedido.desconto || 0) * 100))
  );
  let descontoDistribuido = 0;
  const itensOrder = [];

  linhas.forEach((linha, indice) => {
    const descontoLinha = indice === linhas.length - 1
      ? descontoCentavos - descontoDistribuido
      : Math.round(descontoCentavos * linha.totalCentavos / subtotalCentavos);
    descontoDistribuido += descontoLinha;
    const totalLinha = linha.totalCentavos - descontoLinha;
    const quantidade = linha.quantidade;
    const precoUnitarioCentavos = Math.floor(totalLinha / quantidade);
    const ultimaUnidadeCentavos = totalLinha - (precoUnitarioCentavos * (quantidade - 1));

    if (quantidade > 1 && ultimaUnidadeCentavos !== precoUnitarioCentavos) {
      itensOrder.push({
        title: linha.titulo,
        unit_price: (precoUnitarioCentavos / 100).toFixed(2),
        quantity: quantidade - 1,
      });
      itensOrder.push({
        title: linha.titulo,
        unit_price: (ultimaUnidadeCentavos / 100).toFixed(2),
        quantity: 1,
      });
    } else {
      itensOrder.push({
        title: linha.titulo,
        unit_price: (precoUnitarioCentavos / 100).toFixed(2),
        quantity: quantidade,
      });
    }
  });

  if (Number(pedido.frete) > 0) {
    itensOrder.push({
      title: 'Frete',
      unit_price: Number(pedido.frete).toFixed(2),
      quantity: 1,
    });
  }

  return itensOrder;
}

async function criarOrder(pedido, itens) {
  if (!validarCpf(pedido.usuario_cpf)) {
    const erro = new Error('Informe um CPF válido antes de iniciar o pagamento');
    erro.status = 400;
    throw erro;
  }
  const [primeiroNome, ...resto] = pedido.usuario_nome.split(' ');
  const sobrenome = resto.join(' ') || primeiroNome;
  const cpfLimpo = normalizarCpf(pedido.usuario_cpf);
  const cepLimpo = pedido.cep ? pedido.cep.replace(/\D/g, '') : '70000000';
  const estadoUf = pedido.estado ? pedido.estado.trim().substring(0, 2).toUpperCase() : 'DF';

  const body = {
    type: 'online',
    processing_mode: 'manual',
    total_amount: String(Number(pedido.total).toFixed(2)),
    external_reference: String(pedido.id),
    items: montarItensOrder(pedido, itens),
    payer: {
      email: String(pedido.usuario_email && pedido.usuario_email.includes('@testuser.com') ? pedido.usuario_email : 'test_user_1532400859416612283@testuser.com'),
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
    config: {
      online: {
        success_url: `${FRONTEND_URL}/pedido/${pedido.id}/sucesso`,
        failure_url: `${FRONTEND_URL}/pedido/${pedido.id}/falha`,
        pending_url: `${FRONTEND_URL}/pedido/${pedido.id}/pendente`,
        auto_return: 'approved',
      },
    },
  };

  const resposta = await fetch('https://api.mercadopago.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      'X-Idempotency-Key': `pedido-${pedido.id}`,
    },
    body: JSON.stringify(body),
  });

  const dados = await resposta.json();
  console.log('resposta da order:', JSON.stringify(dados, null, 2));

  if (!resposta.ok) {
    const detalhe = dados.message
      || dados.error
      || dados.cause?.map((causa) => causa.description).join('; ')
      || JSON.stringify(dados)
      || 'resposta inválida';
    throw new Error(
      `Mercado Pago (${resposta.status}) ao criar pagamento: ${detalhe}`
    );
  }

  return dados;
}

async function buscarOrder(id) {
  const order = new Order(client);
  const resultado = await order.get({ id });
  return resultado;
}

async function buscarPagamento(id) {
  const resposta = await fetch(
    `https://api.mercadopago.com/v1/payments/${encodeURIComponent(id)}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
    }
  );
  const dados = await resposta.json();

  if (!resposta.ok) {
    const detalhe = dados.message || dados.error || 'resposta inválida';
    throw new Error(
      `Mercado Pago (${resposta.status}) ao consultar pagamento: ${detalhe}`
    );
  }

  return dados;
}

async function solicitarReembolso(paymentId) {
  const resposta = await fetch(
    `https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}/refunds`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({}),
    }
  );

  const dados = await resposta.json();

  if (!resposta.ok) {
    const detalhe = dados.message || dados.error || 'resposta inválida';
    throw new Error(
      `Mercado Pago (${resposta.status}) ao solicitar reembolso: ${detalhe}`
    );
  }

  return dados;
}

module.exports = { criarOrder, buscarOrder, buscarPagamento, solicitarReembolso };
