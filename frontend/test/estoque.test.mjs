import test from 'node:test';
import assert from 'node:assert/strict';
import { limitarQuantidade, estoqueDoItem, atualizarEstoqueCarrinho } from '../src/utilitarios/estoqueCarrinho.mjs';
test('setinha e quantidade digitada respeitam estoque de 20', () => {
  assert.equal(limitarQuantidade(21, 20), 20);
  assert.equal(limitarQuantidade(58, 20), 20);
  assert.equal(limitarQuantidade(19, 20), 19);
  assert.equal(limitarQuantidade(1.5, 20), null);
});
test('estoque da variacao e variacao removida', () => {
  const produto = { estoque_qtd: 20, variacoes: [{ id: 2, estoque_qtd: 3 }] };
  assert.equal(estoqueDoItem(produto, { variacao_id: 2 }), 3);
  assert.equal(estoqueDoItem(produto, { variacao_id: 9 }), 0);
  assert.equal(estoqueDoItem(produto, {}), 20);
  assert.equal(limitarQuantidade(3, 0), 0);
});

test('remove item esgotado e preserva item disponivel', () => {
  const itens = [{ produto_id: 1, quantidade: 0 }, { produto_id: 2, quantidade: 46 }];
  const produtos = new Map([['1', { estoque_qtd: 0 }], ['2', { estoque_qtd: 50 }]]);
  const atualizados = atualizarEstoqueCarrinho(itens, produtos);
  assert.equal(atualizados.length, 1);
  assert.equal(atualizados[0].produto_id, 2);
  assert.equal(atualizados[0].quantidade, 46);
  assert.deepEqual(atualizarEstoqueCarrinho([itens[0]], produtos), []);
});
test('remove variacao esgotada e corrige quantidade acima do estoque', () => {
  const itens = [{ produto_id: 1, variacao_id: 2, quantidade: 2 }, { produto_id: 1, variacao_id: 3, quantidade: 58 }];
  const produtos = new Map([['1', { estoque_qtd: 20, variacoes: [{ id: 2, estoque_qtd: 0 }, { id: 3, estoque_qtd: 20 }] }]]);
  const atualizados = atualizarEstoqueCarrinho(itens, produtos);
  assert.equal(atualizados.length, 1);
  assert.equal(atualizados[0].variacao_id, 3);
  assert.equal(atualizados[0].quantidade, 20);
});
