const test = require('node:test');
const assert = require('node:assert/strict');

test('criptografia autenticada protege e recupera dados sensíveis', () => {
  const chaveAnterior = process.env.DATA_ENCRYPTION_KEY;
  const idAnterior = process.env.DATA_ENCRYPTION_KEY_ID;
  const chavesAnteriores = process.env.DATA_ENCRYPTION_PREVIOUS_KEYS;
  process.env.DATA_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');
  process.env.DATA_ENCRYPTION_KEY_ID = 'chave-antiga';
  const { criptografar, descriptografar, recriptografar } = require('../src/utils/criptografia');

  try {
    const cifrado = criptografar('12345678901');
    assert.match(cifrado, /^enc:v2:chave-antiga:/);
    assert.notEqual(cifrado, '12345678901');
    assert.equal(descriptografar(cifrado), '12345678901');
    assert.equal(descriptografar('dado-legado'), 'dado-legado');

    const adulterado = `${cifrado.slice(0, -1)}${cifrado.endsWith('A') ? 'B' : 'A'}`;
    assert.throws(() => descriptografar(adulterado));

    process.env.DATA_ENCRYPTION_PREVIOUS_KEYS = `chave-antiga:${process.env.DATA_ENCRYPTION_KEY}`;
    process.env.DATA_ENCRYPTION_KEY = Buffer.alloc(32, 9).toString('base64');
    process.env.DATA_ENCRYPTION_KEY_ID = 'chave-nova';
    assert.equal(descriptografar(cifrado), '12345678901');
    const rotacionado = recriptografar(cifrado);
    assert.match(rotacionado, /^enc:v2:chave-nova:/);
    assert.equal(descriptografar(rotacionado), '12345678901');
  } finally {
    if (chaveAnterior === undefined) delete process.env.DATA_ENCRYPTION_KEY;
    else process.env.DATA_ENCRYPTION_KEY = chaveAnterior;
    if (idAnterior === undefined) delete process.env.DATA_ENCRYPTION_KEY_ID;
    else process.env.DATA_ENCRYPTION_KEY_ID = idAnterior;
    if (chavesAnteriores === undefined) delete process.env.DATA_ENCRYPTION_PREVIOUS_KEYS;
    else process.env.DATA_ENCRYPTION_PREVIOUS_KEYS = chavesAnteriores;
  }
});
