const Usuario = require('../models/Usuario');
const Log = require('../models/Log');
const { normalizarCpf, validarCpf } = require('../utils/cpf');
const { z } = require('zod');
const dadosConta = z.object({
  nome: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(150),
  cpf: z.string().trim().max(14).refine(validarCpf, 'CPF inválido').transform(normalizarCpf),
}).strict();

function dadosPublicos(usuario) {
  const { id, nome, email, cpf, perfil, status, criado_em } = usuario;
  return { id, nome, email, cpf, perfil, status, criado_em };
}

async function buscarConta(req, res) {
  try {
    const usuario = await Usuario.buscarPorId(req.usuario.id);
    if (!usuario) return res.status(404).json({ mensagem: 'Conta não encontrada' });
    return res.json(dadosPublicos(usuario));
  } catch {
    return res.status(500).json({ mensagem: 'Erro ao carregar conta' });
  }
}

async function editarConta(req, res) {
  const id = req.params.id || req.usuario.id;
  if (req.params.id && req.usuario.perfil !== 'admin') {
    return res.status(403).json({ mensagem: 'Acesso não permitido' });
  }
  const resultado = dadosConta.safeParse(req.body);
  if (!resultado.success) {
    return res.status(400).json({ mensagem: resultado.error.issues[0].message });
  }
  try {
    const usuario = await Usuario.buscarPorId(id);
    if (!usuario || (req.params.id && usuario.perfil !== 'cliente')) {
      return res.status(404).json({ mensagem: 'Cliente não encontrado' });
    }
    if (usuario.anonimizado_em) {
      return res.status(409).json({ mensagem: 'Conta anonimizada não pode ser editada' });
    }
    await Usuario.atualizarDados(id, resultado.data);
    return res.json(dadosPublicos({ ...usuario, ...resultado.data }));
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ mensagem: 'E-mail já cadastrado em outra conta' });
    }
    return res.status(500).json({ mensagem: 'Erro ao atualizar conta' });
  }
}

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

    if (!validarCpf(cpf)) {
      return res.status(400).json({ mensagem: 'CPF inválido' });
    }
    await Usuario.atualizarCpf(req.params.id, normalizarCpf(cpf));
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
  buscarConta,
  editarConta,
  listarClientes,
  atualizarStatus,
  atualizarCpf,
  exportarDados,
  anonimizarConta,
};
