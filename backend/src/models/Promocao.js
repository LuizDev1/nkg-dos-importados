const pool = require('../config/banco');

async function buscarValida(codigo, conexao = pool) {
  const [promocoes] = await conexao.query(
    `SELECT * FROM promocoes
     WHERE codigo = ? AND ativo = TRUE
       AND (inicio_em IS NULL OR inicio_em <= NOW())
       AND (fim_em IS NULL OR fim_em >= NOW())
       AND (uso_maximo IS NULL OR usos < uso_maximo)
     FOR UPDATE`,
    [codigo]
  );
  return promocoes[0] || null;
}

async function incrementarUso(id, conexao = pool) {
  await conexao.query(
    'UPDATE promocoes SET usos = usos + 1 WHERE id = ?',
    [id]
  );
}

async function listar() {
  const [promocoes] = await pool.query(
    'SELECT * FROM promocoes ORDER BY criado_em DESC'
  );
  return promocoes;
}

async function criar(dados) {
  const [resultado] = await pool.query(
    `INSERT INTO promocoes (codigo, tipo, valor, inicio_em, fim_em, uso_maximo)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [dados.codigo, dados.tipo, dados.valor, dados.inicio_em || null, dados.fim_em || null, dados.uso_maximo || null]
  );
  return resultado.insertId;
}

async function desativar(id) {
  const [resultado] = await pool.query(
    'UPDATE promocoes SET ativo = FALSE WHERE id = ?',
    [id]
  );
  return resultado.affectedRows;
}

async function reativar(id) {
  const [resultado] = await pool.query(
    'UPDATE promocoes SET ativo = TRUE WHERE id = ?',
    [id]
  );
  return resultado.affectedRows;
}

async function atualizar(id, dados) {
  const [resultado] = await pool.query(
    `UPDATE promocoes
     SET codigo = ?, tipo = ?, valor = ?, inicio_em = ?, fim_em = ?, uso_maximo = ?
     WHERE id = ?`,
    [dados.codigo, dados.tipo, dados.valor, dados.inicio_em || null, dados.fim_em || null, dados.uso_maximo || null, id]
  );
  return resultado.affectedRows;
}

module.exports = { buscarValida, incrementarUso, listar, criar, atualizar, desativar, reativar };
