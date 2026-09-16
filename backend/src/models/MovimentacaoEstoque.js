const pool = require('../config/banco');
async function listarBaixo() {
  const [itens] = await pool.query(`
    SELECT p.id, p.nome, NULL AS variacao_id, NULL AS variacao_nome,
      p.estoque_qtd, p.estoque_minimo
    FROM produtos p
    WHERE p.ativo = TRUE AND p.estoque_qtd <= p.estoque_minimo
      AND NOT EXISTS (SELECT 1 FROM produto_variacoes v WHERE v.produto_id = p.id AND v.ativo = TRUE)
    UNION ALL
    SELECT p.id, p.nome, v.id AS variacao_id,
      CONCAT_WS(' / ', NULLIF(v.nome, ''), NULLIF(v.tamanho, '')) AS variacao_nome,
      v.estoque_qtd, p.estoque_minimo
    FROM produto_variacoes v
    JOIN produtos p ON p.id = v.produto_id
    WHERE p.ativo = TRUE AND v.ativo = TRUE AND v.estoque_qtd <= p.estoque_minimo
    ORDER BY estoque_qtd ASC, nome, variacao_nome
  `);
  return itens;
}
async function listar(produtoId) { const [itens] = await pool.query('SELECT * FROM movimentacoes_estoque WHERE produto_id = ? ORDER BY criado_em DESC', [produtoId]); return itens; }
async function registrar({ produtoId, variacaoId = null, tipo, quantidade, saldoAnterior, saldoPosterior, motivo = '', usuarioId = null }, conexao = pool) { await conexao.query('INSERT INTO movimentacoes_estoque (produto_id, variacao_id, tipo, quantidade, saldo_anterior, saldo_posterior, motivo, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [produtoId, variacaoId, tipo, quantidade, saldoAnterior, saldoPosterior, motivo, usuarioId]); }
module.exports = { listarBaixo, listar, registrar };
