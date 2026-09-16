const test = require('node:test');
const assert = require('node:assert/strict');
const pool = require('../src/config/banco');
const Produto = require('../src/models/Produto');
const Variacao = require('../src/models/VariacaoProduto');
const { schemas } = require('../src/middlewares/validacao');
let produtoId;
test.after(async () => { if (produtoId) await pool.query('DELETE FROM produtos WHERE id = ?', [produtoId]); await pool.end(); });
test('cor e tamanho tem estoque separado e combinação unica', async () => {
  const dados = schemas.produto.parse({ nome: 'Teste Tamanhos', preco: 20, estoque_qtd: 0, estoque_minimo: 5, tamanhos: ['P', 'M'] });
  produtoId = await Produto.criar(dados);
  assert.deepEqual((await Produto.buscarPorId(produtoId)).tamanhos, ['P', 'M']);
  assert.deepEqual((await Produto.listarTodos()).find(p => p.id === produtoId).tamanhos, ['P', 'M']);
  const p = await Variacao.criar(produtoId, { nome: 'Branca', tamanho: 'P', estoque_qtd: 5 });
  const m = await Variacao.criar(produtoId, { nome: 'Branca', tamanho: 'M', estoque_qtd: 10 });
  assert.notEqual(p, m);
  assert.equal((await Variacao.buscarPorId(p)).estoque_qtd, 5);
  assert.equal((await Variacao.buscarPorId(m)).estoque_qtd, 10);
  assert.equal((await Produto.buscarPorId(produtoId)).estoque_qtd, 15);
  await assert.rejects(Variacao.criar(produtoId, { nome: 'Branca', tamanho: 'P', estoque_qtd: 1 }), { code: 'ER_DUP_ENTRY' });
  await assert.rejects(Variacao.criar(produtoId, { nome: 'Branca', tamanho: 'GG', estoque_qtd: 1 }), { code: 'TAMANHO_INVALIDO' });
});

test('aceita variacao somente com tamanho e item de pedido com tamanho', () => {
  assert.deepEqual(
    schemas.variacaoProduto.parse({ nome: '', tamanho: 'M', estoque_qtd: 10 }),
    { nome: '', tamanho: 'M', estoque_qtd: 10, ativo: true }
  );
  const pedido = schemas.pedido.parse({
    tipo_entrega: 'envio',
    endereco_entrega: 'Rua de teste, 10',
    telefone_contato: '86999999999',
    itens: [{ produto_id: 1, tamanho: 'M', quantidade: 1 }],
  });
  assert.equal(pedido.itens[0].tamanho, 'M');
});
