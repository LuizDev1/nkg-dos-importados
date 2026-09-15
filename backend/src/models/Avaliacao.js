const pool = require('../config/banco');

async function listar(produtoId) {
  const [avaliacoes] = await pool.query(
    `SELECT a.id, a.nota, a.comentario, a.foto_url, a.criado_em, CASE WHEN a.anonimo THEN 'Anônimo' ELSE u.nome END AS usuario_nome, a.fotos_json,
       (SELECT COUNT(*) FROM avaliacao_uteis au WHERE au.avaliacao_id = a.id) AS uteis
     FROM avaliacoes a INNER JOIN usuarios u ON u.id = a.usuario_id
     WHERE a.produto_id = ? ORDER BY a.criado_em DESC`,
    [produtoId]
  );
  return avaliacoes.map(({ fotos_json, ...avaliacao }) => ({ ...avaliacao, fotos: fotos_json && JSON.parse(fotos_json).length ? JSON.parse(fotos_json) : (avaliacao.foto_url ? [avaliacao.foto_url] : []) }));
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
    `INSERT INTO avaliacoes (usuario_id, produto_id, nota, comentario, foto_url, fotos_json, anonimo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [usuarioId, produtoId, dados.nota, dados.comentario, dados.foto_url || null, JSON.stringify(dados.fotos || []), dados.anonimo || false]
  );
}

async function usuarioAvaliou(usuarioId, produtoId) {
  const [linhas] = await pool.query('SELECT 1 FROM avaliacoes WHERE usuario_id = ? AND produto_id = ? LIMIT 1', [usuarioId, produtoId]);
  return Boolean(linhas[0]);
}

async function marcarUtil(usuarioId, avaliacaoId, ativo = true) {
  const [avaliacoes] = await pool.query('SELECT id FROM avaliacoes WHERE id = ?', [avaliacaoId]);
  if (!avaliacoes.length) return null;
  if (!ativo) {
    await pool.query('DELETE FROM avaliacao_uteis WHERE usuario_id = ? AND avaliacao_id = ?', [usuarioId, avaliacaoId]);
  } else await pool.query('INSERT INTO avaliacao_uteis (usuario_id, avaliacao_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE usuario_id = VALUES(usuario_id)', [usuarioId, avaliacaoId]);
  const [linhas] = await pool.query('SELECT COUNT(*) AS uteis FROM avaliacao_uteis WHERE avaliacao_id = ?', [avaliacaoId]);
  return Number(linhas[0].uteis);
}

async function listarVotos(usuarioId, produtoId) {
  const [votos] = await pool.query('SELECT au.avaliacao_id FROM avaliacao_uteis au INNER JOIN avaliacoes a ON a.id = au.avaliacao_id WHERE au.usuario_id = ? AND a.produto_id = ?', [usuarioId, produtoId]);
  return votos.map(voto => voto.avaliacao_id);
}

module.exports = { listarVotos, listar, usuarioComprou, usuarioAvaliou, salvar, marcarUtil };
