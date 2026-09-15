const Promocao = require('../models/Promocao');

function formatarDataBanco(valor) {
  if (!valor) return null;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(valor)) {
    return `${valor.replace('T', ' ')}:00`;
  }
  return new Date(valor).toISOString().slice(0, 19).replace('T', ' ');
}

async function listar(req, res) {
  try {
    return res.json(await Promocao.listar());
  } catch (erro) {
    return res.status(500).json({ mensagem: 'Erro ao listar promoções' });
  }
}

async function criar(req, res) {
  try {
    const id = await Promocao.criar({
      ...req.body,
      codigo: req.body.codigo.trim().toUpperCase(),
      inicio_em: formatarDataBanco(req.body.inicio_em),
      fim_em: formatarDataBanco(req.body.fim_em),
    });
    return res.status(201).json({ id });
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensagem: 'Código de promoção já existe' });
    }
    return res.status(500).json({ mensagem: 'Erro ao criar promoção' });
  }
}

async function desativar(req, res) {
  try {
    const alteradas = await Promocao.desativar(req.params.id);
    return alteradas
      ? res.json({ mensagem: 'Promoção desativada' })
      : res.status(404).json({ mensagem: 'Promoção não encontrada' });
  } catch (erro) {
    return res.status(500).json({ mensagem: 'Erro ao desativar promoção' });
  }
}

async function reativar(req, res) {
  try {
    const alteradas = await Promocao.reativar(req.params.id);
    return alteradas
      ? res.json({ mensagem: 'Promoção reativada' })
      : res.status(404).json({ mensagem: 'Promoção não encontrada' });
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao reativar promoção' });
  }
}

async function atualizar(req, res) {
  try {
    const alteradas = await Promocao.atualizar(req.params.id, {
      ...req.body,
      codigo: req.body.codigo.trim().toUpperCase(),
      inicio_em: formatarDataBanco(req.body.inicio_em),
      fim_em: formatarDataBanco(req.body.fim_em),
    });
    return alteradas
      ? res.json({ mensagem: 'Promoção atualizada' })
      : res.status(404).json({ mensagem: 'Promoção não encontrada' });
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensagem: 'Código de promoção já existe' });
    }
    return res.status(500).json({ mensagem: 'Erro ao atualizar promoção' });
  }
}

module.exports = { listar, criar, atualizar, desativar, reativar };
