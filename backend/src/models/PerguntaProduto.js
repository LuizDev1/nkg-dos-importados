const pool = require('../config/banco');
async function listar(produtoId) {
  const [perguntas] = await pool.query(`SELECT pp.id, pp.pergunta, pp.resposta, pp.criado_em, pp.respondida_em, u.nome AS usuario_nome
    FROM perguntas_produtos pp INNER JOIN usuarios u ON u.id = pp.usuario_id WHERE pp.produto_id = ? ORDER BY pp.criado_em DESC`, [produtoId]);
  return perguntas;
}
async function criar(produtoId, usuarioId, pergunta) { const [r] = await pool.query('INSERT INTO perguntas_produtos (produto_id, usuario_id, pergunta) VALUES (?, ?, ?)', [produtoId, usuarioId, pergunta]); return r.insertId; }
async function responder(id, adminId, resposta) { const [r] = await pool.query('UPDATE perguntas_produtos SET resposta = ?, respondida_por_id = ?, respondida_em = NOW() WHERE id = ?', [resposta, adminId, id]); return r.affectedRows; }
module.exports = { listar, criar, responder };
