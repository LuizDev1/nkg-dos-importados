const pool = require('../config/banco');

async function listarAtivos(filtros = {}){
    const condicoes = ['p.ativo = true'];
    const parametros = [];

    if (filtros.busca) {
      condicoes.push('(p.nome LIKE ? OR p.categoria LIKE ? OR p.tag LIKE ?)');
      const termo = `%${filtros.busca}%`;
      parametros.push(termo, termo, termo);
    }
    if (filtros.categoria) {
      condicoes.push('p.categoria = ?');
      parametros.push(filtros.categoria);
    }
    if (filtros.precoMinimo != null) {
      condicoes.push('p.preco >= ?');
      parametros.push(filtros.precoMinimo);
    }
    if (filtros.precoMaximo != null) {
      condicoes.push('p.preco <= ?');
      parametros.push(filtros.precoMaximo);
    }

    const ordenacoes = {
      recentes: 'p.criado_em DESC',
      menor_preco: 'p.preco ASC',
      maior_preco: 'p.preco DESC',
      nome: 'p.nome ASC',
      melhor_avaliados: 'avaliacao_media DESC, avaliacoes_total DESC, p.criado_em DESC',
    };
    const ordenacao = ordenacoes[filtros.ordenacao] || ordenacoes.recentes;
    const [produtos] = await pool.query(
      `SELECT p.*,
        (SELECT ROUND(AVG(a.nota), 1) FROM avaliacoes a WHERE a.produto_id = p.id) AS avaliacao_media,
        (SELECT COUNT(*) FROM avaliacoes a WHERE a.produto_id = p.id) AS avaliacoes_total
       FROM produtos p WHERE ${condicoes.join(' AND ')} ORDER BY ${ordenacao}`,
      parametros
    );

    return produtos.map(p => ({ ...p, tamanhos: typeof p.tamanhos_json === 'string' ? JSON.parse(p.tamanhos_json) : (p.tamanhos_json || []) }));
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

    return produtos.map(p => ({ ...p, tamanhos: typeof p.tamanhos_json === 'string' ? JSON.parse(p.tamanhos_json) : (p.tamanhos_json || []) }));
};

async function buscarPorId(id){
    const [produtos] = await pool.query(
      `SELECT p.*,
        (SELECT ROUND(AVG(a.nota), 1) FROM avaliacoes a WHERE a.produto_id = p.id) AS avaliacao_media,
        (SELECT COUNT(*) FROM avaliacoes a WHERE a.produto_id = p.id) AS avaliacoes_total
       FROM produtos p WHERE p.id = ?`,
      [id]
    );
    const p = produtos[0];
    return p ? { ...p, tamanhos: typeof p.tamanhos_json === 'string' ? JSON.parse(p.tamanhos_json) : (p.tamanhos_json || []) } : undefined;
};

async function criar(dadosProdutos){
    const {nome, categoria, preco, tag, foto_url, estoque_qtd} = dadosProdutos;

    const [resultado] = await pool.query(
        `INSERT INTO produtos
          (nome, categoria, preco, tag, foto_url, estoque_qtd, estoque_minimo, peso_kg, largura_cm, altura_cm, comprimento_cm, tamanhos_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [nome, categoria, preco, tag, foto_url, estoque_qtd, dadosProdutos.estoque_minimo, dadosProdutos.peso_kg, dadosProdutos.largura_cm, dadosProdutos.altura_cm, dadosProdutos.comprimento_cm, JSON.stringify(dadosProdutos.tamanhos || [])]
    );

    return resultado.insertId;
};


async function atualizar(id, dadosProduto) {
  const { nome, categoria, preco, tag, foto_url, estoque_qtd, estoque_minimo, peso_kg, largura_cm, altura_cm, comprimento_cm } = dadosProduto;

  await pool.query(
    `UPDATE produtos
     SET nome = ?, categoria = ?, preco = ?, tag = ?, foto_url = ?, estoque_qtd = ?, estoque_minimo = ?,
       peso_kg = ?, largura_cm = ?, altura_cm = ?, comprimento_cm = ?, tamanhos_json = ?
     WHERE id = ?`,
    [nome, categoria, preco, tag, foto_url, estoque_qtd, estoque_minimo, peso_kg, largura_cm, altura_cm, comprimento_cm, JSON.stringify(dadosProduto.tamanhos || []), id]
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
