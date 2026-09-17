const pool = require('../config/banco');
const MovimentacaoEstoque = require('./MovimentacaoEstoque');

async function registrarReposicao(conexao, item, pedidoId) {
  const [produtos] = await conexao.query('SELECT estoque_qtd FROM produtos WHERE id = ?', [item.produto_id]);
  if (produtos[0]) await MovimentacaoEstoque.registrar({
    produtoId: item.produto_id, tipo: 'entrada', quantidade: item.quantidade,
    saldoAnterior: Number(produtos[0].estoque_qtd) - Number(item.quantidade),
    saldoPosterior: Number(produtos[0].estoque_qtd), motivo: `Reposição do pedido ${pedidoId}`,
  }, conexao);
  if (item.variacao_id) {
    const [variacoes] = await conexao.query('SELECT estoque_qtd FROM produto_variacoes WHERE id = ?', [item.variacao_id]);
    if (variacoes[0]) await MovimentacaoEstoque.registrar({
      produtoId: item.produto_id, variacaoId: item.variacao_id, tipo: 'entrada', quantidade: item.quantidade,
      saldoAnterior: Number(variacoes[0].estoque_qtd) - Number(item.quantidade),
      saldoPosterior: Number(variacoes[0].estoque_qtd), motivo: `Reposição do pedido ${pedidoId}`,
    }, conexao);
  }
}

async function listarTodos() {
  const [pedidos] = await pool.query(
    `SELECT
      p.*,
      u.nome AS usuario_nome,
      u.email AS usuario_email
    FROM pedidos p
    INNER JOIN usuarios u ON u.id = p.usuario_id
    ORDER BY p.criado_em DESC`
  );

  return pedidos;
}

async function listarPorUsuario(usuarioId) {
  const [pedidos] = await pool.query(
    `SELECT
      p.*,
      (
        SELECT COUNT(*)
        FROM pedidos p2
        WHERE p2.usuario_id = p.usuario_id
          AND p2.id <= p.id
      ) AS numero_cliente
    FROM pedidos p
    WHERE p.usuario_id = ?
    ORDER BY p.criado_em DESC`,
    [usuarioId]
  );

  return pedidos;
}

async function buscarPorId(id) {
  const [pedidos] = await pool.query(
    `SELECT
      p.*,
      (
        SELECT COUNT(*)
        FROM pedidos p2
        WHERE p2.usuario_id = p.usuario_id
          AND p2.id <= p.id
      ) AS numero_cliente,
      u.nome AS usuario_nome,
      u.email AS usuario_email,
      u.cpf AS usuario_cpf
    FROM pedidos p
    INNER JOIN usuarios u ON u.id = p.usuario_id
    WHERE p.id = ?`,
    [id]
  );

  return pedidos[0] || null;
}

