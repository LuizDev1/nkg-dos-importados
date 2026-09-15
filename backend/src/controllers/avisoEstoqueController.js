const pool = require('../config/banco');

async function criar(req, res) {
  const produtoId = Number(req.body.produto_id);
  const variacaoId = Number(req.body.variacao_id || 0);
  if (!Number.isInteger(produtoId) || produtoId <= 0 || !Number.isInteger(variacaoId) || variacaoId < 0) {
    return res.status(400).json({ mensagem: 'Produto ou variação inválidos' });
  }

  try {
    const [produtos] = await pool.query('SELECT id FROM produtos WHERE id = ? AND ativo = TRUE', [produtoId]);
    if (!produtos[0]) return res.status(404).json({ mensagem: 'Produto não encontrado' });
    await pool.query(
      'INSERT IGNORE INTO avisos_estoque (usuario_id, produto_id, variacao_id) VALUES (?, ?, ?)',
      [req.usuario.id, produtoId, variacaoId]
    );
    return res.status(201).json({ mensagem: 'Avisaremos quando o produto voltar ao estoque' });
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao cadastrar aviso de estoque' });
  }
}

module.exports = { criar };
