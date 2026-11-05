import test from 'node:test';
import assert from 'node:assert/strict';
import { estoqueDoCartao, formatarNota, textoAvaliacoes, textoNota, textoTamanhosIndisponiveis } from '../src/servicos/produtoVisual.mjs';

test('formatarNota usa vírgula e uma casa decimal', () => {
  assert.equal(formatarNota(4.7), '4,7');
  assert.equal(formatarNota('3.5'), '3,5');
  assert.equal(formatarNota(5), '5,0');
  assert.equal(formatarNota('abc'), '');
});

test('textoAvaliacoes respeita singular e plural', () => {
  assert.equal(textoAvaliacoes(1), '1 avaliação');
  assert.equal(textoAvaliacoes(2), '2 avaliações');
  assert.equal(textoAvaliacoes(0), '0 avaliações');
  assert.equal(textoAvaliacoes(undefined), '0 avaliações');
});

test('textoNota descreve a nota inteira para leitor de tela', () => {
  assert.equal(textoNota(4.7, 3), 'Nota 4,7 de 5, 3 avaliações');
  assert.equal(textoNota('5.0', 1), 'Nota 5,0 de 5, 1 avaliação');
  assert.equal(textoNota(4), 'Nota 4 de 5');
});

test('estoqueDoCartao não expõe quantidade e só sinaliza baixo ou zerado', () => {
  assert.equal(estoqueDoCartao({ estoque_qtd: 0, estoque_minimo: 5 }), 'sem');
  assert.equal(estoqueDoCartao({ estoque_qtd: 3, estoque_minimo: 5 }), 'baixo');
  assert.equal(estoqueDoCartao({ estoque_qtd: 5, estoque_minimo: 5 }), 'baixo');
  assert.equal(estoqueDoCartao({ estoque_qtd: 6, estoque_minimo: 5 }), null);
  assert.equal(estoqueDoCartao({ estoque_qtd: 12 }), null);
  assert.equal(estoqueDoCartao({}), null);
});

test('textoTamanhosIndisponiveis monta o motivo com a cor em minúsculas', () => {
  assert.equal(textoTamanhosIndisponiveis(['M'], 'Preta'), 'Tamanho M indisponível para a cor preta.');
  assert.equal(textoTamanhosIndisponiveis(['M', 'GG'], 'Off-white'), 'Tamanhos M e GG indisponíveis para a cor off-white.');
  assert.equal(textoTamanhosIndisponiveis(['P'], ''), 'Tamanho P indisponível.');
  assert.equal(textoTamanhosIndisponiveis([], 'Preta'), '');
});
