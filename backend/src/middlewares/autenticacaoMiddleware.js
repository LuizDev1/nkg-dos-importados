const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

async function verificarAutenticacao(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ mensagem: 'Token não fornecido' });
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.buscarPorId(dados.id);
    if (!usuario) {
      return res.status(401).json({ mensagem: 'Usuário não encontrado' });
    }

    if (usuario.status === 'bloqueado') {
      return res.status(403).json({ mensagem: 'Usuário bloqueado' });
    }

    req.usuario = { ...dados, status: usuario.status };
    next();
  } catch (erro) {
    if (erro.name === 'JsonWebTokenError' || erro.name === 'TokenExpiredError') {
      return res.status(401).json({ mensagem: 'Token inválido ou expirado' });
    }

    console.error('Erro ao verificar usuário autenticado:', erro);
    return res.status(500).json({ mensagem: 'Erro ao verificar autenticação' });
  }
}

module.exports = verificarAutenticacao;