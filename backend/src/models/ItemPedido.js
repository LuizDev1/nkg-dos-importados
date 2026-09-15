const pool = require('../config/banco');

async function criarVarios(pedidoId, itens, conexao = pool) {
  const valores = itens.map((item) => [
    pedidoId,
    item.produto_id,
    item.variacao_id || null,
    item.variacao_nome || null,
    item.quantidade,
    item.preco_unitario,
  ]);

  const [resultado] = await conexao.query(
    `INSERT INTO itens_pedido
      (
        pedido_id,
        produto_id,
        variacao_id,
        variacao_nome,
        quantidade,
        preco_unitario
      )
    VALUES ?`,
    [valores]
  );

  return resultado.affectedRows;
}

async function listarPorPedido(pedidoId) {
  const [itens] = await pool.query(
    `SELECT
      ip.*,
      p.nome AS produto_nome,
      p.foto_url
    FROM itens_pedido ip
    INNER JOIN produtos p ON p.id = ip.produto_id
    WHERE ip.pedido_id = ?
    ORDER BY ip.id`,
    [pedidoId]
  );

  return itens;
}

module.exports = {
  criarVarios,
  listarPorPedido,
};
