function verificarAdmin(req, res, next) {
  if (req.usuario.perfil !== 'admin') {
    return res.status(403).json({ mensagem: 'Acesso restrito a administradores' });
  }

  next();
}

module.exports = verificarAdmin;