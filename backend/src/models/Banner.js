const pool = require('../config/banco');

async function listarAtivos() {
  const [banners] = await pool.query(
    'SELECT * FROM banners WHERE ativo = TRUE ORDER BY ordem ASC, criado_em DESC'
  );
  return banners;
}

async function listarTodos() {
  const [banners] = await pool.query(
    'SELECT * FROM banners ORDER BY ordem ASC, criado_em DESC'
  );
  return banners;
}

async function criar(dados) {
  const [resultado] = await pool.query(
    'INSERT INTO banners (titulo, imagem_url, link_url, ativo, ordem) VALUES (?, ?, ?, ?, ?)',
    [dados.titulo, dados.imagem_url, dados.link_url, dados.ativo, dados.ordem]
  );
  return resultado.insertId;
}

async function atualizar(id, dados) {
  const [resultado] = await pool.query(
    `UPDATE banners SET titulo = ?, imagem_url = ?, link_url = ?, ativo = ?, ordem = ?
     WHERE id = ?`,
    [dados.titulo, dados.imagem_url, dados.link_url, dados.ativo, dados.ordem, id]
  );
  return resultado.affectedRows;
}

async function remover(id) {
  const [resultado] = await pool.query('DELETE FROM banners WHERE id = ?', [id]);
  return resultado.affectedRows;
}

module.exports = { listarAtivos, listarTodos, criar, atualizar, remover };
