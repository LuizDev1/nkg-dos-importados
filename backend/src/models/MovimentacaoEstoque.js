const pool = require('../config/banco');
async function listarBaixo() { const [itens] = await pool.query('SELECT id, nome, estoque_qtd, estoque_minimo FROM produtos WHERE ativo = TRUE AND estoque_qtd <= estoque_minimo ORDER BY estoque_qtd ASC, nome'); return itens; }
async function listar(produtoId) { const [itens] = await pool.query('SELECT * FROM movimentacoes_estoque WHERE produto_id = ? ORDER BY criado_em DESC', [produtoId]); return itens; }
async function registrar({ produtoId, variacaoId = null, tipo, quantidade, saldoAnterior, saldoPosterior, motivo = '', usuarioId }) { await pool.query('INSERT INTO movimentacoes_estoque (produto_id, variacao_id, tipo, quantidade, saldo_anterior, saldo_posterior, motivo, usuario_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [produtoId, variacaoId, tipo, quantidade, saldoAnterior, saldoPosterior, motivo, usuarioId]); }
module.exports = { listarBaixo, listar, registrar };
