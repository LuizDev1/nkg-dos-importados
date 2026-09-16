const pool = require('../config/banco');

async function listar(usuarioId) {
  const [enderecos] = await pool.query(
    'SELECT * FROM enderecos_usuarios WHERE usuario_id = ? ORDER BY principal DESC, atualizado_em DESC',
    [usuarioId]
  );
  return enderecos;
}

async function criar(usuarioId, dados) {
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    const [existentes] = await conexao.query('SELECT COUNT(*) AS total FROM enderecos_usuarios WHERE usuario_id = ?', [usuarioId]);
    const principal = dados.principal || Number(existentes[0].total) === 0;
    if (principal) await conexao.query('UPDATE enderecos_usuarios SET principal = FALSE WHERE usuario_id = ?', [usuarioId]);
    const [resultado] = await conexao.query(
      `INSERT INTO enderecos_usuarios
       (usuario_id, apelido, cep, rua, numero, complemento, bairro, cidade, estado, telefone, principal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [usuarioId, dados.apelido, dados.cep.replace(/\D/g, ''), dados.rua, dados.numero, dados.complemento, dados.bairro, dados.cidade, dados.estado.toUpperCase(), dados.telefone, principal]
    );
    await conexao.commit();
    return resultado.insertId;
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally { conexao.release(); }
}

async function remover(usuarioId, id) {
  const [resultado] = await pool.query('DELETE FROM enderecos_usuarios WHERE id = ? AND usuario_id = ?', [id, usuarioId]);
  return resultado.affectedRows;
}

async function definirPrincipal(usuarioId, id) {
  const conexao = await pool.getConnection();
  try {
    await conexao.beginTransaction();
    const [existente] = await conexao.query('SELECT id FROM enderecos_usuarios WHERE id = ? AND usuario_id = ? FOR UPDATE', [id, usuarioId]);
    if (!existente[0]) { await conexao.rollback(); return false; }
    await conexao.query('UPDATE enderecos_usuarios SET principal = FALSE WHERE usuario_id = ?', [usuarioId]);
    await conexao.query('UPDATE enderecos_usuarios SET principal = TRUE WHERE id = ?', [id]);
    await conexao.commit();
    return true;
  } catch (erro) { await conexao.rollback(); throw erro; } finally { conexao.release(); }
}

module.exports = { listar, criar, remover, definirPrincipal };
