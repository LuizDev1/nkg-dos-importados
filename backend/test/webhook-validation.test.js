const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const test = require('node:test');
const request = require('supertest');
const app = require('../src/app');
const Usuario = require('../src/models/Usuario');
const pool = require('../src/config/banco');
const jwt = require('jsonwebtoken');
const melhorEnvioService = require('../src/services/melhorEnvioService');
const usuariosTeste = [];
const produtosTeste = [];

async function criarUsuarioTeste(email, senha, perfil = 'cliente', status = 'ativo') {
  const id = await Usuario.criar({
    nome: 'Teste Usuário',
    email,
    senha,
    perfil,
    cpf: '123.456.789-09',
  });

  await pool.query(
    'UPDATE usuarios SET status = ? WHERE id = ?',
    [status, id]
  );

  usuariosTeste.push(id);
  return { id, email, senha };
}

test.after(async () => {
  if (usuariosTeste.length) {
    const [pedidos] = await pool.query(
      'SELECT id FROM pedidos WHERE usuario_id IN (?)',
      [usuariosTeste]
    );
    const pedidosIds = pedidos.map((pedido) => pedido.id);

    if (pedidosIds.length) {
      await pool.query('DELETE FROM itens_pedido WHERE pedido_id IN (?)', [pedidosIds]);
      await pool.query('DELETE FROM pedidos WHERE id IN (?)', [pedidosIds]);
    }

    await pool.query('DELETE FROM usuarios WHERE id IN (?)', [usuariosTeste]);
  }

  if (produtosTeste.length) {
    await pool.query('DELETE FROM produtos WHERE id IN (?)', [produtosTeste]);
  }
  await pool.end();
});

test('frete para o CEP de origem é gratuito', async () => {
  const cotacao = await melhorEnvioService.cotar({
    cepDestino: '64.900-000',
    itens: [{ produto_id: 1, quantidade: 1 }],
  });

  assert.equal(cotacao.gratuito, true);
  assert.equal(cotacao.valor, 0);
  assert.equal(cotacao.servico_id, 'gratis-mesmo-cep');
});

test('frete fora do CEP de origem exige token do Melhor Envio', async () => {
  const tokenAnterior = process.env.MELHOR_ENVIO_TOKEN;
  delete process.env.MELHOR_ENVIO_TOKEN;

  await assert.rejects(
    melhorEnvioService.cotar({
      cepDestino: '01001-000',
      itens: [{ produto_id: 1, quantidade: 1 }],
    }),
    /MELHOR_ENVIO_TOKEN não configurado/
  );

  if (tokenAnterior === undefined) delete process.env.MELHOR_ENVIO_TOKEN;
  else process.env.MELHOR_ENVIO_TOKEN = tokenAnterior;
});

test('login deve bloquear usuário inativo', async () => {
  const email = `bloqueado-${Date.now()}@teste.com`;
  await criarUsuarioTeste(email, 'senha123', 'cliente', 'bloqueado');

  const resposta = await request(app)
    .post('/api/auth/login')
    .send({ email, senha: 'senha123' });

  assert.equal(resposta.status, 403);
  assert.match(resposta.body.mensagem, /bloqueado/i);
});

test('login deve gerar token para usuário ativo', async () => {
  const email = `ativo-${Date.now()}@teste.com`;
  await criarUsuarioTeste(email, 'senha123', 'cliente', 'ativo');

  const resposta = await request(app)
    .post('/api/auth/login')
    .send({ email, senha: 'senha123' });

  assert.equal(resposta.status, 200);
  assert.ok(resposta.body.token);
  assert.equal(resposta.body.usuario.email, undefined);
  assert.equal(resposta.body.usuario.perfil, 'cliente');
});

