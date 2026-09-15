const express = require('express');
const pedidoController = require('../controllers/pedidoController');
const verificarAutenticacao = require('../middlewares/autenticacaoMiddleware');
const verificarAdmin = require('../middlewares/adminMiddleware');
const { schemas, validar } = require('../middlewares/validacao');

const router = express.Router();

router.get('/pedidos', verificarAutenticacao, verificarAdmin, pedidoController.listar);
router.get('/pedidos/me', verificarAutenticacao, pedidoController.listarMeusPedidos);
router.get('/pedidos/me/:id', verificarAutenticacao, pedidoController.buscarMeuPedido);
router.get('/pedidos/usuario/:usuarioId', verificarAutenticacao, pedidoController.listarPorUsuario);
router.get('/pedidos/:id', verificarAutenticacao, pedidoController.buscar);
router.post('/pedidos', verificarAutenticacao, validar(schemas.pedido), pedidoController.criar);
router.patch('/pedidos/:id/status-operacional', verificarAutenticacao, verificarAdmin, pedidoController.atualizarStatusOperacional);
router.patch('/pedidos/:id/cancelar', verificarAutenticacao, pedidoController.cancelar);
router.patch(
  '/pedidos/:id/rastreio',
  verificarAutenticacao,
  verificarAdmin,
  pedidoController.atualizarRastreio
);

module.exports = router;