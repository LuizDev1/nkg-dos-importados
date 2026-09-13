const Usuario = require('../models/Usuario');

async function listarClientes(req, res) {
  try {
    const clientes = await Usuario.listarClientes(req.query.busca || '');
    res.json(clientes);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro ao listar clientes' });
  }
}

async function atualizarStatus(req, res) {
  const { status } = req.body;

  if (!['ativo', 'bloqueado'].includes(status)) {
    return res.status(400).json({ mensagem: 'Status inválido' });
  }

  try {
    await Usuario.atualizarStatus(req.params.id, status);
    res.json({ mensagem: 'Status atualizado com sucesso' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro ao atualizar status' });
  }
}

async function atualizarCpf(req, res) {
  try {
    const { cpf } = req.body;

    if (!cpf) {
      return res.status(400).json({ mensagem: 'CPF é obrigatório' });
    }

    await Usuario.atualizarCpf(req.params.id, cpf);
    res.json({ mensagem: 'CPF atualizado com sucesso' });
  } catch (erro) {
    res.status(500).json({ mensagem: erro.message });
  }
}

module.exports = {
  listarClientes,
  atualizarStatus,
  atualizarCpf,
};