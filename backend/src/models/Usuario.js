const pool = require('../config/banco');
const bcrypt = require('bcrypt');

async function criar(dadosUsuarios) {
  const { nome, email, senha, perfil = 'cliente', cpf = null } = dadosUsuarios;
  const senhaHash = await bcrypt.hash(senha, 10);

  const [resultado] = await pool.query(
    `INSERT INTO usuarios
      (nome, email, senha_hash, perfil, cpf)
     VALUES (?, ?, ?, ?, ?)`,
    [nome, email, senhaHash, perfil, cpf]
  );

  return resultado.insertId;
}

async function buscarPorEmail(email) {
  const [usuarios] = await pool.query(
    'SELECT * FROM usuarios WHERE email = ?',
    [email]
  );

  return usuarios[0];
}

async function buscarPorId(id) {
  const [usuarios] = await pool.query(
    'SELECT * FROM usuarios WHERE id = ?',
    [id]
  );

  return usuarios[0];
}

async function listarClientes(busca = '') {
  const termo = `%${busca}%`;

  const [clientes] = await pool.query(
    `SELECT
       u.id,
       u.nome,
       u.email,
       u.cpf,
       u.status,
       u.criado_em,
       COUNT(p.id) AS quantidade_pedidos,
       COALESCE(SUM(
         CASE WHEN p.payment_status = 'pago' THEN p.total ELSE 0 END
       ), 0) AS total_gasto
     FROM usuarios u
     LEFT JOIN pedidos p ON p.usuario_id = u.id
     WHERE u.perfil = 'cliente'
       AND (u.nome LIKE ? OR u.email LIKE ?)
     GROUP BY u.id
     ORDER BY u.criado_em DESC`,
    [termo, termo]
  );

  return clientes;
}

async function atualizarStatus(id, status) {
  await pool.query(
    'UPDATE usuarios SET status = ? WHERE id = ? AND perfil = "cliente"',
    [status, id]
  );
}

async function atualizarCpf(id, cpf) {
  await pool.query('UPDATE usuarios SET cpf = ? WHERE id = ?', [cpf, id]);
}

async function exportarDados(id) {
  const [usuarios] = await pool.query(
    `SELECT id, nome, email, cpf, perfil, status, criado_em, anonimizado_em
     FROM usuarios WHERE id = ?`,
    [id]
  );

  const [pedidos] = await pool.query(
    `SELECT id, payment_status, status_pedido, tipo_entrega, total, criado_em
     FROM pedidos WHERE usuario_id = ? ORDER BY criado_em DESC`,
    [id]
  );

  return { usuario: usuarios[0] || null, pedidos };
}

async function anonimizar(id) {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();
    const [usuarios] = await conexao.query(
      'SELECT id, anonimizado_em FROM usuarios WHERE id = ? FOR UPDATE',
      [id]
    );

    if (!usuarios[0]) {
      await conexao.rollback();
      return false;
    }
    if (usuarios[0].anonimizado_em) {
      await conexao.commit();
      return true;
    }

    await conexao.query(
      `UPDATE usuarios
       SET nome = 'Usuário anonimizado',
           email = CONCAT('anonimizado+', id, '@dados.invalid'),
           cpf = NULL,
           senha_hash = SHA2(UUID(), 256),
           status = 'bloqueado',
           anonimizado_em = NOW()
       WHERE id = ?`,
      [id]
    );
    await conexao.commit();
    return true;
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

module.exports = {
  buscarPorEmail,
  buscarPorId,
  criar,
  listarClientes,
  atualizarStatus,
  atualizarCpf,
  exportarDados,
  anonimizar,
};