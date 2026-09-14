const pool = require('../config/banco');

async function garantirTabelaLogs() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS logs (
      id INT PRIMARY KEY AUTO_INCREMENT,
      tipo VARCHAR(50) NOT NULL,
      acao VARCHAR(100) NOT NULL,
      entidade_id INT,
      usuario_id INT,
      detalhes JSON,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_logs_tipo_entidade (tipo, entidade_id),
      INDEX idx_logs_criado_em (criado_em)
    )
  `);
}

async function registrar({ tipo, acao, entidade_id = null, usuario_id = null, detalhes = {} }) {
  await garantirTabelaLogs();

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
  await garantirTabelaLogs();

  const [logs] = await pool.query(
    `SELECT * FROM logs WHERE tipo = ? AND entidade_id = ? ORDER BY criado_em DESC`,
    [tipo, entidadeId]
  );

  return logs;
}

module.exports = { registrar, listarPorEntidade };
