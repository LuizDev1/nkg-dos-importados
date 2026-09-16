module.exports = async pool => {
  const [indices] = await pool.query('SHOW INDEX FROM produto_variacoes');
  if (!indices.some(i => i.Key_name === 'idx_variacoes_produto')) await pool.query('ALTER TABLE produto_variacoes ADD INDEX idx_variacoes_produto (produto_id)');
  if (indices.some(i => i.Key_name === 'uq_variacao_produto_nome')) await pool.query('ALTER TABLE produto_variacoes DROP INDEX uq_variacao_produto_nome');
  if (!indices.some(i => i.Key_name === 'uq_variacao_cor_tamanho')) await pool.query('ALTER TABLE produto_variacoes ADD UNIQUE KEY uq_variacao_cor_tamanho (produto_id, nome, tamanho)');
};
