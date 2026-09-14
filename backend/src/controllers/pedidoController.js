const pool = require('../config/banco');
const Pedido = require('../models/Pedido');
const ItemPedido = require('../models/ItemPedido');
const Log = require('../models/Log');
const Promocao = require('../models/Promocao');
const melhorEnvioService = require('../services/melhorEnvioService');

const tiposEntregaPermitidos = ['envio', 'entrega_local'];

async function listar(req, res) {
  try {
    const pedidos = await Pedido.listarTodos();
    res.json(pedidos);
  } catch (erro) {
    res.status(500).json({ mensagem: erro.message });
  }
}

async function listarPorUsuario(req, res) {
  try {
    const usuarioId = req.usuario.perfil === 'admin'
      ? req.params.usuarioId
      : req.usuario.id;

    const pedidos = await Pedido.listarPorUsuario(
      usuarioId
    );

    res.json(pedidos);
  } catch (erro) {
    res.status(500).json({ mensagem: erro.message });
  }
}

async function buscar(req, res) {
  try {
    const pedido = await Pedido.buscarPorId(req.params.id);

    if (!pedido) {
      return res.status(404).json({
        mensagem: 'Pedido não encontrado',
      });
    }

    if (
      req.usuario.perfil !== 'admin'
      && String(pedido.usuario_id) !== String(req.usuario.id)
    ) {
      return res.status(403).json({
        mensagem: 'Você não tem acesso a este pedido',
      });
    }

    pedido.itens = await ItemPedido.listarPorPedido(pedido.id);

    return res.json(pedido);
  } catch (erro) {
    return res.status(500).json({
      mensagem: erro.message,
    });
  }
}

