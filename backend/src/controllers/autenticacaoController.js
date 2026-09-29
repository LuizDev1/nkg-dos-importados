const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { COOKIE_SESSAO, COOKIE_CSRF } = require('../middlewares/autenticacaoMiddleware');

function opcoesCookie(httpOnly) {
  return {
    httpOnly,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.SESSION_COOKIE_SAME_SITE || 'lax',
    path: '/api',
    maxAge: Number(process.env.SESSION_MAX_AGE_MS || 15 * 60 * 1000),
  };
}

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
        if (erro.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ mensagem: 'Não foi possível concluir o cadastro com esses dados' });
        }
        console.error('Erro ao registrar usuário:', erro);
        res.status(500).json({ mensagem: 'Erro ao registrar usuário' });
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

    const csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie(COOKIE_SESSAO, token, opcoesCookie(true));
    res.cookie(COOKIE_CSRF, csrfToken, opcoesCookie(false));
    res.setHeader('X-CSRF-Token', csrfToken);
    res.json({ usuario: { id: usuario.id, nome: usuario.nome, perfil: usuario.perfil } });
  } catch (erro) {
    console.error('Erro ao autenticar usuário:', erro);
    res.status(500).json({ mensagem: 'Erro ao autenticar usuário' });
  }
}

function logout(req, res) {
  const opcoes = opcoesCookie(true);
  delete opcoes.maxAge;
  res.clearCookie(COOKIE_SESSAO, opcoes);
  res.clearCookie(COOKIE_CSRF, { ...opcoes, httpOnly: false });
  return res.status(204).send();
}

module.exports = {
 login,
 registrar,
 logout
};