async function criar(dadosPedido, conexao = pool) {
  const {
    usuario_id,
    tipo_entrega,
    endereco_entrega,
    telefone_contato,
    cep_entrega,
    frete_servico_id,
    prazo_entrega_dias,
    subtotal,
    frete,
    desconto,
    codigo_promocao,
    total,
    idempotency_key,
  } = dadosPedido;

  const [resultado] = await conexao.query(
    `INSERT INTO pedidos
      (
        usuario_id,
        idempotency_key,
        tipo_entrega,
        endereco_entrega,
        telefone_contato,
        cep_entrega,
        frete_servico_id,
        prazo_entrega_dias,
        subtotal,
        frete,
        desconto,
        codigo_promocao,
        total
      )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
    [
      usuario_id,
      idempotency_key,
      tipo_entrega,
      endereco_entrega,
      telefone_contato,
      cep_entrega,
      frete_servico_id,
      prazo_entrega_dias,
      subtotal,
      frete,
      desconto,
      codigo_promocao,
      total,
    ]
  );

  return resultado.insertId;
}

async function atualizarStatus(id, paymentStatus, paymentId = null) {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();
    const [pedidos] = await conexao.query(
      'SELECT * FROM pedidos WHERE id = ? FOR UPDATE',
      [id]
    );
    const pedido = pedidos[0];

    if (!pedido) {
      await conexao.rollback();
      return 0;
    }

    if (pedido.payment_status === paymentStatus && (!paymentId || pedido.payment_id === paymentId)) {
      await conexao.commit();
      return 1;
    }

    if (['recusado', 'cancelado'].includes(paymentStatus) && pedido.estoque_reservado) {
      const [itens] = await conexao.query(
        'SELECT produto_id, variacao_id, quantidade FROM itens_pedido WHERE pedido_id = ?',
        [id]
      );
      for (const item of itens) {
        await conexao.query(
          'UPDATE produtos SET estoque_qtd = estoque_qtd + ? WHERE id = ?',
          [item.quantidade, item.produto_id]
        );
        if (item.variacao_id) {
          await conexao.query(
            'UPDATE produto_variacoes SET estoque_qtd = estoque_qtd + ? WHERE id = ?',
            [item.quantidade, item.variacao_id]
          );
        }
        await registrarReposicao(conexao, item, id);
      }
    }

    await conexao.query(
      `UPDATE pedidos
       SET payment_status = ?,
           status_pedido = CASE WHEN ? = 'cancelado' THEN 'cancelado' WHEN ? = 'recusado' THEN 'cancelado' ELSE status_pedido END,
           estoque_reservado = CASE WHEN ? IN ('recusado', 'cancelado') THEN FALSE ELSE estoque_reservado END,
           payment_id = COALESCE(?, payment_id)
       WHERE id = ?`,
      [paymentStatus, paymentStatus, paymentStatus, paymentStatus, paymentId, id]
    );
    await conexao.commit();
    return 1;
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

async function atualizarStatusOperacional(id, novoStatus) {
  const transicoes = {
    pago: ['em_preparacao', 'cancelado'],
    em_preparacao: ['enviado', 'cancelado'],
    enviado: ['entregue'],
    reembolso_pendente: ['reembolsado'],
  };
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();
    const [pedidos] = await conexao.query(
      'SELECT status_pedido FROM pedidos WHERE id = ? FOR UPDATE',
      [id]
    );
    const pedido = pedidos[0];

    if (!pedido) {
      await conexao.rollback();
      return { encontrado: false };
    }

    if (!transicoes[pedido.status_pedido]?.includes(novoStatus)) {
      await conexao.rollback();
      return { encontrado: true, permitido: false, atual: pedido.status_pedido };
    }

    await conexao.query(
      'UPDATE pedidos SET status_pedido = ? WHERE id = ?',
      [novoStatus, id]
    );
    await conexao.commit();
    return { encontrado: true, permitido: true, atual: novoStatus };
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

async function confirmarPagamento(id, paymentId, itens, estoqueService) {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const [pedidos] = await conexao.query(
      'SELECT payment_status FROM pedidos WHERE id = ? FOR UPDATE',
      [id]
    );
    const pedido = pedidos[0];

    if (!pedido) {
      await conexao.rollback();
      return false;
    }

    if (
      pedido.payment_status === 'pago'
      || ['cancelado', 'reembolso_pendente', 'reembolsado'].includes(pedido.status_pedido)
    ) {
      await conexao.commit();
      return pedido.payment_status === 'pago';
    }

    await conexao.query(
      `UPDATE pedidos
       SET payment_status = 'pago', status_pedido = 'pago', payment_id = COALESCE(?, payment_id)
       WHERE id = ?`,
      [paymentId, id]
    );

    await conexao.commit();
    return true;
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

async function atualizarRastreio(id, codigoRastreio) {
  const [resultado] = await pool.query(
    `UPDATE pedidos
     SET codigo_rastreio = ?
     WHERE id = ?`,
    [codigoRastreio || null, id]
  );

  return resultado.affectedRows;
}

async function cancelarPedido(id, somentePendente = false) {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const [pedidos] = await conexao.query(
      'SELECT * FROM pedidos WHERE id = ? FOR UPDATE',
      [id]
    );

    const pedido = pedidos[0];
    if (!pedido) {
      await conexao.rollback();
      return false;
    }

    if (['cancelado', 'reembolso_pendente', 'reembolsado'].includes(pedido.status_pedido)) {
      await conexao.commit();
      return false;
    }

    if (somentePendente && (
      pedido.status_pedido !== 'aguardando_pagamento'
      || pedido.payment_status !== 'pendente'
    )) {
      await conexao.rollback();
      return false;
    }

    const [itens] = await conexao.query(
      'SELECT produto_id, variacao_id, quantidade FROM itens_pedido WHERE pedido_id = ?',
      [id]
    );

    if (pedido.estoque_reservado) {
      for (const item of itens) {
      await conexao.query(
        'UPDATE produtos SET estoque_qtd = estoque_qtd + ? WHERE id = ?',
        [item.quantidade, item.produto_id]
      );
      if (item.variacao_id) {
        await conexao.query(
          'UPDATE produto_variacoes SET estoque_qtd = estoque_qtd + ? WHERE id = ?',
          [item.quantidade, item.variacao_id]
        );
      }
      await registrarReposicao(conexao, item, id);
      }
    }

await conexao.query(
  `UPDATE pedidos
   SET reembolso_status = CASE
         WHEN payment_status = 'pago' AND payment_id IS NOT NULL THEN 'solicitado'
         ELSE NULL
       END,
       status_pedido = CASE
         WHEN payment_status = 'pago' AND payment_id IS NOT NULL THEN 'reembolso_pendente'
         ELSE 'cancelado'
       END,
       payment_status = 'cancelado',
       estoque_reservado = FALSE
   WHERE id = ?`,
  [id]
);

    await conexao.commit();
    return true;
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

async function buscarPorIdempotency(usuarioId, idempotencyKey, conexao = pool) {
  const [pedidos] = await conexao.query(
    'SELECT * FROM pedidos WHERE usuario_id = ? AND idempotency_key = ?',
    [usuarioId, idempotencyKey]
  );
  return pedidos[0] || null;
}

async function registrarWebhook(eventoId, tipo) {
  try {
    await pool.query(
      'INSERT INTO webhook_eventos (evento_id, tipo) VALUES (?, ?)',
      [eventoId, tipo]
    );
    return true;
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') return false;
    throw erro;
  }
}

async function marcarReembolsoPendente(id) {
  await pool.query(
    `UPDATE pedidos SET status_pedido = 'reembolso_pendente' WHERE id = ? AND payment_status = 'cancelado'`,
    [id]
  );
}

async function removerWebhook(eventoId) {
  await pool.query('DELETE FROM webhook_eventos WHERE evento_id = ?', [eventoId]);
}

async function marcarReembolsoConcluido(id) {
  await pool.query(
    `UPDATE pedidos
     SET status_pedido = 'reembolsado', reembolso_status = 'concluido'
     WHERE id = ? AND status_pedido = 'reembolso_pendente' AND payment_status = 'cancelado'`,
    [id]
  );
}

async function relatorioMensal() {
  const [resultado] = await pool.query(
    `SELECT
      COALESCE(SUM(total), 0) AS total_vendido,
      COUNT(*) AS quantidade_pedidos
    FROM pedidos
    WHERE payment_status = 'pago'
      AND MONTH(criado_em) = MONTH(CURDATE())
      AND YEAR(criado_em) = YEAR(CURDATE())`
  );

  return resultado[0];
}

module.exports = {
  listarTodos,
  listarPorUsuario,
  buscarPorId,
  criar,
  atualizarStatus,
  atualizarStatusOperacional,
  confirmarPagamento,
  atualizarRastreio,
  cancelarPedido,
  buscarPorIdempotency,
  registrarWebhook,
  removerWebhook,
  marcarReembolsoPendente,
  marcarReembolsoConcluido,
  relatorioMensal,
};
