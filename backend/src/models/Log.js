const pool = require('../config/banco');

async function registrar({ tipo, acao, entidade_id = null, usuario_id = null, detalhes = {} }) {
  const [resultado] = await pool.query(
    `INSERT INTO logs (tipo, acao, entidade_id, usuario_id, detalhes)
     VALUES (?, ?, ?, ?, ?)`,
    [
      tipo,
      acao,
      entidade_id,
      usuario_id,
      JSON.stringify(detalhes),
    ]
  );

  return resultado.insertId;
}

async function listarPorEntidade(tipo, entidadeId) {
  const [logs] = await pool.query(
    `SELECT id, tipo, acao, entidade_id, usuario_id, detalhes, criado_em
     FROM logs WHERE tipo = ? AND entidade_id = ? ORDER BY criado_em DESC`,
    [tipo, entidadeId]
  );

  return logs;
}

module.exports = { registrar, listarPorEntidade };
