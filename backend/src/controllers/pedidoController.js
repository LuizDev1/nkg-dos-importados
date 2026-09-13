const pool = require('../config/banco');
const Pedido = require('../models/Pedido');
const ItemPedido = require('../models/ItemPedido');

const tiposEntregaPermitidos = ['envio', 'entrega_local'];

const statusPermitidos = [
  'pendente',
  'pago',
  'recusado',
  'cancelado',
];

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
    const pedidos = await Pedido.listarPorUsuario(
      req.params.usuarioId
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
    usuario_id,
    tipo_entrega,
    endereco_entrega,
    telefone_contato,
    itens,
  } = req.body;

  if (
    !usuario_id ||
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

  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const itensPreparados = [];
    let total = 0;

    for (const item of itens) {
      const produtoId = Number(item.produto_id);
      const quantidade = Number(item.quantidade);

      if (
        !Number.isInteger(produtoId) ||
        produtoId <= 0 ||
        !Number.isInteger(quantidade) ||
        quantidade <= 0
      ) {
        throw new Error('Produto ou quantidade inválidos');
      }

      const [produtos] = await conexao.query(
        `SELECT id, preco, estoque_qtd
        FROM produtos
        WHERE id = ?
        FOR UPDATE`,
        [produtoId]
      );

      const produto = produtos[0];

      if (!produto) {
        throw new Error(`Produto ${produtoId} não encontrado`);
      }

      if (produto.estoque_qtd < quantidade) {
        throw new Error(
          `Estoque insuficiente para o produto ${produtoId}`
        );
      }

      const precoUnitario = Number(produto.preco);

      total += precoUnitario * quantidade;

      itensPreparados.push({
        produto_id: produtoId,
        quantidade,
        preco_unitario: precoUnitario,
      });

      await conexao.query(
        `UPDATE produtos
        SET estoque_qtd = estoque_qtd - ?
        WHERE id = ?`,
        [quantidade, produtoId]
      );
    }

    const pedidoId = await Pedido.criar(
      {
        usuario_id,
        tipo_entrega,
        endereco_entrega,
        telefone_contato,
        total: total.toFixed(2),
      },
      conexao
    );

    await ItemPedido.criarVarios(
      pedidoId,
      itensPreparados,
      conexao
    );

    await conexao.commit();

    return res.status(201).json({
      id: pedidoId,
      total: total.toFixed(2),
      mensagem: 'Pedido criado com sucesso',
    });
  } catch (erro) {
    await conexao.rollback();

    return res.status(400).json({
      mensagem: erro.message,
    });
  } finally {
    conexao.release();
  }
}

async function atualizarStatus(req, res) {
  const { payment_status, payment_id } = req.body;

  if (!statusPermitidos.includes(payment_status)) {
    return res.status(400).json({
      mensagem: 'Status de pagamento inválido',
    });
  }

  try {
    const linhasAlteradas = await Pedido.atualizarStatus(
      req.params.id,
      payment_status,
      payment_id
    );

    if (!linhasAlteradas) {
      return res.status(404).json({
        mensagem: 'Pedido não encontrado',
      });
    }

    return res.json({
      mensagem: 'Status do pedido atualizado',
    });
  } catch (erro) {
    return res.status(500).json({
      mensagem: erro.message,
    });
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

    res.json({ mensagem: 'Código de rastreio atualizado' });
  } catch (erro) {
    res.status(500).json({ mensagem: erro.message });
  }
}

module.exports = {
  listar,
  listarPorUsuario,
  buscar,
  criar,
  atualizarStatus,
  atualizarRastreio,
};