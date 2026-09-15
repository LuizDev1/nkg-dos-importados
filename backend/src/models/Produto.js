const pool = require('../config/banco');

async function listarAtivos(filtros = {}){
    const condicoes = ['ativo = true'];
    const parametros = [];

    if (filtros.busca) {
      condicoes.push('(nome LIKE ? OR categoria LIKE ? OR tag LIKE ?)');
      const termo = `%${filtros.busca}%`;
      parametros.push(termo, termo, termo);
    }
    if (filtros.categoria) {
      condicoes.push('categoria = ?');
      parametros.push(filtros.categoria);
    }
    if (filtros.precoMinimo != null) {
      condicoes.push('preco >= ?');
      parametros.push(filtros.precoMinimo);
    }
    if (filtros.precoMaximo != null) {
      condicoes.push('preco <= ?');
      parametros.push(filtros.precoMaximo);
    }

    const ordenacoes = {
      recentes: 'criado_em DESC',
      menor_preco: 'preco ASC',
      maior_preco: 'preco DESC',
      nome: 'nome ASC',
    };
    const ordenacao = ordenacoes[filtros.ordenacao] || ordenacoes.recentes;
    const [produtos] = await pool.query(
      `SELECT * FROM produtos WHERE ${condicoes.join(' AND ')} ORDER BY ${ordenacao}`,
      parametros
    );

    return produtos;
};

async function listarCategorias() {
  const [categorias] = await pool.query(
    `SELECT DISTINCT categoria FROM produtos
     WHERE ativo = true AND categoria IS NOT NULL AND categoria <> ''
     ORDER BY categoria ASC`
  );
  return categorias.map(({ categoria }) => categoria);
}

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
        `INSERT INTO produtos
          (nome, categoria, preco, tag, foto_url, estoque_qtd, peso_kg, largura_cm, altura_cm, comprimento_cm)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [nome, categoria, preco, tag, foto_url, estoque_qtd, dadosProdutos.peso_kg, dadosProdutos.largura_cm, dadosProdutos.altura_cm, dadosProdutos.comprimento_cm]
    );

    return resultado.insertId;
};


async function atualizar(id, dadosProduto) {
  const { nome, categoria, preco, tag, foto_url, estoque_qtd, peso_kg, largura_cm, altura_cm, comprimento_cm } = dadosProduto;

  await pool.query(
    `UPDATE produtos
     SET nome = ?, categoria = ?, preco = ?, tag = ?, foto_url = ?, estoque_qtd = ?,
       peso_kg = ?, largura_cm = ?, altura_cm = ?, comprimento_cm = ?
     WHERE id = ?`,
    [nome, categoria, preco, tag, foto_url, estoque_qtd, peso_kg, largura_cm, altura_cm, comprimento_cm, id]
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
  listarCategorias,
  listarTodos,
  buscarPorId,
  criar,
  atualizar,
  remover,
  reativar,
  diminuirEstoque
};
