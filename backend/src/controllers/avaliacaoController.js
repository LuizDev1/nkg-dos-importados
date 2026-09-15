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
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') return res.status(409).json({ mensagem: 'Você já avaliou este produto' });
    return res.status(500).json({ mensagem: 'Erro ao salvar avaliação' });
  }
}

async function verificarPermissao(req, res) {
  try {
    const jaAvaliou = await Avaliacao.usuarioAvaliou(req.usuario.id, req.params.produtoId);
    const podeAvaliar = !jaAvaliou && await Avaliacao.usuarioComprou(req.usuario.id, req.params.produtoId);
    return res.json({ pode_avaliar: podeAvaliar });
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao verificar permissão para avaliar' });
  }
}

async function marcarUtil(req, res) {
  try {
    const uteis = await Avaliacao.marcarUtil(req.usuario.id, req.params.avaliacaoId, req.method !== 'DELETE');
    if (uteis === null) return res.status(404).json({ mensagem: 'Avaliação não encontrada' });
    return res.json({ uteis, votou_util: req.method !== 'DELETE' });
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao marcar avaliação como útil' });
  }
}
async function listarVotos(req, res) {
  try { return res.json(await Avaliacao.listarVotos(req.usuario.id, req.params.produtoId)); }
  catch { return res.status(500).json({ mensagem: 'Erro ao carregar votos' }); }
}
module.exports = { listarVotos, listar, salvar, verificarPermissao, marcarUtil };
