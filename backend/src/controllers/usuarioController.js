const Usuario = require('../models/Usuario');
const Log = require('../models/Log');

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
    await Log.registrar({
      tipo: 'cliente',
      acao: 'status_atualizado',
      entidade_id: req.params.id,
      usuario_id: req.usuario.id,
      detalhes: { status },
    });
    res.json({ mensagem: 'Status atualizado com sucesso' });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: 'Erro ao atualizar status' });
  }
}

async function atualizarCpf(req, res) {
  try {
    const { cpf } = req.body;

    if (req.usuario.perfil !== 'admin' && String(req.usuario.id) !== String(req.params.id)) {
      return res.status(403).json({ mensagem: 'Você não tem acesso a este usuário' });
    }

    if (!cpf) {
      return res.status(400).json({ mensagem: 'CPF é obrigatório' });
    }

    await Usuario.atualizarCpf(req.params.id, cpf);
    res.json({ mensagem: 'CPF atualizado com sucesso' });
  } catch (erro) {
    res.status(500).json({ mensagem: erro.message });
  }
}

async function exportarDados(req, res) {
  try {
    const dados = await Usuario.exportarDados(req.usuario.id);
    return res.json(dados);
  } catch (erro) {
    console.error('Erro ao exportar dados:', erro);
    return res.status(500).json({ mensagem: 'Erro ao exportar dados' });
  }
}

async function anonimizarConta(req, res) {
  try {
    await Usuario.anonimizar(req.usuario.id);
    return res.json({ mensagem: 'Dados pessoais anonimizados com sucesso' });
  } catch (erro) {
    console.error('Erro ao anonimizar conta:', erro);
    return res.status(500).json({ mensagem: 'Erro ao anonimizar conta' });
  }
}

module.exports = {
  listarClientes,
  atualizarStatus,
  atualizarCpf,
  exportarDados,
  anonimizarConta,
};