async function criar(req, res) {
  const {
    tipo_entrega,
    endereco_entrega,
    telefone_contato,
    itens,
    codigo_promocao,
    cep_entrega,
    frete_servico_id,
  } = req.body;
  const idempotencyKey = String(req.headers['idempotency-key'] || '').trim();

  if (!idempotencyKey || idempotencyKey.length > 100) {
    return res.status(400).json({ mensagem: 'O header Idempotency-Key é obrigatório' });
  }

  if (
    !tipo_entrega ||
    !endereco_entrega ||
    !telefone_contato
  ) {
    return res.status(400).json({
      mensagem: 'Preencha os dados obrigatórios do pedido',
    });
  }

  if (!tiposEntregaPermitidos.includes(tipo_entrega)) {
    return res.status(400).json({
      mensagem: 'Tipo de entrega inválido',
    });
  }

  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({
      mensagem: 'O pedido precisa possuir pelo menos um item',
    });
  }

  if (tipo_entrega === 'envio' && !cep_entrega) {
    return res.status(400).json({ mensagem: 'CEP de entrega é obrigatório para calcular o frete' });
  }

  const pedidoExistenteAntesDaCotacao = await Pedido.buscarPorIdempotency(
    req.usuario.id,
    idempotencyKey
  );
  if (pedidoExistenteAntesDaCotacao) {
    return res.status(200).json({
      id: pedidoExistenteAntesDaCotacao.id,
      total: Number(pedidoExistenteAntesDaCotacao.total).toFixed(2),
      status_pedido: pedidoExistenteAntesDaCotacao.status_pedido,
      mensagem: 'Pedido já criado',
    });
  }

  let cotacaoFrete = { valor: 0, prazo_dias: 0, servico_id: null };
  if (tipo_entrega === 'envio') {
    try {
      cotacaoFrete = await melhorEnvioService.cotar({
        cepDestino: cep_entrega,
        itens,
        servicoId: frete_servico_id,
      });
    } catch (erro) {
      return res.status(502).json({ mensagem: erro.message });
    }
  }

  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const pedidoExistente = await Pedido.buscarPorIdempotency(
      req.usuario.id,
      idempotencyKey,
      conexao
    );

    if (pedidoExistente) {
      await conexao.commit();
      return res.status(200).json({
        id: pedidoExistente.id,
        total: Number(pedidoExistente.total).toFixed(2),
        status_pedido: pedidoExistente.status_pedido,
        mensagem: 'Pedido já criado',
      });
    }

    const itensPreparados = [];
    let total = 0;

    for (const item of itens) {
      const produtoId = Number(item.produto_id);
      const quantidade = Number(item.quantidade);
      const precoInformado = item.preco_unitario != null ? Number(item.preco_unitario) : null;

      if (
        !Number.isInteger(produtoId) ||
        produtoId <= 0 ||
        !Number.isInteger(quantidade) ||
        quantidade <= 0
      ) {
        throw new Error('Produto ou quantidade inválidos');
      }

      const [produtos] = await conexao.query(
        `SELECT id, preco, estoque_qtd, ativo
        FROM produtos
        WHERE id = ?
        FOR UPDATE`,
        [produtoId]
      );

      const produto = produtos[0];

      if (!produto) {
        throw new Error(`Produto ${produtoId} não encontrado`);
      }

      if (produto.ativo === 0 || produto.ativo === false) {
        throw new Error(`Produto ${produtoId} indisponível no momento`);
      }

      if (produto.estoque_qtd < quantidade) {
        throw new Error(
          `Estoque insuficiente para o produto ${produtoId}`
        );
      }

      if (precoInformado != null && Math.abs(precoInformado - Number(produto.preco)) > 0.01) {
        throw new Error(`Preço do produto ${produtoId} foi alterado e precisa ser revalidado`);
      }

      const precoUnitario = Number(produto.preco);

      const estoqueReservado = await conexao.query(
        `UPDATE produtos
         SET estoque_qtd = estoque_qtd - ?
         WHERE id = ? AND estoque_qtd >= ?`,
        [quantidade, produtoId, quantidade]
      );

      if (!estoqueReservado[0].affectedRows) {
        throw new Error(`Estoque insuficiente para o produto ${produtoId}`);
      }

      total += precoUnitario * quantidade;

      itensPreparados.push({
        produto_id: produtoId,
        quantidade,
        preco_unitario: precoUnitario,
      });

    }

    const subtotal = Number(total.toFixed(2));
    let promocao = null;
    let desconto = 0;

    if (codigo_promocao) {
      promocao = await Promocao.buscarValida(codigo_promocao.toUpperCase(), conexao);
      if (!promocao) throw new Error('Código de promoção inválido ou expirado');
      desconto = promocao.tipo === 'percentual'
        ? subtotal * (Number(promocao.valor) / 100)
        : Number(promocao.valor);
      desconto = Math.min(subtotal, Number(desconto.toFixed(2)));
    }

    const frete = tipo_entrega === 'envio' ? Number(cotacaoFrete.valor || 0) : 0;
    const totalPedido = subtotal + frete - desconto;

    if (promocao) await Promocao.incrementarUso(promocao.id, conexao);

    const pedidoId = await Pedido.criar(
      {
        usuario_id: req.usuario.id,
        tipo_entrega,
        endereco_entrega,
        telefone_contato,
        cep_entrega: cep_entrega ? cep_entrega.replace(/\D/g, '') : null,
        frete_servico_id: cotacaoFrete.servico_id,
        prazo_entrega_dias: cotacaoFrete.prazo_dias || null,
        subtotal: subtotal.toFixed(2),
        frete: frete.toFixed(2),
        desconto: desconto.toFixed(2),
        codigo_promocao: promocao?.codigo || null,
        total: totalPedido.toFixed(2),
        idempotency_key: idempotencyKey,
      },
      conexao
    );

    await ItemPedido.criarVarios(
      pedidoId,
      itensPreparados,
      conexao
    );

    await Log.registrar({
      tipo: 'pedido',
      acao: 'criado',
      entidade_id: pedidoId,
      usuario_id: req.usuario.id,
      detalhes: { itens: itensPreparados },
    });

    await conexao.commit();

    return res.status(201).json({
      id: pedidoId,
      subtotal: subtotal.toFixed(2),
      frete: frete.toFixed(2),
      desconto: desconto.toFixed(2),
      total: totalPedido.toFixed(2),
      mensagem: 'Pedido criado com sucesso',
    });
  } catch (erro) {
    await conexao.rollback();

    if (erro.code === 'ER_DUP_ENTRY') {
      const pedidoExistente = await Pedido.buscarPorIdempotency(
        req.usuario.id,
        idempotencyKey
      );

      if (pedidoExistente) {
        return res.status(200).json({
          id: pedidoExistente.id,
          total: Number(pedidoExistente.total).toFixed(2),
          status_pedido: pedidoExistente.status_pedido,
          mensagem: 'Pedido já criado',
        });
      }
    }

    return res.status(400).json({
      mensagem: erro.message,
    });
  } finally {
    conexao.release();
  }
}

