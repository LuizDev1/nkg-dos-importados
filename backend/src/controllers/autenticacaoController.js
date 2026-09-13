const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function registrar(req, res){
    try{
        const id = await Usuario.criar(req.body);
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

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaCorreta) {
      return res.status(401).json({ mensagem: 'E-mail ou senha inválidos' });
    }

    const token = jwt.sign(
      { id: usuario.id, perfil: usuario.perfil },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
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