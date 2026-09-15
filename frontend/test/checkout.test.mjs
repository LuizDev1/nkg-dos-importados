import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const fonte = fs.readFileSync(new URL('../src/paginas/publicas/Checkout.jsx', import.meta.url), 'utf8');
const funcao = fonte.slice(fonte.indexOf('  async function finalizarCompra('), fonte.indexOf('  function classeCampo('));
for (const gratuito of [true, false]) {
  test('calcular mostra frete ' + (gratuito ? 'gratis' : 'pago') + ' antes de criar pedido', async () => {
    let pedidos = 0;
    let pagamentos = 0;
    const cotacao = { gratuito, servico_id: gratuito ? 'gratis-mesmo-cep' : 'pac', valor: gratuito ? 0 : 25 };
    const contexto = {
      carregandoEstoque: false, erroEstoque: '', pedidoEmProcessamento: false,
      validarCampos: () => true, itens: [{ produto_id: 1, quantidade: 20, estoque_qtd: 20, preco: 20 }],
      formulario: { cep: '64900-000', rua: 'Rua', numero: '1', bairro: 'Centro', cidade: 'Cidade', estado: 'PI', telefone: '99999999999' },
      freteServicoId: '', cotacaoFrete: null, codigoPromocao: '', cpf: '12345678909', usuario: { id: 1 },
      versaoCep: { current: 0 }, API_URL: '/api', idempotencyKey: { current: 'teste' },
      setCarregando() {}, setErro() {}, setResumoServidor() {},
      setPedidoEmProcessamento(value) { contexto.pedidoEmProcessamento = value; },
      setCotacaoFrete(value) { contexto.cotacaoFrete = value; },
      setFreteServicoId(value) { contexto.freteServicoId = value; },
      cotarFrete: async () => cotacao,
      criarPedido: async () => { pedidos++; return { id: 1 }; },
      localStorage: { getItem: () => 'token', setItem() {} }, window: { location: { href: '' } },
      fetch: async (url) => { if (url.includes('/pagamentos/')) pagamentos++; return { ok: true, json: async () => ({ checkout_url: '/pagamento' }) }; },
    };
    vm.createContext(contexto);
    vm.runInContext(funcao + ';globalThis.enviar = finalizarCompra;', contexto);
    await contexto.enviar({ preventDefault() {} });
    assert.equal(pedidos, 0);
    assert.equal(pagamentos, 0);
    assert.equal(contexto.cotacaoFrete.gratuito, gratuito);
    assert.equal(contexto.freteServicoId, cotacao.servico_id);
    await contexto.enviar({ preventDefault() {} });
    assert.equal(pedidos, 1);
    assert.equal(pagamentos, 1);
    assert.equal(contexto.window.location.href, '/pagamento');
  });
}
