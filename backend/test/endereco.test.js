const test = require('node:test');
const assert = require('node:assert/strict');
const Endereco = require('../src/models/Endereco');
const Usuario = require('../src/models/Usuario');
const pool = require('../src/config/banco');
let usuarioId;
test.after(async () => {
  if (usuarioId) await pool.query('DELETE FROM usuarios WHERE id = ?', [usuarioId]);
  await pool.end();
});
test('remover principal promove restante e remover ultimo deixa lista vazia', async () => {
  usuarioId = await Usuario.criar({ nome: 'Teste Endereco', email: 'endereco-' + Date.now() + '@teste.com', senha: 'Senha@2026', perfil: 'cliente', cpf: '52998224725' });
  const dados = { apelido: 'Casa', cep: '64900000', rua: 'Rua Teste', numero: '1', complemento: '', bairro: 'Centro', cidade: 'Bom Jesus', estado: 'PI', telefone: '', principal: false };
  const primeiro = await Endereco.criar(usuarioId, dados);
  const segundo = await Endereco.criar(usuarioId, { ...dados, apelido: 'Outro', principal: true });
  assert.equal(await Endereco.remover(usuarioId, segundo), 1);
  let restantes = await Endereco.listar(usuarioId);
  assert.equal(restantes.length, 1);
  assert.equal(restantes[0].id, primeiro);
  assert.equal(Number(restantes[0].principal), 1);
  const terceiro = await Endereco.criar(usuarioId, dados);
  assert.equal(await Endereco.remover(usuarioId, terceiro), 1);
  assert.equal(Number((await Endereco.listar(usuarioId))[0].principal), 1);
  assert.equal(await Endereco.remover(usuarioId, -1), 0);
  assert.equal(await Endereco.remover(usuarioId, primeiro), 1);
  assert.deepEqual(await Endereco.listar(usuarioId), []);
});
