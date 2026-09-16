const pool = require('../config/banco');

async function listar(produtoId, somenteAtivas = true) {
  const [variacoes] = await pool.query(
    `SELECT * FROM produto_variacoes WHERE produto_id = ?
     ${somenteAtivas ? 'AND ativo = TRUE' : ''} ORDER BY nome`,
    [produtoId]
  );
  return variacoes;
}

async function buscarPorId(id) {
  const [variacoes] = await pool.query('SELECT * FROM produto_variacoes WHERE id = ?', [id]);
  return variacoes[0] || null;
}

async function sincronizarEstoque(produtoId, conexao = pool) {
  const [resultado] = await conexao.query(
    'SELECT COUNT(*) AS total, COALESCE(SUM(estoque_qtd), 0) AS estoque FROM produto_variacoes WHERE produto_id = ? AND ativo = TRUE',
    [produtoId]
  );
  if (Number(resultado[0].total) > 0) {
    await conexao.query('UPDATE produtos SET estoque_qtd = ? WHERE id = ?', [resultado[0].estoque, produtoId]);
  }
}

async function validarTamanho(produtoId, tamanho) {
  const [produtos] = await pool.query('SELECT tamanhos_json FROM produtos WHERE id = ?', [produtoId]);
  const raw = produtos[0]?.tamanhos_json;
  const tamanhos = typeof raw === 'string' ? JSON.parse(raw) : (raw || []);
  if ((tamanhos.length && !tamanhos.includes(tamanho)) || (!tamanhos.length && tamanho)) {
    const erro = new Error('Escolha um tamanho configurado no produto');
    erro.code = 'TAMANHO_INVALIDO';
    throw erro;
  }
}

async function criar(produtoId, dados) {
  await validarTamanho(produtoId, dados.tamanho || '');
  const [resultado] = await pool.query(
    'INSERT INTO produto_variacoes (produto_id, nome, estoque_qtd, tamanho) VALUES (?, ?, ?, ?)',
    [produtoId, dados.nome, dados.estoque_qtd, dados.tamanho || '']
  );
  await sincronizarEstoque(produtoId);
  return resultado.insertId;
}

async function atualizar(id, dados) {
  const [existentes] = await pool.query('SELECT produto_id FROM produto_variacoes WHERE id = ?', [id]);
  if (!existentes[0]) return 0;
  await validarTamanho(existentes[0].produto_id, dados.tamanho || '');
  const [resultado] = await pool.query(
    'UPDATE produto_variacoes SET nome = ?, estoque_qtd = ?, ativo = ?, tamanho = ? WHERE id = ?',
    [dados.nome, dados.estoque_qtd, dados.ativo, dados.tamanho || '', id]
  );
  await sincronizarEstoque(existentes[0].produto_id);
  return resultado.affectedRows;
}

async function remover(id) {
  const [existentes] = await pool.query('SELECT produto_id FROM produto_variacoes WHERE id = ?', [id]);
  if (!existentes[0]) return 0;
  const [resultado] = await pool.query('DELETE FROM produto_variacoes WHERE id = ?', [id]);
  await sincronizarEstoque(existentes[0].produto_id);
  return resultado.affectedRows;
}

module.exports = { listar, buscarPorId, criar, atualizar, remover, sincronizarEstoque };
