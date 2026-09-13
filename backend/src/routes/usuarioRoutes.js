const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuarioController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');
const verificarAdmin = require('../middlewares/adminMiddleware');

router.get(
  '/usuarios/clientes',
  verificarAutenticacao,
  verificarAdmin,
  usuarioController.listarClientes
);

router.patch(
  '/usuarios/:id/status',
  verificarAutenticacao,
  verificarAdmin,
  usuarioController.atualizarStatus
);

router.patch('/usuarios/:id/cpf', usuarioController.atualizarCpf);

module.exports = router;