async function atualizarStatusOperacional(req, res) {
  const statusPermitidosOperacionais = [
    'em_preparacao',
    'enviado',
    'entregue',
    'cancelado',
    'reembolsado',
  ];
  const { status_pedido } = req.body;

  if (!statusPermitidosOperacionais.includes(status_pedido)) {
    return res.status(400).json({ mensagem: 'Status operacional inválido' });
  }

  try {
    const resultado = await Pedido.atualizarStatusOperacional(req.params.id, status_pedido);
    if (!resultado.encontrado) return res.status(404).json({ mensagem: 'Pedido não encontrado' });
    if (!resultado.permitido) {
      return res.status(409).json({ mensagem: `Transição inválida a partir de ${resultado.atual}` });
    }

    await Log.registrar({
      tipo: 'pedido',
      acao: 'status_operacional_atualizado',
      entidade_id: req.params.id,
      usuario_id: req.usuario.id,
      detalhes: { status_pedido },
    });
    return res.json({ mensagem: 'Status operacional atualizado' });
  } catch (erro) {
    return res.status(500).json({ mensagem: 'Erro ao atualizar status operacional' });
  }
}

async function atualizarRastreio(req, res) {
  const { codigo_rastreio } = req.body;

  try {
    const alterados = await Pedido.atualizarRastreio(
      req.params.id,
      codigo_rastreio
    );

    if (!alterados) {
      return res.status(404).json({
        mensagem: 'Pedido não encontrado',
      });
    }

    await Log.registrar({
      tipo: 'pedido',
      acao: 'rastreio_atualizado',
      entidade_id: req.params.id,
      usuario_id: req.usuario.id,
      detalhes: { codigo_rastreio },
    });

    res.json({ mensagem: 'Código de rastreio atualizado' });
  } catch (erro) {
    res.status(500).json({ mensagem: erro.message });
  }
}

async function cancelar(req, res) {
  try {
    const pedido = await Pedido.buscarPorId(req.params.id);

    if (!pedido) {
      return res.status(404).json({ mensagem: 'Pedido não encontrado' });
    }

    if (req.usuario.perfil !== 'admin' && String(pedido.usuario_id) !== String(req.usuario.id)) {
      return res.status(403).json({ mensagem: 'Você não tem acesso a este pedido' });
    }

    const pedidoCancelado = await Pedido.cancelarPedido(pedido.id);

    let reembolsoPendente = false;
    if (pedidoCancelado && pedido.payment_status === 'pago' && pedido.payment_id) {
      try {
        const mercadoPagoService = require('../services/mercadoPagoService');
        await mercadoPagoService.solicitarReembolso(pedido.payment_id);
        await Pedido.atualizarStatus(pedido.id, 'cancelado', pedido.payment_id);
      } catch (erro) {
        reembolsoPendente = true;
        await Pedido.marcarReembolsoPendente(pedido.id);
        console.warn('Reembolso do Mercado Pago pendente:', erro.message);
      }
    }

    await Log.registrar({
      tipo: 'pedido',
      acao: 'cancelado',
      entidade_id: pedido.id,
      usuario_id: req.usuario.id,
      detalhes: { payment_id: pedido.payment_id },
    });

    return res.json({ mensagem: pedidoCancelado
      ? (reembolsoPendente ? 'Pedido cancelado; reembolso pendente' : 'Pedido cancelado com sucesso')
      : 'Pedido já estava cancelado' });
  } catch (erro) {
    console.error('Erro ao cancelar pedido:', erro);
    return res.status(500).json({ mensagem: erro.message });
  }
}

module.exports = {
  listar,
  listarPorUsuario,
  buscar,
  criar,
  atualizarStatusOperacional,
  atualizarRastreio,
  cancelar,
};