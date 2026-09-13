const Produto = require('../models/Produto');

async function listarPublico(req, res) {
    try {
        const produtos = await Produto.listarAtivos();
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
        res.status(500).json({mensagem: erro.message});
    }
};

async function criar(req, res){
    try{
        const id = await Produto.criar(req.body);
        res.status(201).json({ id });
    }catch(erro){
        res.status(500).json({mensagem: erro.message});
    }
};

async function atualizar(req, res){
    try{
        await Produto.atualizar(req.params.id, req.body);
        res.json({ mensagem: 'Produto atualizado' });
    }catch(erro){
        res.status(500).json({mensagem: erro.message});
    }
};

async function remover(req, res){
    try{
        await Produto.remover(req.params.id);
        res.json({ mensagem: 'Produto removido' });
    }catch(erro){
        res.status(500).json({mensagem: erro.message});
    }
};

async function reativar(req, res){
    try{
        await Produto.reativar(req.params.id);
        res.json({ mensagem: 'Produto reativado' });
    }catch(erro){
        res.status(500).json({mensagem: erro.message});
    }
};

module.exports = {
  listarPublico,
  listarAdmin,
  buscar,
  criar,
  atualizar,
  remover,
  reativar,
};