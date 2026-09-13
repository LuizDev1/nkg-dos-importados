const pool = require('../config/banco');

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
    `SELECT *
    FROM pedidos
    WHERE usuario_id = ?
    ORDER BY criado_em DESC`,
    [usuarioId]
  );

  return pedidos;
}

async function buscarPorId(id) {
  const [pedidos] = await pool.query(
    `SELECT
      p.*,
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
    total,
  } = dadosPedido;

  const [resultado] = await conexao.query(
    `INSERT INTO pedidos
      (
        usuario_id,
        tipo_entrega,
        endereco_entrega,
        telefone_contato,
        total
      )
    VALUES (?, ?, ?, ?, ?)`,
    [
      usuario_id,
      tipo_entrega,
      endereco_entrega,
      telefone_contato,
      total,
    ]
  );

  return resultado.insertId;
}

async function atualizarStatus(id, paymentStatus, paymentId = null) {
  const [resultado] = await pool.query(
    `UPDATE pedidos
    SET
      payment_status = ?,
      payment_id = COALESCE(?, payment_id)
    WHERE id = ?`,
    [paymentStatus, paymentId, id]
  );

  return resultado.affectedRows;
}

module.exports = {
  listarTodos,
  listarPorUsuario,
  buscarPorId,
  criar,
  atualizarStatus,
};