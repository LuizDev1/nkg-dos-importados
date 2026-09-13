const express = require('express');
const pedidoController = require('../controllers/pedidoController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');
const verificarAdmin = require('../middlewares/adminMiddleware');

const router = express.Router();

router.get('/pedidos', verificarAutenticacao, verificarAdmin, pedidoController.listar);
router.get('/pedidos/usuario/:usuarioId', verificarAutenticacao, pedidoController.listarPorUsuario);
router.get('/pedidos/:id', verificarAutenticacao, pedidoController.buscar);
router.post('/pedidos', verificarAutenticacao, pedidoController.criar);
router.patch('/pedidos/:id/status', verificarAutenticacao, verificarAdmin, pedidoController.atualizarStatus);
router.patch(
  '/pedidos/:id/rastreio',
  verificarAutenticacao,
  verificarAdmin,
  pedidoController.atualizarRastreio
);

module.exports = router;