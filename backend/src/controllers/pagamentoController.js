const Pedido = require('../models/Pedido');
const ItemPedido = require('../models/ItemPedido');
const mercadoPagoService = require('../services/mercadoPagoService');

async function criarPagamento(req, res) {
  try {
    const pedido = await Pedido.buscarPorId(req.params.pedidoId);

    if (!pedido) {
      return res.status(404).json({ mensagem: 'Pedido não encontrado' });
    }

    const itens = await ItemPedido.listarPorPedido(pedido.id);
    const order = await mercadoPagoService.criarOrder(pedido, itens);

    res.json({ checkout_url: order.checkout_url });
} catch (erro) {
  console.error('Erro completo:', JSON.stringify(erro, null, 2));
  console.error('apiResponse:', erro.apiResponse);
  res.status(500).json({ mensagem: erro.message });
}
}

async function receberWebhook(req, res) {
  try {
    const orderId = req.query['data.id'];

    if (!orderId) {
      return res.status(400).send();
    }

    const order = await mercadoPagoService.buscarOrder(orderId);
    const pedidoId = order.external_reference;

    let statusTraduzido = 'pendente';
    if (order.status === 'processed') statusTraduzido = 'pago';
    if (order.status === 'cancelled') statusTraduzido = 'cancelado';
    if (order.status === 'refused') statusTraduzido = 'recusado';

    await Pedido.atualizarStatus(pedidoId, statusTraduzido, order.id);

    res.status(200).send();
  } catch (erro) {
    console.error(erro);
    res.status(500).send();
  }
}

module.exports = { criarPagamento, receberWebhook };