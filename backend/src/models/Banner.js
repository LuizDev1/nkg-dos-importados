const pool = require('../config/banco');

async function listarAtivos() {
  const [banners] = await pool.query(
    'SELECT * FROM banners WHERE ativo = TRUE ORDER BY principal DESC, ordem ASC, criado_em DESC'
  );
  return banners;
}

async function listarTodos() {
  const [banners] = await pool.query(
    'SELECT * FROM banners ORDER BY principal DESC, ordem ASC, criado_em DESC'
  );
  return banners;
}

async function criar(dados) {
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    if (dados.principal) await conexao.query('UPDATE banners SET principal = FALSE WHERE principal = TRUE');
    const [resultado] = await conexao.query(
      `INSERT INTO banners (titulo, imagem_url, imagem_url_2, link_url, ativo, ordem, posicao_x, posicao_y, posicao_x_2, posicao_y_2, zoom, zoom_2, principal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [dados.titulo, dados.imagem_url, dados.imagem_url_2, dados.link_url, dados.ativo, dados.ordem,
        dados.posicao_x, dados.posicao_y, dados.posicao_x_2, dados.posicao_y_2, dados.zoom, dados.zoom_2, dados.principal]
    );
    await conexao.commit();
    return resultado.insertId;
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

async function atualizar(id, dados) {
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    const [existentes] = await conexao.query('SELECT id FROM banners WHERE id = ? FOR UPDATE', [id]);
    if (!existentes.length) { await conexao.rollback(); return 0; }
    if (dados.principal) await conexao.query('UPDATE banners SET principal = FALSE WHERE principal = TRUE AND id <> ?', [id]);
    const [resultado] = await conexao.query(
      `UPDATE banners SET titulo = ?, imagem_url = ?, imagem_url_2 = ?, link_url = ?, ativo = ?, ordem = ?,
       posicao_x = ?, posicao_y = ?, posicao_x_2 = ?, posicao_y_2 = ?, zoom = ?, zoom_2 = ?, principal = ? WHERE id = ?`,
      [dados.titulo, dados.imagem_url, dados.imagem_url_2, dados.link_url, dados.ativo, dados.ordem,
        dados.posicao_x, dados.posicao_y, dados.posicao_x_2, dados.posicao_y_2, dados.zoom, dados.zoom_2, dados.principal, id]
    );
    await conexao.commit();
    return resultado.affectedRows;
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

async function remover(id) {
  const [resultado] = await pool.query('DELETE FROM banners WHERE id = ?', [id]);
  return resultado.affectedRows;
}

module.exports = { listarAtivos, listarTodos, criar, atualizar, remover };
