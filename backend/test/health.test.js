const assert = require('node:assert/strict');
const test = require('node:test');
const request = require('supertest');
const app = require('../src/app');
const pool = require('../src/config/banco');

test.after(async () => {
  await pool.end();
});

test('GET /health confirma API, banco e headers de segurança', async () => {
  const resposta = await request(app).get('/health');

  assert.equal(resposta.status, 200);
  assert.deepEqual(resposta.body, { status: 'ok', banco: 'ok' });
  assert.equal(resposta.headers['x-content-type-options'], 'nosniff');
});
