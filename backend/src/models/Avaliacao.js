const pool = require('../config/banco');

async function listar(produtoId) {
  const [avaliacoes] = await pool.query(
    `SELECT a.id, a.nota, a.comentario, a.foto_url, a.criado_em, u.nome AS usuario_nome
     FROM avaliacoes a INNER JOIN usuarios u ON u.id = a.usuario_id
     WHERE a.produto_id = ? ORDER BY a.criado_em DESC`,
    [produtoId]
  );
  return avaliacoes;
}

async function usuarioComprou(usuarioId, produtoId) {
  const [pedidos] = await pool.query(
    `SELECT 1 FROM pedidos p INNER JOIN itens_pedido ip ON ip.pedido_id = p.id
     WHERE p.usuario_id = ? AND ip.produto_id = ? AND p.payment_status = 'pago' LIMIT 1`,
    [usuarioId, produtoId]
  );
  return Boolean(pedidos[0]);
}

async function salvar(usuarioId, produtoId, dados) {
  await pool.query(
    `INSERT INTO avaliacoes (usuario_id, produto_id, nota, comentario, foto_url)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE nota = VALUES(nota), comentario = VALUES(comentario), foto_url = VALUES(foto_url)`,
    [usuarioId, produtoId, dados.nota, dados.comentario, dados.foto_url || null]
  );
}

module.exports = { listar, usuarioComprou, salvar };
