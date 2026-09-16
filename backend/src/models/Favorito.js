const pool = require('../config/banco');

async function listar(usuarioId) {
  const [produtos] = await pool.query(
    `SELECT p.* FROM favoritos f
     INNER JOIN produtos p ON p.id = f.produto_id
     WHERE f.usuario_id = ? AND p.ativo = TRUE
     ORDER BY f.criado_em DESC`,
    [usuarioId]
  );
  return produtos;
}

async function adicionar(usuarioId, produtoId) {
  const [produtos] = await pool.query(
    'SELECT id FROM produtos WHERE id = ? AND ativo = TRUE',
    [produtoId]
  );
  if (!produtos.length) return false;

  await pool.query(
    'INSERT IGNORE INTO favoritos (usuario_id, produto_id) SELECT ?, id FROM produtos WHERE id = ? AND ativo = TRUE',
    [usuarioId, produtoId]
  );
  return true;
}

async function remover(usuarioId, produtoId) {
  await pool.query('DELETE FROM favoritos WHERE usuario_id = ? AND produto_id = ?', [usuarioId, produtoId]);
}

module.exports = { listar, adicionar, remover };
