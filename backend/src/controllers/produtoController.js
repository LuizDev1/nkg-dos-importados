const Produto = require('../models/Produto');
const Log = require('../models/Log');
const VariacaoProduto = require('../models/VariacaoProduto');
const notificacaoService = require('../services/notificacaoService');
const ProdutoImagem = require('../models/ProdutoImagem');
const MovimentacaoEstoque = require('../models/MovimentacaoEstoque');

async function registrarAlteracaoEstoque(produtoId, variacaoId, anterior, posterior, usuarioId, motivo) {
    const diferenca = Number(posterior) - Number(anterior);
    if (!diferenca) return;
    await MovimentacaoEstoque.registrar({
      produtoId, variacaoId, tipo: diferenca > 0 ? 'entrada' : 'saida',
      quantidade: Math.abs(diferenca), saldoAnterior: Number(anterior),
      saldoPosterior: Number(posterior), motivo, usuarioId,
    });
}

async function listarPublico(req, res) {
    try {
        const precoMinimo = req.query.preco_min !== undefined && req.query.preco_min !== ''
          ? Number(req.query.preco_min) : null;
        const precoMaximo = req.query.preco_max !== undefined && req.query.preco_max !== ''
          ? Number(req.query.preco_max) : null;

        if (
          (precoMinimo != null && (!Number.isFinite(precoMinimo) || precoMinimo < 0)) ||
          (precoMaximo != null && (!Number.isFinite(precoMaximo) || precoMaximo < 0)) ||
          (precoMinimo != null && precoMaximo != null && precoMinimo > precoMaximo)
        ) {
          return res.status(400).json({ mensagem: 'Faixa de preço inválida' });
        }

        const produtos = await Produto.listarAtivos({
          busca: String(req.query.busca || '').trim().slice(0, 100),
          categoria: String(req.query.categoria || '').trim().slice(0, 100),
          precoMinimo,
          precoMaximo,
          ordenacao: req.query.ordenacao,
        });
        res.json(produtos);
    } catch (erro) {
        res.status(500).json({ mensagem: erro.message });
    }
};

async function listarAdmin(req, res){
    try{
        const produtos = await Produto.listarTodos();
        await Promise.all(produtos.map(async (produto) => {
          produto.imagens = await ProdutoImagem.listar(produto.id);
        }));
        res.json(produtos);
    } catch(erro){
        res.status(500).json({mensagem: erro.message});
    }
    
};

async function buscar(req, res){
    try{
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        const produto = await Produto.buscarPorId(req.params.id);
        if (!produto) return res.status(404).json({ mensagem: 'Produto não encontrado' });
        produto.variacoes = await VariacaoProduto.listar(produto.id);
        produto.imagens = await ProdutoImagem.listar(produto.id);
        res.json(produto);
    }catch(erro){
        res.status(500).json({mensagem: 'Erro ao buscar produto'});
    }
};

async function criar(req, res){
    try{
        const id = await Produto.criar(req.body);
        await registrarAlteracaoEstoque(id, null, 0, req.body.estoque_qtd, req.usuario.id, 'Cadastro do produto');
        await ProdutoImagem.substituir(id, req.body.imagens);
        await Log.registrar({
          tipo: 'produto',
          acao: 'criado',
          entidade_id: id,
          usuario_id: req.usuario.id,
          detalhes: req.body,
        });
        res.status(201).json({ id });
    }catch(erro){
        res.status(500).json({mensagem: 'Erro ao criar produto'});
    }
};

async function atualizar(req, res){
    try{
        const produtoAnterior = await Produto.buscarPorId(req.params.id);
        await Produto.atualizar(req.params.id, req.body);
        if (produtoAnterior) await registrarAlteracaoEstoque(req.params.id, null, produtoAnterior.estoque_qtd, req.body.estoque_qtd, req.usuario.id, 'Alteração no cadastro do produto');
        await ProdutoImagem.substituir(req.params.id, req.body.imagens);
        if (produtoAnterior && Number(produtoAnterior.estoque_qtd) === 0 && Number(req.body.estoque_qtd) > 0) {
          notificacaoService.notificarReposicao(Number(req.params.id)).catch(console.error);
        }
        await Log.registrar({
          tipo: 'produto',
          acao: 'atualizado',
          entidade_id: req.params.id,
          usuario_id: req.usuario.id,
          detalhes: req.body,
        });
        res.json({ mensagem: 'Produto atualizado' });
    }catch(erro){
        res.status(500).json({mensagem: 'Erro ao atualizar produto'});
    }
};

