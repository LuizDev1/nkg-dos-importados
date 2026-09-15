const Avaliacao = require('../models/Avaliacao');

async function listar(req, res) {
  try { return res.json(await Avaliacao.listar(req.params.produtoId)); }
  catch { return res.status(500).json({ mensagem: 'Erro ao listar avaliações' }); }
}

async function salvar(req, res) {
  try {
    if (!await Avaliacao.usuarioComprou(req.usuario.id, req.params.produtoId)) {
      return res.status(403).json({ mensagem: 'Somente clientes que compraram este produto podem avaliá-lo' });
    }
    await Avaliacao.salvar(req.usuario.id, req.params.produtoId, req.body);
    return res.json({ mensagem: 'Avaliação salva' });
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao salvar avaliação' });
  }
}

async function verificarPermissao(req, res) {
  try {
    const podeAvaliar = await Avaliacao.usuarioComprou(req.usuario.id, req.params.produtoId);
    return res.json({ pode_avaliar: podeAvaliar });
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao verificar permissão para avaliar' });
  }
}

module.exports = { listar, salvar, verificarPermissao };
