import test from 'node:test';
import assert from 'node:assert/strict';
import { classesBotao, classesBotaoIcone, classesCampo, classesSelo, classesSuperficie, tomDoStatus } from '../src/componentes/ui/estilos.mjs';
import { formatarMoeda } from '../src/servicos/formatadores.mjs';

test('formatarMoeda usa o formato brasileiro e não quebra com valor inválido', () => {
  assert.equal(formatarMoeda(349.9), 'R$ 349,90');
  assert.equal(formatarMoeda('1299.9'), 'R$ 1.299,90');
  assert.equal(formatarMoeda(0), 'R$ 0,00');
  assert.equal(formatarMoeda(1234567.891), 'R$ 1.234.567,89');
  assert.equal(formatarMoeda('abc'), '—');
  assert.equal(formatarMoeda(undefined), '—');
});

test('formatarMoeda dá o mesmo resultado do toLocaleString que as telas usavam', () => {
  for (const valor of [0, 9.9, 129.9, 1299.9, 15000, '708.90']) {
    assert.equal(formatarMoeda(valor), Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  }
});

test('tomDoStatus mapeia os status reais sem depender de acento ou caixa', () => {
  assert.equal(tomDoStatus('pago'), 'sucesso');
  assert.equal(tomDoStatus('Entregue'), 'sucesso');
  assert.equal(tomDoStatus('ativa'), 'sucesso');
  assert.equal(tomDoStatus('cancelado'), 'erro');
  assert.equal(tomDoStatus('recusado'), 'erro');
  assert.equal(tomDoStatus('bloqueado'), 'erro');
  assert.equal(tomDoStatus('inativo'), 'erro');
  assert.equal(tomDoStatus('pendente'), 'aviso');
  assert.equal(tomDoStatus('aguardando_pagamento'), 'aviso');
  assert.equal(tomDoStatus('reembolso_pendente'), 'aviso');
  assert.equal(tomDoStatus('em_preparacao'), 'info');
  assert.equal(tomDoStatus('enviado'), 'info');
  assert.equal(tomDoStatus('desconhecido'), 'neutro');
  assert.equal(tomDoStatus(null), 'neutro');
});

test('botão usa só tokens, tem altura mínima por tamanho e trata desabilitado', () => {
  const primario = classesBotao();
  assert.match(primario, /bg-marca/);
  assert.match(primario, /text-texto-inverso/);
  assert.match(primario, /min-h-11/);
  assert.match(primario, /disabled:opacity-50/);
  assert.match(classesBotao({ tamanho: 'lg', larguraTotal: true }), /min-h-12.*w-full|w-full.*min-h-12/);
  assert.match(classesBotao({ variante: 'destrutivo' }), /text-erro/);
  assert.doesNotMatch(classesBotao({ variante: 'secundario' }), /#[0-9a-f]{3,6}/i);
  assert.match(classesBotao({ variante: 'inexistente' }), /bg-marca/);
});

test('campo, superfície, selo e botão de ícone usam tokens e valores padrão seguros', () => {
  assert.match(classesCampo(), /border-borda-forte/);
  assert.match(classesCampo(), /\btext-base\b/);
  assert.match(classesCampo(), /\bsm:text-sm\b/);
  assert.match(classesCampo({ as: 'textarea' }), /min-h-24/);
  assert.match(classesSuperficie(), /rounded-cartao bg-superficie/);
  assert.match(classesSuperficie({ sombra: true }), /shadow-nivel-2/);
  assert.doesNotMatch(classesSuperficie({ borda: false }), /border/);
  assert.match(classesSelo('aviso'), /bg-aviso-fundo/);
  assert.match(classesSelo('qualquer'), /bg-superficie-elevada/);
  assert.match(classesBotaoIcone(), /h-10 w-10/);
  assert.match(classesBotaoIcone({ tamanho: 'sm' }), /h-8 w-8/);
});