async function remover(req, res){
    try{
        await Produto.remover(req.params.id);
        await Log.registrar({
          tipo: 'produto',
          acao: 'removido',
          entidade_id: req.params.id,
          usuario_id: req.usuario.id,
          detalhes: { ativo: false },
        });
        res.json({ mensagem: 'Produto removido' });
    }catch(erro){
        res.status(500).json({mensagem: erro.message});
    }
};

async function reativar(req, res){
    try{
        await Produto.reativar(req.params.id);
        await Log.registrar({
          tipo: 'produto',
          acao: 'reativado',
          entidade_id: req.params.id,
          usuario_id: req.usuario.id,
          detalhes: { ativo: true },
        });
        res.json({ mensagem: 'Produto reativado' });
    }catch(erro){
        res.status(500).json({mensagem: erro.message});
    }
};

async function listarVariacoes(req, res) {
    try {
        res.json(await VariacaoProduto.listar(req.params.id, false));
    } catch {
        res.status(500).json({ mensagem: 'Erro ao listar variações' });
    }
}

async function criarVariacao(req, res) {
    try {
        const id = await VariacaoProduto.criar(req.params.id, req.body);
        await registrarAlteracaoEstoque(req.params.id, id, 0, req.body.estoque_qtd, req.usuario.id, 'Cadastro da variação');
        res.status(201).json({ id });
    } catch (erro) {
        const status = erro.code === 'TAMANHO_INVALIDO' ? 400 : erro.code === 'ER_DUP_ENTRY' ? 409 : 500;
        res.status(status).json({ mensagem: status === 400 ? erro.message : status === 409 ? 'Esta variação já existe' : 'Erro ao criar variação' });
    }
}

async function atualizarVariacao(req, res) {
    try {
        const variacaoAnterior = await VariacaoProduto.buscarPorId(req.params.variacaoId);
        const alterados = await VariacaoProduto.atualizar(req.params.variacaoId, req.body);
        if (alterados && variacaoAnterior) await registrarAlteracaoEstoque(req.params.id, req.params.variacaoId, variacaoAnterior.estoque_qtd, req.body.estoque_qtd, req.usuario.id, 'Alteração da variação');
        if (variacaoAnterior && Number(variacaoAnterior.estoque_qtd) === 0 && Number(req.body.estoque_qtd) > 0) {
          notificacaoService.notificarReposicao(Number(req.params.id), Number(req.params.variacaoId)).catch(console.error);
        }
        res.status(alterados ? 200 : 404).json({ mensagem: alterados ? 'Variação atualizada' : 'Variação não encontrada' });
    } catch (erro) {
        const status = erro.code === 'ER_DUP_ENTRY' ? 409 : 500;
        res.status(status).json({ mensagem: status === 409 ? 'Esta variação já existe' : 'Erro ao atualizar variação' });
    }
}

async function removerVariacao(req, res) {
    try {
        const variacaoAnterior = await VariacaoProduto.buscarPorId(req.params.variacaoId);
        const removidos = await VariacaoProduto.remover(req.params.variacaoId);
        if (removidos && variacaoAnterior) await registrarAlteracaoEstoque(req.params.id, null, variacaoAnterior.estoque_qtd, 0, req.usuario.id, 'Exclusão da variação');
        res.status(removidos ? 200 : 404).json({ mensagem: removidos ? 'Variação excluída' : 'Variação não encontrada' });
    } catch {
        res.status(500).json({ mensagem: 'Erro ao excluir variação' });
    }
}

async function listarCategorias(req, res) {
    try {
        res.json(await Produto.listarCategorias());
    } catch (erro) {
        res.status(500).json({ mensagem: erro.message });
    }
};

module.exports = {
  listarPublico,
  listarCategorias,
  listarAdmin,
  buscar,
  criar,
  atualizar,
  remover,
  reativar,
  listarVariacoes,
  criarVariacao,
  atualizarVariacao,
  removerVariacao,
};
