const Banner = require('../models/Banner');

async function listarPublico(req, res) {
  try {
    return res.json(await Banner.listarAtivos());
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao listar banners' });
  }
}

async function listarAdmin(req, res) {
  try {
    return res.json(await Banner.listarTodos());
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao listar banners' });
  }
}

async function criar(req, res) {
  try {
    return res.status(201).json({ id: await Banner.criar(req.body) });
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao criar banner' });
  }
}

async function atualizar(req, res) {
  try {
    const alterados = await Banner.atualizar(req.params.id, req.body);
    return alterados
      ? res.json({ mensagem: 'Banner atualizado' })
      : res.status(404).json({ mensagem: 'Banner não encontrado' });
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao atualizar banner' });
  }
}

async function remover(req, res) {
  try {
    const removidos = await Banner.remover(req.params.id);
    return removidos
      ? res.json({ mensagem: 'Banner excluído' })
      : res.status(404).json({ mensagem: 'Banner não encontrado' });
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao excluir banner' });
  }
}

module.exports = { listarPublico, listarAdmin, criar, atualizar, remover };
