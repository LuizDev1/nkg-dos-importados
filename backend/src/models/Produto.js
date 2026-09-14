const pool = require('../config/banco');

async function listarAtivos(){
    const [produtos] = await pool.query('SELECT * from produtos where ativo = true');

    return produtos;
};

async function listarTodos(){
    const [produtos] = await pool.query ('SELECT * from produtos');

    return produtos;
};

async function buscarPorId(id){
    const [produtos] = await pool.query('SELECT * FROM produtos WHERE id = ?', [id]);
    return produtos[0];
};

async function criar(dadosProdutos){
    const {nome, categoria, preco, tag, foto_url, estoque_qtd} = dadosProdutos;

    const [resultado] = await pool.query(
        'INSERT INTO produtos (nome, categoria, preco, tag, foto_url, estoque_qtd) VALUES (?, ?, ?, ?, ?, ?)',
    [nome, categoria, preco, tag, foto_url, estoque_qtd]
    );

    return resultado.insertId;
};


async function atualizar(id, dadosProduto) {
  const { nome, categoria, preco, tag, foto_url, estoque_qtd } = dadosProduto;

  await pool.query(
    'UPDATE produtos SET nome = ?, categoria = ?, preco = ?, tag = ?, foto_url = ?, estoque_qtd = ? WHERE id = ?',
    [nome, categoria, preco, tag, foto_url, estoque_qtd, id]
  );
}

async function remover(id){
    const [produtos] = await pool.query ('UPDATE produtos SET ativo = false WHERE id = ?',[id]);
};

async function reativar(id){
    const [produtos] = await pool.query ('UPDATE produtos SET ativo = true WHERE id = ?',[id]);
};
async function diminuirEstoque(id, quantidade, conexao = pool) {
  const [resultado] = await conexao.query(
    'UPDATE produtos SET estoque_qtd = estoque_qtd - ? WHERE id = ? AND estoque_qtd >= ?',
    [quantidade, id, quantidade]
  );

  return resultado.affectedRows;
}
module.exports = {
  listarAtivos,
  listarTodos,
  buscarPorId,
  criar,
  atualizar,
  remover,
  reativar,
  diminuirEstoque
};