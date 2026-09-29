const test = require('node:test');
const assert = require('node:assert/strict');
const { validarToken } = require('../src/middlewares/turnstile');

test('Turnstile valida token, ação e hostname no servidor', async (t) => {
  const segredoAnterior = process.env.TURNSTILE_SECRET_KEY;
  const hostnameAnterior = process.env.TURNSTILE_EXPECTED_HOSTNAME;
  process.env.TURNSTILE_SECRET_KEY = 'segredo-de-teste';
  process.env.TURNSTILE_EXPECTED_HOSTNAME = 'loja.exemplo.com';
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => ({
    ok: true,
    json: async () => ({ success: true, action: 'login', hostname: 'loja.exemplo.com' }),
  }));

  try {
    assert.equal(await validarToken('token-valido', '127.0.0.1', 'login'), true);
    assert.equal(await validarToken('token-valido', '127.0.0.1', 'cadastro'), false);
    assert.equal(await validarToken('', '127.0.0.1', 'login'), false);
    assert.equal(fetchMock.mock.callCount(), 2);
  } finally {
    if (segredoAnterior === undefined) delete process.env.TURNSTILE_SECRET_KEY;
    else process.env.TURNSTILE_SECRET_KEY = segredoAnterior;
    if (hostnameAnterior === undefined) delete process.env.TURNSTILE_EXPECTED_HOSTNAME;
    else process.env.TURNSTILE_EXPECTED_HOSTNAME = hostnameAnterior;
  }
});
