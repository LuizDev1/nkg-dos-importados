const crypto = require('crypto');
const Pedido = require('../models/Pedido');
const ItemPedido = require('../models/ItemPedido');
const Log = require('../models/Log');
const estoqueService = require('../services/estoqueService');
const mercadoPagoService = require('../services/mercadoPagoService');

function validarAssinaturaWebhook(req) {
  const assinatura = String(req.headers['x-signature'] || '').trim();
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error('MERCADOPAGO_WEBHOOK_SECRET não configurado');
  }

  if (!assinatura) {
    throw new Error('Assinatura do webhook ausente');
  }

  const payload = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));
  const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const assinaturaNormalizada = assinatura.startsWith('v1=')
    ? assinatura.slice(3)
    : assinatura.includes('=')
      ? assinatura.split('=').slice(1).join('=')
      : assinatura;

  const assinaturaBuffer = Buffer.from(assinaturaNormalizada);
  const hashBuffer = Buffer.from(hash);

  if (assinaturaBuffer.length !== hashBuffer.length || !crypto.timingSafeEqual(hashBuffer, assinaturaBuffer)) {
    throw new Error('Assinatura do webhook inválida');
  }
}

async function criarPagamento(req, res) {
  try {
    const pedido = await Pedido.buscarPorId(req.params.pedidoId);

    if (!pedido) {
      return res.status(404).json({ mensagem: 'Pedido não encontrado' });
    }

    if (
      req.usuario.perfil !== 'admin'
      && String(pedido.usuario_id) !== String(req.usuario.id)
    ) {
      return res.status(403).json({
        mensagem: 'Você não tem acesso a este pedido',
      });
    }

    const itens = await ItemPedido.listarPorPedido(pedido.id);
    const order = await mercadoPagoService.criarOrder(pedido, itens);

    res.json(order);
} catch (erro) {
  console.error('Erro completo:', JSON.stringify(erro, null, 2));
  console.error('apiResponse:', erro.apiResponse);
  const status = erro.message.startsWith('Mercado Pago') ? 502 : 500;
  res.status(status).json({ mensagem: erro.message });
}
}
async function receberWebhook(req, res) {
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));
    validarAssinaturaWebhook({ headers: req.headers, body: rawBody });

    const orderId = req.query['data.id'];

    console.log('Webhook Mercado Pago recebido:', {
      tipo: req.query.type,
      orderId,
    });

    if (!orderId) {
      return res.status(400).send();
    }

    const order = await mercadoPagoService.buscarOrder(orderId);
    const pedidoId = order.external_reference;

    console.log('Order Mercado Pago consultada:', {
      orderId,
      pedidoId,
      status: order.status,
    });

    if (!pedidoId || !order.status) {
      return res.status(400).send();
    }

    const itens = await ItemPedido.listarPorPedido(pedidoId);

    if (order.status === 'processed') {
      await Pedido.confirmarPagamento(
        pedidoId,
        order.id,
        itens,
        estoqueService
      );

      await Log.registrar({
        tipo: 'pedido',
        acao: 'pagamento_confirmado',
        entidade_id: pedidoId,
        detalhes: { payment_id: order.id, status: order.status },
      });
    } else {
      const statusTraduzido = {
        cancelled: 'cancelado',
        refused: 'recusado',
      }[order.status];

      if (statusTraduzido) {
        await Pedido.atualizarStatus(pedidoId, statusTraduzido, order.id);

        await Log.registrar({
          tipo: 'pedido',
          acao: 'status_atualizado',
          entidade_id: pedidoId,
          detalhes: { payment_id: order.id, novo_status: statusTraduzido },
        });
      }
    }

    res.status(200).send();
  } catch (erro) {
    console.error('Erro no webhook:', erro);
    if (erro.message && /assinatura|configurado|ausente/i.test(erro.message)) {
      return res.status(401).json({ mensagem: erro.message });
    }
    res.status(500).send();
  }
}

async function sincronizarPagamento(req, res) {
  try {
    const pedido = await Pedido.buscarPorId(req.params.pedidoId);
    const paymentId = req.body?.payment_id
      || req.body?.collection_id
      || req.query.payment_id
      || req.query.collection_id;

    if (!paymentId) {
      return res.status(400).json({ mensagem: 'payment_id não informado' });
    }

    if (!pedido) {
      return res.status(404).json({ mensagem: 'Pedido não encontrado' });
    }

    if (req.usuario.perfil !== 'admin'
      && String(pedido.usuario_id) !== String(req.usuario.id)) {
      return res.status(403).json({ mensagem: 'Você não tem acesso a este pedido' });
    }

    const pagamento = await mercadoPagoService.buscarPagamento(paymentId);

    if (!pagamento || String(pagamento.external_reference) !== String(pedido.id)) {
      return res.status(404).json({ mensagem: 'Pagamento não pertence a este pedido' });
    }

    if (pagamento.status === 'approved') {
      const itens = await ItemPedido.listarPorPedido(pedido.id);
      await Pedido.confirmarPagamento(
        pedido.id,
        String(pagamento.id),
        itens,
        estoqueService
      );
    }

    const statusTraduzido = {
      rejected: 'recusado',
      cancelled: 'cancelado',
    }[pagamento.status];

    if (statusTraduzido) {
      await Pedido.atualizarStatus(
        pedido.id,
        statusTraduzido,
        String(pagamento.id)
      );
    }

    return res.json({
      status: pagamento.status,
      payment_status: statusTraduzido || pagamento.status,
    });
  } catch (erro) {
    console.error('Erro ao sincronizar pagamento:', erro);

    if (erro.message.startsWith('Estoque insuficiente')) {
      return res.status(409).json({ mensagem: erro.message });
    }

    if (erro.message.startsWith('Mercado Pago')) {
      return res.status(502).json({ mensagem: erro.message });
    }

    return res.status(500).json({ mensagem: 'Erro ao sincronizar pagamento' });
  }
}

module.exports = { criarPagamento, receberWebhook, sincronizarPagamento };