const assert = require('node:assert/strict');
const test = require('node:test');
const { schemas } = require('../src/middlewares/validacao');

const base = { nome: 'Cliente Teste', email: 'cliente@exemplo.com', cpf: '529.982.247-25' };

test('aceita senha forte no cadastro', () => {
  assert.equal(schemas.autenticacao.safeParse({ ...base, senha: 'Senha@2026' }).success, true);
});

test('recusa novas senhas sem número ou símbolo', () => {
  assert.equal(schemas.autenticacao.safeParse({ ...base, senha: 'SenhaForte' }).success, false);
  assert.equal(schemas.autenticacao.safeParse({ ...base, senha: 'Senha1234' }).success, false);
});

test('informa cada requisito ausente da senha', () => {
  const resultado = schemas.autenticacao.safeParse({ ...base, senha: 'senha' });
  const mensagens = resultado.error.issues.map((erro) => erro.message).join(' ');
  assert.match(mensagens, /8 caracteres/);
  assert.match(mensagens, /maiúscula/);
  assert.match(mensagens, /número/);
  assert.match(mensagens, /símbolo/);
});
