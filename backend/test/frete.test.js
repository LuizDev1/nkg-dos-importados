const { describe, it, beforeEach, mock } = require('node:test');
const assert = require('node:assert');

// ATENÇÃO: Ajustei os caminhos baseando-me na sua estrutura padrão. 
// Se der erro de "Cannot find module", verifique o nome exato das pastas!
const { cotar } = require('../src/services/melhorEnvioService.js'); 
const pool = require('../src/config/banco.js'); 

describe('Serviço de Cotação de Frete', () => {
  const envOriginal = process.env;

  beforeEach(() => {
    mock.restoreAll();
    process.env = { ...envOriginal };
    process.env.MELHOR_ENVIO_TOKEN = 'token_de_teste_123';
    process.env.CEP_ORIGEM = '64900000';
  });

  it('Deve lançar erro se o CEP de destino for inválido', async () => {
    await assert.rejects(
      cotar({ cepDestino: '123', itens: [] }),
      /CEP de destino inválido/
    );
  });

  it('Deve retornar frete grátis se o CEP de destino for igual ao de origem', async () => {
    const resultado = await cotar({ cepDestino: '64900000', itens: [] });
    
    assert.strictEqual(resultado.gratuito, true);
    assert.strictEqual(resultado.valor, 0);
    assert.strictEqual(resultado.servico_id, 'gratis-mesmo-cep');
  });

  it('Deve retornar cotações calculadas com sucesso pela API', async () => {
    // Mock do banco de dados (simula produto encontrado)
    mock.method(pool, 'query', async () => [[{
      id: 1, nome: 'Camiseta', preco: 50.00, peso_kg: 0.5, largura_cm: 20, altura_cm: 5, comprimento_cm: 20
    }]]);

    // Mock do fetch global (simula resposta do Melhor Envio)
    mock.method(global, 'fetch', async () => ({
      ok: true,
      json: async () => ([
        { id: 1, name: 'PAC', price: '25.50', delivery_time: 5 },
        { id: 2, name: 'SEDEX', price: '45.00', delivery_time: 2 }
      ])
    }));

    const resultado = await cotar({
      cepDestino: '70000000',
      itens: [{ produto_id: 1, quantidade: 2 }]
    });

    assert.strictEqual(resultado.gratuito, false);
    assert.strictEqual(resultado.opcoes.length, 2);
    assert.strictEqual(resultado.valor, 25.50);
    assert.strictEqual(resultado.servico_id, "1");
  });
});