test('pedido de outro cliente deve ser bloqueado', async () => {
  const dono = await criarUsuarioTeste(`dono-${Date.now()}@teste.com`, 'senha123');
  const intruso = await criarUsuarioTeste(`intruso-${Date.now()}@teste.com`, 'senha123');

  const [pedido] = await pool.query(
    'INSERT INTO pedidos (usuario_id, tipo_entrega, endereco_entrega, telefone_contato, total) VALUES (?, ?, ?, ?, ?)',
    [dono.id, 'envio', 'Rua A, 123', '(61)99999-9999', 50.00]
  );

  const token = jwt.sign({ id: intruso.id, perfil: 'cliente' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const resposta = await request(app)
    .get(`/api/pedidos/${pedido.insertId}`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(resposta.status, 403);
  assert.match(resposta.body.mensagem, /acesso/i);
});

test('webhook deve rejeitar assinatura inválida', async () => {
  process.env.MERCADOPAGO_WEBHOOK_SECRET = 'segredo-teste';

  const resposta = await request(app)
    .post('/api/pagamentos/webhook?data.id=123&type=payment')
    .set('x-signature', 'assinatura-invalida')
    .type('json')
    .send({ id: 'evt_123' });

  assert.equal(resposta.status, 401);
  assert.match(resposta.text, /assinatura|webhook/i);
});

test('webhook deve validar assinatura correta antes de processar', async () => {
  process.env.MERCADOPAGO_WEBHOOK_SECRET = 'segredo-teste';

  const payload = JSON.stringify({ id: 'evt_123' });
  const assinatura = crypto.createHmac('sha256', process.env.MERCADOPAGO_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  const resposta = await request(app)
    .post('/api/pagamentos/webhook?data.id=123&type=payment')
    .set('x-signature', assinatura)
    .type('json')
    .send(JSON.parse(payload));

  assert.notEqual(resposta.status, 401);
});

test('cliente pode cancelar pedido e receber estoque de volta', async () => {
  const usuario = await criarUsuarioTeste(`cancel-${Date.now()}@teste.com`, 'senha123');
  const token = jwt.sign({ id: usuario.id, perfil: 'cliente' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const [produto] = await pool.query(
    'INSERT INTO produtos (nome, categoria, preco, tag, foto_url, estoque_qtd, ativo) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ['Produto Cancelamento', 'Acessórios', 49.90, 'promo', 'https://img.test/produto.jpg', 3, true]
  );
  produtosTeste.push(produto.insertId);

  const [pedido] = await pool.query(
    'INSERT INTO pedidos (usuario_id, payment_status, payment_id, tipo_entrega, endereco_entrega, telefone_contato, total) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [usuario.id, 'pago', 'pay_123', 'envio', 'Rua B, 456', '(61)98888-7777', 99.80]
  );

  await pool.query(
    'INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)',
    [pedido.insertId, produto.insertId, 2, 49.90]
  );

  const resposta = await request(app)
    .patch(`/api/pedidos/${pedido.insertId}/cancelar`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(resposta.status, 200);
  assert.match(resposta.body.mensagem, /cancelado/i);

  const [pedidoAtualizado] = await pool.query('SELECT payment_status FROM pedidos WHERE id = ?', [pedido.insertId]);
  const [estoqueAtualizado] = await pool.query('SELECT estoque_qtd FROM produtos WHERE id = ?', [produto.insertId]);

  assert.equal(pedidoAtualizado[0].payment_status, 'cancelado');
  assert.equal(Number(estoqueAtualizado[0].estoque_qtd), 5);
});

test('cancelamento de pagamento pendente não cria reembolso', async () => {
  const usuario = await criarUsuarioTeste(`pendente-${Date.now()}@teste.com`, 'senha123');
  const token = jwt.sign({ id: usuario.id, perfil: 'cliente' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const [pedido] = await pool.query(
    `INSERT INTO pedidos
      (usuario_id, idempotency_key, payment_status, payment_id, tipo_entrega,
       endereco_entrega, telefone_contato, subtotal, total)
     VALUES (?, ?, 'pendente', 'pay_pending', 'envio', ?, ?, ?, ?)`,
    [usuario.id, `pendente-${Date.now()}`, 'Rua Pendente, 1', '(61)99999-3333', 30, 30]
  );

  const resposta = await request(app)
    .patch(`/api/pedidos/${pedido.insertId}/cancelar`)
    .set('Authorization', `Bearer ${token}`);

  assert.equal(resposta.status, 200);

  const [pedidoAtualizado] = await pool.query(
    'SELECT payment_status, status_pedido FROM pedidos WHERE id = ?',
    [pedido.insertId]
  );
  assert.equal(pedidoAtualizado[0].payment_status, 'cancelado');
  assert.equal(pedidoAtualizado[0].status_pedido, 'cancelado');
});

test('criação de pedido é idempotente e não duplica reserva de estoque', async () => {
  const usuario = await criarUsuarioTeste(`idempotente-${Date.now()}@teste.com`, 'senha123');
  const token = jwt.sign({ id: usuario.id, perfil: 'cliente' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const [produto] = await pool.query(
    'INSERT INTO produtos (nome, categoria, preco, estoque_qtd, ativo) VALUES (?, ?, ?, ?, ?)',
    ['Produto Idempotência', 'Testes', 25.00, 4, true]
  );
  produtosTeste.push(produto.insertId);

  const payload = {
    tipo_entrega: 'entrega_local',
    endereco_entrega: 'Rua Idempotência, 10',
    telefone_contato: '(61)99999-1111',
    itens: [{ produto_id: produto.insertId, quantidade: 2, preco_unitario: 25 }],
  };
  const chave = `teste-${Date.now()}`;

  const primeira = await request(app)
    .post('/api/pedidos')
    .set('Authorization', `Bearer ${token}`)
    .set('Idempotency-Key', chave)
    .send(payload);

  const segunda = await request(app)
    .post('/api/pedidos')
    .set('Authorization', `Bearer ${token}`)
    .set('Idempotency-Key', chave)
    .send(payload);

  assert.equal(primeira.status, 201);
  assert.equal(segunda.status, 200);
  assert.equal(segunda.body.id, primeira.body.id);

  const [pedidos] = await pool.query(
    'SELECT COUNT(*) AS quantidade FROM pedidos WHERE id = ?',
    [primeira.body.id]
  );
  const [estoque] = await pool.query(
    'SELECT estoque_qtd FROM produtos WHERE id = ?',
    [produto.insertId]
  );

  assert.equal(Number(pedidos[0].quantidade), 1);
  assert.equal(Number(estoque[0].estoque_qtd), 2);

  await pool.query('DELETE FROM itens_pedido WHERE pedido_id = ?', [primeira.body.id]);
  await pool.query('DELETE FROM pedidos WHERE id = ?', [primeira.body.id]);
  await pool.query('DELETE FROM produtos WHERE id = ?', [produto.insertId]);
  await pool.query('DELETE FROM usuarios WHERE id = ?', [usuario.id]);
});

test('status operacional respeita a ordem de expedição', async () => {
  const admin = await criarUsuarioTeste(`admin-status-${Date.now()}@teste.com`, 'senha123', 'admin');
  const cliente = await criarUsuarioTeste(`cliente-status-${Date.now()}@teste.com`, 'senha123');
  const token = jwt.sign({ id: admin.id, perfil: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

  const [pedido] = await pool.query(
    `INSERT INTO pedidos
      (usuario_id, idempotency_key, payment_status, status_pedido, tipo_entrega,
       endereco_entrega, telefone_contato, subtotal, total)
     VALUES (?, ?, 'pago', 'pago', 'entrega_local', ?, ?, ?, ?)`,
    [cliente.id, `status-${Date.now()}`, 'Rua Status, 1', '(61)99999-2222', 30, 30]
  );

  const salto = await request(app)
    .patch(`/api/pedidos/${pedido.insertId}/status-operacional`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status_pedido: 'entregue' });

  assert.equal(salto.status, 409);

  const preparacao = await request(app)
    .patch(`/api/pedidos/${pedido.insertId}/status-operacional`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status_pedido: 'em_preparacao' });

  assert.equal(preparacao.status, 200);

  const [atualizado] = await pool.query(
    'SELECT status_pedido FROM pedidos WHERE id = ?',
    [pedido.insertId]
  );
  assert.equal(atualizado[0].status_pedido, 'em_preparacao');

  await pool.query('DELETE FROM pedidos WHERE id = ?', [pedido.insertId]);
  await pool.query('DELETE FROM usuarios WHERE id IN (?, ?)', [admin.id, cliente.id]);
});
