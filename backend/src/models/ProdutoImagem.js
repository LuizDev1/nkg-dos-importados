const pool = require('../config/banco');

async function listar(produtoId) {
  const [imagens] = await pool.query(
    'SELECT id, imagem_url, ordem FROM produto_imagens WHERE produto_id = ? ORDER BY ordem, id',
    [produtoId]
  );
  return imagens;
}

async function substituir(produtoId, urls = []) {
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    await conexao.query('DELETE FROM produto_imagens WHERE produto_id = ?', [produtoId]);
    for (const [ordem, url] of urls.entries()) {
      await conexao.query(
        'INSERT INTO produto_imagens (produto_id, imagem_url, ordem) VALUES (?, ?, ?)',
        [produtoId, url, ordem]
      );
    }
    await conexao.commit();
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

module.exports = { listar, substituir };
