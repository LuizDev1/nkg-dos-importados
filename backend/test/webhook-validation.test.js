const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const test = require('node:test');
const request = require('supertest');
const app = require('../src/app');
const Usuario = require('../src/models/Usuario');
const pool = require('../src/config/banco');
const jwt = require('jsonwebtoken');

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

  return { id, email, senha };
}

test.after(async () => {
  await pool.end();
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
