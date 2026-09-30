const Banner = require('../models/Banner');
const Log = require('../models/Log');

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
    const id = await Banner.criar(req.body);
    await Log.registrar({
      tipo: 'banner',
      acao: 'criado',
      entidade_id: id,
      usuario_id: req.usuario.id,
      detalhes: { ativo: req.body.ativo, principal: req.body.principal },
    });
    return res.status(201).json({ id });
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao criar banner' });
  }
}

async function atualizar(req, res) {
  try {
    const alterados = await Banner.atualizar(req.params.id, req.body);
    if (alterados) {
      await Log.registrar({
        tipo: 'banner',
        acao: 'atualizado',
        entidade_id: req.params.id,
        usuario_id: req.usuario.id,
        detalhes: { ativo: req.body.ativo, principal: req.body.principal },
      });
    }
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
    if (removidos) {
      await Log.registrar({
        tipo: 'banner',
        acao: 'removido',
        entidade_id: req.params.id,
        usuario_id: req.usuario.id,
      });
    }
    return removidos
      ? res.json({ mensagem: 'Banner excluído' })
      : res.status(404).json({ mensagem: 'Banner não encontrado' });
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao excluir banner' });
  }
}

module.exports = { listarPublico, listarAdmin, criar, atualizar, remover };
