const Favorito = require('../models/Favorito');

async function listar(req, res) {
  try { return res.json(await Favorito.listar(req.usuario.id)); }
  catch { return res.status(500).json({ mensagem: 'Erro ao listar favoritos' }); }
}

async function adicionar(req, res) {
  try {
    await Favorito.adicionar(req.usuario.id, req.params.produtoId);
    return res.status(201).json({ mensagem: 'Produto adicionado aos favoritos' });
  } catch { return res.status(500).json({ mensagem: 'Erro ao adicionar favorito' }); }
}

async function remover(req, res) {
  try {
    await Favorito.remover(req.usuario.id, req.params.produtoId);
    return res.json({ mensagem: 'Produto removido dos favoritos' });
  } catch { return res.status(500).json({ mensagem: 'Erro ao remover favorito' }); }
}

module.exports = { listar, adicionar, remover };
