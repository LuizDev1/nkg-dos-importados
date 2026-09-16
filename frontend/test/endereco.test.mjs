import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const fonte = fs.readFileSync(new URL('../src/paginas/publicas/Checkout.jsx', import.meta.url), 'utf8');
const funcao = fonte.slice(fonte.indexOf('  function usarEndereco('), fonte.indexOf('  if (itens.length === 0 || !usuario)'));
test('endereco salvo preenche campos e invalida frete anterior', () => {
  let formulario = {}; let selecionado; let cotacao = {}; let servico = 'pac';
  const contexto = { versaoCep: { current: 0 }, formatarCep: v => v, formatarTelefone: v => v,
    setEnderecoSelecionadoId: v => { selecionado = v; }, setFormulario: fn => { formulario = fn(formulario); },
    setCotacaoFrete: v => { cotacao = v; }, setFreteServicoId: v => { servico = v; } };
  vm.createContext(contexto); vm.runInContext(funcao, contexto);
  contexto.usarEndereco({ id: 1, cep: '64900000', rua: 'Rua Teste', numero: '274', bairro: 'Centro', cidade: 'Bom Jesus', estado: 'PI' });
  assert.equal(formulario.rua, 'Rua Teste'); assert.equal(formulario.numero, '274');
  assert.equal(formulario.cep, '64900000'); assert.equal(selecionado, '1');
  assert.equal(cotacao, null); assert.equal(servico, ''); assert.equal(contexto.versaoCep.current, 1);
});
