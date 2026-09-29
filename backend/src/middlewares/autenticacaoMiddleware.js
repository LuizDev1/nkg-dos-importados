const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Usuario = require('../models/Usuario');

const COOKIE_SESSAO = 'nkg_sessao';
const COOKIE_CSRF = 'nkg_csrf';

function lerCookies(req) {
  return String(req.headers.cookie || '').split(';').reduce((cookies, parte) => {
    const indice = parte.indexOf('=');
    if (indice < 0) return cookies;
    const nome = parte.slice(0, indice).trim();
    const valor = parte.slice(indice + 1).trim();
    try { cookies[nome] = decodeURIComponent(valor); } catch { cookies[nome] = valor; }
    return cookies;
  }, {});
}

function valoresIguais(valorA, valorB) {
  const a = Buffer.from(String(valorA || ''));
  const b = Buffer.from(String(valorB || ''));
  return a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b);
}

async function verificarAutenticacao(req, res, next) {
  const authHeader = req.headers.authorization;
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length).trim() : '';
  const cookies = lerCookies(req);
  const token = bearer || cookies[COOKIE_SESSAO];

  if (!token) {
    return res.status(401).json({ mensagem: 'Token não fornecido' });
  }

  try {
    const opcoes = {};
    if (process.env.JWT_ISSUER) opcoes.issuer = process.env.JWT_ISSUER;
    if (process.env.JWT_AUDIENCE) opcoes.audience = process.env.JWT_AUDIENCE;
    const dados = jwt.verify(token, process.env.JWT_SECRET, opcoes);

    const usuario = await Usuario.buscarPorId(dados.id);
    if (!usuario) {
      return res.status(401).json({ mensagem: 'Usuário não encontrado' });
    }

    if (usuario.status === 'bloqueado') {
      return res.status(403).json({ mensagem: 'Usuário bloqueado' });
    }

    req.usuario = { id: usuario.id, perfil: usuario.perfil, status: usuario.status };
    req.autenticacaoPorCookie = !bearer;

    if (req.autenticacaoPorCookie) {
      const csrf = cookies[COOKIE_CSRF];
      const metodoSeguro = ['GET', 'HEAD', 'OPTIONS'].includes(req.method);
      if (!metodoSeguro && !valoresIguais(csrf, req.get('X-CSRF-Token'))) {
        return res.status(403).json({ mensagem: 'Token CSRF inválido ou ausente' });
      }
      if (csrf) res.setHeader('X-CSRF-Token', csrf);
    }
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
module.exports.COOKIE_SESSAO = COOKIE_SESSAO;
module.exports.COOKIE_CSRF = COOKIE_CSRF;
