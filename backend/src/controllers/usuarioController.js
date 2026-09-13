const Usuario = require('../models/Usuario');

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

module.exports = { atualizarCpf };