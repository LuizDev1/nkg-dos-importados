const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function registrar(req, res){
    try{
        const { nome, email, senha, cpf } = req.body;
        const id = await Usuario.criar({
            nome,
            email,
            senha,
            cpf,
            perfil: 'cliente'
        });
        res.status(201).json({ id });
    }catch(erro){
        res.status(500).json({mensagem: erro.message});
    }  
};

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    const usuario = await Usuario.buscarPorEmail(email);
    if (!usuario) {
      return res.status(401).json({ mensagem: 'E-mail ou senha inválidos' });
    }

    if (usuario.status === 'bloqueado') {
      return res.status(403).json({ mensagem: 'Usuário bloqueado' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'E-mail ou senha inválidos' });
    }

    const token = jwt.sign(
      { id: usuario.id, perfil: usuario.perfil },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        ...(process.env.JWT_ISSUER ? { issuer: process.env.JWT_ISSUER } : {}),
        ...(process.env.JWT_AUDIENCE ? { audience: process.env.JWT_AUDIENCE } : {}),
      }
    );

    res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil } });
  } catch (erro) {
    res.status(500).json({ mensagem: erro.message });
  }
}

module.exports = {
 login,
 registrar
};