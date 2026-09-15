const Produto = require('../models/Produto');
const Log = require('../models/Log');

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
        res.json(produtos);
    } catch(erro){
        res.status(500).json({mensagem: erro.message});
    }
    
};

async function buscar(req, res){
    try{
        const produto = await Produto.buscarPorId(req.params.id);
        res.json(produto);
    }catch(erro){
        res.status(500).json({mensagem: 'Erro ao buscar produto'});
    }
};

async function criar(req, res){
    try{
        const id = await Produto.criar(req.body);
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
        await Produto.atualizar(req.params.id, req.body);
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
};
