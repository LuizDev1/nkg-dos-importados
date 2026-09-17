const crypto = require('crypto');
const Pedido = require('../models/Pedido');
const ItemPedido = require('../models/ItemPedido');
const Log = require('../models/Log');
const estoqueService = require('../services/estoqueService');
const mercadoPagoService = require('../services/mercadoPagoService');
const notificacaoService = require('../services/notificacaoService'); // 📧 NOVO
const pool = require('../config/banco'); // 🗄️ NOVO: Para buscar o e-mail

function validarAssinaturaWebhook(req) {
  const assinatura = String(req.headers['x-signature'] || '').trim();
  const requestId = String(req.headers['x-request-id'] || '').trim();
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (!secret) {
    throw new Error('MERCADOPAGO_WEBHOOK_SECRET não configurado');
  }

  if (!assinatura) {
    throw new Error('Assinatura do webhook ausente');
  }

  const partes = Object.fromEntries(assinatura.split(',').map((parte) => parte.split('=').map((valor) => valor.trim())));
  const dataId = String(req.query?.['data.id'] || req.body?.data?.id || '').toLowerCase();
  const ts = partes.ts;
  const v1 = partes.v1;

  if (!requestId || !dataId || !ts || !v1) {
    const payload = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(JSON.stringify(req.body || {}));
    const hashLegado = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const assinaturaLegado = assinatura.replace(/^v1=/, '');
    const assinaturaBuffer = Buffer.from(assinaturaLegado);
    const hashBuffer = Buffer.from(hashLegado);

    if (
      assinaturaBuffer.length !== hashBuffer.length
      || !crypto.timingSafeEqual(hashBuffer, assinaturaBuffer)
    ) {
      throw new Error('Assinatura do webhook inválida');
    }

    return;
  }

  const manifesto = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const hash = crypto.createHmac('sha256', secret).update(manifesto).digest('hex');
  const assinaturaNormalizada = v1;

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
  const status = erro.status === 400 ? 400 : erro.message.startsWith('Mercado Pago') ? 502 : 500;
  res.status(status).json({ mensagem: erro.message });
}
}
async function receberWebhook(req, res) {
  let eventoId;
  let eventoRegistrado = false;
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body || {}));
    validarAssinaturaWebhook({ headers: req.headers, body: rawBody, query: req.query });

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

    eventoId = `${orderId}:${order.status}`;
    eventoRegistrado = await Pedido.registrarWebhook(eventoId, req.query.type || 'desconhecido');
    if (!eventoRegistrado) {
      return res.status(200).send();
    }

    const itens = await ItemPedido.listarPorPedido(pedidoId);

    if (order.status === 'processed') {
      const confirmado = await Pedido.confirmarPagamento(
        pedidoId,
        order.id,
        itens,
        estoqueService
      );

      if (confirmado) {
        await Log.registrar({
          tipo: 'pedido',
          acao: 'pagamento_confirmado',
          entidade_id: pedidoId,
          detalhes: { payment_id: order.id, status: order.status },
        });

        // 📧 NOVO: Avisa que o pagamento caiu via Webhook
        try {
          const [usuarios] = await pool.query('SELECT email FROM usuarios WHERE id = (SELECT usuario_id FROM pedidos WHERE id = ?)', [pedidoId]);
          if (usuarios.length > 0) {
            notificacaoService.notificarStatusPedido(usuarios[0].email, pedidoId, 'pago').catch(console.error);
          }
        } catch (erroEmail) {
          console.error('Erro ao notificar cliente:', erroEmail);
        }
      }
    } else if (order.status === 'cancelled' || order.status === 'refused') {
      const statusTraduzido = order.status === 'cancelled' ? 'cancelado' : 'recusado';
      await Pedido.atualizarStatus(pedidoId, statusTraduzido, order.id);

      await Log.registrar({
        tipo: 'pedido',
        acao: 'status_atualizado',
        entidade_id: pedidoId,
        detalhes: { payment_id: order.id, novo_status: statusTraduzido },
      });
    }

    res.status(200).send();
  } catch (erro) {
    if (eventoRegistrado) {
      try {
        await Pedido.removerWebhook(eventoId);
      } catch (erroRemocao) {
        console.error('Erro ao liberar webhook para nova tentativa:', erroRemocao);
      }
    }
    console.error('Erro no webhook:', erro);
    if (erro.message && /assinatura|configurado|ausente/i.test(erro.message)) {
      return res.status(401).send();
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

      // 📧 NOVO: Avisa que o pagamento foi sincronizado com sucesso
      try {
        const [usuarios] = await pool.query('SELECT email FROM usuarios WHERE id = ?', [pedido.usuario_id]);
        if (usuarios.length > 0) {
          notificacaoService.notificarStatusPedido(usuarios[0].email, pedido.id, 'pago').catch(console.error);
        }
      } catch (erroEmail) {
        console.error('Erro ao notificar cliente:', erroEmail);
      }
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
